import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Element, ElementCompact } from 'xml-js';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';
import { xmlLong, xmlSimple } from './workflows';

type linkTuple = [string[], number, number];
// declare var traverse: any;

import deepdash from 'deepdash';
import * as lodash from 'lodash';
import * as traverse from 'traverse';
const _ = deepdash(lodash);

/* Draw the nodes and links in an SVG container;

   source: https://stackoverflow.com/questions/28102089/simple-graph-of-nodes-and-links-without-using-force-layout
*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  testData: object;
  nodes: SvgNode[] = [];
  links: SvgLink[] = [];
  xmlSimple: string;
  xmlLong: string;
  simulation: any;
  circleGroup: any;

  initTestData(): void {
    this.title = 'workflow-viz';
    this.xmlSimple = xmlSimple;
    this.xmlLong = xmlLong;
  }

  createSvgContainer(canvasSize: { width: number; height: number }): any {
    // Create SVG container
    return d3
      .select('body')
      .append('svg')
      .attr('width', canvasSize.width.toString())
      .attr('height', canvasSize.height.toString());
  }

  createSvgCircles(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    radius: number,
    fontSize: number
  ): void {
    const color = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    this.circleGroup = svg
      .selectAll('node')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', (d: SvgNode) => {
        return d.x;
      })
      .attr('cy', (d: SvgNode) => {
        return d.y;
      })
      .attr('r', radius)
      .attr('fill', (d, i) => {
        return color(i.toString());
      });

    // const svgCircleLabels = circleGroup
    //   .append('text')
    //   .attr('x', (d: SvgNode) => {
    //     return d.x;
    //   })
    //   .attr('y', (d: SvgNode) => {
    //     return d.y;
    //   })
    //   .attr('font-size', fontSize.toString())
    //   .attr('text-anchor', 'middle')
    //   .attr('alignment-baseline', 'middle')
    //   .text((d: SvgNode) => {
    //     return d.name;
    //   });
  }

  createSvgNodes(obj: object): linkTuple[] {
    let svgNode: SvgNode;
    let currentNodeId: number;
    let targetNodeId: number;
    let actionName: string;
    let currentLinkEnds: linkTuple = null;
    let linkFound: linkTuple;
    let nodeFound: SvgNode;
    const linkEndsTuples: linkTuple[] = [];

    traverse(obj).map(elem => {
      // Create nodes for steps, actions and result xml elements
      switch (elem.name) {
        case 'initial-actions': {
          // Initial node will have id 0
          currentNodeId = 0;
          svgNode = new SvgNode('Initial', currentNodeId, null, null);
          this.nodes.push(svgNode);
          break;
        }
        case 'step': {
          currentNodeId = parseInt(elem.attributes.id, 10);

          nodeFound = this.nodes.find(node => {
            return node.id === currentNodeId;
          });
          nodeFound.name = elem.attributes.name;
          break;
        }
        case 'action': {
          actionName = elem.attributes.name;
          break;
        }
        case 'unconditional-result': {
          targetNodeId = parseInt(elem.attributes.step, 10);

          // Create a new node if it does not exist yet
          nodeFound = this.nodes.find(node => {
            return node.id === targetNodeId;
          });

          // Shift y coordinate if it has not been shifted for the current step yet
          if (!nodeFound) {
            svgNode =
              targetNodeId === -1
                ? new SvgNode('Final', targetNodeId, null, null)
                : new SvgNode('', targetNodeId, null, null);

            this.nodes.push(svgNode);
          }

          // Record a link
          linkFound = linkEndsTuples.find(tuple => {
            return tuple[1] === currentNodeId && tuple[2] === targetNodeId;
          });
          // If a link for the same source and target already exists,
          // add the current action name to the existing link's action name
          // Otherwise, create a brand new link
          if (linkFound) {
            linkFound[0].push(actionName);
          } else {
            currentLinkEnds = [[actionName], currentNodeId, targetNodeId];
            linkEndsTuples.push(currentLinkEnds);
          }
          break;
        }
        default: {
          // Otherwise no need to instantiate any element
        }
      }
    });

    return linkEndsTuples;
  }

  createSvgLinks(linkEndsTuples: linkTuple[]): void {
    // Create the links
    let svgLink: SvgLink;
    let names: string[];
    let source: number;
    let target: number;
    linkEndsTuples.forEach(linkEnds => {
      names = linkEnds[0];

      source = this.nodes.findIndex(node => {
        return node.id === linkEnds[1];
      });

      target = this.nodes.findIndex(node => {
        return node.id === linkEnds[2];
      });

      svgLink = new SvgLink(names, source, target);
      this.links.push(svgLink);
    });
  }

  // Create nodes and links from XML JS object
  createGraph(obj: Element | ElementCompact): void {
    const linkEndsTuples = this.createSvgNodes(obj);

    this.createSvgLinks(linkEndsTuples);
  }

  removeGlobalActions(jsWorkflow: Element | ElementCompact): void {
    _.eachDeep(
      jsWorkflow,
      (value, key, path, depth, parent, parentKey, parentPath) => {
        if (value === 'global-actions') {
          delete parent['elements'];
        }
      }
    );
  }

  ticked(): void {
    this.circleGroup
      .attr('cx', d => {
        return d.x;
      })
      .attr('cy', d => {
        return d.y;
      });
  }

  constructor(private parseWorkflowService: ParseWorkflowService) {
    const canvasSize: { width: number; height: number } = {
      width: 800,
      height: 600
    };

    // Initialize lengths and sizes
    const radius: number = 40; // The only parameter specified by the user
    const fontSize: number = radius / 2.7;

    this.initTestData();

    const svg: any = this.createSvgContainer(canvasSize);

    this.createSvgCircles(svg, this.nodes, radius, fontSize);

    // this.createSvgLines(svg, this.nodes, this.links, fontSize, radius);

    const jsWorkflow: Element | ElementCompact = parseWorkflowService.toJs(
      this.xmlLong
    );

    this.removeGlobalActions(jsWorkflow);

    this.createGraph(jsWorkflow);

    // Create force simulation
    this.simulation = d3.forceSimulation(this.nodes);

    this.simulation.on('tick', this.ticked());
  }
}
