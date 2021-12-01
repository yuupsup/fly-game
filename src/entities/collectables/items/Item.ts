import Phaser from 'phaser';
import {EntityConstants} from "../../EntityConstants";
import Collectable from "../Collectable";

export default class Item extends Collectable {
  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.ITEM;
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);
    if (this.inPos) {
      this.setVisible(false);
      this.setActive(false);
    }
  }
}