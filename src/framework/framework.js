import { cloneDeep, compareArrays, isDOMElement } from "../helpers/helpers.js";
import { effect } from "../signal-flow.js";

const idIndexRegex = (id) => new RegExp(`^${id}_([0-9]+)$`);

const specialElements = {
	if: {
		requiredAttributes: ["condition"],
		fn: handleIf,
		createFn: () => document.createElement("div"),
		renderChildren: true,
	},
	for: {
		requiredAttributes: ["each"],
		fn: handleFor,
		createFn: () => document.createElement("ul"),
		renderChildren: false,
	},
	suspend: {
		requiredAttributes: ["loading", "fallback"],
		fn: handleSuspend,
		createFn: () => document.createElement("div"),
		renderChildren: false,
	},
};

export function html(strings, ...values) {
	/* prettier-ignore */
	const fnMap = {}, domMap = {}, id = crypto.randomUUID();

	const h = strings.reduce((acc, string, i) => {
		if (typeof values[i] === "function") {
			fnMap[`${id}_${i}`] = values[i];
			return acc + string + `${id}_${i}`;
		} else if (isDOMElement(values[i])) {
			domMap[`${id}_${i}`] = values[i];
			return acc + string + `<template component-placeholder="${id}__${i}"></template>`;
		} else return acc + string + values[i] ?? "";
	}, "");

	const doc = new DOMParser().parseFromString(h, "text/html");

	const parseElementContext = { element: doc.body.firstChild, id, fnMap };
	const result = parseElement(parseElementContext);

	const createDOMContext = { result, values, id, fnMap };
	const resultElement = createDOM(createDOMContext);

	if (Object.keys(domMap)?.length > 0) {
		for (const [key, value] of Object.entries(domMap)) {
			const index = key.split("_")[1];
			const domNode = resultElement.querySelector(`[component-placeholder="${id}__${index}"]`);
			const parent = domNode.parentNode;
			parent.replaceChild(value, domNode);
		}
	}

	return resultElement;
}

function parseElement(context) {
	if (context.element.nodeName.toLowerCase() === "svg")
		throw new Error("SVG elements are not supported by the html function");

	const { element, id } = context;

	const result = {
		type: element.nodeName.toLowerCase(),
		attributes: {},
		updateAbleAttributes: {},
		updateAbleContent: [],
		hasFunction: [],
		children: [],
	};

	for (const attr of element.attributes) {
		if (attr.name.startsWith("on:")) result.hasFunction.push(attr.name.split(":")[1]);
		else if (idIndexRegex(id).test(attr.value)) result.updateAbleAttributes[attr.name] = attr.value;
		result.attributes[attr.name] = attr.value;
	}

	for (const child of element.childNodes) {
		if (child.nodeType === 1) result.children.push(parseElement({ ...context, element: child }));
		else if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
			result.children.push({
				type: "text",
				updateAbleContent: child.nodeValue.match(new RegExp(`${id}_\\d+`, "g")),
				content: child.nodeValue.trim(),
			});
		}
	}

	return result;
}

function createDOM(context) {
	const { result } = context;

	if (result.type === "text" && !result.updateAbleContent) return document.createTextNode(result.content);

	let element;
	if (specialElements[result.type]) element = specialElements[result.type].createFn();
	else if (result.type === "text") element = document.createTextNode(result.content);
	else element = document.createElement(result.type);

	if (Object.keys(result?.attributes || {}).length > 0) handleAttributes({ ...context, element });

	if (specialElements[result.type]) specialElements[result.type].fn({ ...context, element });

	if (result.updateAbleContent?.length > 0) handleUpdateableContent({ ...context, element });

	if (result.hasFunction?.length > 0) handleHasFunction({ ...context, element });

	for (const child of result?.children || []) {
		if (specialElements[result.type] && !specialElements[result.type]?.renderChildren) continue;
		const childElement = createDOM({ ...context, result: child });
		element.appendChild(childElement);
	}

	return element;
}

