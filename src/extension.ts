import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "ext-insert_log" is now active!');

	const insertText = (log: string) => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const lineOfSelectedVar = selection?.active.line;
		console.log(selection);
		editor?.edit((editBuilder: vscode.TextEditorEdit) => {
			// 插入到下一行
			// editBuilder.insert(new vscode.Position(lineOfSelectedVar! + 1, 0), `${log}\n`);
			// 替换当前选中字符
			editBuilder.replace(new vscode.Range(selection?.start!, selection?.end!), log);
		});
	};

	let disposable = vscode.commands.registerCommand('ext-insert_log.insertLog', () => {

		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const text = editor?.document.getText(selection);
		const logToInsert = `console.log('${text}: ', ${text});`;
		text ? insertText(logToInsert) : insertText(`console.log();`);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
