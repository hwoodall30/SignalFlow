import { expect, test } from 'vitest';
import { cloneDeep, compareArrays, isDOMElement, isEqual } from '../../src/helpers/helpers';
import { html } from '../../src/framework/framework';

// Compare Arrays
test('Compare Arrays - Added', () => {
	const array1 = [1, 2, 3];
	const array2 = array1.concat([4, 5, 6]);
	expect(compareArrays(array1, array2)).toEqual([
		{ index: 3, type: 'added', value: 4 },
		{ index: 4, type: 'added', value: 5 },
		{ index: 5, type: 'added', value: 6 },
	]);
});

test('Compare Arrays - Deleted', () => {
	const array1 = [1, 2, 3, 4, 5, 6];
	const array2 = [1, 2, 3];
	expect(compareArrays(array1, array2)).toEqual([
		{ index: 3, type: 'deleted', value: 4 },
		{ index: 4, type: 'deleted', value: 5 },
		{ index: 5, type: 'deleted', value: 6 },
	]);
});

test('Compare Arrays - Modified', () => {
	const array1 = [1, 2, 3, 4, 5, 6];
	const array2 = [1, 2, 3, 7, 8, 9];
	expect(compareArrays(array1, array2)).toEqual([
		{ index: 3, type: 'modified', oldValue: 4, value: 7 },
		{ index: 4, type: 'modified', oldValue: 5, value: 8 },
		{ index: 5, type: 'modified', oldValue: 6, value: 9 },
	]);
});

test('Compare Arrays - No Changes', () => {
	const array1 = [1, 2, 3, 4, 5, 6];
	const array2 = array1;
	expect(compareArrays(array1, array2)).toEqual([]);
});

// isEqual
test('isEqual - primitive', () => {
	expect(isEqual(1, 1)).toBe(true);
	expect(isEqual(1, 2)).toBe(false);
});

test('isEqual - object', () => {
	expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
	expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
});

test('isEqual - array', () => {
	expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
	expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
});

test('isEqual - function', () => {
	expect(
		isEqual(
			() => {},
			() => {}
		)
	).toBe(true);
	expect(
		isEqual(
			() => {},
			() => 1
		)
	).toBe(false);
});

// Clone Deep
test('Clone Deep - primitive', () => {
	expect(cloneDeep(1)).toBe(1);
});

test('Clone Deep - object', () => {
	expect(cloneDeep({ a: 1 })).toEqual({ a: 1 });
});

test('Clone Deep - array', () => {
	expect(cloneDeep([1, 2, 3])).toEqual([1, 2, 3]);
});

// isDOMElement

test('isDOMElement - true', () => {
	expect(isDOMElement(document.createElement('div'))).toBe(true);
	expect(isDOMElement(document.createElement('span'))).toBe(true);
	expect(isDOMElement(html`<div>Test</div>`)).toBe(true);
	expect(isDOMElement({})).toBe(false);
	expect(isDOMElement('test')).toBe(false);
});
