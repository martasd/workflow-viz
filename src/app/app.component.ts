import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Element, ElementCompact } from 'xml-js';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';

type linkTuple = [string, number, number];
declare var traverse: any;

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
  xml0: string;
  xml1: string;

  afuConfig = {
    multiple: false,
    formatsAllowed: '.xml',
    maxSize: '1',
    uploadAPI: {
      url: 'https://example-file-upload-api'
    }
  };

  initTestData(): void {
    this.title = 'workflow-viz';

    this.xml0 = `<?xml version="1.0" encoding="utf-8"?>
    <workflow>
  <initial-actions>
    <action id="2" name="go to step 1" view="RetrieveMandate">
      <results>
        <unconditional-result status="NewMessageCreated" step="1">
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <steps>
    <step id="1" name="Step 1">
      <actions>
        <action id="101" name="go to step 2">
          <results>
            <unconditional-result status="RequestGenerated" step="2">
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="go to step 3">
          <results>
            <unconditional-result status="Cancel" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="2" name="Step 2">
      <actions>
        <action id="201" name="go to step 3">
          <results>
            <unconditional-result status="RequestGenerated" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="3" name="Step 3">
      <actions>
        <action id="301" name="go to step 4">
          <results>
            <unconditional-result status="RequestGenerated" step="4">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
  <step id="4" name="Step 4">
      <actions>
        <action id="401" name="go to final step">
          <results>
            <unconditional-result status="RequestGenerated" step="-1">
            </unconditional-result>
          </results>
        </action>
        <action id="402" name="go to step 2">
          <results>
            <unconditional-result status="Back to 2" step="2">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    </steps>
</workflow>`;
  }

  createSvgCircles(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    radius: number,
    fontSize: number
  ): void {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

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

  createSvgLines(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    links: SvgLink[],
    fontSize: number,
    radius: number
  ): void {
    const scale = radius / 2;
    // Create a line arrow using a marker
    // source: https://vanseodesign.com/web-design/svg-markers
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('markerWidth', radius)
      .attr('markerHeight', radius)
      .attr('refX', radius + scale)
      .attr('refY', scale / 2)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', `M0,0 L0,${scale} L${scale},${scale / 2} z`)
      .attr('fill', 'white');

    const lineData = svg.selectAll('link').data(links);

    const lineGroup = lineData.enter().append('g');

    const svgLines = lineGroup
      .append('line')
      .attr('class', 'link')
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
      .attr('stroke', 'white')
      .attr('marker-end', 'url(#arrow)');

    const svgLineLabels = lineGroup
      .append('text')
      .attr('class', 'link')
      .attr('x', (l: SvgLink) => {
        const sourceNode = nodes.filter((d, i) => {
          return i === l.source;
        })[0];
        const targetNode = nodes.filter((d, i) => {
          return i === l.target;
        })[0];
        return sourceNode.x + (targetNode.x - sourceNode.x) / 2;
      })
      .attr('y', (l: SvgLink) => {
        const sourceNode = nodes.filter((d, i) => {
          return i === l.source;
        })[0];
        const targetNode = nodes.filter((d, i) => {
          return i === l.target;
        })[0];
        return sourceNode.y + (targetNode.y - sourceNode.y) / 2;
      })
      .attr('font-size', fontSize.toString())
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .text((l: SvgLink) => {
        return l.name;
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

    // TODO: Make element groups draggable
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

          // Shift x coordinate if it has not been shifted for the current step yet
          if (!nodeFound) {
            if (!stepShifted) {
              x += circleDistance;
              stepShifted = true;
            }
            y += circleDistance;

            svgNode =
              targetNodeId === -1
                ? new SvgNode('Final', targetNodeId, x, y)
                : new SvgNode('', targetNodeId, x, y);

            this.nodes.push(svgNode);
          }

          // Record a link
          currentLinkEnds = [actionName, currentNodeId, targetNodeId];
          linkEndsTuples.push(currentLinkEnds);
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
    let name: string;
    let source: number;
    let target: number;
    linkEndsTuples.forEach(linkEnds => {
      name = linkEnds[0];

      source = this.nodes.findIndex(node => {
        return node.id === linkEnds[1];
      });

      target = this.nodes.findIndex(node => {
        return node.id === linkEnds[2];
      });

      svgLink = new SvgLink(name, source, target);
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

  constructor(private parseWorkflowService: ParseWorkflowService) {
    let obj: Element | ElementCompact;
    let canvasSize: { finalX: number; finalY: number };

    // Initialize lengths and sizes
    const radius: number = 30; // The only parameter specified by the user
    const margin: number = radius;
    const fontSize: number = radius / 3;
    const circleDistance: number = radius * 5;

    this.initTestData();

    obj = parseWorkflowService.toJs(this.xml0);

    canvasSize = this.createGraph(obj, margin, circleDistance);

    this.createSvg(this.nodes, this.links, canvasSize, radius, fontSize);
  }
}
