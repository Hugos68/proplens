import {
	SymbolFlags,
	type Type,
	type TypeChecker,
	createCompilerHost,
	createProgram,
	createSourceFile,
	displayPartsToString,
} from "typescript";
import type { Prop } from "./types";

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

export function parseTsx(code: string) {
	const compilerHost = createCompilerHost({});
	compilerHost.getSourceFile = (fileName, languageVersion) => {
		return createSourceFile(fileName, code, languageVersion, true);
	};
	const program = createProgram({
		rootNames: ["component.tsx"],
		options: {},
		host: compilerHost,
	});

	return {
		sourceFile: program.getSourceFile("component.tsx"),
		typeChecker: program.getTypeChecker(),
	};
}
