export const Easing = {
  linear: function(t:number) {
    return t;
  },

  /**
   * @param t
   * @param s initial ease in
   */
  easeInBack: function(t:number, s:number=1.70158) {
    // const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },

  easeInOutSine: function(t:number) {
    return (-0.5 * (Math.cos(Math.PI * t) - 1));
  },

  /**
   * @param {number} t
   * @return {number}
   */
  // accelerating from zero velocity
  easeInQuad: function(t:number) : number {
    return t * t;
  },

  /**
   * @param {number} t
   * @return {number}
   */
  // decelerating to zero velocity
  easeOutQuad: function(t:number) : number {
    return t * (2 - t);
  },

  easeOutExpo: function(t:number) : number {
    return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
  },

  // decelerating to zero velocity
  easeOutCubic: function(t:number) : number {
    return --t * t * t + 1;
  }
};