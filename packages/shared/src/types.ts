export interface Prop {
	name: string;
	type: string;
	required: boolean;
	docs: string | null;
}

export interface Component {
	name: string | null;
	props: Prop[];
}
