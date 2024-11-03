import { readFileSync } from "node:fs";
import { isNamedExports } from "typescript";
import { parse, walk } from "../core";
import type { Component } from "../types";

export function parseReact(path: string): Component[] {
	const components: Component[] = [];
	console.log({
		path,
	});
	const code = readFileSync(path, { encoding: "utf-8" });
	const parsed = parse(code, path);
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
