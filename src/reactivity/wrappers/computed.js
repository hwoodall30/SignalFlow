import { reactive } from "../reactive";

export function computed(fn) {
	const node = reactive(fn);

	return () => node.get();
}
