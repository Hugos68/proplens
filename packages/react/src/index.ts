import { readFileSync } from "node:fs";
import {
	type Component,
	type Prop,
	getPropsFromType,
	parse,
	walk,
} from "@proplens/shared";
import { isArrowFunction, isFunctionDeclaration } from "typescript";

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
		const propsNode = node.parameters[0];
		if (!propsNode || !propsNode.type) {
			return;
		}
		const props: Prop[] = [];
		const propsType = parsed.typeChecker.getTypeFromTypeNode(propsNode.type);
		props.push(...getPropsFromType(propsType, parsed.typeChecker));
		const name = node.name?.getText() ?? null;
		components.push({
			name: name,
			props: props,
		});
	});
	return components;
}
