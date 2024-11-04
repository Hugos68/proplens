import { readFileSync } from "node:fs";
import {
	type Component,
	type Prop,
	getPropsFromType,
	parse,
	walk,
} from "@proplens/shared";
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
		if (!isVariableDeclaration(node)) {
			return;
		}
		const initializer = node.initializer;
		if (!initializer || !isCallExpression(initializer)) {
			return;
		}
		const expression = initializer.expression;
		if (!isIdentifier(expression) || expression.getText() !== "$props") {
			return;
		}
		const propsType = parsed.typeChecker.getTypeAtLocation(node);
		const props = getPropsFromType(propsType, parsed.typeChecker);
		components.push({
			name: null,
			props: props,
		});
	});
	return components;
}
