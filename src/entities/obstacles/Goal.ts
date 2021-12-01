import Phaser from 'phaser';
import {EntityConstants} from "../EntityConstants";
import Obstacle from "./Obstacle";

export default class Goal extends Obstacle {
  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.GOAL;

    this.floatVal = 2;
    this.floatDir = 0;
    this.floatSpd = 50;
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
      x: this.initialX,
      y: this.initialY + Math.sin(rad) * this.floatVal
    };
    this.updateTransform(pos, null);

    this.updateCollisionBounds();
  }
}