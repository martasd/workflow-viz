# Workflow-viz

**WARNING: This project is currently not maintained.** 

Visualizes XML Workflow Descriptor using SVG.

See [Demo](https://martasd.github.io/workflow-viz) for a live example . To display a visualization, upload a workflow file from `test-input` directory such as `strate.xml`.

**Note:** This is currently disabled as the repository is now private on GitHub.

## Displaying locally

To display the web app locally, open `docs/index.html` in your favorite browser.

## Development

You need to install the following to be able to run the live development server locally:

- Node.js
- npm package manager
- Angular CLI:

        npm install -g @angular/cli

To launch the server, execute:

    ng serve --open

A new browser window opens accessing the running instance of the local live development server.

## Code Documentation

Documentation for the project can be generated with [Compodoc](https://compodoc.app):

    compodoc -p tsconfig.json

## Deployment

Deployment on Github pages does not work when the project is built in the **./dist** directory, so using **./docs** instead:

    ng build --prod --output-path docs --base-href "https://martasd.github.io/workflow-viz/"
    npx angular-cli-ghpages --dir  docs

Change `base-href` if you would like to deploy to your own Github pages.
