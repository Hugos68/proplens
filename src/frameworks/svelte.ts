import { svelte2tsx } from "svelte2tsx";
import {
	type Node,
	createCompilerHost,
	createProgram,
	createSourceFile,
	forEachChild,
	isCallExpression,
	isIdentifier,
	isVariableDeclaration,
} from "typescript";
import { getPropsFromType } from "../core";
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
			props.push(...getPropsFromType(propsType, typeChecker));
			return;
		}
		forEachChild(node, visit);
	}
	const sourceFile = program.getSourceFile("component.tsx");
	if (sourceFile) {
		visit(sourceFile);
	}
	return props;
}
