import Phaser from 'phaser';

export default class AABB {
  x:number;
  y:number;
  xoffset:number;
  yoffset:number;
  width:number;
  height:number;
  halfWidth:number;
  halfHeight:number;
  left:number;
  top:number;
  right:number;
  bottom:number;

  constructor(config:any) {
    this.x = (config.x || 0) - (config.xoffset || 0);
    this.y = (config.y || 0) - (config.yoffset || 0);
    this.xoffset = config.xoffset || 0;
    this.yoffset = config.yoffset || 0;
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
    this.left = this.x;
    this.top = this.y;
    this.right = Math.max((this.left + this.width) - 1, 0);
    this.bottom = Math.max((this.top + this.height) - 1, 0);
  }

  static create(position:Phaser.Math.Vector2|any, offset:Phaser.Math.Vector2|any, width:number, height:number) : AABB {
    return new AABB({
      x: position.x || 0,
      y: position.y || 0,
      xoffset: offset.x || 0,
      yoffset: offset.y || 0,
      width: width || 0,
      height: height || 0
    });
  }

  /**
   * Creates a copy of an AABB instance.
   * @param {AABB} aabb
   */
  static createCopy(aabb:AABB) : AABB {
    let newAABB = AABB.create({}, {}, 0, 0);
    newAABB.copy(aabb);
    return newAABB;
  }

  update(position:Phaser.Math.Vector2|any) {
    this.x = position.x - this.xoffset;
    this.y = position.y - this.yoffset;
    this.left = this.x;
    this.top = this.y;
    this.right = (this.left + this.width) - 1;
    this.bottom = (this.top + this.height) - 1;
  }

  /**
   * Updates the AABB bounds based ONLY on the (x, y) and NOT the offsets.
   */
  updateBounds() {
    this.left = this.x;
    this.top = this.y;
    this.right = (this.left + this.width) - 1;
    this.bottom = (this.top + this.height) - 1;
  }

  /**
   * Floors the left,top and ceils the right,bottom
   *
   * Primary use is when testing overlap between broadphase AABB and tile AABB
   */
  roundOut() {
    // todo will this work with half width tiles?
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.left = Math.floor(this.left);
    this.top = Math.floor(this.top);
    this.right = Math.ceil(this.right);
    this.bottom = Math.ceil(this.bottom);
    this.width = (this.right - this.left) + 1;
    this.height = (this.bottom - this.top) + 1;
    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
  }

  /**
   * Copies the properties from another AABB instance.
   * @param {AABB} aabb
   */
  copy(aabb:AABB) {
    this.x = aabb.x;
    this.y = aabb.y;
    this.xoffset = aabb.xoffset;
    this.yoffset = aabb.yoffset;
    this.left = aabb.left;
    this.top = aabb.top;
    this.right = aabb.right;
    this.bottom = aabb.bottom;
    this.width = aabb.width;
    this.height = aabb.height;
    this.halfWidth = aabb.width;
    this.halfHeight = aabb.height;
    return this;
  }

  hasPoint(pos:Phaser.Math.Vector2|any) : boolean {
    if (pos.x < this.x) return false;
    if (pos.y < this.y) return false;
    if (pos.x > this.right) return false;
    if (pos.y > this.bottom) return false;
    return true;
  }

  getPoints() : Array<any> {
    return [
      {x: this.left, y: this.top},
      {x: this.right, y: this.top},
      {x: this.left, y: this.bottom},
      {x: this.right, y: this.bottom}
    ];
  }

  isCollide(other:AABB) : boolean {
    const toLeftOfOther = this.right < other.left;
    const toTopOfOther = this.bottom < other.top;
    const toRightOfOther = this.left > other.right;
    const toBottomOfOther = this.top > other.bottom;
    return !(toLeftOfOther || toTopOfOther || toRightOfOther || toBottomOfOther);
  }
}