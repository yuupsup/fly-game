import Phaser from 'phaser';
import {EntityConstants} from "../EntityConstants";
import {MathUtils} from "../../utils/MathUtils";
import GameController from "../../GameController";
import Entity from "../Entity";

export default class Fly extends Entity {
  wings:Phaser.GameObjects.Sprite;
  animSpd:number;
  animFrame:number;
  animTime:number;
  animTimeLimit:number;

  constructor(config:any) {
    super(config);
    // wings
    const scene:Phaser.Scene = config.scene;
    this.wings = new Phaser.GameObjects.Sprite(scene, config.x, config.y, 'player-wings');
    this.wings.setDepth(EntityConstants.Depth.PLAYER);
    this.wings.x = this.position.x;
    this.wings.y = this.position.y;
    scene.add.existing(this.wings);

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

  // update wing position
  updateWingPosition() {
    this.wings.x = this.x;
    this.wings.y = this.y;
    const animIndex = this.anims.currentFrame.index;
    // animation index IS NOT zero index based
    if (animIndex === 2 || animIndex === 3) {
      this.wings.y = this.y + 1;
    }
  }

  // update wing animations
  updateWingAnimation(delta:number) {
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