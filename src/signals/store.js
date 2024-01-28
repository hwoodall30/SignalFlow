import { context, signal } from './signal.js';

export const $RAW = Symbol('store-raw'),
	$NODE = Symbol('store-node'),
	$HAS = Symbol('store-has'),
	$SELF = Symbol('store-self'),
	$PROXY = Symbol('store-proxy'),
	$TRACK = Symbol('solid-track');

function wrap(value) {
	let p = value[$PROXY];
	if (!p) {
		Object.defineProperty(value, $PROXY, { value: (p = new Proxy(value, proxyTraps)) });
		if (!Array.isArray(value)) {
			const keys = Object.keys(value),
				desc = Object.getOwnPropertyDescriptors(value);
			for (let i = 0, l = keys.length; i < l; i++) {
				const prop = keys[i];
				if (desc[prop].get) {
					Object.defineProperty(value, prop, {
						enumerable: desc[prop].enumerable,
						get: desc[prop].get.bind(p),
					});
				}
			}
		}
	}
	return p;
}

export function isWrappable(obj) {
	let proto;
	return (
		obj != null &&
		typeof obj === 'object' &&
		(obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj))
	);
}

export function unwrap(item, set = new Set()) {
	let result, unwrapped, v, prop;
	if ((result = item != null && item[$RAW])) return result;
	if (!isWrappable(item) || set.has(item)) return item;
	if (Array.isArray(item)) {
		if (Object.isFrozen(item)) item = item.slice(0);
		else set.add(item);
		for (let i = 0, l = item.length; i < l; i++) {
			v = item[i];
			if ((unwrapped = unwrap(v, set)) !== v) item[i] = unwrapped;
		}
	} else {
		if (Object.isFrozen(item)) item = Object.assign({}, item);
		else set.add(item);
		const keys = Object.keys(item),
			desc = Object.getOwnPropertyDescriptors(item);
		for (let i = 0, l = keys.length; i < l; i++) {
			prop = keys[i];
			if (desc[prop].get) continue;
			v = item[prop];
			if ((unwrapped = unwrap(v, set)) !== v) item[prop] = unwrapped;
		}
	}
	return item;
}

export function getNodes(target, symbol) {
	let nodes = target[symbol];
	if (!nodes) Object.defineProperty(target, symbol, { value: (nodes = Object.create(null)) });
	return nodes;
}

export function getNode(nodes, property, value) {
	if (nodes[property]) return nodes[property];
	const [s, set] = signal(value);
	s.$ = set;
	return (nodes[property] = s);
}

export function proxyDescriptor(target, property) {
	const desc = Reflect.getOwnPropertyDescriptor(target, property);
	if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE) return desc;
	delete desc.value;
	delete desc.writable;
	desc.get = () => target[$PROXY][property];
	return desc;
}

export function trackSelf(target) {
	/*getListener() && */ context.length > 0 && getNode(getNodes(target, $NODE), $SELF)();
}

export function ownKeys(target) {
	trackSelf(target);
	return Reflect.ownKeys(target);
}

const proxyTraps = {
	get(target, property, receiver) {
		if (property === $RAW) return target;
		if (property === $PROXY) return receiver;
		if (property === $TRACK) {
			trackSelf(target);
			return receiver;
		}
		const nodes = getNodes(target, $NODE);
		const tracked = nodes[property];
		let value = tracked ? tracked() : target[property];
		if (property === $NODE || property === $HAS || property === '__proto__') return value;
		if (!tracked) {
			const desc = Object.getOwnPropertyDescriptor(target, property);
			if (
				/*getListener() && */ context.length > 0 &&
				(typeof value !== 'function' || target.hasOwnProperty(property)) &&
				!(desc && desc.get)
			)
				value = getNode(nodes, property, value)();
		}
		return isWrappable(value) ? wrap(value) : value;
	},
	has(target, property) {
		if (
			property === $RAW ||
			property === $PROXY ||
			property === $TRACK ||
			property === $NODE ||
			property === $HAS ||
			property === '__proto__'
		)
			return true;
		/* getListener() && */ context.length > 0 && getNode(getNodes(target, $HAS), property)();
		return property in target;
	},
	set() {
		return true;
	},
	deleteProperty() {
		return true;
	},
	ownKeys: ownKeys,
	getOwnPropertyDescriptor: proxyDescriptor,
};

