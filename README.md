<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/hwoodall30/SignalFlow">
    <img src="./public/SignalFlowLogo.png" alt="Logo" width="200">
  </a>

  <!-- <h3 align="center">Signal Flow</h3> -->

  <p align="center">
    A very small lightweight templating library that uses Signals for fine-grained updating.
    <br />
    <a href="https://github.com/hwoodall30/SignalFlow"><strong>Explore the code »</strong></a>
    <br />
    <br />
    <a href="https://github.com/hwoodall30/SignalFlow">View Demo</a>
    ·
    <a href="https://github.com/hwoodall30/SignalFlow/issues">Report Bug</a>
    ·
    <a href="https://github.com/hwoodall30/SignalFlow/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
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

There are a lot of great JavaScript frameworks. Solid, Svelte, React, Vue, Qwik, etc. are all fantastic choices and are actually recommended for large and complex projects. But each of these framework require a build step in order to natively run on the web.

SignalFlow takes a different approach by using signals to embed fine-grained updating into your UI at runtime.

Here's why:

-   What if you were working on a site that had no framework installed and wanted to add a new widget to it? If you wanted to use a JavaScript framework such as React to do this, you would have to also include all of React's dependencies in order to render which can be heavy. This is exactly what SignalFlow aims to solve.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This project was built with no external libraries or dependencies.

-   [![JavaScript][JavaScriptImage]][JavaScriptUrl]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation

-   npm
    ```sh
    npm install signal-flow
    ```

<!-- USAGE EXAMPLES -->

## Usage

-   Signals
    -   Signals are the core principle that powers SignalFlow.
    -   Signals are composed of:
        -   Signals
            -   Signals are the reactive values that change.
        -   Effects
            -   Effects are side effect callbacks that run when a tracked Signal changes.
        -   Derived Values or Memos
            -   Derived Values are values that are derived from other signals.
                -   Ex.
                ```js
                const [signal, setSignal] = signal(5);
                const derived = () => signal() * 2;
                console.log(derived()); // Even if the signal changes, the derived value will be up to date as the signal * 2
                ```
            -   Memos are derived values that are memoized..
-   `html` Function
    -   Here you can pass in a string template literal to the `html` function. You can use your signals in the template literal to make the string dynamic.
    -   **_Note: In order for a value to be reactive, the value passed must be a function._**
    -   Special Elements
        -   For
            -   This is a special element used to loop over arrays. It takes an `each` attribute which is the array to loop over. And the child is is a function that is called for each item in the array.
                -   Ex.
                ```js
                const [array, setArray] = signal([1, 2, 3]);
                html` <For class="list" each=${array}> ${(item) => html`<li>${item}</li>`} </For> `;
                ```
        -   If
            -   This is a special element that will only render if the `condition` attribute is `true`
                -   Ex.
                ```js
                const [condition, setCondition] = signal(true);
                html`
                	<If condition=${condition}>
                		<p>Condition is true</p>
                	</If>
                `;
                ```
        -   Suspend
            -   This is a special element that will display the `fallback` until the `loading` attribute is `false`
                -   Ex.
                ```js
                const [loading, setLoading] = signal(true);
                html`
                	<Suspend loading="${condition}" fallback="${() => html`<p>Loading...</p>`}">
                		<p>Condition is true</p>
                	</Suspend>
                `;
                ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

-   [x] Add Changelog
-   [ ] Add better array diffing for For component
-   [ ] Add more "Special Components"

See the [open issues](https://github.com/hwoodall30/SignalFlow/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

<!-- CONTACT -->

## Contact

Hunter Woodall - [@your_twitter](https://twitter.com/hwoodall30) - hwoodall30@gmail.com

Project Link: [https://github.com/hwoodall30/SignalFlow](https://github.com/hwoodall30/SignalFlow)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

-   [Solid.js](https://www.solidjs.com/)
-   [Building a Reactive Library from Scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)
-   [Tagged Template Literals](https://webreflection.medium.com/bringing-jsx-to-template-literals-1fdfd0901540)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-url]: https://github.com/hwoodall30/SignalFlow/graphs/contributors
[forks-url]: https://github.com/hwoodall30/SignalFlow/network/members
[stars-url]: https://github.com/hwoodall30/SignalFlow/stargazers
[issues-url]: https://github.com/hwoodall30/SignalFlow/issues
[JavaScriptImage]: ./public/JavaScript.png
[JavaScriptUrl]: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics
