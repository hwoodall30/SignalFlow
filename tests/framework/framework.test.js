import { expect, test } from 'vitest';
import { html } from '../../src/framework/framework';
import { signal } from '../../src/signals/signal';

test('Create dom node', () => {
	const result = html`<div>Test</div>`;
	expect(result).toBeInstanceOf(HTMLElement);
});

test('<If> Element', () => {
	const result = html`
		<If condition=${() => true}>
			<div>Test</div>
		</If>
	`;
	expect(result).toBeInstanceOf(HTMLElement);
});

test('<For> Element', () => {
	const [array, _] = signal([{ name: 'Work' }, { name: 'Clean' }, { name: 'Cook' }]);
	const result = html`<For each=${array}> ${(item) => html`<li>${item.name}</li>`} </For>`;
	expect(result).toBeInstanceOf(HTMLElement);
});

test('<Suspend> Element', () => {
	const [loading, _] = signal(true);
	const loader = () => html`<div>Loading...</div>`;
	const result = html`<Suspend loading=${loading} fallback=${loader}>Test</Suspend>`;
	expect(result).toBeInstanceOf(HTMLElement);
});
