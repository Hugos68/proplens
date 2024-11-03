import { type Prop, lensFactory } from "@proplens/core";
import { parse } from "svelte/compiler";

const lens = lensFactory((code) => {
	const props: Prop[] = [];
	const parsed = parse(code);
	const script = parsed.instance;
	if (!script) {
		return props;
	}
	return props;
});

export { lens };
