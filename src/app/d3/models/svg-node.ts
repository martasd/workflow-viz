export class SvgNode implements d3.SimulationNodeDatum {
  index: number;
  x: number;
  y: number;
  fx: number;
  fy: number;

  name: string;
  id: number;

  constructor(name, id, x, y, fx, fy) {
    this.name = name;
    this.id = id;
    this.x = x;
    this.y = y;
    this.fx = fx;
    this.fy = fy;
  }
}
