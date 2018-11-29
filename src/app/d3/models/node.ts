export class Node implements d3.SimulationNodeDatum {

    index?: number;
    x?: number;
    y?: number;

    id: string;

    constructor(id) {
        this.id = id;
    }
}