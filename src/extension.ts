import * as vscode from 'vscode';
import { saveTheKeybindings } from './extension/saveTheKeybindings';
import { generateTheContent } from './extension/generateTheContent';
import { configuration } from "./extension/configuration";
import { folderManger } from "./extension/folderManger";

async function generateTheFile(sortby:string, groupby:string = 'none') {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const folder = new folderManger;

	if (!workspaceFolders) {
		vscode.window.showErrorMessage("Please open workspace first");
		return;
	}

	configuration.excludedCommands(folder).then(async (excluded:any) => {
		const content:string = await generateTheContent.content(sortby, groupby, excluded);
	
		if (content) return saveTheKeybindings.save(content);
	})
}

export function activate(context: vscode.ExtensionContext) {	
	context.subscriptions.push(
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcuts', () => generateTheFile('commands')),
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcutsSortedByKeys', () => generateTheFile('keys')),
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcutsGroupByExtension', () => generateTheFile('commands', 'extension')),
		vscode.commands.registerCommand('key-bindings-to-md.generateKeybindinsShortcutsGroupByExtensionSortByKeys', () => generateTheFile('keys', 'extension'))
	);
}

export function deactivate() {}
