<div align="center">
	<h1>
		@vyke/tsdocs
	</h1>
</div>

A simple and opinionated TypeScript **docs generator** designed to effortlessly create comprehensive API documentation for your TypeScript projects. Embracing a straightforward approach, this tool leverages JSDoc annotations within your codebase, automating the process of generating clear, organized, and easily navigable documentation for your APIs.

## Installation

```sh
npm i @vyke/tsdocs -D
```

Add a script to your package.json for easy execution:

```json
{
	"scripts": {
		"generate-docs": "tsdocs"
	}
}
```

Make sure you have a API section in your README.md file

```md
<!-- README.md -->

## API
```

## API

### generateApi

Generates api docs base on the jsdocs on the exports functions

### replaceApiSection

Replace the old api section with the given one

## Others vyke projects

- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/results](https://github.com/albizures/vyke-results)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
