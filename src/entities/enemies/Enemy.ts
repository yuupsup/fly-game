import Phaser from 'phaser';
import Entity from "../Entity";
import {EntityConstants} from "../EntityConstants";
import GameController from "../../GameController";
import {MathUtils} from "../../utils/MathUtils";

export default class Enemy extends Entity {
  attackVel:Phaser.Math.Vector2;

  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.ENEMY;
    this.setDepth(EntityConstants.Depth.ENEMY);

    this.hit.collision.type = "circle";
    this.hit.collision.bounds = new Phaser.Geom.Circle(config.x, config.y, config.radius);

    this.attackVel = new Phaser.Math.Vector2(0, 0);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.updateCollisionBounds();
  }

  updateCollisionBounds() {
    super.updateCollisionBounds();
    this.hit.collision.bounds.setPosition(this.position.x, this.position.y);
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }
}