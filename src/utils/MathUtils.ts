export const MathUtils = {
  Vector: {
    distance: function(a:any, b:any) : number {
      return Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));
    },
    add: function(a:any, b:any) {
      return {x: a.x + b.x, y: a.y + b.y};
    },
    subtract: function(a:any, b:any) : any {
      return {x: a.x - b.x, y: a.y - b.y};
    },
    dot: function(u:any, v:any) : number {
      return u.x * v.x + u.y * v.y;
    },
    cross: function(u:any, v:any): number {
      return u.x * v.y - u.y * v.x;
    }
  },
  Angle: {
    /**
     * Adds value to the provided angle and returns the result
     * @param {number} angle in degrees
     * @param {number} value
     */
    add: function(angle:number, value:number) : number {
      angle += value;
      // wrap the direction
      if (angle < 0) {
        angle += 360;
      } else if (angle > 360) {
        angle -= 360;
      }
      return angle;
    },
    /**
     * Returns x position of circle with the provided length (radius)
     * @param len
     * @param angle in radians
     * @return {number}
     */
    lengthDirX: function(len:number, angle:number) : number {
      return Math.cos(angle) * len;
    },
    /**
     * Returns y position of circle with the provided length (radius)
     * @param len
     * @param angle in radians
     * @return {number}
     */
    lengthDirY: function(len:number, angle:number) : number {
      return Math.sin(angle) * len;
    }
  }
};