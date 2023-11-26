const context = [];

function subscribe(running, subscriptions) {
	subscriptions.add(running);
	running.dependencies.add(subscriptions);
}

export function signal(value) {
	const subscriptions = new Set();

	const read = () => {
		const running = context[context.length - 1];
		if (running) subscribe(running, subscriptions);
		return value;
	};

	const write = (nextValue) => {
		value = typeof nextValue === 'function' ? nextValue(value) : nextValue;
		[...subscriptions].forEach((sub) => sub.execute(value));
	};
	return [read, write, subscriptions];
}

function cleanup(running) {
	for (const dep of running.dependencies) dep.delete(running);
	running.dependencies.clear();
}

function cleanupChildEffects(running) {
	if (running.childEffects.size === 0) return;
	for (const child of running.childEffects) {
		cleanup(child);
		cleanupChildEffects(child);
	}
	running.childEffects.clear();
}

function addChildEffects(effect) {
	const effectIndex = context.indexOf(effect);
	if (effectIndex < 1) return;
	for (let i = 0; i < effectIndex; i++) context[i].childEffects.add(effect);
}

export function effect(fn) {
	const effect = {
		execute(changed = []) {
			cleanupChildEffects(effect);
			cleanup(effect);
			context.push(effect);
			addChildEffects(effect);
			try {
				fn(changed);
			} finally {
				context.pop();
			}
		},
		dependencies: new Set(),
		childEffects: new Set(),
	};

	effect.execute();
}

export function memo(fn) {
	let cachedValue;

	const [s, set] = signal();

	effect(() => {
		const newValue = fn();
		if (newValue === cachedValue) return;
		cachedValue = newValue;
		set(cachedValue);
	});

	return s;
}
