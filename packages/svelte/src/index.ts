import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { type Prop, lensFactory } from "@proplens/core";
import { svelte2tsx } from "svelte2tsx";
import {
	JsxEmit,
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget,
	SymbolFlags,
	type Type,
	createCompilerHost,
	createProgram,
	createSourceFile,
	displayPartsToString,
	forEachChild,
	isCallExpression,
	isIdentifier,
	isVariableDeclaration,
	type Node,
} from "typescript";

export const lens = lensFactory((filePath) => {
	const props: Prop[] = [];
	const code = readFileSync(filePath).toString();
	const tsx = svelte2tsx(code);

	const compilerHost = createCompilerHost({});
	const originalGetSourceFile = compilerHost.getSourceFile;
	compilerHost.getSourceFile = (fileName, languageVersion) => {
		if (fileName === "component.tsx") {
			return createSourceFile(fileName, tsx.code, ScriptTarget.Latest, true);
		}
		return originalGetSourceFile(
			resolve(dirname(filePath), fileName),
			languageVersion,
		);
	};
	const program = createProgram({
		rootNames: ["component.tsx"],
		options: {
			strict: true,
			noEmit: true,
			target: ScriptTarget.Latest,
			module: ModuleKind.ESNext,
			jsx: JsxEmit.Preserve,
			moduleResolution: ModuleResolutionKind.NodeNext,
			allowJs: true,
			baseUrl: dirname(filePath),
			paths: {
				"*": ["*", "node_modules/*"],
			},
		},
		host: compilerHost,
	});
	const typeChecker = program.getTypeChecker();

	function getPropsFromType(type: Type): Prop[] {
		const props: Prop[] = [];
		for (const symbol of type.getProperties()) {
			const declarations = symbol.getDeclarations();
			if (!declarations || !declarations[0]) {
				return [];
			}
			const declaration = declarations[0];
			const symbolType = typeChecker.getTypeOfSymbolAtLocation(
				symbol,
				declaration,
			);
			props.push({
				name: symbol.getName(),
				type: typeChecker.typeToString(symbolType),
				required: !(symbol.flags & SymbolFlags.Optional),
				description: displayPartsToString(
					symbol.getDocumentationComment(typeChecker),
				),
			});
		}

		return props;
	}
	function visit(node: Node) {
		if (
			isVariableDeclaration(node) &&
			node.type &&
			node.initializer &&
			isCallExpression(node.initializer) &&
			isIdentifier(node.initializer.expression) &&
			node.initializer.expression.text === "$props"
		) {
			const propsType = typeChecker.getTypeFromTypeNode(node.type);
			props.push(...getPropsFromType(propsType));
		}

		forEachChild(node, visit);
	}

	const sourceFile = program.getSourceFile("component.tsx");
	if (sourceFile) {
		visit(sourceFile);
	}

	return props;
});

// Example usage:
console.log(lens("./component.svelte"));
