import { SvgNode } from '.';

export class SvgLink implements d3.SimulationLinkDatum<SvgNode> {
  index?: number;

  source: string | number;
  target: string | number;

  constructor(source, target) {
    this.source = source;
    this.target = target;
  }
}
