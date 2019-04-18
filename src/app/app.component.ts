import { Component } from '@angular/core';
import { Element } from 'xml-js';
import { CreateGraphService } from './create-graph.service';
import { CreateSvgService } from './create-svg.service';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';
import { ValidateFileService } from './validate-file.service';

import deepdash from 'deepdash';
import * as lodash from 'lodash';
const deepDash = deepdash(lodash);

type linkTuple = [string[], number, number];

/**
 * Visualize workflow described in an uploaded file by drawing nodes connected by links using svg.
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
   * @param jsWorkflow Workflow js object
   */
  private removeGlobalActions(jsWorkflow: Element): void {
    deepDash.eachDeep(jsWorkflow, (value, key, parentValue, context) => {
      if (value === 'global-actions') {
        delete parentValue['elements'];
      }
    });
  }

  /**
   * Read the file uploaded by the user. This function gets called when the user uploads an input file.
   *
   * @param fileList list of input files selected to visualize- currently, uploading a single file is supported
   */
  public uploadFile(fileList: FileList): boolean {
    const file = fileList[0];
    const fileReader: FileReader = new FileReader();
    const radius: number = 30; // The only variable that should be changed to scale the visualization
    const margin: number = radius * 1.6;
    const fontSize: number = radius / 2.9;
    const circleDistance: number = radius * 4.5;

    let x: number;
    let y: number;
    let nodes: SvgNode[];
    let links: SvgLink[];
    let linkEndsTuples: linkTuple[];
    let workflowObj: Element;
    let canvasSize: { width: number; height: number };
    let xmlString: string;

    fileReader.onloadend = event => {
      this.createSvgService.removePreviousContent();

      xmlString = fileReader.result.toString();

      if (!this.validateFileService.validateXML(xmlString)) {
        return false;
      }

      workflowObj = this.parseWorkflowService.toJs(xmlString);

      if (!this.validateFileService.validateWorkflow(workflowObj)) {
        return false;
      }

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
    };

    fileReader.readAsText(file);
    return true;
  }

  constructor(
    private parseWorkflowService: ParseWorkflowService,
    private createGraphService: CreateGraphService,
    private createSvgService: CreateSvgService,
    private validateFileService: ValidateFileService
  ) {
    this.title = 'workflow-viz';
  }
}
