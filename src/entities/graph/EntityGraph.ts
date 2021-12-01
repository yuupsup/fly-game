import EntityNode from "./EntityNode";
import Entity from "../Entity";
import Command from "../../pattern/command/Command";
import {CommandType} from "../../pattern/command/CommandType";

export default class EntityGraph {
  root:EntityNode;
  allNodes:Map<number, EntityNode>;

  constructor(nullEntity:Entity) {
    nullEntity.id = -1;
    // todo should the root parent be null?
    this.root = new EntityNode(nullEntity, nullEntity.id);
    this.root.isNull = true;

    this.allNodes = new Map<number, EntityNode>();
  }

  getParent(nodeId:number) : Entity|null {
    const node = this.getNode(nodeId);
    if (node) {
      const parent = this.getNode(node.parentId);
      return parent ? parent.entity : null;
    }
    return null;
  }

  findChild(id:number, func:any) : Entity|null {
    const node = this.getNode(id);
    if (node) {
      for (const c of node.children) {
        const found = func(c.entity);
        if (found) {
          return c.entity;
        }
      }
    }
    return null;
  }

  hasChildren(nodeId:number) : boolean {
    const node = this.getNode(nodeId);
    if (node) {
      return node.children.length > 0;
    }
    return false;
  }

  getNode(nodeId:number) : EntityNode {
    if (nodeId === null || nodeId === undefined) {
      throw 'method: EntityGraph.getNode; Node Id cannot be null or undefined!'
    }
    if (nodeId === -1) {
      return this.root;
    }
    // todo throw an error when id does not exist?
    return this.allNodes.get(nodeId);
  }

  /**
   * Adds entity to the root node
   * @param entity
   * @param parent
   */
  addEntity(entity:Entity, parent:Entity|null) {
    const node = new EntityNode(entity, this.root.id);
    this.allNodes.set(node.id, node);
    this.root.addChild(node);

    // force command into queue
    if (parent) {
      this.moveChild(entity.id, parent.id);
    }
  }

  removeEntity(node:EntityNode) {
    node.children.length = 0;
    node.entity.destroy();
    this.allNodes.delete(node.id);
  }

  moveChild(id:number, parentId:number, options:any={}) {
    // move child from to new parent node
    const child = this.getNode(id);
    if (child) {
      const old = this.getNode(child.parentId);
      if (old) {
        old.removeChild(child.id);
      }
      const parent = this.getNode(parentId);
      if (parent) {
        parent.addChild(child);
      } else {
        this.root.addChild(child);
      }
    }
  }

  /**
   * todo NEED TO IMPLEMENT REMOVE ENTITY
   */

  update(time:number, delta:number) {
    this.root.preUpdate(time, delta);
    this.root.update(time, delta, {});
    this.root.postUpdate(time, delta, {});
  }

  command(command:Command) {
    if (command.type === CommandType.Entity.MOVE_CHILD) {
      this.moveChild(command.data.id, command.data.parentId, command.data);
    }
  }

  /**
   * Sends command to all nodes
   * @param command
   */
  sendCommand(command:Command) {
    this.root.command(command);
  }

  /**
   * Removes all nodes in the graph
   */
  destroy() {
    const nodes = Array.from(this.allNodes.values());
    for (const node of nodes) {
      if (!node.isNull) {
        this.removeEntity(node);
      }
    }
    this.root.children.length = 0;
  }
}