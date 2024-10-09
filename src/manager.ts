import * as jsonc from 'jsonc-parser';
import * as vscode from 'vscode';

class File {
    private _context: string;
    constructor(context: string) {
        this._context = context;
    }

    private _tree: jsonc.Node | null | undefined;

    get tree() {
        if (this._tree === undefined) {
            this._tree = jsonc.parseTree(this.context, undefined, {
                allowTrailingComma: true,
            }) ?? null;
        }
        return this._tree ?? undefined;
    }

    get context() {
        return this._context;
    }

    set context(value: string) {
        this._tree = undefined;
        this.context = value;
    }
}

export class Manager {
    private files: Map<string, File> = new Map();

    public open(path: vscode.Uri, context: string) {
        this.files.set(path.toString(), new File(context));
    }

    public close(path: vscode.Uri) {
        this.files.delete(path.toString());
    }

    public get(path: vscode.Uri) {
        return this.files.get(path.toString());
    }
}
