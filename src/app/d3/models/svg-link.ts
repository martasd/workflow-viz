import { SvgNode } from '.';

export class SvgLink implements d3.SimulationLinkDatum<SvgNode> {
  index?: number;

  names: string[];
  // Source and target are indices into nodes array
  source: string | number;
  target: string | number;

  constructor(names, source, target) {
    this.names = names;
    this.source = source;
    this.target = target;
  }
}
