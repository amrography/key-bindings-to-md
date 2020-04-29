import * as vscode from 'vscode';
import { saveTheKeybindings } from './extension/saveTheKeybindings';
import { generateTheContent } from './extension/generateTheContent';

async function generateTheFile(sortby:string, groupby:string = 'none') {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		vscode.window.showErrorMessage("Please open workspace first");
		return;
	}
	
	const content:string = await generateTheContent.content(sortby, groupby);

	if (content) return saveTheKeybindings.save(content);
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
