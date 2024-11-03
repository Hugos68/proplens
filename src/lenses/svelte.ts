import { lensFactory } from "./factory.js";
import { parse, walk } from "svelte/compiler";
import type { Prop } from "../types";

const svelteLens = lensFactory((code) => {
	const props: Prop[] = [];
	const parsed = parse(code);
	const script = parsed.instance;
	if (!script) {
		return props;
	}
	return props;
});

export { svelteLens };
