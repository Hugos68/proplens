import { svelte2tsx } from "svelte2tsx";
import {
	isCallExpression,
	isIdentifier,
	isVariableDeclaration,
} from "typescript";
import { getPropsFromType, parse, walk } from "../core";
import type { Component, Prop } from "../types";

export function parseSvelte(code: string): Component[] {
	const components: Component[] = [];
	const parsed = parse(svelte2tsx(code).code);
	if (!parsed.sourceFile) {
		return components;
	}
	walk(parsed.sourceFile, (node) => {
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
		}
	});
	return components;
}
