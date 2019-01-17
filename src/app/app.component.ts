import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Element, ElementCompact } from 'xml-js';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';
import { xmlLong, xmlSimple } from './workflows';

type linkTuple = [string[], number, number];
declare var traverse: any;

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
  testData: object;
  nodes: SvgNode[] = [];
  links: SvgLink[] = [];
  xmlSimple: string;
  xmlLong: string;

  initTestData(): void {
    this.title = 'workflow-viz';

    this.xmlSimple = xmlSimple;
    this.xmlLong = xmlLong;
  }

  createSvgCircles(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    radius: number,
    fontSize: number
  ): void {
    const color = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    const circleData = svg.selectAll('node').data(nodes);

    const circleGroup = circleData.enter().append('g');
    // .call(drag);

    const svgCircles = circleGroup
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

    const svgCircleLabels = circleGroup
      .append('text')
      .attr('x', (d: SvgNode) => {
        return d.x;
      })
      .attr('y', (d: SvgNode) => {
        return d.y;
      })
      .attr('font-size', fontSize.toString())
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d: SvgNode) => {
        return d.name;
      });
  }

  // Calculate the X coordinate of link label
  labelX(nodes: SvgNode[], link: SvgLink): number {
    const sourceNode = nodes.filter((val, i) => {
      return i === link.source;
    })[0];
    const targetNode = nodes.filter((val, i) => {
      return i === link.target;
    })[0];
    const x = (targetNode.x - sourceNode.x) / 2 + sourceNode.x;
    return x;
  }

  // Calculate the Y coordinate of link label
  labelY(
    nodes: SvgNode[],
    link: SvgLink,
    lineWidth: number
  ): { sourceNode: SvgNode; targetNode: SvgNode; y: number } {
    const sourceNode = nodes.filter((val, i) => {
      return i === link.source;
    })[0];
    const targetNode = nodes.filter((val, i) => {
      return i === link.target;
    })[0];
    const y = (targetNode.y - sourceNode.y) / 2 + sourceNode.y - lineWidth * 2;
    return { sourceNode, targetNode, y };
  }

  createSvgLines(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    links: SvgLink[],
    fontSize: number,
    radius: number
  ): void {
    // Create a line arrow using a marker
    // source: https://vanseodesign.com/web-design/svg-markers
    // Scale the arrow along with the circle
    const arrowScale = radius / 3;
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('markerWidth', radius)
      .attr('markerHeight', radius)
      .attr('refX', arrowScale * 2.42)
      .attr('refY', arrowScale / 2)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', `M0,0 L0,${arrowScale} L${arrowScale},${arrowScale / 2} z`)
      .attr('fill', 'black');

    const lineData = svg.selectAll('link').data(links);

    const lineGroup = lineData.enter().append('g');

    // Create lines
    const lineWidth: number = 2;
    const svgLines = lineGroup
      .append('line')
      .attr('x1', function(l: SvgLink) {
        const sourceNode = nodes.filter((d, i) => {
          return i === l.source;
        })[0];
        d3.select(this).attr('y1', sourceNode.y);
        return sourceNode.x;
      })
      .attr('x2', function(l: SvgLink) {
        const targetNode = nodes.filter((d, i) => {
          return i === l.target;
        })[0];
        d3.select(this).attr('y2', targetNode.y);
        return targetNode.x;
      })
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', lineWidth.toString())
      .attr('marker-end', 'url(#arrow)');

    // Create line labels
    const svgLineLabels = lineGroup
      .append('text')
      .attr('class', 'label')
      .attr('x', (l: SvgLink) => {
        return this.labelX(nodes, l);
      })
      .attr('y', (l: SvgLink) => {
        // If the flow is in the opposite direction,
        // then shift the line label to avoid overlap
        const { sourceNode, targetNode, y } = this.labelY(nodes, l, lineWidth);
        if (sourceNode.x < targetNode.x) {
          return y;
        } else {
          let labelShift: number = 0;
          // Find link from the opposite direction if it exists
          const oppositeLink: SvgLink = links.filter(link => {
            return link.source === l.target && link.target === l.source;
          })[0];
          if (oppositeLink) {
            oppositeLink.names.forEach(name => {
              labelShift += fontSize;
            });
          }
          return (targetNode.y - sourceNode.y) / 2 + sourceNode.y + labelShift;
        }
      })
      .attr('font-size', fontSize.toString())
      .attr('fill', 'orange')
      .attr('text-anchor', 'middle')
      .text((l: SvgLink) => {
        return l.names[0];
      })
      .append('tspan')
      .attr('x', (l: SvgLink) => {
        return this.labelX(nodes, l);
      })
      .attr('dy', fontSize.toString())
      .text((l: SvgLink) => {
        if (l.names[1]) {
          return l.names[1];
        }
      });
  }

  createSvg(
    nodes: SvgNode[],
    links: SvgLink[],
    canvasSize: { finalX: number; finalY: number },
    radius: number,
    fontSize: number
  ): void {
    // Create SVG container
    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', canvasSize.finalX.toString())
      .attr('height', canvasSize.finalY.toString());

    const drag = d3.drag().on('drag', function(d: SvgNode, i, group) {
      d.x += d3.event.dx;
      d.y += d3.event.dy;
      d3.select(this)
        .attr('cx', d.x)
        .attr('cy', d.y);
      links.forEach(function(l: SvgLink, li) {
        if (l.source === i) {
          d3.select(this)
            .attr('x1', d.x)
            .attr('y1', d.y);
        } else if (l.target === i) {
          d3.select(this)
            .attr('x2', d.x)
            .attr('y2', d.y);
        }
      });
    });

    this.createSvgLines(svg, nodes, links, fontSize, radius);

    this.createSvgCircles(svg, nodes, radius, fontSize);
  }

  createNodes(
    obj: object,
    margin: number,
    circleDistance: number
  ): { linkEndsTuples: linkTuple[]; x: number; y: number } {
    let x: number = margin;
    let y: number = margin;
    let svgNode: SvgNode;
    let currentNodeId: number;
    let targetNodeId: number;
    let actionName: string;
    let currentLinkEnds: linkTuple = null;
    let linkFound: linkTuple;
    let nodeFound: SvgNode;
    let stepShifted: boolean = false;
    const linkEndsTuples: linkTuple[] = [];

    traverse(obj).map(elem => {
      // Create nodes for steps, actions and result xml elements
      switch (elem.name) {
        case 'initial-actions': {
          // Initial node will have id 0
          currentNodeId = 0;
          svgNode = new SvgNode('Initial', currentNodeId, x, y);
          this.nodes.push(svgNode);
          break;
        }
        case 'step': {
          currentNodeId = parseInt(elem.attributes.id, 10);

          nodeFound = this.nodes.find(node => {
            return node.id === currentNodeId;
          });
          nodeFound.name = elem.attributes.name;
          stepShifted = false;

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
            if (!stepShifted) {
              y += circleDistance;
              stepShifted = true;
            }
            // Always shift right
            x += circleDistance;

            svgNode =
              targetNodeId === -1
                ? new SvgNode('Final', targetNodeId, x, y)
                : new SvgNode('', targetNodeId, x, y);

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

    return { linkEndsTuples, x, y };
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
  createGraph(
    obj: Element | ElementCompact,
    margin: number,
    circleDistance: number
  ): { finalX: number; finalY: number } {
    const { linkEndsTuples, x, y } = this.createNodes(
      obj,
      margin,
      circleDistance
    );

    const canvasSize = { finalX: x + margin, finalY: y + margin };

    this.createSvgLinks(linkEndsTuples);

    return canvasSize;
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

  constructor(private parseWorkflowService: ParseWorkflowService) {
    let jsWorkflow: Element | ElementCompact;
    let canvasSize: { finalX: number; finalY: number };

    // Initialize lengths and sizes
    const radius: number = 40; // The only parameter specified by the user
    const margin: number = radius;
    const fontSize: number = radius / 2.7;
    const circleDistance: number = radius * 7;

    this.initTestData();

    jsWorkflow = parseWorkflowService.toJs(this.xmlLong);
    this.removeGlobalActions(jsWorkflow);

    canvasSize = this.createGraph(jsWorkflow, margin, circleDistance);

    this.createSvg(this.nodes, this.links, canvasSize, radius, fontSize);
  }
}
