import Phaser from 'phaser'

export default class InputManager {
  keys:Map<string|number, Phaser.Input.Keyboard.Key>; // registered keys by name
  pressed:Set<string|number>;  // pressed keys
  down:Set<string|number>;     // keys currently down
  released:Set<string|number>; // keys currently released
  up:Set<string|number>;       // keys up

  ignoreKeyForUpdate:Set<string|number> // ignores one or more keys for the current update

  mouse:Phaser.Input.Pointer|null;
  mouseButtons:Array<string>;
  mousePressed:Set<string>;
  mouseDown:Set<string>;
  mouseReleased:Set<string>;
  mouseUp:Set<string>;

  hasFocus:boolean;

  constructor() {
    this.keys = new Map<string|number, Phaser.Input.Keyboard.Key>();
    this.pressed = new Set<string>();
    this.down = new Set<string>();
    this.released = new Set<string>();
    this.up = new Set<string>();

    this.ignoreKeyForUpdate = new Set<string | number>();

    this.mouse = null;
    this.mouseButtons = ['left', 'right'];
    this.mousePressed = new Set<string>();
    this.mouseDown = new Set<string>();
    this.mouseReleased = new Set<string>();
    this.mouseUp = new Set<string>();

    this.hasFocus = true; // represents if the game window is in focus
  }

  isFocus() {
    return this.hasFocus;
  }

  setFocus(hasFocus) {
    this.hasFocus = hasFocus;
  }

  /**
   * Registers a key.
   * @param {Phaser.Scene} scene
   * @param {string|number}key
   */
  addKey(scene:Phaser.Scene, key:string|number) {
    this.keys.set(key, scene.input.keyboard.addKey(key));
  }

  /**
   * @param {string|number} key
   * @return {boolean}
   */
  isPressed(key:string|number) : boolean {
    if (this.isKeyIgnored(key)) {
      return false;
    }
    return this.pressed.has(key);
  }

  /**
   * @param {string|number} key
   */
  isDown(key:string|number) : boolean {
    if (this.isKeyIgnored(key)) {
      return false;
    }
    return this.down.has(key);
  }

  /**
   * @param {string|number} key
   */
  isReleased(key:string|number) : boolean {
    if (this.isKeyIgnored(key)) {
      return false;
    }
    return this.released.has(key);
  }

  /**
   * @param {string|number} key
   */
  isUp(key:string|number) : boolean {
    return this.up.has(key);
  }

  isKeyIgnored(key:string|number) {
    return this.ignoreKeyForUpdate.has(key);
  }

  ignoreKey(key:string|number) {
    this.ignoreKeyForUpdate.add(key);
  }

  /**
   * @param {Phaser.Scene} scene
   */
  enableMouse(scene:Phaser.Scene) {
    this.mouse = scene.input.activePointer;
  }

  /**
   * Returns the position of the mouse in screen space.
   * @return {Phaser.Math.Vector2|null}
   */
  getMousePosition() : Phaser.Math.Vector2|null {
    return this.mouse ? this.mouse.position : null;
  }

  /**
   * @param {Phaser.Cameras.Scene2D.Camera} camera
   * @return {object|null}
   */
  getMouseWorldPosition(camera:Phaser.Cameras.Scene2D.Camera) : any|null {
    if (this.mouse) {
      this.mouse.updateWorldPoint(camera);
      return {
        x: this.mouse.worldX,
        y: this.mouse.worldY
      }
    }
    return null;
  }

  /**
   * Determines if the mouse was moved from the previous position.
   * @return {boolean}
   */
  isMouseMoved() : boolean {
    return this.mouse ? this.mouse.distance > 0 : false;
  }

  /**
   * @param {string} button
   */
  isButtonPressed(button:string) : boolean {
    return this.mousePressed.has(button);
  }

  /**
   * @param {string} button
   */
  isButtonDown(button:string) : boolean {
    return this.mouseDown.has(button);
  }

  /**
   * @param {string} button
   */
  isButtonReleased(button:string) : boolean {
    return this.mouseReleased.has(button);
  }

  /**
   * @param {string} button
   */
  isButtonUp(button:string) : boolean {
    return this.mouseUp.has(button);
  }

  resetMouseButtons() {
    for (const button of this.mouseButtons) {
      this.mouseDown.delete(button);
      this.mouseUp.delete(button);
      this.mousePressed.delete(button);
      this.mouseReleased.delete(button);
    }
  }

  update() {
    this.ignoreKeyForUpdate.clear();

    const iter = this.keys.keys();
    for (let i = 0; i < this.keys.size; i++) {
      const key:string = iter.next().value;
      if (this.keys.has(key)) {
        const keyObj = this.keys.get(key);
        if (keyObj) {
          if (keyObj.isDown) {
            if (!this.isPressed(key) && !this.isDown(key)) {
              this.pressed.add(key);
              this.down.add(key);
            } else {
              this.pressed.delete(key);
              this.down.add(key);
            }
            // revert the 'up' status
            this.released.delete(key);
            this.up.delete(key);
          } else if (keyObj.isUp) {
            if (!this.isReleased(key) && !this.isUp(key)) {
              if (this.down.has(key)) {
                this.released.add(key);
              }
              this.up.add(key);
            } else {
              this.released.delete(key);
              this.up.add(key);
            }
            // revert the 'down' status
            this.pressed.delete(key);
            this.down.delete(key);
          }
        }
      }
    }
    // left mouse button
    if (this.mouse) {
      for (const button of this.mouseButtons) {
        let isDown = button === 'left' ? this.mouse.leftButtonDown : this.mouse.rightButtonDown;
        if (isDown.call(this.mouse)) {
          if (!this.isButtonPressed(button) && !this.isButtonDown(button)) {
            this.mousePressed.add(button);
            this.mouseDown.add(button);
          } else {
            this.mousePressed.delete(button);
            this.mouseDown.add(button);
          }
          // revert the 'up' status
          this.mouseReleased.delete(button);
          this.mouseUp.delete(button);
        } else {
          if (!this.isButtonReleased(button) && !this.isButtonUp(button)) {
            if (this.mouseDown.has(button)) {
              this.mouseReleased.add(button);
            }
            this.mouseUp.add(button);
          } else {
            this.mouseReleased.delete(button);
            this.mouseUp.add(button);
          }
          // revert the 'down' status
          this.mousePressed.delete(button);
          this.mouseDown.delete(button);
        }
      }
    }
  }

  destroy() {
    this.keys.clear();
    this.pressed.clear();
    this.down.clear();
    this.released.clear();
    this.up.clear();

    this.mouse = null;
    this.mousePressed.clear();
    this.mouseDown.clear();
    this.mouseReleased.clear();
    this.mouseUp.clear();
  }
}