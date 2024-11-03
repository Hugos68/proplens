/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { getPropsFromSvelte } from "../src";

const fixtures = import.meta.glob("./fixtures/**/*", {
	query: "?raw",
	import: "default",
});

const frameworkPropsGetterMap = new Map([["svelte", getPropsFromSvelte]]);

describe("fixtures", () => {
	for (const [path, getCode] of Object.entries(fixtures)) {
		const name = path.split("/").at(-1);
		if (!name) {
			continue;
		}
		const extension = name.split(".").at(-1);
		if (!extension) {
			continue;
		}
		const propsGetter = frameworkPropsGetterMap.get(extension);
		if (!propsGetter) {
			continue;
		}
		test(name, async () => {
			const code = String(await getCode());
			const actual = propsGetter(code);
			const expected = await import(
				path.replace("fixtures", "results").replace(".svelte", ".json")
			).then((module) => module.default);
			expect(actual).toStrictEqual(expected);
		});
	}
});
