export class SvgNode implements d3.SimulationNodeDatum {
  index?: number;
  x?: number;
  y?: number;

  name: string;
  id: number;

  constructor(name, id, x, y) {
    this.name = name;
    this.id = id;
    this.x = x;
    this.y = y;
  }
}