function handleAttributes(context) {
	const { result, element, fnMap } = context;

	for (const [key, value] of Object.entries(result?.attributes || {})) {
		if (result.updateAbleAttributes[key]) {
			const idKey = result.updateAbleAttributes[key];
			effect(() => {
				const value = fnMap[idKey]();
				if (key === "value") element.value = value;
				if (result.type === "for" && key === "each") return;
				element.setAttribute(key, value);
			});
		} else element.setAttribute(key, value);
	}
}

function handleIf(context) {
	const { result, element, fnMap } = context;

	checkRequiredAttributes(result);

	const idKey = result.updateAbleAttributes["condition"];
	const display = element.style.display;
	effect(() => {
		fnMap[idKey]()
			? ((element.style.display = display || ""), (element.style.position = "static"))
			: ((element.style.display = "none"), (element.style.position = "absolute"));
	});
}

function handleFor(context) {
	const { result, element, fnMap } = context;

	checkRequiredAttributes(result);

	const childFuncIdKey = result.children[0].content;
	const childFunc = fnMap[childFuncIdKey];
	const idKey = result.updateAbleAttributes["each"];
	let currentArray = [];
	effect(() => {
		const array = fnMap[idKey]();
		const changes = compareArrays(currentArray, array);

		for (const change of changes) {
			if (change.type === "added") element.appendChild(childFunc(change.value, change.index));
			else if (change.type === "deleted") element.removeChild(element.children[change.index]);
			else if (change.type === "modified")
				element.replaceChild(childFunc(change.value, change.index), element.children[change.index]);
		}

		currentArray = cloneDeep(array);
	});
}

function handleSuspend(context) {
	const { result, element, id, fnMap } = context;

	checkRequiredAttributes(result);

	const { loading = "", fallback = "" } = result.attributes;
	if (!idIndexRegex(id).test(loading))
		throw new Error(
			"Must pass in a function that returns the loading state (true or false). e.g. () => true",
		);
	if (!idIndexRegex(id).test(fallback))
		throw new Error(
			"Must pass in a function that returns the fallback element. e.g. () => html`<div>Loading...</div>",
		);

	const fallbackReturn = fnMap[fallback]();

	let fallbackNode;
	if (isDOMElement(fallbackReturn)) fallbackNode = fallbackReturn;
	else {
		fallbackNode = document.createElement("div");
		fallbackNode.innerHTML = fallbackReturn;
	}

	element.removeAttribute("fallback");

	effect(() => {
		const isLoading = typeof loading.includes(id) ? fnMap[loading]() : loading === "false" ? false : true;
		element.innerHTML = "";
		if (isLoading) element.appendChild(fallbackNode);
		else {
			if (element.contains(fallbackNode)) element.removeChild(fallbackNode);

			for (const child of result.children) {
				const childElement = createDOM({ ...context, result: child });
				element.appendChild(childElement);
			}
		}
	});
}

function handleUpdateableContent({ result, element, fnMap }) {
	const updateAbleContent = result?.updateAbleContent || [];
	effect(() => {
		element.textContent = result.content.replace(
			new RegExp(`${updateAbleContent.join("|")}`, "g"),
			(match) => {
				return fnMap[match]();
			},
		);
	});
}

function handleHasFunction({ result, element, fnMap }) {
	for (const event of result?.hasFunction || []) {
		const idKey = result.attributes[`on:${event}`];
		element.addEventListener(event, (e) => fnMap[idKey](e));
	}
}

function checkRequiredAttributes(result) {
	const requiredAttributes = specialElements[result.type]?.requiredAttributes || [];

	for (const attribute of requiredAttributes) {
		if (!result.attributes[attribute])
			throw new Error(`Missing required attribute on <${result.type}>: ${attribute}`);
	}
}

export function onMount(cb) {}
