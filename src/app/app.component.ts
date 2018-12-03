import { Component } from '@angular/core';
import * as d3 from 'd3';
import { Element, ElementCompact } from 'xml-js';
import { Node } from './d3/models';
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
  title = 'workflow-viz';

  constructor(private parseWorkflowService: ParseWorkflowService) {
    // Test the parser
    const xml: string =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<note importance="high" logged="true">' +
      '    <title>Happy</title>' +
      '    <todo>Work</todo>' +
      '    <todo>Play</todo>' +
      '</note>';

    const obj: Element | ElementCompact = parseWorkflowService.toJs(xml);

    traverse(obj).map(x => {
      console.log(x + '\n');
    });

    // Initialize the data
    const data = {
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

    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', 1200)
      .attr('height', 800);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const drag = d3.drag().on('drag', function(d: Node, i) {
      d.x += d3.event.dx;
      d.y += d3.event.dy;
      d3.select(this)
        .attr('cx', d.x)
        .attr('cy', d.y);
      links.each(function(l, li) {
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

    const links = svg
      .selectAll('link')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', function(l) {
        const sourceNode = data.nodes.filter((d, i) => {
          return i === l.source;
        })[0];
        d3.select(this).attr('y1', sourceNode.y);
        return sourceNode.x;
      })
      .attr('x2', function(l) {
        const targetNode = data.nodes.filter((d, i) => {
          return i === l.target;
        })[0];
        d3.select(this).attr('y2', targetNode.y);
        return targetNode.x;
      })
      .attr('fill', 'none')
      .attr('stroke', 'white');

    const nodes = svg
      .selectAll('node')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => {
        return d.x;
      })
      .attr('cy', d => {
        return d.y;
      })
      .attr('r', 15)
      .attr('fill', (d, i) => {
        return color(i.toString());
      })
      .call(drag);
  }
}
