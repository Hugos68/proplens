import { fileURLToPath, resolve } from "node:url";
import { describe, expect, test } from "vitest";
import { parseSvelte } from "../src";

const fixtures = import.meta.glob("./fixtures/*.svelte", {
	query: "?raw",
});

describe("fixtures", () => {
	for (const path of Object.keys(fixtures)) {
		const name = path.split("/").at(-1);
		if (!name) {
			continue;
		}
		test(name, async () => {
			const actual = parseSvelte(resolve(fileURLToPath(import.meta.url), path));
			const expected = await import(
				path.replace("fixtures", "results").replace(".svelte", ".json")
			).then((module) => module.default);
			expect(actual).toStrictEqual(expected);
		});
	}
});
