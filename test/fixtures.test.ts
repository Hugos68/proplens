/// <reference types="vite/client" />

import { fileURLToPath, resolve } from "node:url";
import { describe, expect, test } from "vitest";
import { parseSvelte } from "../src.ts";
import { parseReact } from "../src/frameworks/react.ts";

const fixtures = import.meta.glob("./fixtures/**/*.{svelte,tsx}", {
	query: "?raw",
});

const frameworkParseMap = new Map([
	["svelte", parseSvelte],
	["react", parseReact],
]);

describe("fixtures", () => {
	for (const path of Object.keys(fixtures)) {
		const name = path.split("/").at(-1);
		if (!name) {
			continue;
		}
		const framework = path.split("/").at(2);
		if (!framework) {
			continue;
		}
		const parse = frameworkParseMap.get(framework);
		if (!parse) {
			continue;
		}
		test(name, async () => {
			const actual = parse(resolve(fileURLToPath(import.meta.url), path));
			const expected = await import(
				path.replace("fixtures", "results").replace(/\.\w+$/, ".json")
			).then((module) => module.default);
			expect(actual).toStrictEqual(expected);
		});
	}
});
