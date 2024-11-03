import { svelte2tsx } from "svelte2tsx";
import {
	type Node,
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
} from "typescript";
import type { Prop } from "../types";

export function getPropsFromSvelte(code: string): Prop[] {
	const props: Prop[] = [];
	const tsx = svelte2tsx(code).code;
	const compilerHost = createCompilerHost({});
	compilerHost.getSourceFile = (fileName, languageVersion) => {
		return createSourceFile(fileName, tsx, languageVersion, true);
	};
	const program = createProgram({
		rootNames: ["component.tsx"],
		options: {},
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
				docs: displayPartsToString(symbol.getDocumentationComment(typeChecker)),
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
}
