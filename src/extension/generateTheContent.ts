import { window, commands, Location } from "vscode";
import { jsonc } from 'jsonc';
const humanizeString = require('humanize-string')
const keyboardSymbol = require('keyboard-symbol')
const json2md = require("json2md")

export class generateTheContent {
    static async content(sortby:string, groupby:string, excluded:any): Promise<string> {
        const sets:string = await askForSets();

        return new Promise(async (resolve) => {
            if (sets === undefined) return resolve(undefined);
            if (parseInt(sets)%2 != 0) {
                window.showErrorMessage("Please enter even number")
                return resolve(undefined);
            }

            let rows = parseRows(await openDefaultKeyBindings(), groupby, excluded);
            let content:any = [];

            if (groupby == 'extension') {
                let wanted:string = await askForGroupOnly(rows);
                console.info(wanted);
                console.log(rows);
                if (wanted == 'All') {
                    for (const head in rows) {
                        if (rows.hasOwnProperty(head)) content.push(getMarkDownTable(head, rows[head], sortby, sets))
                    }
                } else {
                    if (rows.hasOwnProperty(wanted)) content = getMarkDownTable(wanted, rows[wanted], sortby, sets)
                    else window.showErrorMessage(`Error, can't find keys within ${wanted} group`)
                }
            }
            else content = getMarkDownTable("Keyboard shortcuts", rows, sortby, sets)

            resolve(json2md(content));
        });
    }
}

async function askForSets(): Promise<string> {
    const sets = await window.showInputBox({
        prompt: 'Number of columns (Should be even)',
        placeHolder: '2, 4, 6, ...',
        value: '6'
    })
    return new Promise((resolve) => resolve(sets))
}

async function askForGroupOnly(rows:any, parent_group:string = ''): Promise<string> {
    let groups = Object.keys(rows);
    let group_name:any = '';

    if (groups.length > 0) {
        groups.push('All');
        group_name = await window.showQuickPick(groups);
    } 

    if (group_name) {
        let nested:any = {};
        let tmp = parent_group.length > 0 ? group_name.split(`${parent_group}\.`).join('') : group_name;
        
        if (rows[tmp]) {
            rows[tmp].forEach((arr:any) => {
                // editor.actions.commandExample [3]
                // actions.commandExample [2]
                let splitted = arr[2].command.split('.');
                if (splitted.length > 2) {
                    let key:string = splitted[1];

                    arr[2].command = arr[2].command.split(`${group_name}\.`).join('')
                    !nested[key] && (nested[key] = []);
                    nested[key].push(row(arr[0], arr[2].command, arr[2]))
                }
            });

            group_name += `.${await askForGroupOnly(nested, group_name)}`;
        }
    }

    return new Promise((resolve) => resolve(group_name))
}

function getMarkDownTable(head:string, rows:any, sortby:string, sets:string) {
    return {
        vscodeTable: {
            head: humanizeString(head),
            rows: rows,
            sortby: sortby,
            sets: parseInt(sets),
        }
    };
}

async function openDefaultKeyBindings() {
	await commands.executeCommand<Location[]>('workbench.action.openDefaultKeybindingsFile')

	const activeEditor = window.activeTextEditor;
	if (!activeEditor) return '';

	const definitions = activeEditor.document.getText();
	await commands.executeCommand<Location[]>('workbench.action.closeActiveEditor')
	return definitions;
}

function parseRows(json:any, groupby:string, excluded:any): any {
    let inputs = jsonc.parse(json);
    
    switch (groupby) {
        case 'extension':
            return groupRowsByExtensionName(inputs, excluded);
        default:
            return inputs.map((col:any) => {
                if (excluded.indexOf(col.command) > -1) return;
                
                return row(col.key, col.command.split('.').join(' '), col)
            })
    }
}

function groupRowsByExtensionName(inputs:any, excluded:any): any {
    let group:any = {};
    inputs.forEach((col:any) => {
        if (excluded.indexOf(col.command) > -1) return;

        let splitted = col.command.split('.'),
            extension_name = splitted[0],
            property = col.command.split(`${extension_name}.`).join('').split('.').join(' ');

        if (splitted.length < 2) extension_name = 'WithoutGroup';
        if (!group[extension_name]) group[extension_name] = [];

        group[extension_name].push(row(col.key, property, col))
    })

    let keys = [],
        sorted:any = {},
        k;

    for (k in group) {
        if (group.hasOwnProperty(k)) keys.push(k);
    }
    keys.sort();
    for (let i = 0; i < keys.length; i++) {
        k = keys[i];
        sorted[k] = group[k];
    }

    return sorted
}

json2md.converters.vscodeTable = function (obj:any , json2md: any) {
    let headers = [];

	for (let i = 0; i < obj.sets; i++) {
		headers.push(i%2 == 0 ? "Keybinding" : "Command")
	}

    return json2md([
        { h1: obj.head},
        { table: { headers: headers, rows: fetchBySetNumber(sorted(obj.rows, obj.sortby), obj.sets) } }
    ]);
}

function sorted(rows:any[], sortby:string) {
    if (sortby == 'keys') {
		return rows.sort((row1:any, row2:any) => {
			if (row1[0] > row2[0]) return 1;
			if (row1[0] < row2[0]) return -1;
			return 0;
		})
	} else {
		return rows.sort((row1:any, row2:any) => {
			if (row1[1] > row2[1]) return 1;
			if (row1[1] < row2[1]) return -1;
			return 0;
		})
	}
}

function fetchBySetNumber(sorted:any, sets:number): any[] {
    const cols_number = sets/2;
    let i = 0;
    let rows = [];

	while (i < sorted.length) {
        let row: any[] = [];
        for (let current_col = 0; current_col < cols_number; current_col++) {
            row.push(...(sorted[i]) ? sorted[i] : ['', '']);
            i++;
        }
        rows.push(row);
    }
    return rows;
}

function shortcutToSymbol(shorcut:string) {
	const os = 'mac';
	const skip = ['tab', 'enter', 'escape', 'space', 'backspace', 'tab', 'pagedown', 'pageup', 'delete', 'home', 'end'];
	const arrows = ['right', 'left', 'up', 'down']
	return shorcut.split(' ').map((single:string) => single.split('+').map((item:string) => shortcutToSymbolAssist(item, os, skip, arrows)).join(' + ')).join(' ');
}

function shortcutToSymbolAssist(item:string, os:string, skip:any, arrows:any) {
	if (skip.indexOf(item) > -1) return `**${item[0].toUpperCase()}**${item.slice(1)}`;
	if (arrows.indexOf(item) > -1) item = `arrow${item}`;
	if (item == 'ctrl') item = 'control';
	if (item.search(/[a-z]+/) > -1) item = item.toUpperCase();
    
    return `**${keyboardSymbol(item, os)}**`;
    return item.search(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]+/)
        ? item
	    : `**${keyboardSymbol(item, os)}**`
}

function humanReading(str:string) {
    let description = humanizeString(str)
    let splitted = description.split(' ')
    let first_word = splitted.pop()
    return `**${first_word.toUpperCase()}** ${splitted.join(' ')}`;
}

function row(shortcut:string, description:string, col:any) {
    return [
        `${shortcutToSymbol(shortcut)}`,
        `${humanReading(description)}`,
        col
    ]
}