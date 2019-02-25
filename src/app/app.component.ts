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
import { line } from 'd3';
// import * as traverse from 'traverse';
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

  initXmlData(): void {
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

  createSvgCircleGroups(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>
  ): d3.Selection<SVGElement, SvgNode, SVGSVGElement, {}> {
    return svg
      .selectAll('node')
      .data(this.nodes)
      .enter()
      .append('g');
  }

  createSvgCircles(
    circleGroups: d3.Selection<SVGElement, SvgNode, SVGSVGElement, {}>,
    nodes: SvgNode[],
    radius: number
  ): d3.Selection<SVGCircleElement, SvgNode, SVGSVGElement, {}> {
    const color = d3.scaleOrdinal(d3.schemeRdYlGn[11]);

    return circleGroups
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
  }

  createSvgCircleLabels(
    circleGroups: d3.Selection<SVGElement, SvgNode, SVGSVGElement, {}>,
    fontSize: number
  ): d3.Selection<SVGTextElement, SvgNode, SVGSVGElement, {}> {
    // Create labels
    const svgCircleLabels: d3.Selection<
      SVGTextElement,
      SvgNode,
      SVGSVGElement,
      {}
    > = circleGroups
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

    return svgCircleLabels;
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

  createSvgLineGroups(
    svg: d3.Selection<SVGSVGElement, {}, HTMLElement, any>,
    radius: number
  ): d3.Selection<SVGElement, SvgLink, SVGSVGElement, {}> {
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

    return svg
      .selectAll('link')
      .data(this.links)
      .enter()
      .append('g');
  }

  createSvgLines(
    lineGroups: d3.Selection<SVGElement, SvgLink, SVGSVGElement, {}>,
    nodes: SvgNode[],
    lineWidth: number
  ): d3.Selection<SVGLineElement, SvgLink, SVGSVGElement, {}> {
    const lines: any = lineGroups
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

    return lines;
  }

  createSvgLineLabels(
    lineGroups: d3.Selection<SVGElement, SvgLink, SVGSVGElement, {}>,
    nodes: SvgNode[],
    links: SvgLink[],
    fontSize: number,
    lineWidth: number
  ): d3.Selection<SVGElement, SvgLink, SVGSVGElement, {}> {
    // Create line labels
    const svgLineLabels = lineGroups
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
      .attr('font-size', (fontSize * (4 / 5)).toString())
      .attr('fill', 'orange')
      .attr('text-anchor', 'middle')
      .text((l: SvgLink) => {
        return l.names[0];
      });
    // .append('tspan')
    // .attr('x', (l: SvgLink) => {
    //   return this.labelX(nodes, l);
    // })
    // .attr('dy', fontSize.toString())
    // .text((l: SvgLink) => {
    //   if (l.names[1]) {
    //     return l.names[1];
    //   }
    // });

    return svgLineLabels;
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

  constructor(private parseWorkflowService: ParseWorkflowService) {
    const canvasSize: { width: number; height: number } = {
      width: 1500,
      height: 1500
    };

    // Initialize lengths and sizes
    const radius: number = 40; // The only parameter specified by the user
    const fontSize: number = radius / 2.7;
    const lineWidth: number = 2;

    this.initXmlData();

    const jsWorkflow: Element | ElementCompact = parseWorkflowService.toJs(
      this.xmlLong
    );

    this.removeGlobalActions(jsWorkflow);

    // Create nodes and links
    this.createGraph(jsWorkflow);

    const svg: any = this.createSvgContainer(canvasSize);

    const lineGroups: any = this.createSvgLineGroups(svg, radius);

    const lines: any = this.createSvgLines(lineGroups, this.nodes, lineWidth);

    const lineLabels: any = this.createSvgLineLabels(
      lineGroups,
      this.nodes,
      this.links,
      fontSize,
      lineWidth
    );

    const circleGroups: any = this.createSvgCircleGroups(svg);

    const circles: any = this.createSvgCircles(
      circleGroups,
      this.nodes,
      radius
    );

    const circleLabels: any = this.createSvgCircleLabels(
      circleGroups,
      fontSize
    );
    // Create force simulation with a callback ticked function
    const simulation: any = d3
      .forceSimulation(this.nodes)
      .force('charge', d3.forceManyBody().strength(-40))
      .force(
        'center',
        d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
      )
      .force(
        'collision',
        d3.forceCollide().radius(d => {
          return radius;
        })
      )
      .on('tick', () => {
        circles
          .attr('cx', d => {
            return d.x;
          })
          .attr('cy', d => {
            return d.y;
          });

        circleLabels
          .attr('x', d => {
            return d.x;
          })
          .attr('y', d => {
            return d.y;
          });

        lines
          .attr('x1', d => {
            const source: SvgNode = this.nodes[d.source];
            return source.x;
          })
          .attr('y1', d => {
            const source: SvgNode = this.nodes[d.source];
            return source.y;
          })
          .attr('x2', d => {
            const target: SvgNode = this.nodes[d.target];
            return target.x;
          })
          .attr('y2', d => {
            const target: SvgNode = this.nodes[d.target];
            return target.y;
          });

        lineLabels
          .attr('x', (l: SvgLink) => {
            return this.labelX(this.nodes, l);
          })
          .attr('y', (l: SvgLink) => {
            const { sourceNode, targetNode, y } = this.labelY(
              this.nodes,
              l,
              lineWidth
            );
            return y;
          });
      });
  }
}
