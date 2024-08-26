import { signal } from "./signal";

export function resource({ initialValue, promise, key }) {
	const [data, setData] = signal(initialValue);
	const [loading, setLoading] = signal(true);
	const [err, setErr] = signal(null);
	promise
		.then(async (res) => {
			const json = await res.json();
			let data = json;
			if (key) {
				const keysArray = key.split(".");
				data = keysArray.reduce((obj, k) => (obj[k] = obj[k] || {}), json);
			}
			setData(data);
			setLoading(false);
		})
		.catch((err) => setErr(err))
		.finally(() => setLoading(false));
	return { data, setData, loading, err };
}
