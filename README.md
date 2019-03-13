# Workflow-viz

Visualizes XML Workflow Descriptor using SVG.

See [Demo](https://martasd.github.io/workflow-viz) for a live example.

## Code Documentation

Documentation is generated with [Compodoc](https://compodoc.app):

    compodoc -p tsconfig.json

It is available to display in the browser from the **./documentation** directory.

## Deployment

Deployment on Github pages does not work when the project is built in the **./dist** directory, so using **./docs** instead:

    ng build --prod --output-path docs --base-href "https://martasd.github.io/workflow-viz/"
    npx angular-cli-ghpages --dir  docs'

Change `base-href` if you would like to deploy to your own Github pages.
