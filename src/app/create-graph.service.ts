import { Injectable } from '@angular/core';
import { SvgLink, SvgNode } from './d3/models';

type linkTuple = [string[], number, number];
declare var traverse: any;

/**
 * Create nodes to represent workflow steps and links to represent workflow actions.
 */
@Injectable({
  providedIn: 'root'
})
export class CreateGraphService {
  links: SvgLink[] = [];
  nodes: SvgNode[] = [];

  constructor() {}

  /**
   * Reset links and nodes data (after creating SVG).
   *
   */
  clean(): void {
    this.links = [];
    this.nodes = [];
  }

  /**
   * Create nodes from workflow steps.
   *
   * @param  workflowObj Workflow js object
   * @param  margin Distance from the edge of the container
   * @param  nodeDistance Distance between individual nodes
   * @returns Nodes and links and related attributes
   */
  createNodes(
    workflowObj: object,
    margin: number,
    nodeDistance: number
  ): [SvgNode[], Array<[string[], number, number]>, number, number] {
    let svgNode: SvgNode;
    let currentNodeId: number;
    let targetNodeId: number;
    let actionName: string;
    let nodeName: string;
    let currentLinkEnds: linkTuple = null;
    let linkFound: linkTuple;
    let nodeFound: SvgNode;
    const linkEndsTuples: linkTuple[] = [];

    traverse(workflowObj).map(elem => {
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

          nodeName = elem.attributes.name;
          if (!nodeFound) {
            svgNode = new SvgNode(nodeName, currentNodeId, null, null);
            this.nodes.push(svgNode);
          } else {
            nodeFound.name = nodeName;
          }
          break;
        }
        case 'action': {
          actionName = elem.attributes.name;
          break;
        }
        case 'unconditional-result': {
          targetNodeId = parseInt(elem.attributes.step, 10);

          // If we create the final step, assign it largest possible id
          if (targetNodeId === -1) {
            targetNodeId = Number.MAX_SAFE_INTEGER;
          }

          // Create a new node if it does not exist yet
          nodeFound = this.nodes.find(node => {
            return node.id === targetNodeId;
          });

          if (!nodeFound) {
            svgNode =
              targetNodeId === Number.MAX_SAFE_INTEGER
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

    // Sort nodes based on their step id
    this.nodes.sort((node1, node2) => {
      if (node1.id < node2.id) {
        return -1;
      }
      if (node1.id > node2.id) {
        return 1;
      }
      return 0;
    });

    // Set the nodes' x and y coordinates
    const nodeCount = this.nodes.length - 1; // starting from 0
    const graphHeight = nodeCount * 40;
    this.nodes.forEach((node, index) => {
      node.x = margin + index * nodeDistance;
      node.y = graphHeight;
    });

    return [
      this.nodes,
      linkEndsTuples,
      margin + nodeCount * nodeDistance,
      graphHeight * 2
    ];
  }

  /**
   * Create links from workflow actions.
   *
   * @returns Array of links.
   */
  createLinks(linkEndsTuples: linkTuple[]): SvgLink[] {
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
