import createDocument from './createDocument';
import * as vscode from 'vscode';

export class saveTheKeybindings
{
    static save(content:string) {
        createDocument(content).then(([document, file_path]) => {
            vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`Keybindings save location: ${file_path}`);
        })
    }
}