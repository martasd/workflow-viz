import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Element, ElementCompact } from 'xml-js';
import { SvgLink, SvgNode } from './d3/models';
import { ParseWorkflowService } from './parse-workflow.service';

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
  shortXml: string;
  longXml: string;

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

    this.shortXml =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<note importance="high" logged="true">' +
      '    <title>Happy</title>' +
      '    <todo>Work</todo>' +
      '    <todo>Play</todo>' +
      '</note>';

    this.longXml = `<?xml version="1.0" encoding="utf-8"?>
    <workflow>
  <initial-actions>
    <action id="2" name="go to step 1" view="RetrieveMandate">
      <results>
        <unconditional-result old-status="Finished" status="NewMessageCreated" step="1">
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <steps>
    <step id="1" name="Step 1">
      <actions>
        <action id="101" name="go to step 2">
          <results>
            <unconditional-result old-status="Finished" status="RequestGenerated" step="2">
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="go to step 3">
          <results>
            <unconditional-result old-status="Finished" status="Cancel" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="2" name="Step 2">
      <actions>
        <action id="201" name="go to step 3">
          <results>
            <unconditional-result old-status="Finished" status="RequestGenerated" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="3" name="Step 3">
      <actions>
        <action id="101" name="go to final step">
          <results>
            <unconditional-result old-status="Finished" status="RequestGenerated" step="-1">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
  </steps>
</workflow>`;
  }

  createSvg(
    nodes: SvgNode[],
    links: SvgLink[],
    radius: number,
    fontSize: number
  ): void {
    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 900);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

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
      .attr('stroke', 'white');

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

    const circleData = svg.selectAll('node').data(nodes);

    const circleGroup = circleData
      .enter()
      .append('g')
      .call(drag);

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

  // Create nodes and links from XML JS object
  createGraph(obj: Element | ElementCompact, circleDistance: number) {
    type linkTuple = [string, number, number];

    let x: number = circleDistance;
    let y: number = circleDistance;
    let svgNode: SvgNode;
    let svgLink: SvgLink;
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

    // Create the links
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

  constructor(private parseWorkflowService: ParseWorkflowService) {
    let obj: Element | ElementCompact;

    // Init lengths and sizes
    const radius: number = 40;
    const fontSize: number = radius / 3;
    const circleDistance: number = radius * 4;

    this.initTestData();

    obj = parseWorkflowService.toJs(this.longXml);

    this.createGraph(obj, circleDistance);

    this.createSvg(this.nodes, this.links, radius, fontSize);
  }
}
