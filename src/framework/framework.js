import { cloneDeep, compareArrays } from '../helpers/helpers';
import { effect } from '../signals/signal';

const specialElements = {
	if: {
		requiredAttributes: ['condition'],
		fn: handleIf,
	},
	for: {
		requiredAttributes: ['each'],
		fn: handleFor,
	},
	suspend: {
		requiredAttributes: ['loading'],
		fn: handleSuspend,
	},
};

export function html(strings, ...values) {
	let fnMap = {};
	const id = crypto.randomUUID();
	const h = strings.reduce((acc, string, i) => {
		if (typeof values[i] === 'function') fnMap[`${id}_${i}`] = values[i];
		return acc + string + (typeof values[i] === 'function' ? `${id}_${i}` : values[i] ?? '');
	}, '');

	const doc = new DOMParser().parseFromString(h, 'text/html');

	function parseElement(element) {
		const result = {
			type: element.nodeName.toLowerCase(),
			attributes: {},
			updateAbleAttributes: {},
			updateAbleContent: false,
			hasFunction: null,
			children: [],
		};

		for (const attr of element.attributes) {
			if (attr.name.startsWith('on:')) result.hasFunction = attr.name.split(':')[1];
			else if (attr.value.startsWith(id)) result.updateAbleAttributes[attr.name] = getIndex(attr.value, id);
			result.attributes[attr.name] = attr.value;
		}

		for (const childNode of element.childNodes) {
			if (childNode.nodeType === 1) result.children.push(parseElement(childNode));
			else if (childNode.nodeType === 3 && childNode.nodeValue.trim() !== '') {
				result.children.push({
					type: 'text',
					updateAbleContent: childNode.textContent.includes(id),
					content: childNode.nodeValue.trim(),
				});
			}
		}

		return result;
	}

	const result = parseElement(doc.body.firstChild);

	if (onMountCallbacks?.size > 0) {
		Promise.resolve().then(() => {
			for (const cb of onMountCallbacks) {
				cb();
				onMountCallbacks.delete(cb);
			}
		});
	}

	const resultElement = createDOM(result, values, id);
	return resultElement;
}

function createDOM(parsed, values, id) {
	if (parsed.type === 'text' && !parsed.updateAbleContent) return document.createTextNode(parsed.content);

	let element;
	if (parsed.type === 'text') element = document.createTextNode(parsed.content);
	else if (parsed.type === 'for') element = document.createElement('ul');
	else if (parsed.type === 'if' || parsed.type === 'suspend') element = document.createElement('div');
	else element = document.createElement(parsed.type);

	if (Object.keys(parsed?.attributes || {}).length > 0) handleAttributes(parsed, element, values);

	if (parsed.type === 'if') handleIf(parsed, element, values);
	else if (parsed.type === 'for') handleFor(parsed, element, values, id);
	else if (parsed.type === 'suspend') handleSuspend(parsed, element, values, id);

	if (parsed.updateAbleContent) handleUpdateableContent(parsed, element, values, id);

	if (parsed.hasFunction) handleHasFunction(parsed, element, values, id);

	for (const child of parsed?.children || []) {
		if (parsed.type === 'for' || parsed.type === 'suspend') continue;
		const childElement = createDOM(child, values, id);
		element.appendChild(childElement);
	}

	return element;
}

function handleIf(parsed, element, values) {
	const index = parsed.updateAbleAttributes['condition'];
	const display = element.style.display;
	effect(() => {
		values[index]()
			? ((element.style.display = display || ''), (element.style.position = 'static'))
			: ((element.style.display = 'none'), (element.style.position = 'absolute'));
	});
}

function handleFor(parsed, element, values, id) {
	const childFuncIndex = getIndex(parsed.children[0].content, id);
	const childFunc = values[childFuncIndex];
	const arrayIndex = parsed.updateAbleAttributes['each'];
	let currentArray = [];
	effect(() => {
		const array = values[arrayIndex]();
		const changes = compareArrays(currentArray, array);

		for (const change of changes) {
			if (change.type === 'added') element.appendChild(childFunc(change.value, change.index));
			else if (change.type === 'deleted') element.removeChild(element.children[change.index]);
			else if (change.type === 'modified')
				element.replaceChild(childFunc(change.value, change.index), element.children[change.index]);
		}

		currentArray = cloneDeep(array);
	});
}

function handleSuspend(parsed, element, values, id) {
	const { loading, fallback } = parsed.attributes;

	if (loading && !loading.includes(id))
		throw new Error('Must pass in a function that returns the loading state. e.g. () => true');
	if (fallback && !fallback.includes(id))
		throw new Error('Must pass in a function that returns the fallback element. e.g. () => html`<div>Loading...</div>');

	const loadingIndex = getIndex(loading, id);
	const fallbackIndex = getIndex(fallback, id);

	let fallbackNode;
	if (fallbackIndex) fallbackNode = values[fallbackIndex]();
	else fallbackNode = fallback;

	if (typeof fallbackNode === 'string') fallbackNode = document.createTextNode(fallbackNode);

	effect(() => {
		const isLoading = typeof loading.includes(id) ? values[loadingIndex]() : loading === 'false' ? false : true;

		if (isLoading) element.appendChild(fallbackNode);
		else {
			if (element.contains(fallbackNode)) element.removeChild(fallbackNode);

			for (const child of parsed.children) {
				const childElement = createDOM(child, values, id);
				element.appendChild(childElement);
			}
		}
	});
}

function handleUpdateableContent(parsed, element, values, id) {
	const startText = parsed.content.split(`${id}_`)[0];
	const match = /\b(?<id>[a-f0-9-]+)_(?<number>\d+)\b/i.exec(parsed.content);
	const index = match.groups.number;
	const afterText = parsed.content.split(`${id}_${index}`)[1];
	effect(() => {
		element.textContent = (startText ?? '') + values[index]() + (afterText ?? '');
	});
}

function handleHasFunction(parsed, element, values, id) {
	element.addEventListener(parsed.hasFunction, (e) => {
		const attributes = parsed.attributes;
		for (const key of Object.keys(attributes)) {
			if (!key.startsWith('on:')) continue;
			values[getIndex(element.getAttribute(key), id)](e);
		}
	});
}

function handleAttributes(parsed, element, values) {
	for (const [key, value] of Object.entries(parsed?.attributes || {})) {
		if (parsed.updateAbleAttributes[key]) {
			const index = parsed.updateAbleAttributes[key];
			effect(() => {
				const value = values[index]();
				if (key === 'value') element.value = value;
				if (parsed.type === 'for' && key === 'each') return;
				element.setAttribute(key, values[index]());
			});
		}
		element.setAttribute(key, value);
	}
}

let onMountCallbacks = new Set();
export function onMount(cb) {
	onMountCallbacks.add(cb);
}

function getIndex(idString, id) {
	return idString.replace(`${id}_`, '');
}

function isDOMElement(variable) {
	return variable instanceof Element || variable instanceof Node;
}
