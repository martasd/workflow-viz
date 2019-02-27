import { Component } from '@angular/core';
import { Element, ElementCompact } from 'xml-js';
import { CreateGraphService } from './create-graph.service';
import { CreateSvgService } from './create-svg.service';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';
import { xmlFnb, xmlLong, xmlSimple } from './workflows';

type linkTuple = [string[], number, number];

import deepdash from 'deepdash';
import * as lodash from 'lodash';
const _ = deepdash(lodash);

/* Draw the nodes and links in an SVG container
   source: https://stackoverflow.com/questions/28102089/simple-graph-of-nodes-and-links-without-using-force-layout
*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  xmlSimple: string;
  xmlLong: string;
  xmlFnb: string;

  private initTestData(): void {
    this.title = 'workflow-viz';
    this.xmlSimple = xmlSimple;
    this.xmlLong = xmlLong;
    this.xmlFnb = xmlFnb;
  }

  private removeGlobalActions(jsWorkflow: Element | ElementCompact): void {
    _.eachDeep(
      jsWorkflow,
      (value, key, path, depth, parent, parentKey, parentPath) => {
        if (value === 'global-actions') {
          delete parent['elements'];
        }
      }
    );
  }

  constructor(
    private parseWorkflowService: ParseWorkflowService,
    private createGraphService: CreateGraphService,
    private createSvgService: CreateSvgService
  ) {
    // Initialize lengths and sizes
    const radius: number = 40; // The only parameter specified by the user
    const margin: number = radius * 1.6;
    const fontSize: number = radius / 2.7;
    const circleDistance: number = radius * 5.5;

    this.initTestData();

    const jsWorkflow: Element | ElementCompact = parseWorkflowService.toJs(
      this.xmlFnb
    );
    this.removeGlobalActions(jsWorkflow);

    // Create nodes and links from XML JS object
    let x: number;
    let y: number;
    let nodes: SvgNode[];
    let linkEndsTuples: linkTuple[];
    [nodes, linkEndsTuples, x, y] = createGraphService.createSvgNodes(
      jsWorkflow,
      margin,
      circleDistance
    );
    const links: SvgLink[] = createGraphService.createSvgLinks(linkEndsTuples);

    const canvasSize = { width: x + margin, height: y + margin };
    createSvgService.createSvg(nodes, links, canvasSize, radius, fontSize);
  }
}
