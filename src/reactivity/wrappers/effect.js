import { autoStabilize, reactive } from "../reactive";

export function effect(fn) {
	autoStabilize();
	return reactive(fn, { effect: true });
}
