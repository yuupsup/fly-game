import GraphNode from "./GraphNode";

export default class DirectedGraph {
  nodes:Map<string, GraphNode>;
  size:number;

  constructor() {
    this.nodes = new Map<string, GraphNode>(); // adjacency list (as hashmap)
    this.size = 0;
  }

  addNode(node:GraphNode) {
    if (!this.nodes.has(node.name)) {
      this.nodes.set(node.name, node);
      node.graph = this;
    }
  }

  /**
   * Adds an edge from the first node (A) to the second node (B).
   * @param {String} nameA name of the first node
   * @param {String} nameB name of the second node
   */
  addEdgeTo(nameA:string, nameB:string) {
    if (this.nodes.has(nameA) && this.nodes.has(nameB)) {
      const A = this.nodes.get(nameA);
      const B = this.nodes.get(nameB);
      if (A && B) {
        A.addEdge(B);
      }
    }
  }
}