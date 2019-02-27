import { Injectable } from '@angular/core';
import { SvgLink, SvgNode } from './d3/models';

type linkTuple = [string[], number, number];
declare var traverse: any;

@Injectable({
  providedIn: 'root'
})
export class CreateGraphService {
  links: SvgLink[] = [];
  nodes: SvgNode[] = [];

  constructor() {}

  createSvgNodes(
    obj: object,
    margin: number,
    circleDistance: number
  ): [SvgNode[], Array<[string[], number, number]>, number, number] {
    let nodes: SvgNode[];
    let x: number = margin;
    let y: number = margin * 10;
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

          if (!nodeFound) {
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

    y *= 2;

    return [this.nodes, linkEndsTuples, x, y];
  }

  createSvgLinks(linkEndsTuples: linkTuple[]): SvgLink[] {
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
    return this.links;
  }
}
