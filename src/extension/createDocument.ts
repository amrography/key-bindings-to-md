import * as vscode from 'vscode';
import * as fs from 'fs';

export default function createDocument(content:string): Promise<[vscode.TextDocument,string]>{
    const root = vscode.workspace.rootPath;
    if(typeof root === 'undefined'){
        vscode.window.showErrorMessage('Open folder before running the keybindings commands');
        return Promise.reject(new Error('Open folder before running the keybindings commands'));
    }
    
    const uri = `${root}/.vscode/`;
    if (fs.existsSync(uri) === false) fs.mkdirSync(uri);
    
    const keybindingTempPath = `${root}/.vscode/keybindings.md`;

    return new Promise((resolve, reject) => {
        const newFile:vscode.Uri = vscode.Uri.file(keybindingTempPath)

        return fs.writeFile(keybindingTempPath, content, 'utf8', function (err) {
            if (err) vscode.window.showErrorMessage(err.toString());
    
            vscode.workspace.openTextDocument(newFile).then((document) => {
                resolve([document, keybindingTempPath])
            })
        })
    })
}