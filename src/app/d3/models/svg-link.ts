import { SvgNode } from '.';

export class SvgLink implements d3.SimulationLinkDatum<SvgNode> {
  index?: number;

  name: string;
  // Source and target are indices into nodes array
  source: string | number;
  target: string | number;

  constructor(name, source, target) {
    this.name = name;
    this.source = source;
    this.target = target;
  }
}
