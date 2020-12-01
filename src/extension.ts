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

	// insertLog
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

	// 获取所有的`console`
	const getAllLogs = ()  => {
		const editor = vscode.window.activeTextEditor;
		const document = editor?.document;
		const documentText = document?.getText();
		let logStatements = [];
		const logRegexp = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
		let matched;
		while (matched = logRegexp.exec(documentText!)) {
			const matchedRange = new vscode.Range(document?.positionAt(matched.index)!, document?.positionAt(matched.index + matched[0].length)!);
			if (!matchedRange.isEmpty) {
				logStatements.push(matchedRange);
			}
		}
		return logStatements;
	};

	// deleteLogs
	let disposableDeleteLogs = vscode.commands.registerCommand('Nidalee.deleteLogs', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const workspaceEdit = new vscode.WorkspaceEdit();
		const document = editor.document;
		const allLogs = getAllLogs();
		allLogs.forEach(log => {
			workspaceEdit.delete(document.uri, log);
		});
		vscode.workspace.applyEdit(workspaceEdit).then(() => {
			vscode.window.showInformationMessage(`${allLogs.length} consoles is deleted`);
		});
	});
	
	context.subscriptions.push(disposableDeleteLogs);
	
	// deleteComments
	let disposableDeleteComments = vscode.commands.registerCommand('Nidalee.deleteComments', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		editor.edit((editBuilder: vscode.TextEditorEdit) => {
			let text = editor.document.getText();
			// 前往`https://jex.im/regulex`可查看正则分析
			// FIXME: #1
			text = text.replace(/((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(^\s*(?=\r?$)\n))/gm, '');
			// text = text.replace(/((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(\/\/((?![img]?\..*))+)|(^\s*(?=\r?$)\n))/gm, '');
			text = text.replace(/(^\s*(?=\r?$)\n)/gm, '');
			text = text.replace(/\\n\\n\?/gm, '');
			const end = new vscode.Position(editor.document.lineCount + 1, 0);
			editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), text);
			vscode.commands.executeCommand('editor.action.formatDocument');
		});
	});
	
	context.subscriptions.push(disposableDeleteComments);
}

export function deactivate() {
	console.log('your extension "Nidalee" is deactivate!');
}
