import * as vscode from 'vscode';
import { Manager } from './file';
import * as jsonc from 'jsonc-parser';
import { off } from 'process';

export class InlayHintsProvider implements vscode.InlayHintsProvider {
    constructor(private manager: Manager) {}

    async provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): Promise<vscode.InlayHint[] | undefined> {
        const file = this.manager.get(document.uri);
        if (!file || !file.tree) {
            return undefined;
        }

        let hints: vscode.InlayHint[] = [];

        const start = document.offsetAt(range.start);
        const end = document.offsetAt(range.end);

        let looked = 0;

        async function lookInto(node: jsonc.Node, index: number, max: number) {
            looked++;
            if (looked % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
                if (token.isCancellationRequested) {
                    throw new Error('cancelled');
                }
            }
            if (node.offset > end || node.offset + node.length < start) {
                return;
            }
            if (node.offset >= start && node.offset <= end) {
                if (node.parent?.type === 'array') {
                    const paddedIndex = index.toString().padStart(max.toString().length, '0');
                    hints.push({
                        label: `[${paddedIndex}]`,
                        kind: vscode.InlayHintKind.Parameter,
                        position: document.positionAt(node.offset),
                    });
                }
            }
            if (!node.children) {
                return;
            }

            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                await lookInto(child, i, node.children.length);
            }
        }

        try {
            await lookInto(file.tree, 0, 0);
        } catch (error) {
            return undefined;
        }

        return hints;
    }
}
