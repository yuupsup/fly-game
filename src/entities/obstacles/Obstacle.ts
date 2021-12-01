import Phaser from "phaser";
import {EntityConstants} from "../EntityConstants";
import Entity from "../Entity";

export default class Obstacle extends Entity {
  attachable:boolean;

  radius:number;

  floatVal:number;
  floatDir:number;
  floatSpd:number;

  constructor(config) {
    super(config);
    this.entityType = EntityConstants.Type.OBSTACLE;
    this.setDisplayOrigin(config.displayX, config.displayY);
    this.setDepth(EntityConstants.Depth.OBSTACLE);

    this.attachable = false;

    this.floatVal = 0;
    this.floatDir = 0;
    this.floatSpd = 0;
  }

  setup() {
    super.setup();
    this.body.setCircle(this.radius);
  }
}