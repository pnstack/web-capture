# Template node typescript

## Getting Started
Instructions for installing dependencies and running the app locally.

```bash
npm install
npm run dev
```

## Project Structure
Overview of the project files and directories.

```
src/ - TypeScript source code
dist/ - Compiled JavaScript output
test/ - Unit tests
```
## Scripts
Explanation of the main NPM scripts for development.

dev - Starts the app in development mode with live reloading
build - Compiles TypeScript to JavaScript
start - Runs the compiled app
test - Runs unit tests

## Remote Browser Support

This application supports connecting to remote browser services like BrowserStack or LambdaTest via CDP (Chrome DevTools Protocol).

### Configuration

Set the `BROWSER_WS_ENDPOINT` environment variable to connect to a remote browser:

```bash
# BrowserStack example
BROWSER_WS_ENDPOINT=wss://cdp.browserstack.com/playwright?caps=<encoded_capabilities>

# LambdaTest example
BROWSER_WS_ENDPOINT=wss://cdp.lambdatest.com/playwright?capabilities=<encoded_capabilities>
```

When `BROWSER_WS_ENDPOINT` is not set, the application uses a local browser.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BROWSER_WS_ENDPOINT` | WebSocket endpoint for remote browser connection | (empty - uses local browser) |
| `HEADLESS` | Run browser in headless mode (only applies to local browser) | `true` |
| `PORT` | Server port | `5510` |

Deployment
Notes on how to deploy the app to production.

# Built With
Node.js - JavaScript runtime
TypeScript - Typed superset of JavaScript
# License
Overview of license used for the project.

# Acknowledgments
Shoutouts to tutorials, libraries, and resources that were helpful.

Let me know if you would like me to expand or modify this suggested README. I aimed to provide a high-level overview based on the context provided.