import { type Node, forEachChild } from "typescript";
import { parseTsx } from "../core";
import type { Component } from "../types";

export function parseReact(code: string): Component[] {
	const components: Component[] = [];
	const parsed = parseTsx(code);
	function visit(node: Node) {
		// TODO: Check if node is react component, then parse props
		forEachChild(node, visit);
	}
	if (parsed.sourceFile) {
		visit(parsed.sourceFile);
	}
	return components;
}
