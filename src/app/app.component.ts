import { Component } from '@angular/core';
import { Element, ElementCompact } from 'xml-js';
import { CreateGraphService } from './create-graph.service';
import { CreateSvgService } from './create-svg.service';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';

type linkTuple = [string[], number, number];

import deepdash from 'deepdash';
import * as parser from 'fast-xml-parser';
import * as lodash from 'lodash';
const deepDash = deepdash(lodash);

/**
 * Draw the nodes and links in an SVG container
 * source: https://stackoverflow.com/questions/28102089/simple-graph-of-nodes-and-links-without-using-force-layout
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;

  /**
   * Remove global actions from WFD.
   *
   * @param jsWorkflow workflow js object
   */
  private removeGlobalActions(jsWorkflow: Element | ElementCompact): void {
    deepDash.eachDeep(
      jsWorkflow,
      (value, key, path, depth, parent, parentKey, parentPath) => {
        if (value === 'global-actions') {
          delete parent['elements'];
        }
      }
    );
  }

  /**
   * Read the file uploaded by the user.
   *
   * @param fileList list of input files selected to visualize- currently, only one file is supported
   */
  public async onChange(fileList: FileList) {
    const file = fileList[0];
    const fileReader: FileReader = new FileReader();

    fileReader.onloadend = event => {
      const radius: number = 30; // The only parameter needed to be adjusted by the user
      const margin: number = radius * 1.6;
      const fontSize: number = radius / 2.9;
      const circleDistance: number = radius * 4.5;

      let x: number;
      let y: number;
      let nodes: SvgNode[];
      let links: SvgLink[];
      let linkEndsTuples: linkTuple[];
      let workflowObj: Element | ElementCompact;
      let canvasSize: { width: number; height: number };
      let xmlString: string;

      this.createSvgService.removePreviousContent();

      xmlString = fileReader.result.toString();

      if (parser.validate(xmlString) !== true) {
        this.createSvgService.createAlert();
      } else {
        workflowObj = this.parseWorkflowService.toJs(xmlString);

        this.removeGlobalActions(workflowObj);

        [nodes, linkEndsTuples, x, y] = this.createGraphService.createNodes(
          workflowObj,
          margin,
          circleDistance
        );

        links = this.createGraphService.createLinks(linkEndsTuples);

        canvasSize = { width: x + margin, height: y + margin };
        this.createSvgService.createSvg(
          workflowObj,
          nodes,
          links,
          canvasSize,
          radius,
          fontSize
        );

        this.createGraphService.clean();
      }
    };

    fileReader.readAsText(file);
  }

  constructor(
    private parseWorkflowService: ParseWorkflowService,
    private createGraphService: CreateGraphService,
    private createSvgService: CreateSvgService
  ) {
    this.title = 'workflow-viz';
  }
}
