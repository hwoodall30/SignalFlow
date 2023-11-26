import { signal } from './src/signals/signal';
import { html } from './src/framework/framework';
import './style.css';

function Component() {
	const [count, setCount] = signal(0);
	const [input, setInput] = signal('');
	const [show, setShow] = signal(true);
	const [array, setArray] = signal([{ name: 'Work' }, { name: 'Clean' }, { name: 'Cook' }]);
	const [pokemon, setPokemon] = signal({});
	const [pokemonList, setPokemonList] = signal([]);

	fetch('https://pokeapi.co/api/v2/pokemon/ditto').then(async (data) => {
		setPokemon(await data.json());
	});

	setTimeout(() => {
		fetch('https://pokeapi.co/api/v2/pokemon?limit=50').then(async (data) => {
			setPokemonList((await data.json())?.results || []);
		});
	}, 3000);

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
		fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(async (data) => {
			setPokemon(await data.json());
		});
	}

	const loader = 'Loading...';

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
				<div>
					<img src="${() => pokemon()?.sprites?.front_default}" />
					<div>${() => pokemon()?.name}</div>
				</div>
			</If>
			<Suspend loading="${() => pokemonList()?.length <= 0}" fallback="${() => loader}"
				><For class="pokemon_list" each=${pokemonList}
					>${({ name }) => html`<li on:click="${() => fetchPokemonData(name)}">${name}</li>`}</For
				></Suspend
			>
		</div>
	`;
}

const app = document.getElementById('app');
app.appendChild(Component());
