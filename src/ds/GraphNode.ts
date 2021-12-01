import DirectedGraph from "./DirectedGraph";

export default class GraphNode {
  name:string;
  adjacents:Array<GraphNode>; // adjacency list
  graph:DirectedGraph|null;

  constructor(name) {
    this.name = name;
    this.adjacents = []; // adjacency list
    this.graph = null;
  }

  /**
   * Returns the first message node from the 'out' nodes collection.
   */
  getNext() : GraphNode|null {
    if (this.adjacents.length === 0) {
      return null;
    }
    // need logic or conditions

    return this.adjacents[0];
  }

  /**
   * Adds an edge to the provided node.
   * @param {GraphNode} node
   */
  addEdge(node:GraphNode) {
    this.adjacents.push(node);
  }
}