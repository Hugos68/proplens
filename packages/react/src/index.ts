import { readFileSync } from "node:fs";
import {
	type Component,
	type Prop,
	getPropsFromType,
	parse,
	walk,
} from "@proplens/shared";
import {
	isArrowFunction,
	isFunctionDeclaration,
	isVariableDeclaration,
} from "typescript";

export function parseReact(path: string): Component[] {
	const components: Component[] = [];
	const code = readFileSync(path, { encoding: "utf-8" });
	const parsed = parse(code, path);

	if (!parsed.sourceFile) {
		return components;
	}
	walk(parsed.sourceFile, (node) => {
		if (!isFunctionDeclaration(node) && !isArrowFunction(node)) {
			return;
		}
		const propsParam = node.parameters[0];
		if (!propsParam) {
			return;
		}
		const propsType = parsed.typeChecker.getTypeAtLocation(propsParam);
		const name = isVariableDeclaration(node.parent)
			? node.parent.name.getText()
			: (node.name?.getText() ?? null);
		const props = getPropsFromType(propsType, parsed.typeChecker);
		components.push({
			name: name,
			props: props,
		});
	});
	return components;
}
