import { reactive } from "../reactive";

export function signal(value) {
	const node = reactive(value);

	return [() => node.get(), (v) => node.set(v)];
}
