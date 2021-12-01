import Phaser from 'phaser';
import Entity from "../Entity";
import {EntityConstants} from "../EntityConstants";
import {Easing} from "../../utils/Easing";
import {MathUtils} from "../../utils/MathUtils";
import GameController from "../../GameController";
import EntityManager from "../manager/EntityManager";

export default class Hands extends Entity {
  handsPosition:Phaser.Math.Vector2;
  front:Phaser.GameObjects.Sprite;
  back:Phaser.GameObjects.Sprite;

  targetPos:Phaser.Math.Vector2;

  trigger:Phaser.GameObjects.Arc;
  triggerOffset:number;

  dist:number;
  t:number;
  maxLen:number;

  // clap animation
  clapAnimTime:number;
  clapAnimSpd:number;
  clapHitTimerSpd:number;
  clapHitTimerLimit:number;

  timer:number;
  timerLimit:number;
  timerSpd:number;

  // particles
  emitter:Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(config:any) {
    super(config);
    const scene:Phaser.Scene = config.scene;

    this.entityType = EntityConstants.Type.ENEMY;

    this.hit.collision.type = "";
    this.hit.collision.bounds = null;

    this.handsPosition = new Phaser.Math.Vector2();
    this.handsPosition.copy(this.position);

    this.front = new Phaser.GameObjects.Sprite(scene, this.position.x, this.position.y, "hands", 0);
    this.front.setDepth(EntityConstants.Depth.HAND_FRONT);
    this.back = new Phaser.GameObjects.Sprite(scene, this.position.x + 5, this.position.y - 1, "hands", 1);
    this.back.setDepth(EntityConstants.Depth.HAND_BACK);

    scene.add.existing(this.front);
    scene.add.existing(this.back);

    this.targetPos = new Phaser.Math.Vector2();

    // trigger
    this.trigger = scene.add.circle(this.position.x, this.position.y, config.triggerRadius, 0x17434b, 0.6);
    scene.physics.world.enable(this.trigger, Phaser.Physics.Arcade.STATIC_BODY);
    // @ts-ignore
    this.trigger.body.setCircle(config.triggerRadius);
    this.trigger.setData('entity', this);
    const group = EntityManager.instance(scene).getGroupById(EntityConstants.Group.HAND_ZONE);
    group.add(this.trigger, false);

    // particle emitter
    this.emitter = scene.add.particles('clap-dust').setDepth(EntityConstants.Depth.CLAP_DUST).createEmitter({
      x: this.position.x,
      y: this.position.y,
      frame: 0,
      frequency: -1,
      angle: {min: 0, max: 359},
      speed: 40,
      lifespan: 600,
      scale: {start: 1, end: 0}
    });
    // this.emitter.on = false;
    // this.emitter.start();

    this.spd = 2.5;
    this.t = 1;
    this.dist = 0;
    this.maxLen = 0;

    this.clapAnimTime = 0;
    this.clapAnimSpd = 3.2;
    this.clapHitTimerLimit = 0.5;
    this.clapHitTimerSpd = 1;

    this.timer = 0;
    this.timerLimit = 1;
    this.timerSpd = 1;

    this.States = {
      HIDDEN: 0,
      EXTEND: 1,
      RETRACT: 2,
      CLAPPED: 3,
    };
    this.currentState = this.States.HIDDEN;

    this.setVisible(false);
  }

  setup() {
    super.setup();
    this.body.setCircle(this.radius);
  }

  isHidden() : boolean {
    return this.currentState === this.States.HIDDEN;
  }

  isExtend() : boolean {
    return this.currentState === this.States.EXTEND;
  }

  isRetract() : boolean {
    return this.currentState === this.States.RETRACT;
  }

  isHitActive() : boolean {
    return (this.currentState === this.States.CLAPPED) && (this.clapAnimTime === 1) && (this.timer < (this.clapHitTimerLimit * 0.5));
  }

