import { signal } from './src/signals/signal';
import { html } from './src/framework/framework';
import './style.css';

function Component1() {
	return html`<div>test</div>`;
}
function Component() {
	const [count, setCount] = signal(0);
	const [input, setInput] = signal('');
	const [show, setShow] = signal(true);
	const [array, setArray] = signal([{ name: 'Work' }, { name: 'Clean' }, { name: 'Cook' }]);
	const [pokemon, setPokemon] = signal({});
	const [loadingPokemon, setLoadingPokemon] = signal(false);
	const [pokemonList, setPokemonList] = signal([]);
	const [loadingPokemonList, setLoadingPokemonList] = signal(true);

	fetch('https://pokeapi.co/api/v2/pokemon/ditto').then(async (data) => {
		setPokemon(await data.json());
	});

	fetch('https://pokeapi.co/api/v2/pokemon?limit=50').then(async (data) => {
		setPokemonList((await data.json())?.results || []);
		setLoadingPokemonList(false);
	});

	function incrementCounter() {
		setCount(count() + 1);
	}

	function handleInput(e) {
		setInput(e.target.value);
	}

	function addTodo(e) {
		e.preventDefault();
		const inputValue = input();
		if (!inputValue) return;
		setArray([...array(), { name: inputValue }]);
		setInput('');
	}

	function deleteTodo(index) {
		const newArray = [...array()];
		newArray.splice(index, 1);
		setArray(newArray);
	}

	function toggleInputValue() {
		setShow(!show());
	}

	function fetchPokemonData(name) {
		setLoadingPokemon(true);
		fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(async (data) => {
			setPokemon(await data.json());
			setLoadingPokemon(false);
		});
	}

	const loader = `<svg
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

	return html`
		<div class="container">
			<div class="counter_container">
				<button class="increment_button" on:click="${incrementCounter}" class="increment">+</button>
				<div class="count">The count is ${count} signals</div>
			</div>

			<form>
				<input class="todo_input" value="${input}" on:input="${handleInput}" />
				<button on:click="${addTodo}" class="add_todo">Add Todo</button>
			</form>

			<For each=${array} class="todo_list">
				${({ name }, i) => html`<li on:click="${() => deleteTodo(i)}" class="todo_item">${name}</li>`}
			</For>

			<If condition="${() => show()}" style="display: flex;"> ${input} </If>

			<button on:click="${toggleInputValue}">
				<If condition="${() => show()}">Hide</If>
				<If condition="${() => !show()}">Show</If>
			</button>

			<If class="pokemon_container" condition="${() => pokemon()?.name}">
				<Suspend loading="${() => loadingPokemon()}" fallback="${() => loader}">
					<div>
						<img src="${() => pokemon()?.sprites?.front_default}" />
						<div>${() => pokemon()?.name}</div>
					</div>
				</Suspend>
			</If>

			<Suspend loading="${() => loadingPokemonList()}" fallback="${() => loader}" class="pokemon_list_container"
				><For class="pokemon_list" each=${pokemonList}
					>${({ name }) => html`<li on:click="${() => fetchPokemonData(name)}">${name}</li>`}</For
				></Suspend
			>
		</div>
	`;
}

const app = document.getElementById('app');
app.appendChild(Component());
