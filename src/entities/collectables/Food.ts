import Phaser from 'phaser';
import Collectable from "./Collectable";
import {EntityConstants} from "../EntityConstants";
import EntityManager from "../manager/EntityManager";
import GameController from "../../GameController";
import Command from "../../pattern/command/Command";
import {CommandType} from "../../pattern/command/CommandType";

export default class Food extends Collectable {
  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.FOOD;
    this.setDepth(EntityConstants.Depth.FOOD);

    this.createAnimations(config.scene);
    const anim = this.scene.anims.get('food');
    this.anims.setCurrentFrame(anim.frames[config.frame]);
  }

  createAnimations(scene: Phaser.Scene) {
    super.createAnimations(scene);
    scene.anims.create({
      key: 'food',
      repeat: 0,
      frames: scene.anims.generateFrameNumbers('food', {start: 0, end: 1}),
      frameRate: 0
    });
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);
    const parent:any = EntityManager.instance(this.scene).getParent(this.id);
    if (parent && parent.entityType === EntityConstants.Type.PLAYER && parent.isDead()) {
      GameController.instance(this.scene).getCommandManager(this.scene).add(new Command(CommandType.Entity.MOVE_CHILD).addData({
        id: this.id,
        parentId: -1
      }));
      this.initialX = this.position.x;
      this.initialY = this.position.y;
      this.currentState = this.States.NORMAL;
    }
  }
}