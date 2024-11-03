import { svelte2tsx } from "svelte2tsx";
import {
	type Node,
	forEachChild,
	isCallExpression,
	isIdentifier,
	isVariableDeclaration,
} from "typescript";
import { getPropsFromType, parseTsx } from "../core";
import type { Component, Prop } from "../types";

export function parseSvelte(code: string): Component[] {
	const components: Component[] = [];
	const parsed = parseTsx(svelte2tsx(code).code);
	function visit(node: Node) {
		if (
			isVariableDeclaration(node) &&
			node.type &&
			node.initializer &&
			isCallExpression(node.initializer) &&
			isIdentifier(node.initializer.expression) &&
			node.initializer.expression.text === "$props"
		) {
			const props: Prop[] = [];
			const propsType = parsed.typeChecker.getTypeFromTypeNode(node.type);
			props.push(...getPropsFromType(propsType, parsed.typeChecker));
			components.push({
				exportType: "default",
				props: props,
			});
			return;
		}
		forEachChild(node, visit);
	}
	if (parsed.sourceFile) {
		visit(parsed.sourceFile);
	}
	return components;
}
