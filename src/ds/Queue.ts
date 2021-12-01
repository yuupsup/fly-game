export default class Queue {
  elements:Array<any>;
  constructor() {
    this.elements = new Array<any>();
  }

  /**
   * @param {object} element
   */
  enqueue(element:any) {
    this.elements.push(element);
  }

  dequeue() : any {
    return this.elements.shift();
  }

  peek() : any|null {
    if (this.isEmpty()) {
      return null;
    }
    return this.elements[0];
  }

  isEmpty() : boolean {
    return this.elements.length === 0;
  }

  size() : number {
    return this.elements.length;
  }

  clear() {
    while (this.elements.length > 0) {
      this.elements.pop();
    }
  }
}