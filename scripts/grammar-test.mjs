import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const workspace = resolve(dirname(new URL(import.meta.url).pathname), "..");
const testCase = join(workspace, "src", "test", "syntaxes", "Test.test.leaf");
const vscodeTestDirectory = join(workspace, ".vscode-test");

function findGrammar(directory, extension, filename) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const entryPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			const grammarPath = findGrammar(entryPath, extension, filename);
			if (grammarPath) {
				return grammarPath;
			}
		} else if (entry.name === filename && directory.endsWith(join(extension, "syntaxes"))) {
			return entryPath;
		}
	}
	return undefined;
}

const grammarDefinitions = [
	["html", "html.tmLanguage.json", "text.html.basic"],
	["css", "css.tmLanguage.json", "source.css"],
	["javascript", "JavaScript.tmLanguage.json", "source.js"],
];

const grammarPaths = [];
try {
	for (const [extension, filename, scopeName] of grammarDefinitions) {
		const grammarPath = findGrammar(vscodeTestDirectory, extension, filename);
		if (!grammarPath) {
			throw new Error(`Unable to find VS Code's ${scopeName} grammar.`);
		}
		grammarPaths.push(grammarPath);
	}
} catch (error) {
	console.error(`Unable to find the VS Code test installation: ${error.message}`);
	process.exit(1);
}

const grammarTest = join(workspace, "node_modules", "vscode-tmgrammar-test", "dist", "unit.js");
const result = spawnSync(process.execPath, [
	grammarTest,
	...grammarPaths.flatMap((grammarPath) => ["-g", grammarPath]),
	testCase,
], {
	cwd: workspace,
	stdio: "inherit",
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
