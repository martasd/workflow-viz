export class SvgNode implements d3.SimulationNodeDatum {
  index?: number;

  name: string;
  id: number;

  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}
