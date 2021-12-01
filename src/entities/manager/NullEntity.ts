import Phaser from 'phaser'
import Entity from "../Entity";
import {EntityConstants} from "../EntityConstants";

export default class NullEntity extends Entity {
  constructor(scene:Phaser.Scene) {
    super({
      scene: scene,
      x: 0,
      y: 0,
      texture: "",
      ignoreAdd: true
    });
    this.entityType = EntityConstants.Type.NULL;
    this.setVisible(false);
  }
}