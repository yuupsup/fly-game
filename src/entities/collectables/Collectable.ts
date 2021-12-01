import {EntityConstants} from "../EntityConstants";
import Entity from "../Entity";
import Phaser from "phaser";
import EntityManager from "../manager/EntityManager";
import GameController from "../../GameController";
import Command from "../../pattern/command/Command";
import {CommandType} from "../../pattern/command/CommandType";
import Player from "../player/Player";

export default class Collectable extends Entity {
  floatVal:number;
  floatDir:number;
  floatSpd:number;

  orbitVal:number;
  orbitDir:number;
  orbitSpd:number;

  lerpSpd:number;

  inPos:boolean; // determines whether the collectable has moved to its collectors defined position

  collectedOffset:Phaser.Math.Vector2;

  constructor(config: any) {
    super(config);
    this.entityType = EntityConstants.Type.COLLECTABLE;
    this.setDisplayOrigin(config.displayX, config.displayY);
    this.setDepth(EntityConstants.Depth.COLLECTABLE);

    this.floatVal = 5;
    this.floatDir = 0;
    this.floatSpd = 100;

    this.orbitVal = 5;
    this.orbitDir = 0;
    this.orbitSpd = 100;

    // this.lerpSpd = 0.08;
    this.lerpSpd = 0.15;

    this.inPos = false;

    this.collectedOffset = new Phaser.Math.Vector2();
    if (config.collectedOffset) {
      this.collectedOffset.x = config.collectedOffset[0];
      this.collectedOffset.y = config.collectedOffset[1];
    }

    this.hit.collision.type = "circle";
    this.hit.collision.bounds = new Phaser.Geom.Circle(config.x, config.y, config.radius);

    this.States.NORMAL = 0;
    this.States.COLLECTED = 1;
    this.currentState = this.States.NORMAL;
  }

  setup() {
    super.setup();
    this.body.setCircle(this.radius);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    if (this.paused) {
      return;
    }

    if (!this.isCollected()) {
      const parent = EntityManager.instance(this.scene).getParent(this.id);
      if (!parent || parent.isNull()) {
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
      } else {
        // orbit
        this.orbitDir += this.orbitSpd * delta;
        if (this.orbitDir >= 360) {
          this.orbitDir = 0;
        }
      }
    }
    this.updateBody();
    // this.updateCollisionBounds();
  }

  applyTransform(transform: any, delta: number) {
    super.applyTransform(transform, delta);
    const pos = {x: this.position.x, y: this.position.y};
    if (this.isCollected()) {
      const isItem = this.entityType === EntityConstants.Type.ITEM;
      const yoffset = this.collectedOffset.y;
      if (this.inPos) {
        pos.x = transform.position.x;
        pos.y = transform.position.y + yoffset;
      } else {
        pos.x += ((transform.position.x - pos.x) / this.lerpSpd) * delta;
        pos.y += (((transform.position.y + yoffset) - pos.y) / this.lerpSpd) * delta;
        const trans = {x: transform.position.x, y: transform.position.y + yoffset};
        this.inPos = Phaser.Math.Distance.BetweenPoints(pos, trans) <= 5;
      }
    } else {
      // orbit
      pos.x = transform.position.x + Math.cos(Phaser.Math.DegToRad(this.orbitDir)) * transform.entity.radius * 2;
      pos.y = transform.position.y + Math.sin(Phaser.Math.DegToRad(this.orbitDir)) * transform.entity.radius * 2;
    }
    this.updateTransform(pos, null);
    this.updateBody();
  }

  isCollected() : boolean {
    return this.currentState === this.States.COLLECTED;
  }

  collect(player:Player) {
    const parent = EntityManager.instance(this.scene).getParent(this.id);
    if (parent && (parent.id !== player.id)) {
      GameController.instance(this.scene).getCommandManager(this.scene).add(new Command(CommandType.Entity.MOVE_CHILD).addData({
        id: this.id,
        parentId: player.id
      }));
      this.currentState = this.States.COLLECTED;
    }
  }

  // updateCollisionBounds() {
  //   super.updateCollisionBounds();
  //   this.hit.collision.bounds.setPosition(this.position.x, this.position.y);
  // }
}