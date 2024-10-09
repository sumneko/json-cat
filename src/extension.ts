import * as vscode from 'vscode';
import { Manager } from './file';
import { HoverProvider } from './hover';

export function activate(context: vscode.ExtensionContext) {
    const manager = new Manager();

    vscode.workspace.textDocuments.forEach((e) => {
        if (e.languageId === 'json' || e.languageId === 'jsonc') {
            manager.open(e.uri, e.getText());
        }
    });

    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((e) => {
        if (e.languageId === 'json' || e.languageId === 'jsonc') {
            manager.open(e.uri, e.getText());
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        const file = manager.get(e.document.uri);
        if (file) {
            file.context = e.document.getText();
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((e) => {
        manager.close(e.uri);
    }));

    context.subscriptions.push(vscode.languages.registerHoverProvider(['json', 'jsonc'], new HoverProvider(manager)));
}

export function deactivate() {}
