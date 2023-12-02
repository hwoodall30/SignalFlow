import { expect, test, vi } from 'vitest';
import { effect, memo, signal } from '../../src/signals/signal';

test('Signals', async () => {
	const [count, setCount] = signal(0);

	setCount(count() + 1);

	await Promise.resolve();

	expect(count()).toBe(1);
});

test('Effects', async () => {
	const [count, setCount] = signal(0);
	const fn = vi.fn();

	effect(() => {
		fn(count());
	});

	setCount(count() + 1);
	setCount(count() + 1);

	await Promise.resolve();

	expect(fn).toBeCalledTimes(3);
});

test('Memo', async () => {
	const [count, setCount] = signal({ count: 1 });
	const fn = vi.fn();

	const memoCount = memo(() => {
		fn();
		return { count: count().count * 2 };
	});

	setCount({ count: count().count + 1 });

	await Promise.resolve();

	expect(fn).toBeCalledTimes(2);
	expect(memoCount().count).toBe(4);
});
