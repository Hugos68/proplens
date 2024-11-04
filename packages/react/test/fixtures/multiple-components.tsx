interface FooProps {
	foo: string;
}

export default (_props: FooProps) => <></>;

interface BarProps {
	bar: string;
}

export function Bar(_props: BarProps) {
	return <></>;
}
