import { isNamedExports } from "typescript";
import { parse, walk } from "../core";
import type { Component } from "../types";

export function parseReact(code: string): Component[] {
	const components: Component[] = [];
	const parsed = parse(code);
	if (!parsed.sourceFile) {
		return components;
	}
	walk(parsed.sourceFile, (node) => {
		if (isNamedExports(node)) {
			console.log(node);
		}
	});
	return components;
}
