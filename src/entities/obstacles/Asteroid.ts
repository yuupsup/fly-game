import Phaser from 'phaser';
import {EntityConstants} from "../EntityConstants";
import Obstacle from "./Obstacle";

export default class Asteroid extends Obstacle {
  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.ASTEROID;

    this.attachable = true;

    this.floatVal = 5;
    this.floatDir = 0;
    this.floatSpd = 100;
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    if (this.paused) {
      return;
    }

    this.floatDir += this.floatSpd * delta;
    if (this.floatDir >= 360) {
      this.floatDir = 0;
    }
    const rad = Phaser.Math.DegToRad(this.floatDir);
    const pos = {
      x: this.initialX - Math.sin(rad + Phaser.Math.DegToRad(30)) * this.floatVal * 2,
      y: this.initialY + Math.sin(rad) * this.floatVal * 2
    };
    this.updateTransform(pos, null);
    this.updateBody();
  }
}