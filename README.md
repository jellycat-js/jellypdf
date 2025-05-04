# JellyPDF

[![npm version](https://img.shields.io/npm/v/@jellydock/jellypdf)](https://www.npmjs.com/package/@jellydock/jellypdf)
[![Node.js](https://img.shields.io/badge/node-20+-brightgreen)](https://nodejs.org/)
[![CI](https://github.com/jellydock/jellypdf/actions/workflows/ci.yml/badge.svg)](https://github.com/jellydock/jellypdf/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@jellydock/jellypdf)](./LICENSE)

A fast and flexible PDF generation toolkit for Node.js with both CLI and API interfaces.

## Project Overview

This project provides a tool for generating PDFs from HTML content, available both as a command-line interface (CLI) and as an API. Users can convert web pages into high-quality, customizable PDFs using either Puppeteer or Playwright, with various options for headers, footers, DPI, and more.

- **CLI**: The command-line tool allows developers to integrate PDF generation into automated workflows and scripts.
- **API**: The library can also be used programmatically in Node.js applications to generate PDFs within the app itself.

### Features

- Convert HTML to PDF with customizable options (headers, footers, DPI, etc.).
- Supports both **Puppeteer** and **Playwright** engines for PDF generation.
- Adjustable DPI, paper format, margins, and other settings.
- The output PDF can be saved to a specified location.
- Can be used via the command line or as part of a Node.js application.

## Installation

### Local Installation via NPM

To install the package locally in your project, run:

```bash
npm i jellycat-js/jellypdf
```

### Global Installation (CLI)

If you want to use the PDF generator as a command-line tool (CLI), you can install it globally with the following command:

```bash
npm install -g jellycat-js/jellypdf`
```

This will allow you to run the `jellypdf-cli` command directly in your terminal.

### Requirements

- **Node.js version 20 or above** is required to run this project.
- The package supports both **ESM (ECMAScript Modules)** and **MJS**.

## Usage

### CLI

Once installed, you can use the tool via the command line to generate PDFs:

```bash
jellypdf-cli --input <url_or_html_file> --output <output_path> [options]
```

#### Example

```bash
jellypdf-cli --input 'https://example.com' --output './output.pdf'
```

### API

#### ESM Import (module)

If you are using an environment that supports **ESM modules** (e.g., with `"type": "module"` in your `package.json`), you can import and use the PDF generator like this:

```js

import { generatePdf } from '@jellycat-js/jellypdf'

const outputPath = await generatePdf({
    input: 'https://example.com',
    output: 'output.pdf'
})

```

#### CommonJS Import (require)

If you are using CommonJS, you can use require like this:

```js

const { generatePdf } = require('@jellycat-js/jellypdf')

const outputPath = await generatePdf({
    input: 'https://example.com',
    output: 'output.pdf'
})

```

### TypeScript Support

`jellycat-js/jellypdf` is fully written in TypeScript and includes comprehensive type definitions.
This ensures seamless integration and type safety when used in TypeScript projects.

#### Importing Types

You can import types directly from the package to leverage TypeScript's static typing:

```ts
import type { JellyPDFOptions } from '@jellycat-js/jellypdf'
```

This allows for enhanced code completion and type checking in your development environment.

#### Type Definitions

The type definitions are included in the package and are automatically recognized by TypeScript. 
You don't need to install any additional `@types` packages. The `package.json` specifies the types entry:

```json
{
  "types": "./dist/types/jellypdf.d.ts"
}
```

This setup ensures that TypeScript can locate and utilize the type definitions without additional configuration.


## Supported Options / Configuration

Here is a detailed table of the available options to customize PDF generation:

| Option                 | Type       | Description                                                                                     | Default Value     |
|------------------------|------------|-------------------------------------------------------------------------------------------------|-------------------|
| **input**              | `string`   | URL or path to an HTML file to convert                                                          | **Required**      |
| **output**             | `string`   | Path where the PDF will be saved                                                                | **Required**      |
| **header**             | `string`   | Path to the header HTML file                                                                    | `null`            |
| **footer**             | `string`   | Path to the footer HTML file                                                                    | `null`            |
| **dpi**                | `number`   | DPI for the conversion                                                                          | `96`              |
| **format**             | `string`   | Paper format (`Letter`, `Legal`, `Tabloi`, `Ledger`, `A0`, `A1`, `A2`, `A3`, `A4`, `A5`, `A6`.) | `A4`              |
| **landscape**          | `boolean`  | Whether the PDF should be in landscape orientation                                              | `false`           |
| **base-margin**        | `number`   | Base margin in mm                                                                               | `10`              |
| **engine**             | `string`   | Generation engine (puppeteer or playwright)                                                     | `puppeteer`       |
| **auto-calc-margin**   | `boolean`  | Whether to automatically calculate margin based on header/footer                                | `true`            |
| **timeout**            | `number`   | Timeout for PDF generation in milliseconds                                                      | `30000`           |
| **verbose**            | `boolean`  | Enable detailed logging                                                                         | `false`           |
  
**Note:**  
- In the CLI, options are written in kebab-case (e.g., `base-margin`, `auto-calc-margin`).  
- In the API, options are written in camelCase (e.g., `baseMargin`, `autoCalcMargin`).  
  
Options can be provided via the command line or in the options object when using the API.

## Testing

This project uses [Jest](https://jestjs.io/) for unit testing.  
  
To run tests locally:

```bash
npm1 run test
```

To run tests in watch mode:

```bash
npm1 run test:watch
```

## Contributing

We welcome contributions! If you'd like to help, please fork the repository, create a new branch, and submit a pull request. For bug reports or feature requests, please use the issues section.  
  
Thank you for contributing!

## License

This project is licensed under the [MIT License](./LICENSE).  
  
Feel free to use, modify, and distribute it as per the terms of the license.

## Acknowledgments

- **Puppeteer** – A headless Chrome Node.js API used for generating PDFs by rendering HTML content in a headless browser.  

- **Playwright** – A browser automation library used as an alternative engine for generating PDFs, offering additional flexibility and support for cross-browser rendering.  

- Thanks to the open-source community for making these tools available for free.