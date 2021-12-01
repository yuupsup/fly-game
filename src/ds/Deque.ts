export default class Deque {
  elements:Array<any>;
  constructor() {
    this.elements = new Array<any>();
  }

  /**
   * @param {any} element
   */
  addFront(element:any) {
    this.elements.unshift(element);
  }

  /**
   * @param {any} element
   */
  addBack(element:any) {
    this.elements.push(element);
  }

  removeFront() : any {
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
}