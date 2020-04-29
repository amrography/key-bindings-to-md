// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { jsonc } from 'jsonc';

const json2md = require("json2md")
const humanizeString = require('humanize-string')
const keyboardSymbol = require('keyboard-symbol')

json2md.converters.vscodeTable = function (obj:any , json2md: any) {
	let inputs = jsonc.parse(obj.inputs);

	let rows = inputs.map((col:any) => [
		`${shortcutToSymbol(col.key)}`,
		`${humanizeString(col.command)}`
	]);
	// the dot is for the extensions
	// `${humanizeString(col.command).split('.').join(' ')}`

	let sorted: any[] = [];
	if (obj.sortby == 'keys') {
		sorted = rows.sort((row1:any, row2:any) => {
			if (row1[0] > row2[0]) return 1;
			if (row1[0] < row2[0]) return -1;
			return 0;
		})
	} else {
		sorted = rows.sort((row1:any, row2:any) => {
			if (row1[1] > row2[1]) return 1;
			if (row1[1] < row2[1]) return -1;
			return 0;
		})
	}

	let headers = [],
		sorted_setted : any[] = [];

	for (let i = 0; i < obj.sets; i++) {
		if (i%2 == 0) headers.push("Keybinding")
		else headers.push("Command")
	}

	let i0 = 0, i1 = 1;

	for (let i = 0; i < (sorted.length/2); i++) {
		let item:any = sorted[i];
		let temp:any[] = [];

		if (obj.sets == 4) {
			temp = [...(sorted[i0]) ? sorted[i0] : ['', ''], ...(sorted[i1]) ? sorted[i1] : ['', '']];
			i0 = i0+2;
			i1 = i1+2;
		} else {
			temp = [...item];
		}
		
		sorted_setted.push(temp)
	}

	return json2md({ table: { headers: headers, rows: sorted_setted } });
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
	
	return `**${keyboardSymbol(item, os)}**`
}

async function openDefaultKeyBindings() {
	await vscode.commands.executeCommand<vscode.Location[]>('workbench.action.openDefaultKeybindingsFile')

	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) return '';

	const definitions = activeEditor.document.getText();
	await vscode.commands.executeCommand<vscode.Location[]>('workbench.action.closeActiveEditor')
	return definitions;
}

async function generateTheFile(sortby:string) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		vscode.window.showErrorMessage("Please open workspace first");
		return;
	}

	const sets = await vscode.window.showQuickPick(['2', '4'], {placeHolder: 'Number of columns'});
	if (!sets) return;
	
	const wsPath = workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
	const uri = `${wsPath}/.vscode/ext-${Date.now()}.md`;
	const newFile = vscode.Uri.parse(`untitled:${uri}`);
	let definitions = await openDefaultKeyBindings();
	let content:any = [
		{ h1: "Keyboard shortcuts"},
		{
			vscodeTable: {
				inputs: definitions,
				sortby: sortby,
				sets: parseInt(sets)
			}
		}
	];
	
	vscode.workspace.openTextDocument(newFile).then(document => {
		const edit = new vscode.WorkspaceEdit();
		edit.insert(newFile, new vscode.Position(0, 0), json2md(content));
		
		return vscode.workspace.applyEdit(edit).then(success => {
			if (success) {
				vscode.window.showTextDocument(document);
			} else {
				vscode.window.showInformationMessage('Error!');
			}
		});
	})
	vscode.window.showInformationMessage(`Don't forget to save it, default location: ${uri}`);
}

export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcuts', () => generateTheFile('commands')),
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcutsSortedByKeys', () => generateTheFile('keys'))
	);
}

export function deactivate() {}
