export function compareArrays(oldArray, newArray) {
	const changes = [];

	const maxLength = Math.max(oldArray.length, newArray.length);

	for (let index = 0; index < maxLength; index++) {
		const oldItem = oldArray[index];
		const newItem = newArray[index];

		if (!isEqual(oldItem, newItem)) {
			if (oldItem === undefined) changes.push({ index, type: 'added', value: newItem });
			else if (newItem === undefined) changes.push({ index, type: 'deleted', value: oldItem });
			else changes.push({ index, type: 'modified', oldValue: oldItem, value: newItem });
		}
	}

	return changes;
}

export function isEqual(a, b) {
	if (typeof a !== typeof b) return false;

	if (typeof a === 'object' && a !== null && b !== null) {
		const keysA = Object.keys(a || []);
		const keysB = Object.keys(b || []);

		if (keysA.length !== keysB.length) return false;

		for (const key of keysA) if (!isEqual(a[key], b[key])) return false;

		return true;
	}

	if (typeof a === 'function') return a.toString() === b.toString();

	if (typeof a === 'symbol' || typeof b === 'symbol') return Symbol.keyFor(a) === Symbol.keyFor(b);

	return a === b;
}

export function cloneDeep(value, cloned = new WeakMap()) {
	if (value === null || typeof value !== 'object') return value;

	if (cloned.has(value)) return cloned.get(value);

	if (Array.isArray(value)) {
		const newArray = [];
		cloned.set(value, newArray);
		value.forEach((item, index) => (newArray[index] = cloneDeep(item, cloned)));
		return newArray;
	}

	if (value instanceof Date) return new Date(value);

	if (value instanceof RegExp) {
		const flags = value.flags;
		return new RegExp(value.source, flags);
	}

	if (value instanceof Map) {
		const newMap = new Map();
		cloned.set(value, newMap);
		value.forEach((val, key) => {
			newMap.set(cloneDeep(key, cloned), cloneDeep(val, cloned));
		});
		return newMap;
	}

	if (value instanceof Set) {
		const newSet = new Set();
		cloned.set(value, newSet);
		value.forEach((val) => newSet.add(cloneDeep(val, cloned)));
		return newSet;
	}

	if (typeof value === 'object') {
		const newObj = {};
		cloned.set(value, newObj);
		for (const key in value) {
			if (value.hasOwnProperty(key)) newObj[key] = cloneDeep(value[key], cloned);
		}
		return newObj;
	}

	if (typeof value === 'function') return value;

	return value;
}

export function isDOMElement(variable) {
	return variable instanceof Element || variable instanceof Node;
}
