import { expect, test } from 'vitest';
import { html } from '../../src/framework/framework';

test('Create dom node', () => {
	const result = html`<div>Test</div>`;
	expect(result).toBeInstanceOf(HTMLElement); // You can also use DocumentFragment if appropriate
});
