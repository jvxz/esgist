<div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
  <code style="font-weight: bold; font-size: 3rem; text-align: center; font-family: monospace;">gslint</code>
  
  <p style="font-size: 1.5rem;">GitHub Gist → ESLint config</p>
</div>

## Features

- Automatic dependency detection + installation
- ESLint config file detection
- Manual override via CLI args

## Usage

```bash
npx gslint # Initiate the wizard
npx gslint --yes # Skip Node.js project and commit warnings
npx gslint --package-manager npm # Manually specify package manager (in this case, npm)
npx gslint --gist https://gist.github.com/... # Provide Gist to use for the config
```

## License

MIT 2025 [@jvxz](https://github.com/jvxz)
