export interface Prop {
	name: string;
	type: string;
	description?: string;
	required: boolean;
}

export type Lens = (path: string) => Prop[];
