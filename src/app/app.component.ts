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

    // Initialize the data
    this.testData = {
      nodes: [
        {
          name: 'A',
          x: 200,
          y: 150
        },
        {
          name: 'B',
          x: 140,
          y: 300
        },
        {
          name: 'C',
          x: 300,
          y: 300
        },
        {
          name: 'D',
          x: 300,
          y: 180
        }
      ],
      links: [
        {
          source: 0,
          target: 1
        },
        {
          source: 1,
          target: 2
        },
        {
          source: 2,
          target: 3
        }
      ]
    };

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
    <action id="2" name="Retrieve Mandate" view="RetrieveMandate">
      <results>
        <unconditional-result old-status="Finished" status="NewMessageCreated" step="1">
        </unconditional-result>
      </results>
    </action>
  </initial-actions>
  <steps>
    <step id="1" name="DisplayMandate">
      <actions>
        <action id="101" name="Generate Request">
          <results>
            <unconditional-result old-status="Finished" status="RequestGenerated" step="2">
            </unconditional-result>
          </results>
        </action>
        <action id="102" name="Cancel">
          <results>
            <unconditional-result old-status="Finished" status="Cancel" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="2" name="DisplayMandate">
      <actions>
        <action id="201" name="Generate Request">
          <results>
            <unconditional-result old-status="Finished" status="RequestGenerated" step="3">
            </unconditional-result>
          </results>
        </action>
      </actions>
    </step>
    <step id="3" name="DisplayMandate">
      <actions>
        <action id="101" name="Generate Request">
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
      .attr('width', 800)
      .attr('height', 600);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const drag = d3.drag().on('drag', function(d: SvgNode, i) {
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

    const svgLines = svg
      .selectAll('link')
      .data(links)
      .enter()
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

    const svgCircles = svg
      .selectAll('node')
      .data(nodes)
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
      })
      .call(drag);

    const svgTextLabels = svg
      .selectAll('text')
      .data(nodes)
      .enter()
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
      .text(d => {
        return d.name;
      });
  }

  // Create nodes and links from XML JS object
  createGraph(obj: Element | ElementCompact, circleDistance: number) {
    type linkTuple = [number, number];

    let x: number = circleDistance;
    let y: number = circleDistance;
    let svgNode: SvgNode;
    let svgLink: SvgLink;
    let currentNodeId: number;
    let currentLinkEnds: linkTuple = null;
    const linkEndsTuples: linkTuple[] = [];

    traverse(obj).map(elem => {
      // Create nodes for steps, actions and result xml elements
      switch (elem.name) {
        case 'initial-actions': {
          // Initial node will have id 0
          currentNodeId = 0;
          svgNode = new SvgNode('Initial', currentNodeId, x, y);
          this.nodes.push(svgNode);
          x += circleDistance;
          y += circleDistance;
          break;
        }
        case 'step': {
          currentNodeId = parseInt(elem.attributes.id, 10);
          svgNode = new SvgNode(elem.attributes.name, currentNodeId, x, y);
          this.nodes.push(svgNode);
          x += circleDistance;
          y += circleDistance;
          break;
        }
        case 'unconditional-result': {
          // Record a link (note: target node does not exist yet)
          currentLinkEnds = [currentNodeId, parseInt(elem.attributes.step, 10)];
          linkEndsTuples.push(currentLinkEnds);
          break;
        }
        default: {
          // Otherwise no need to instantiate any element
        }
      }
    });

    // Create node for final step
    svgNode = new SvgNode('Final', -1, x, y);
    this.nodes.push(svgNode);

    // Create the links
    let source: number;
    let target: number;
    linkEndsTuples.forEach(linkEnds => {
      source = this.nodes.findIndex(node => {
        return node.id === linkEnds[0];
      });

      target = this.nodes.findIndex(node => {
        return node.id === linkEnds[1];
      });

      svgLink = new SvgLink(source, target);
      this.links.push(svgLink);
    });
  }

  constructor(private parseWorkflowService: ParseWorkflowService) {
    let obj: Element | ElementCompact;

    const radius: number = 50;
    const fontSize: number = radius / 3;
    const circleDistance: number = radius * 2;

    this.initTestData();

    obj = parseWorkflowService.toJs(this.longXml);

    this.createGraph(obj, circleDistance);

    this.createSvg(this.nodes, this.links, radius, fontSize);
  }
}
