import Phaser from 'phaser';
import {EntityConstants} from "../EntityConstants";
import {MathUtils} from "../../utils/MathUtils";
import GameController from "../../GameController";
import Enemy from "../enemies/Enemy";

// todo may possibly use

export default class Fly extends Enemy {
  followOffset:number;
  followAngle:number; // radians

  wings:Phaser.GameObjects.Sprite;
  animSpd:number;
  animFrame:number;
  animTime:number;
  animTimeLimit:number;

  constructor(config:any) {
    super(config);
    // this.spdMax = 90;
    const gameController = GameController.instance(config.scene);
    this.spdMax = gameController.randGenerator.realInRange(85, 90);
    // this.spdMax = gameController.randGenerator.realInRange(120, 130);
    this.attackVel = new Phaser.Math.Vector2(70, 70);
    this.checkScreenBounds = true;
    this.screenBounceVelocity = 30;

    this.followOffset = gameController.randGenerator.realInRange(0, 16);
    const deg = gameController.randGenerator.integerInRange(0, 359);
    this.followAngle = Phaser.Math.DegToRad(deg);

    this.wings = new Phaser.GameObjects.Sprite(config.scene, config.x, config.y, 'player-wings');
    this.wings.setDepth(EntityConstants.Depth.PLAYER);
    this.wings.x = this.position.x;
    this.wings.y = this.position.y;
    config.scene.add.existing(this.wings);

    // animations
    this.createAnimations(config.scene);

    this.animSpd = 0;
    this.animFrame = 0;
    this.animTime = 0;
    this.animTimeLimit = 5;
  }

  createAnimations(scene:Phaser.Scene) {
    // player
    scene.anims.create({
      key: 'idle',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
      frameRate: 6
    });
    this.anims.play('idle');

    // wings
    scene.anims.create({
      key: 'flap',
      repeat: -1,
      frames: this.wings.anims.generateFrameNumbers('player-wings', {start: 0, end: 3}),
      frameRate: 12
    });
    this.wings.anims.play('flap');
  }

  preUpdateCall(time: number, delta: number) {
    super.preUpdateCall(time, delta);

    const levelManager = GameController.instance(this.scene).getLevelManager(this.scene);
    const player = levelManager.player;
    if (player) {
      const rad = Phaser.Math.Angle.BetweenPoints(this.position, player.position);
      // const pos = {
      //   x: player.position.x + MathUtils.Angle.lengthDirX(this.followOffset, this.followAngle),
      //   y: player.position.y + MathUtils.Angle.lengthDirY(this.followOffset, this.followAngle)
      // }
      // const rad = Phaser.Math.Angle.BetweenPoints(this.position, pos);
      const vel = {
        // x: MathUtils.Angle.lengthDirX(100, rad),
        // y: MathUtils.Angle.lengthDirY(100, rad)
        x: MathUtils.Angle.lengthDirX(200, rad),
        y: MathUtils.Angle.lengthDirY(200, rad)
      };
      this.velocity.x += vel.x * delta;
      this.velocity.y += vel.y * delta;
      const mag = this.velocity.length();
      if (mag > this.spdMax) {
        this.velocity.normalize().scale(this.spdMax);
      }
    }
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);

    // update wing position
    this.wings.x = this.x;
    this.wings.y = this.y;
    const animIndex = this.anims.currentFrame.index;
    // animation index IS NOT zero index based
    if (animIndex === 2 || animIndex === 3) {
      this.wings.y = this.y + 1;
    }
    // animations
    const anim = this.scene.anims.get('flap');
    this.animSpd = Phaser.Math.Clamp(this.velocity.length(), 30, this.spdMax);
    if (this.animTime >= this.animTimeLimit) {
      this.animTime = 0;
      this.animFrame = (this.animFrame + 1) % anim.frames.length;
    } else {
      this.animTime += this.animSpd * delta;
    }
    this.wings.anims.setCurrentFrame(anim.frames[this.animFrame]);
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.wings.destroy();
  }
}