import * as vscode from 'vscode';
import { Manager, File } from './file';
import * as jsonc from 'jsonc-parser';

function isValidIdentifier(value: string) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
}

export class HoverProvider implements vscode.HoverProvider {
    constructor(private manager: Manager) {}

    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | undefined> {
        const file = this.manager.get(document.uri);
        if (!file || !file.tree) {
            return undefined;
        }

        const offset = document.offsetAt(position);
        const node = jsonc.findNodeAtOffset(file.tree, offset);
        if (!node) {
            return undefined;
        }

        let md = new vscode.MarkdownString();

        if (node.type === 'string') {
            if (typeof node.value !== 'string') {
                return undefined;
            }

            const rawLength = node.length - 2;

            if (rawLength === node.value.length) {
                md.appendMarkdown(`length \`${node.value.length}\``);
                md.appendMarkdown('  \n');
            } else {
                md.appendText(node.value);
                md.appendMarkdown('\n\n---\n\n');
                md.appendMarkdown(`length \`${node.value.length}\``);
                md.appendMarkdown('  \n');
                md.appendMarkdown(`law length \`${node.length - 2}\``);
                md.appendMarkdown('  \n');
            }
        }

        let path = jsonc.getNodePath(node);
        md.appendMarkdown(`path \`${path.map((value, index) => {
            if (typeof value === 'number') {
                return `[${value}]`;
            } else if (isValidIdentifier(value)){
                if (index === 0) {
                    return value;
                } else {
                    return `.${value}`;
                }
            } else {
                return `[${JSON.stringify(value)}]`;
            }
        }).join('')}\``);

        return new vscode.Hover(md, new vscode.Range(
            document.positionAt(node.offset + 1),
            document.positionAt(node.offset + node.length - 1),
        ));
    }
}
