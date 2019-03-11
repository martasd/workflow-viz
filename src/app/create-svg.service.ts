import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SvgLink, SvgNode } from './d3/models';

declare var traverse: any;

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

    // Create lines
    const lineWidth: number = 2;
    lineData
      .enter()
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
    lineData
      .enter()
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
    workflowObj: object,
    nodes: SvgNode[],
    links: SvgLink[],
    canvasSize: { width: number; height: number },
    radius: number,
    fontSize: number
  ): void {
    // Remove existing svg
    d3.select('.graph').remove();

    // Create SVG container
    const svg = d3
      .select('body')
      .append('div')
      .attr('contenteditable', '')
      .attr('class', 'graph')
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${canvasSize.width.toString()} ${canvasSize.height.toString()}`
      );

    this.createSvgLines(svg, nodes, links, fontSize, radius);

    this.createSvgCircles(svg, nodes, radius, fontSize);

    svg.node().addEventListener('click', event => {
      const popupElem = d3.select('.popup');

      // retrieve the step name
      const stepName: string = event.srcElement.nextSibling.textContent;
      if (stepName !== 'Initial' && stepName !== 'Final') {
        // toggle the popup if it is currently shown
        // otherwise, create and show the popup
        if (popupElem.node() !== null) {
          popupElem.remove();
        } else {
          const color = d3.scaleOrdinal(d3.schemeRdYlGn[11]);
          const cx: number = event.srcElement.cx.animVal.value + fontSize;
          const cy: number = event.srcElement.cy.animVal.value + fontSize;
          const x: number = cx + fontSize;
          let y: number = cy + fontSize;
          let elemInfo: string;

          // find the step in the source xml
          traverse(workflowObj).forEach(element => {
            if (element.name === 'step') {
              // && elem.attributes.name === stepName) {

              const popup: d3.Selection<
                SVGGElement,
                {},
                HTMLElement,
                any
              > = svg.append('g').attr('class', 'popup');

              popup
                .append('rect')
                .attr('x', cx)
                .attr('y', cy)
                .attr('rx', 15)
                .attr('ry', 15)
                .attr('width', 100)
                .attr('height', 40)
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('fill', (d, i) => {
                  return color(i.toString());
                });

              // retrieve the step attributes
              element.elements.forEach(elem => {
                console.log(elem);
                if (elem.name === 'meta') {
                  elemInfo = elem.attributes.name;
                } else {
                  elemInfo = '';
                }
                popup
                  .append('text')
                  .attr('x', x)
                  .attr('y', y)
                  .attr('font-size', (fontSize * 0.7).toString())
                  .attr('text-anchor', 'start')
                  .text(elemInfo);
                y += fontSize;
              });
              const popupElem2 = d3.select('.popup');
              console.log(popupElem2);
            }
          });
        }
      }
    });
  }
}
