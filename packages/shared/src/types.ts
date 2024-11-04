export interface Prop {
	name: string;
	type: string;
	required: boolean;
	docs: string | null;
}

export interface DefaultExportedComponent {
	exportType: "default";
	props: Prop[];
}

export interface NamedExportedComponent {
	exportType: "named";
	name: string;
	props: Prop[];
}

export type Component = DefaultExportedComponent | NamedExportedComponent;
