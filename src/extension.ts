import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "json-cat" is now active!');

    const disposable = vscode.commands.registerCommand('json-cat.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from json-cat!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
