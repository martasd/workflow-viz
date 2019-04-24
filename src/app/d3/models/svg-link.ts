import { SvgNode } from '.';

/**
 * Represents a link between two data nodes.
 *
 */
export class SvgLink implements d3.SimulationLinkDatum<SvgNode> {
  index?: number;

  // There may be multiple actions between a source and a target
  names: string[];
  // Source and target are indices into the nodes array
  source: string | number;
  target: string | number;

  constructor(names, source, target) {
    this.names = names;
    this.source = source;
    this.target = target;
  }
}
