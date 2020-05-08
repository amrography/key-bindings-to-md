import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as defaultExcludeedCommands from '../json/default-excluded-commands.json';

export class configuration {
	static async get(name:string) {
		return await (vscode.workspace.getConfiguration().get(`keybindings-to-md.${name}`))
	}
    static async excludedCommands(folderManger: any) {
		let excludeFile = path.join(folderManger.folder(), 'exclude_commands.json');

		var commands;

		try {
			commands = fs.readFileSync(excludeFile, 'utf8')
		} catch (error) {
			if (error.code === 'ENOENT') {
				commands = defaultExcludeedCommands;
				fs.writeFileSync(excludeFile, JSON.stringify(commands))
			} else throw error;
		}

		return commands;
    }
}