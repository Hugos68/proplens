import {
	SymbolFlags,
	type Type,
	type TypeChecker,
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
			docs: displayPartsToString(property.getDocumentationComment(typeChecker)),
		});
	}
	return props;
}
