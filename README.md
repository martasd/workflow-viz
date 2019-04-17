# Workflow-viz

Visualizes XML Workflow Descriptor using SVG.

See [Demo](https://martasd.github.io/workflow-viz) for a live example. To display a visualization, upload a workflow file from `test-input` directory such as `strate.xml`.

## Code Documentation

Documentation for the project can be generated with [Compodoc](https://compodoc.app):

    compodoc -p tsconfig.json

## Deployment

Deployment on Github pages does not work when the project is built in the **./dist** directory, so using **./docs** instead:

    ng build --prod --output-path docs --base-href "https://martasd.github.io/workflow-viz/"
    npx angular-cli-ghpages --dir  docs

Change `base-href` if you would like to deploy to your own Github pages.
