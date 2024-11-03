/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { parseSvelte } from "../src";
import { parseReact } from "../src/frameworks/react";

const fixtures = import.meta.glob("./fixtures/**/*", {
	query: "?raw",
	import: "default",
});

const frameworkPropsGetterMap = new Map([
	["svelte", parseSvelte],
	["react", parseReact],
]);

describe("fixtures", () => {
	for (const [path, getCode] of Object.entries(fixtures)) {
		const name = path.split("/").at(-1);
		if (!name) {
			continue;
		}
		const framework = path.split("/").at(2);
		if (!framework) {
			continue;
		}
		const propsGetter = frameworkPropsGetterMap.get(framework);
		if (!propsGetter) {
			continue;
		}
		test(name, async () => {
			const code = String(await getCode());
			const actual = propsGetter(code);
			const expected = await import(
				path.replace("fixtures", "results").replace(/\.\w+$/, ".json")
			).then((module) => module.default);
			expect(actual).toStrictEqual(expected);
		});
	}
});