  preUpdateCall(time: number, delta: number) {
    super.preUpdateCall(time, delta);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    if (this.paused) {
      return;
    }
    const gameController = GameController.instance(this.scene);
    const levelManager = gameController.getLevelManager(this.scene);
    if (this.isExtend() && (!levelManager.player || levelManager.player.isDead())) {
      this.timer = 0;
      this.clapAnimTime = 0;
      this.maxLen = Phaser.Math.Distance.Between(this.initialX, this.initialY, this.position.x, this.position.y);
      this.currentState = this.States.RETRACT;
    }

    if (this.currentState === this.States.EXTEND) {
      this.extend(delta);
    } else if (this.currentState === this.States.CLAPPED) {
      this.clap(delta);
    } else if (this.currentState === this.States.RETRACT) {
      this.retract(delta);
    }
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);
    // if (this.isHitActive()) {
    //   this.back.setVisible(false);
    // } else {
    //   this.back.setVisible(true);
    // }
  }

  extend(delta:number) {
    const levelManager = GameController.instance(this.scene).getLevelManager(this.scene);
    const player = levelManager.player;

    const rad = Phaser.Math.Angle.BetweenPoints(player.prevPosition, player.position);
    const len = player.velocity.length();
    this.position.x += (((player.position.x + MathUtils.Angle.lengthDirX(len * 0.6, rad)) - this.position.x) / 0.3) * delta;
    this.position.y += (((player.position.y + MathUtils.Angle.lengthDirY(len * 0.6, rad)) - this.position.y) / 0.3) * delta;

    this.front.setPosition(this.position.x, this.position.y);
    this.back.setPosition(this.position.x + 5, this.position.y - 1);

    if (this.timer >= this.timerLimit) {
      this.timer = 0;
      this.currentState = this.States.CLAPPED;
    } else {
      this.timer += this.timerSpd * delta;
    }
  }

  clap(delta:number) {
    if (this.clapAnimTime === 1) {
      // clap hitbox active
      if (this.timer >= this.clapHitTimerLimit) {
        this.timer = 0;
        this.clapAnimTime = 0;
        this.maxLen = Phaser.Math.Distance.Between(this.initialX, this.initialY, this.position.x, this.position.y);
        this.currentState = this.States.RETRACT;
      } else {
        this.timer += this.clapHitTimerSpd * delta;
      }
    } else {
      this.clapAnimTime = Phaser.Math.Clamp(this.clapAnimTime + this.clapAnimSpd * delta, 0, 1);
      if (this.clapAnimTime === 1) {
        this.emitter.explode(5, this.position.x, this.position.y);
      }

      this.dist = Easing.easeInBack(this.clapAnimTime, 80);

      this.front.setPosition(this.position.x + this.dist, this.position.y);
      this.back.setPosition((this.position.x + 5) - this.dist, this.position.y - 1);
    }
  }

  retract(delta:number) {
    this.dist = Easing.easeOutCubic(this.t) * this.maxLen;

    const rad = Phaser.Math.Angle.Between(this.position.x, this.position.y, this.initialX, this.initialY);

    this.position.x = this.initialX - MathUtils.Angle.lengthDirX(this.dist, rad);
    this.position.y = this.initialY - MathUtils.Angle.lengthDirY(this.dist, rad);

    this.front.setPosition(this.position.x, this.position.y);
    this.back.setPosition(this.position.x + 5, this.position.y - 1);

    if (this.t === 0) {
      this.t = 1;
      this.dist = 0;
      this.currentState = this.States.HIDDEN;
    } else {
      this.t = Phaser.Math.Clamp(this.t - (this.spd * 0.5) * delta, 0, 1);
    }
  }

  attack(player:any) {
    if (this.isHidden()) {
      this.targetPos.copy(player.position);
      this.currentState = this.States.EXTEND;
    }
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.front.destroy();
    this.back.destroy();
    this.trigger.destroy();
    this.emitter.manager.destroy();
  }
}