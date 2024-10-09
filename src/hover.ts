import * as vscode from 'vscode';
import { Manager } from './manager';
import * as jsonc from 'jsonc-parser';

export class HoverProvider implements vscode.HoverProvider {
    constructor(private manager: Manager) {}

    private viewString(value: any): vscode.Hover | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }
        // 将 "\uXXXX" 转换为对应的字符
        const content = value.replace(/\\u(\w{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        if (content === value) {
            return undefined;
        }

        return new vscode.Hover(content);
    }

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

        if (node.type === 'string') {
            return this.viewString(node.value);
        }
    }
}
