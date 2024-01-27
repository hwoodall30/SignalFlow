export const context = [];

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
		[...subscriptions].forEach((sub) => sub.execute());
	};
	return [read, write, subscriptions];
}

export function resource({ initialValue, promise, key }) {
	const [data, setData] = signal(initialValue);
	const [loading, setLoading] = signal(true);
	promise
		.then(async (res) => {
			const json = await res.json();
			let data = json;
			if (key) {
				const keysArray = key.split('.');
				data = keysArray.reduce((obj, k) => (obj[k] = obj[k] || {}), json);
			}
			setData(data);
			setLoading(false);
		})
		.catch((err) => console.error(err))
		.finally(() => setLoading(false));
	return { data, setData, loading };
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
		execute() {
			cleanupChildEffects(effect);
			cleanup(effect);
			context.push(effect);
			addChildEffects(effect);
			try {
				fn();
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
