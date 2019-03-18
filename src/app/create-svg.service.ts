import { Injectable } from '@angular/core';
import { SvgLink, SvgNode } from './d3/models';
import * as d3 from 'd3';

declare var traverse: any;

@Injectable({
  providedIn: 'root'
})
export class CreateSvgService {
  constructor() {}

  /**
   * Create an svg entity (currently ellipse) for each node.
   *
   * @param svg svg selection- container
   * @param nodes data nodes to render as svg
   * @param radius radius of the ellipse
   * @param fontSize text size inside the svg node
   */
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
      .attr('cx', (node: SvgNode) => {
        return node.x;
      })
      .attr('cy', (node: SvgNode) => {
        return node.y;
      })
      .attr('rx', radius * 1.5)
      .attr('ry', radius)
      .attr('fill', (node, index) => {
        return color(index.toString());
      });

    // Create labels
    circleGroup
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (node: SvgNode) => {
        return node.x;
      })
      .attr('y', (node: SvgNode) => {
        return node.y;
      })
      .attr('font-size', fontSize.toString())
      .text((node: SvgNode) => {
        return node.name;
      });
  }

  /**
   * Calculate the X coordinate of link label.
   *
   * @param nodes array of data nodes
   * @param link array of data links
   * @returns x-coordinate of link label
   */
  private labelX(nodes: SvgNode[], link: SvgLink): number {
    const sourceNode = nodes.filter((val, index) => {
      return index === link.source;
    })[0];
    const targetNode = nodes.filter((val, index) => {
      return index === link.target;
    })[0];
    const x = (targetNode.x - sourceNode.x) / 2 + sourceNode.x;
    return x;
  }

  /**
   * Calculate the Y coordinate of link label.
   *
   * @param nodes array of data nodes
   * @param link array of data links
   * @returns source node, target node, and y-coordinate of link label
   */
  private labelY(nodes: SvgNode[], link: SvgLink): number {
    const sourceNode = nodes.filter((val, index) => {
      return index === link.source;
    })[0];
    const targetNode = nodes.filter((val, index) => {
      return index === link.target;
    })[0];
    const nodeDistance = sourceNode.x - targetNode.x;
    const y = sourceNode.y + nodeDistance * 0.3;
    return y;
  }

  /**
   * Create svg entity (line) for each link.
   *
   * @param svg svg container
   * @param nodes array of data nodes
   * @param links array of data links
   * @param fontSize text size of line labels
   */
  createSvgLines(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    nodes: SvgNode[],
    links: SvgLink[],
    fontSize: number
  ): void {
    const lineData = svg.selectAll('link').data(links);

    // Create lines
    const lineWidth: number = 2;
    lineData
      .enter()
      .append('path')
      .attr('d', (link: SvgLink) => {
        const sourceNode = nodes.filter((node, index) => {
          return index === link.source;
        })[0];
        const targetNode = nodes.filter((node, index) => {
          return index === link.target;
        })[0];

        const nodeDistance = sourceNode.x - targetNode.x;

        return `M ${sourceNode.x} ${sourceNode.y}
                C ${sourceNode.x} ${sourceNode.y + nodeDistance * 0.4}
                  ${targetNode.x} ${targetNode.y + nodeDistance * 0.4}
                  ${targetNode.x} ${targetNode.y}`;
      })
      .attr('stroke-width', lineWidth.toString());

    // Create line labels
    lineData
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('x', (link: SvgLink) => {
        return this.labelX(nodes, link);
      })
      .attr('y', (link: SvgLink) => {
        // If the flow is in the opposite direction,
        // then shift the line label to avoid overlap
        return this.labelY(nodes, link);
      })
      .attr('font-size', fontSize.toString())
      .text((link: SvgLink) => {
        return link.names[0];
      })
      .append('tspan')
      .attr('x', (link: SvgLink) => {
        return this.labelX(nodes, link);
      })
      .attr('dy', fontSize.toString())
      .text((link: SvgLink) => {
        if (link.names[1]) {
          return link.names[1];
        }
      });
  }
  /**
   * Create svg container for the graph.
   *
   * @param workflowObj workflow js object
   * @param nodes graph nodes
   * @param links graph links
   * @param canvasSize size of the canvas used for drawing the graph
   * @param radius radius of the svg node entity (ellipse)
   * @param fontSize text size for all text inside the svg
   */
  createSvg(
    workflowObj: object,
    nodes: SvgNode[],
    links: SvgLink[],
    canvasSize: { width: number; height: number },
    radius: number,
    fontSize: number
  ): void {
    let stepName: string;
    let ellipse: any;
    let color: any;
    let cx: number;
    let cy: number;
    let x: number;
    let y: number;
    let height;
    let width;
    let elemInfo: string;

    // Create SVG container
    const svg = d3
      .select('body')
      .append('div')
      .attr('class', 'dynamic-content')
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${canvasSize.width.toString()} ${canvasSize.height.toString()}`
      );

    this.createSvgLines(svg, nodes, links, fontSize);

    this.createSvgCircles(svg, nodes, radius, fontSize);

    svg.node().addEventListener('click', event => {
      const popupElem = d3.select('.popup');

      // retrieve the step name
      if (event.srcElement.nodeName === 'text') {
        stepName = event.srcElement.textContent;
        ellipse = event.srcElement.previousSibling;
      } else {
        stepName = event.srcElement.nextSibling.textContent;
        ellipse = event.srcElement;
      }

      if (stepName !== 'Initial' && stepName !== 'Final') {
        // toggle the popup if it is currently shown
        // otherwise, create and show the popup
        if (popupElem.node() !== null) {
          popupElem.remove();
        } else {
          color = ellipse.getAttribute('fill');
          cx = Number(ellipse.getAttribute('cx'));
          cy = Number(ellipse.getAttribute('cy')) + fontSize;
          x = cx + fontSize;
          y = cy + fontSize;
          height = 0;
          width = 0;

          // find the step in the source xml
          traverse(workflowObj).forEach(element => {
            if (
              element.name === 'step' &&
              element.attributes.name === stepName
            ) {
              const popup: d3.Selection<
                SVGGElement,
                {},
                HTMLElement,
                any
              > = svg.append('g').attr('class', 'popup');

              const rectangle = popup
                .append('rect')
                .attr('class', 'popup-rectangle')
                .attr('x', cx)
                .attr('y', cy)
                .attr('fill', color);

              // retrieve the step attributes
              element.elements.forEach(elem => {
                if (elem.name === 'meta') {
                  elemInfo = ` ${elem.attributes.name}: ${
                    elem.elements[0].text
                  }`;
                  // calculate dimensions of the popup
                  const elemInfoLen: number = elemInfo.length * 5;
                  if (elemInfoLen > width) {
                    width = elemInfoLen;
                  }
                  height += 20;
                } else {
                  elemInfo = '';
                }
                popup
                  .append('text')
                  .attr('class', 'popup-text')
                  .attr('x', x)
                  .attr('y', y)
                  .attr('font-size', (fontSize * 0.9).toString())
                  .text(elemInfo);
                y += fontSize;
              });
              rectangle.attr('height', height);
              rectangle.attr('width', width);
            }
          });
        }
      }
    });
  }

  /**
   * Show an alert if XML from input file is not valid.
   *
   * @param alertMessage Message to display in the alert
   */
  createAlert(alertMessage: string): void {
    d3.select('body')
      .append('div')
      .attr('class', 'alert alert-danger dynamic-content')
      .attr('role', 'alert')
      .text(alertMessage);
  }

  /**
   * When selecting a new input file, remove the existing previously inserted dynamic elements.
   *
   */
  removePreviousContent(): void {
    d3.select('.dynamic-content').remove();
  }
}