export function setProperty(state, property, value, deleting = false) {
	if (!deleting && state[property] === value) return;
	const prev = state[property],
		len = state.length;
	if (value === undefined) {
		delete state[property];
		if (state[$HAS] && state[$HAS][property] && prev !== undefined) state[$HAS][property].$();
	} else {
		state[property] = value;
		if (state[$HAS] && state[$HAS][property] && prev === undefined) state[$HAS][property].$();
	}
	let nodes = getNodes(state, $NODE),
		node;
	if ((node = getNode(nodes, property, prev))) node.$(() => value);
	if (Array.isArray(state) && state.length !== len) {
		for (let i = state.length; i < len; i++) (node = nodes[i]) && node.$();
		(node = getNode(nodes, 'length', len)) && node.$(state.length);
	}
	(node = nodes[$SELF]) && node.$();
}

function mergeStoreNode(state, value) {
	const keys = Object.keys(value);
	for (let i = 0; i < keys.length; i += 1) {
		const key = keys[i];
		setProperty(state, key, value[key]);
	}
}

function updateArray(current, next) {
	if (typeof next === 'function') next = next(current);
	next = unwrap(next);
	if (Array.isArray(next)) {
		if (current === next) return;
		let i = 0,
			len = next.length;
		for (; i < len; i++) {
			const value = next[i];
			if (current[i] !== value) setProperty(current, i, value);
		}
		setProperty(current, 'length', len);
	} else mergeStoreNode(current, next);
}

export function updatePath(current, path, traversed = []) {
	let part,
		prev = current;
	if (path.length > 1) {
		part = path.shift();
		const partType = typeof part,
			isArray = Array.isArray(current);
		if (Array.isArray(part)) {
			// Ex. update('data', [2, 23], 'label', l => l + ' !!!');
			for (let i = 0; i < part.length; i++) {
				updatePath(current, [part[i]].concat(path), traversed);
			}
			return;
		} else if (isArray && partType === 'function') {
			// Ex. update('data', i => i.id === 42, 'label', l => l + ' !!!');
			for (let i = 0; i < current.length; i++) {
				if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
			}
			return;
		} else if (isArray && partType === 'object') {
			// Ex. update('data', { from: 3, to: 12, by: 2 }, 'label', l => l + ' !!!');
			const { from = 0, to = current.length - 1, by = 1 } = part;
			for (let i = from; i <= to; i += by) {
				updatePath(current, [i].concat(path), traversed);
			}
			return;
		} else if (path.length > 1) {
			updatePath(current[part], path, [part].concat(traversed));
			return;
		}
		prev = current[part];
		traversed = [part].concat(traversed);
	}
	let value = path[0];
	if (typeof value === 'function') {
		value = value(prev, traversed);
		if (value === prev) return;
	}
	if (part === undefined && value == undefined) return;
	value = unwrap(value);
	if (part === undefined || (isWrappable(prev) && isWrappable(value) && !Array.isArray(value))) {
		mergeStoreNode(prev, value);
	} else setProperty(current, part, value);
}
/**
 * creates a reactive store that can be read through a proxy object and written with a setter function
 *
 * @description https://www.solidjs.com/docs/latest/api#createstore
 */
export function store(...[store]) {
	const unwrappedStore = unwrap(store || {});
	const isArray = Array.isArray(unwrappedStore);
	const wrappedStore = wrap(unwrappedStore);
	function setStore(...args) {
		isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
	}
	return [wrappedStore, setStore];
}
