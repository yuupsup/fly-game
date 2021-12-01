import Phaser from 'phaser';
import Entity from "../Entity";

export default class EntityToAdd {
  entity:Entity;
  scene:Phaser.Scene;
  isStatic:boolean;
  groupId:string|null;
  parent:Entity|null;
  /**
   *
   * @param entity
   * @param scene
   * @param isStatic
   * @param groupId
   * @param parent
   */
  constructor(entity:Entity, scene:Phaser.Scene, isStatic:boolean, groupId:string|null, parent:Entity|null) {
    this.entity = entity;
    this.scene = scene;
    this.isStatic = isStatic;
    this.groupId = groupId;
    this.parent = parent;
  }
}