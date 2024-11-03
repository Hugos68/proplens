/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { getPropsFromSvelte } from "../src";

const fixtures = import.meta.glob("./fixtures/*.svelte", { query: "?raw", import: 'default' });

describe("fixtures", () => {
	for (const [path, getCode] of Object.entries(fixtures)) {
		const name = path.split("/").at(-1)?.replace(".svelte", "");
		test(name ?? path, async () => {
			const code = await getCode();
			const actual = getPropsFromSvelte(String(code));
			const expected = await import(
				`${path.replace("fixtures", "results").replace(".svelte", ".json")}`
			).then(module => module.default);
			expect(actual).toStrictEqual(expected);
		});
	}
});
