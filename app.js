import { signal, resource, html, store } from './src/signal-flow.js';

function Counter() {
	const [count, setCount] = signal(0);

	const increment = () => setCount(count() + 1);
	const decrement = () => setCount(count() - 1);

	return html`<div class="counter">
		<h1>Simple Counter</h1>
		<p>${count}</p>
		<div>
			<button on:click=${decrement}>Decrement</button>
			<button on:click=${increment}>Increment</button>
		</div>
		${NestedCounter({ count })}
	</div>`;
}

function NestedCounter({ count }) {
	const [show, setShow] = signal(false);

	const toggle = () => setShow(!show());

	return html`<div class="nested_counter">
		<h1>Nested Counter (Using Props)</h1>
		<If condition=${show}> ${count} </If>
		<button on:click=${toggle}>${() => (show() ? 'Hide' : 'Show')}</button>
	</div>`;
}

function List() {
	const [list, setList] = signal([]);
	const [input, setInput] = signal('');

	function addItem(e) {
		e.preventDefault();
		if (input() === '') return;
		setList([...list(), { name: input() }]);
		setInput('');
	}

	function removeItem(index) {
		const newList = [...list()];
		newList.splice(index, 1);
		setList(newList);
	}
	function handleInput(e) {
		setInput(e.target.value);
	}

	return html`
		<div class="list">
			<h1>Simple Todo List</h1>
			<form>
				<input value=${input} on:input=${handleInput} />
				<button on:click=${addItem}>Add Item</button>
			</form>
			<For each=${list}> ${(item, i) => html`<li on:click=${() => removeItem(i)}>${item.name}</li>`} </For>
		</div>
	`;
}

function Loader() {
	return `<svg
		width="30"
		height="30"
		version="1.1"
		id="L9"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		x="0px"
		y="0px"
		viewBox="0 0 100 100"
		enable-background="new 0 0 0 0"
		xml:space="preserve"
	>
		<path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
			<animateTransform
				attributeName="transform"
				attributeType="XML"
				type="rotate"
				dur="1s"
				from="0 50 50"
				to="360 50 50"
				repeatCount="indefinite"
			/>
		</path>
	</svg>`;
}

async function fetchPokemon() {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
}

function PokemonList() {
	const { data, loading } = resource({
		promise: fetchPokemon(),
		key: 'results',
		initialValue: [],
	});

	const [pokemon, setPokemon] = signal(null);
	const [pokemonLoading, setPokemonLoading] = signal(false);

	async function fetchPokemonDetails(name) {
		setPokemonLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
		const data = await res.json();
		setPokemon(data);
		setPokemonLoading(false);
	}

	return html`
		<div class="fetching_data">
			<h1>Fetching Data</h1>
			<Suspend loading=${loading} fallback=${Loader}>
				<For each=${data}>
					${(pokemon) => html`<li on:click=${() => fetchPokemonDetails(pokemon.name)}>${pokemon.name}</li>`}
				</For>
			</Suspend>
			${PokemonDetails({ pokemon, pokemonLoading })}
		</div>
	`;
}

function PokemonDetails({ pokemon, pokemonLoading }) {
	return html`
		<Suspend loading=${pokemonLoading} fallback=${Loader}>
			<If class="pokemon_details" condition=${() => Object.keys(pokemon() || {})?.length > 0}>
				<h1>${() => pokemon()?.name}</h1>
				<img src=${() => pokemon()?.sprites?.front_default} />
			</If>
		</Suspend>
	`;
}

function Store() {
	const [state, setState] = store({
		counter: 2,
		list: [
			{ id: 23, title: 'Birds' },
			{ id: 27, title: 'Fish' },
		],
	});

	function increment() {
		setState('counter', (c) => c + 1);
	}

	function list() {
		setState('list', (prevList) => [...prevList, { id: 43, title: 'Marsupials' }]);
	}

	return html`<div class="counter">
		<h1>Store</h1>
		<p>${() => state.counter}</p>
		<pre>${() => JSON.stringify(state, null, 2)}</pre>
		<div>
			<button on:click=${increment}>Increment</button>
			<button on:click=${list}>Update List</button>
		</div>
	</div>`;
}

function AppContent() {
	return html`<div class="app_content">${Counter()} ${List()} ${PokemonList()} ${Store()}</div>`;
}

const app = document.getElementById('app');
app.appendChild(AppContent());
