import { readFileSync } from "node:fs";
import { isNamedExports } from "typescript";
import { parse, walk } from "../core.ts";
import type { Component } from "../types.ts";

export function parseReact(path: string): Component[] {
	const components: Component[] = [];
	const code = readFileSync(path, { encoding: "utf-8" });
	const parsed = parse(code, path);
	if (!parsed.sourceFile) {
		return components;
	}
	walk(parsed.sourceFile, (node) => {
		if (isNamedExports(node)) {
		}
	});
	return components;
}
