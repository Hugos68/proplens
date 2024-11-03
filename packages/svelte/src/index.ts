import { readFileSync } from "node:fs";
import {
	type Component,
	type Prop,
	getPropsFromType,
	parse,
	walk,
} from "@proplens/core";
import { svelte2tsx } from "svelte2tsx";
import {
	isCallExpression,
	isIdentifier,
	isVariableDeclaration,
} from "typescript";

export function parseSvelte(path: string): Component[] {
	const components: Component[] = [];
	const code = readFileSync(path, { encoding: "utf-8" });
	const parsed = parse(svelte2tsx(code).code, path);
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
