interface Prop {
	name: string;
	type: string;
	description?: string;
	required: boolean;
}

type Lens = (code: string) => Prop[];

export type { Prop, Lens };
