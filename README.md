<h1>esgist</h1>

<p>Generate an ESLint config from a GitHub Gist.</p>

## Features

- Automatic dependency detection + installation
- ESLint config file detection
- Manual override via CLI args

## Usage

```bash
npx esgist # Initiate the wizard
npx esgist --yes # Skip Node.js project and commit warnings
npx esgist --package-manager npm # Manually specify package manager (in this case, npm)
npx esgist --gist https://gist.github.com/... # Provide Gist to use for the config
npx esgist --help # Display information about the CLI
```

## Example

<p align="center">
  <img src="assets/example.png" alt="esgist example" width="600" />
</p>

## License

MIT 2025 [@jvxz](https://github.com/jvxz)
