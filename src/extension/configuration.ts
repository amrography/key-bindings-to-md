import * as vscode from 'vscode';

export class configuration {
	static async get(name:string) {
		return await (vscode.workspace.getConfiguration().get(`keybindings-to-md.${name}`))
	}
    static async excludedCommands() {
		return await this.get(`exclude-commands-on-generate`)
		return await vscode.workspace.getConfiguration().get(`keybindings-to-md.exclude-commands-on-generate`)
    }
}