import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SvgLink, SvgNode } from './d3/models';

@Injectable({
  providedIn: 'root'
})
export class CreateSvgService {
  constructor() {}

  createSvgCircles(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    radius: number,
    fontSize: number
  ): void {
    const color = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    const circleGroup = svg
      .selectAll('node')
      .data(nodes)
      .enter()
      .append('g');

    // Create graphical nodes (ellipses)
    circleGroup
      .append('ellipse')
      .attr('class', 'node')
      .attr('cx', (d: SvgNode) => {
        return d.x;
      })
      .attr('cy', (d: SvgNode) => {
        return d.y;
      })
      .attr('rx', radius * 1.5)
      .attr('ry', radius)
      .attr('fill', (d, i) => {
        return color(i.toString());
      });

    // Create labels
    circleGroup
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
  private labelX(nodes: SvgNode[], link: SvgLink): number {
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
  private labelY(
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
    const nodeDistance = sourceNode.x - targetNode.x;
    const y = sourceNode.y + nodeDistance * 0.3;
    return { sourceNode, targetNode, y };
  }

  createSvgLines(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    links: SvgLink[],
    fontSize: number,
    radius: number
  ): void {
    const lineData = svg.selectAll('link').data(links);

    const lineGroup = lineData.enter().append('g');

    // Create lines
    const lineWidth: number = 2;
    lineGroup
      .append('path')
      .attr('d', (l: SvgLink) => {
        const sourceNode = nodes.filter((d, i) => {
          return i === l.source;
        })[0];
        const targetNode = nodes.filter((d, i) => {
          return i === l.target;
        })[0];

        const nodeDistance = sourceNode.x - targetNode.x;

        return `M ${sourceNode.x} ${sourceNode.y}
                C ${sourceNode.x} ${sourceNode.y + nodeDistance * 0.4}
                  ${targetNode.x} ${targetNode.y + nodeDistance * 0.4}
                  ${targetNode.x} ${targetNode.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', lineWidth.toString());

    // Create line labels
    lineGroup
      .append('text')
      .attr('class', 'label')
      .attr('x', (l: SvgLink) => {
        return this.labelX(nodes, l);
      })
      .attr('y', (l: SvgLink) => {
        // If the flow is in the opposite direction,
        // then shift the line label to avoid overlap
        const { sourceNode, targetNode, y } = this.labelY(nodes, l, lineWidth);
        return y;
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
    canvasSize: { width: number; height: number },
    radius: number,
    fontSize: number
  ): void {
    // Create SVG container
    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', canvasSize.width.toString())
      .attr('height', canvasSize.height.toString());

    this.createSvgLines(svg, nodes, links, fontSize, radius);

    this.createSvgCircles(svg, nodes, radius, fontSize);
  }
}
