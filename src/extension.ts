/**
 * @desc 为所选择代码段添加`log`
 * @usage 1. obj.i 插入到下一行
 * 			  2. obj.r 替换当前选中字符
 * 			  3. obj.t 打印代码耗时
 *        TODO: error/warning/table/color
 */
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "Nidalee" is now active!');

	// 插入到下一行
	const insertLog = (text: string) => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;		
		const logToInsert = text ? `console.log('${text}: ', ${text});` : `console.log();`;
		const lineOfSelectedVar = selection?.active.line;
		editor?.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.insert(new vscode.Position(lineOfSelectedVar! + 1, 0), `${logToInsert}\n`);
		});
	};

	// 替换当前选中字符
	const replaceLog = (text: string) => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;		
		const logToReplace = text ? `console.log('${text}: ', ${text});` : `console.log();`;
		editor?.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(new vscode.Range(selection?.start!, selection?.end!), logToReplace);
		});
	};

	// 打印代码耗时
	const wrapTime = (text: string) => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;		
		if (!text) {
			return;
		};
		const codeTowrap = `console.time('timer');\n${text}\nconsole.timeEnd('timer');\n`;
		editor?.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(new vscode.Range(selection?.start!, selection?.end!), codeTowrap);
		});
	};

	let disposable = vscode.commands.registerCommand('Nidalee.insertLog', () => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const text = editor?.document.getText(selection).trim();
		if (/\.i$/.test(text!)) {
			insertLog(text!.slice(0, -2));
		} else if (/\.r$/.test(text!)) {
			replaceLog(text!.slice(0, -2));
		} else if (/\.t$/.test(text!)) {
			wrapTime(text!.slice(0, -2));
		} else {
			insertLog(text!);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('your extension "Nidalee" is deactivate!');
}
