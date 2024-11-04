import { dirname } from "node:path";
import { resolve } from "node:url";
import {
	type CompilerOptions,
	ModuleDetectionKind,
	ModuleKind,
	type Node,
	ScriptTarget,
	SymbolFlags,
	type Type,
	type TypeChecker,
	createCompilerHost,
	createProgram,
	createSourceFile,
	displayPartsToString,
	forEachChild,
} from "typescript";
import type { Prop } from "./types";

export * from "./types";

const defaultCompilerOptions: CompilerOptions = {
	strict: true,
	module: ModuleKind.NodeNext,
	target: ScriptTarget.ESNext,
	allowJs: true,
	skipDefaultLibCheck: true,
	skipLibCheck: true,
	moduleDetection: ModuleDetectionKind.Force,
};

export function getPropsFromType(type: Type, typeChecker: TypeChecker) {
	const props: Prop[] = [];
	for (const property of type.getProperties()) {
		const declaration = property.getDeclarations()?.at(0);
		if (!declaration) {
			continue;
		}
		const propertyType = typeChecker.getTypeOfSymbolAtLocation(
			property,
			declaration,
		);
		props.push({
			name: property.getName(),
			type: typeChecker.typeToString(propertyType),
			required: !(property.flags & SymbolFlags.Optional),
			docs:
				displayPartsToString(property.getDocumentationComment(typeChecker)) ||
				null,
		});
	}
	return props;
}

export function parse(
	code: string,
	path: string,
	options: CompilerOptions = {},
) {
	const host = createCompilerHost({});
	const originalGetSourceFile = host.getSourceFile;
	host.getCurrentDirectory = () => dirname(path);
	host.getSourceFile = (fileName, languageVersion) => {
		if (fileName === "component.tsx") {
			return createSourceFile(fileName, code, ScriptTarget.Latest, true);
		}
		return originalGetSourceFile(
			resolve(dirname(path), fileName),
			languageVersion,
		);
	};
	const program = createProgram({
		rootNames: ["component.tsx"],
		options: {
			...defaultCompilerOptions,
			baseUrl: dirname(path),
			paths: {
				"*": ["*", "node_modules/*"],
			},
			...options,
		},
		host: host,
	});

	return {
		sourceFile: program.getSourceFile("component.tsx"),
		typeChecker: program.getTypeChecker(),
	};
}

export function walk(node: Node, callback: (node: Node) => void) {
	forEachChild(node, (node) => {
		callback(node);
		walk(node, callback);
	});
}
