import Entity from "../Entity";
import Command from "../../pattern/command/Command";

export default class EntityNode {
  entity:Entity;
  id:number;
  parentId:number;
  children:Array<EntityNode>;
  isNull:boolean;

  constructor(entity:Entity, parentId:number) {
    this.entity = entity;
    this.id = entity.id;
    this.parentId = parentId;
    this.children = new Array<EntityNode>();
    this.isNull = false;
  }

  addChild(node:EntityNode) {
    node.parentId = this.id;
    this.children.push(node);
  }

  removeChild(entityId:number) {
    for (let i = 0; i < this.children.length; i++) {
      const node = this.children[i];
      if (node.id === entityId) {
        this.children.splice(i, 1);
        break;
      }
    }
  }

  /**
   * @param time
   * @param delta
   */
  preUpdate(time:number, delta:number) {
    this.children.forEach((function(time:number, delta:number) {
      return function (node:EntityNode) {
        const entity = node.entity;
        if (!entity.ignoreUpdate && !node.isNull) {
          entity.preUpdateCall(time, delta);
        }
        // send the updated transform
        node.preUpdate(time, delta);
      };
    })(time, delta));
  }

  /**
   * @param time
   * @param delta
   * @param transform {position, velocity}
   */
  update(time:number, delta:number, transform:any) {
    this.children.forEach((function(time:number, delta:number, transform:any, parentEntity:Entity) {
      return function (node:EntityNode) {
        const entity = node.entity;
        if (parentEntity) {
          entity.applyTransform(transform, delta);
        }
        if (!entity.ignoreUpdate && !node.isNull) {
          entity.update(time, delta);
        }
        node.update(time, delta, entity.getTransform(parentEntity));
      };
    })(time, delta, transform, this.id === -1 ? null : this.entity));
  }

  /**
   * @param time
   * @param delta
   * @param transform {position, velocity}
   */
  postUpdate(time:number, delta:number, transform:any) {
    this.children.forEach((function(time:number, delta:number, transform:any) {
      return function (node:EntityNode) {
        const entity = node.entity;
        if (!entity.ignoreUpdate && !node.isNull) {
          entity.postUpdate(time, delta);
        }
        node.postUpdate(time, delta, transform);
      };
    })(time, delta, transform));
  }

  hasChildren() : boolean {
    return this.children.length > 0;
  }

  command(command:Command) {
    this.children.forEach(function (node) {
      node.entity.command(command);
      node.command(command);
    });
  }
}