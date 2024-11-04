import { readFileSync } from "node:fs";
import {
	type Component,
	type Prop,
	getPropsFromType,
	parse,
	walk,
} from "@proplens/core";
import {
	type ArrowFunction,
	type FunctionDeclaration,
	isArrowFunction,
	isFunctionDeclaration,
} from "typescript";

export function parseReact(path: string): Component[] {
	const components: Component[] = [];
	const code = readFileSync(path, { encoding: "utf-8" });
	const parsed = parse(code, path);

	if (!parsed.sourceFile) {
		return components;
	}

	function isReactComponent(node: FunctionDeclaration | ArrowFunction) {
		const signature = parsed.typeChecker.getSignatureFromDeclaration(node);
		if (!signature) {
			return false;
		}
		const returnType = parsed.typeChecker.getReturnTypeOfSignature(signature);
		const returnTypeString = parsed.typeChecker.typeToString(returnType);
		return ["Element", "ReactElement"].includes(returnTypeString);
	}

	walk(parsed.sourceFile, (node) => {
		if (!isFunctionDeclaration(node) && !isArrowFunction(node)) {
			return;
		}
		if (!isReactComponent(node)) {
			return;
		}
		const propsNode = node.parameters[0];
		if (!propsNode || !propsNode.type) {
			return;
		}
		const props: Prop[] = [];
		const propsType = parsed.typeChecker.getTypeFromTypeNode(propsNode.type);
		props.push(...getPropsFromType(propsType, parsed.typeChecker));

		const name = node.name?.getText();

		if (name) {
			components.push({
				exportType: "named",
				name: name,
				props: props,
			});
		} else {
			components.push({
				exportType: "default",
				props: props,
			});
		}
	});
	return components;
}
