import Phaser from "phaser";
import Entity from "../../entities/Entity";
import GameController from "../../GameController";
import {MathUtils} from "../../utils/MathUtils";

export default class CameraTarget {
  target:Phaser.GameObjects.Rectangle;
  targetVel:Phaser.Math.Vector2;
  // targetSpd:number;
  targetSpd:Phaser.Math.Vector2;
  targetPan:any;
  targetDistLimit:number;

  follow:Entity|null;

  constructor(scene:Phaser.Scene) {
    this.target = scene.add.rectangle(0, 0, 4, 4, 0xFF34AB, 1);
    this.target.setDepth(1000);
    this.target.setVisible(false);

    this.targetVel = new Phaser.Math.Vector2(0, 0);
    // this.targetSpd = 8;
    this.targetSpd = new Phaser.Math.Vector2(0.1, 0.1);
    // this.targetSpd = new Phaser.Math.Vector2(10, 10);
    // this.targetSpd = new Phaser.Math.Vector2(20, 20);
    // this.targetSpd = new Phaser.Math.Vector2(50, 50);
    // the position the target moves towards when the mouse right button is down
    this.targetPan = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isSet: false
    };
    this.targetDistLimit = 50;

    this.follow = null;
  }

  setPosition(x:number, y:number) {
    this.target.setPosition(x, y);
  }

  /**
   * @param {number} id identifier of the entity the target follows
   */
  isFollow(id:number) {
    return this.follow && this.follow.id === id;
  }

  setFollow(gameObject:Entity|null) {
    this.follow = gameObject;
  }

  // todo needs to use DELTA
  update(camera:Phaser.Cameras.Scene2D.Camera, inputEnabled:boolean, delta:number, scene:Phaser.Scene) {
    // this.targetPan.isSet = false;
    const fx = this.follow ? this.follow.x : this.target.x;
    const fy = this.follow ? this.follow.y : this.target.y;
    const distTargetToPlayer = Phaser.Math.Distance.Between(this.target.x, this.target.y, fx, fy);
    const dirTargetToPlayer = Phaser.Math.Angle.Between(this.target.x, this.target.y, fx, fy);
    this.targetVel.x = MathUtils.Angle.lengthDirX(distTargetToPlayer / this.targetSpd.x, dirTargetToPlayer);
    this.targetVel.y = MathUtils.Angle.lengthDirY(distTargetToPlayer / this.targetSpd.y, dirTargetToPlayer);

    this.target.x += this.targetVel.x * delta;
    this.target.y += this.targetVel.y * delta;

    // this.target.x = fx;
    // this.target.y = fy;

    // restrict the target from exceeding the maximum distance from the player
    if (this.targetPan.isSet) {
      const distFromStart = Phaser.Math.Distance.Between(this.targetPan.startX, this.targetPan.startY, this.target.x, this.target.y);
      if (distFromStart > this.targetDistLimit) {
        const dirToTarget = Phaser.Math.Angle.Between(this.targetPan.startX, this.targetPan.startY, this.target.x, this.target.y);
        this.target.x = this.targetPan.startX + MathUtils.Angle.lengthDirX(this.targetDistLimit, dirToTarget);
        this.target.y = this.targetPan.startY + MathUtils.Angle.lengthDirY(this.targetDistLimit, dirToTarget);
      }
    }
  }
}