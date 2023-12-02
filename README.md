<!-- README TOP ANCHOR -->

<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/hwoodall30/SignalFlow">
    <img src="./public/SignalFlowLogo.png" alt="Logo" width="200">
  </a>

  <p align="center">
    A very small, lightweight templating library that uses Signals for fine-grained updating.
    <br />
    <a href="https://github.com/hwoodall30/SignalFlow"><strong>Explore the code »</strong></a>
    <br />
    <a href="https://hwoodall30.github.io/SignalFlow/index.html">View Demo</a> ·
    <a href="https://github.com/hwoodall30/SignalFlow/issues">Report Bug</a> ·
    <a href="https://github.com/hwoodall30/SignalFlow/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

There are many fantastic JavaScript frameworks, such as Solid, Svelte, React, Vue, Qwik, etc., which are recommended for large and complex projects. However, each of these frameworks requires a build step to run natively on the web.

SignalFlow differs by using signals to embed fine-grained updating into your UI at runtime.

Here's why:

-   Project without a framework may want to include a widget without adding heavy dependencies.
-   SignalFlow provides a lightweight solution for this use case.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

-   Vanilla JavaScript ([Learn more][JavaScriptUrl])

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Installation

1. Install SignalFlow via npm:
    ```sh
    npm install signal-flow
    ```

<!-- USAGE EXAMPLES -->

## Usage

-   **Signals**:

    -   Reactive values known as _Signals_
    -   _Effects_ (callbacks for when Signals change)
    -   _Derived_ Values or _Memos_ (values based on other Signals)
        ```js
        const [signal, setSignal] = signal(5);
        const derived = () => signal() * 2;
        console.log(derived()); // Outputs signal * 2
        ```

-   **`html` Function**:

    -   Render dynamic templates with Signals embedded in a string literal.
    -   To make values reactive, pass them as functions.

-   **Special Elements**:
    -   _For_: Iterates over arrays <br>
        _Attributes_:
        -   `each` - **type**: `array` - The array to iterate over
        ```js
        const [array, setArray] = signal([1, 2, 3]);
        html` <For class="list" each=${array}> ${(item) => html`<li>${item}</li>`} </For> `;
        ```
    -   _If_: Conditionally render content <br>
        _Attributes_:
        -   `condition` - **type**: `function => boolean` - The condition to evaluate. If `true` the content will be rendered
        ```js
        const [condition, setCondition] = signal(true);
        html`
        	<If condition=${condition}>
        		<p>Condition is true</p>
        	</If>
        `;
        ```
    -   _Suspend_: Provide a fallback UI during loading <br>
        _Attributes_:
        -   `loading` - **type**: `function => boolean` - The condition to evaluate. If `true` the fallback will be rendered, otherwise the child content will be rendered.
        -   `fallback` - **type**: `function => htmlElement | string` - The fallback UI.
        ```js
        const [loading, setLoading] = signal(true);
        html`
        	<Suspend loading="${condition}" fallback="${() => html`<p>Loading...</p>`}">
        		<content />
        	</Suspend>
        `;
        ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

-   [x] Add Changelog
-   [ ] Improve array diffing for For component
-   [ ] Implement additional Special Components
-   [ ] Expand and enhance documentation

Visit the [issue tracker](https://github.com/hwoodall30/SignalFlow/issues) for future feature plans and current issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

We encourage community contributions. Here's how you can contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Don't forget to star the project and tag any issues with "enhancement". Your support is much appreciated!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Hunter Woodall - [@hwoodall30 on Twitter](https://twitter.com/hwoodall30) - Email: hwoodall30@gmail.com

Project Link: [SignalFlow on GitHub](https://github.com/hwoodall30/SignalFlow)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Resources that have been particularly helpful:

-   [Solid.js](https://www.solidjs.com/)
-   [Building a Reactive Library from Scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)
-   [Tagged Template Literals](https://webreflection.medium.com/bringing-jsx-to-template-literals-1fdfd0901540)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-url]: https://github.com/hwoodall30/SignalFlow/graphs/contributors
[forks-url]: https://github.com/hwoodall30/SignalFlow/network/members
[stars-url]: https://github.com/hwoodall30/SignalFlow/stargazers
[issues-url]: https://github.com/hwoodall30/SignalFlow/issues
[JavaScriptUrl]: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics
