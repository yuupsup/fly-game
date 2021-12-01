import Phaser from 'phaser';
import {SceneConstants} from "../../scenes/SceneConstants";
import {EntityConstants} from "../EntityConstants";
import GameController from "../../GameController";
import LevelScene from "../../scenes/LevelScene";
import Entity from "../Entity";
import EntityGraph from "../graph/EntityGraph";
import EntityToAdd from "./EntityToAdd";
import NullEntity from "./NullEntity";

export default class EntityManager {
  entities:Array<Entity>;
  entitiesToAdd:Array<EntityToAdd>;
  entitiesToRemove:Map<number, any>; // map of entity identifiers that need to be removed from the scene (not DESTROYED)
  entitiesRemoved:Array<Entity>; // entities that were removed from the scene
  groupsById:Map<string, Phaser.GameObjects.Group>;
  newId:number;

  entityGraph:EntityGraph|null;

  nullEntity:NullEntity|any;

  scene:LevelScene;

  constructor(scene:LevelScene) {
    this.entities = new Array<Entity>();
    this.entitiesToAdd = new Array<EntityToAdd>();
    this.entitiesToRemove = new Map<number, any>();
    this.entitiesRemoved = new Array<Entity>();
    this.groupsById = new Map<string, Phaser.GameObjects.Group>();
    this.newId = 0; // represents the current id to be provided to a created entity

    this.entityGraph = null;
    this.nullEntity = null;

    this.scene = scene;
  }

  setup() {
    this.nullEntity = new NullEntity(this.scene);
    this.nullEntity.id = -1;
    this.entityGraph = new EntityGraph(this.nullEntity);
  }

  /**
   * Returns the instance of the GameController from the Phaser.Game instance.
   * @param {Phaser.Scene} scene
   * @return {GameController}
   */
  static instance(scene:Phaser.Scene) : EntityManager {
    const levelScene = scene.scene.get(SceneConstants.Scenes.LEVEL) as LevelScene;
    return levelScene.entityManager;
  }

  /**
   * Generates an id for the entities.
   * @return {number}
   */
  generateId() {
    this.newId++;
    return this.newId;
  }

  resetId() {
    this.newId = 0;
  }

  getParent(id:number) : Entity|null {
    return this.entityGraph.getParent(id);
  }

  findChild(id:number, func:any) : Entity|null {
    return this.entityGraph.findChild(id, func);
  }

  hasChildren(id:number) : boolean {
    return this.entityGraph.hasChildren(id);
  }

  moveChild(id:number, parentId:number, options:any={}) {
    this.entityGraph.moveChild(id, parentId, options);
  }

  /**
   * Adds and setup the entity.
   * NOTE: This method should only be called from within the EntityManager.
   */
  addEntity(entityToAdd:EntityToAdd) {
    const entity = entityToAdd.entity;
    const isStatic = entityToAdd.isStatic;
    const scene = entityToAdd.scene;

    scene.physics.add.existing(entity, isStatic);

    // DO NOT update the NullEntity id!
    if (entity.entityType !== EntityConstants.Type.NULL) {
      entity.id = this.generateId();
    }
    entity.setup();

    scene.add.existing(entity);

    this.entityGraph.addEntity(entity, entityToAdd.parent);
  }

  addEntityToAdd(entity:Entity, scene:Phaser.Scene, isStatic:boolean, addToGroupId:string|null, parent:Entity|null) {
    this.entitiesToAdd.push(new EntityToAdd(entity, scene, isStatic, addToGroupId, parent));
  }

  /**
   * Adds the entity to be removed
   * @param {number} id identifier of the entity
   * @param {string} groupId of the group that contains the entity
   */
  addEntityToRemove(id:number, groupId:string) {
    this.entitiesToRemove.set(id, {
      id: id,
      groupId: groupId
    });
  }

  /**
   * Gets the group from the id
   * @param {string} groupId
   * @return {Phaser.GameObjects.Group|null}
   */
  getGroupById(groupId:string) : Phaser.GameObjects.Group|undefined {
    return this.groupsById.get(groupId);
  }

  /**
   * Creates the group and adds it to the scene.
   * @param classType
   * @param groupId
   * @param isStatic determines whether the group is static, otherwise it is dynamic
   * @param scene
   */
  createGroup(classType:any, groupId:string, isStatic:boolean, scene:Phaser.Scene) : Phaser.GameObjects.Group {
    const group = isStatic ?
      scene.physics.add.staticGroup({
        classType: classType
      })
      :
      scene.physics.add.group({
        classType: classType
      });
    this.addGroup(groupId, group, isStatic, scene);
    return group;
  }

  /**
   * Adds the group to the map containing all groups
   * @param groupId
   * @param {Phaser.GameObjects.Group} group
   * @param {boolean} isStatic
   * @param {Phaser.Scene} scene represents whether or not to push entities to the entity list
   */
  addGroup(groupId:string, group:Phaser.GameObjects.Group, isStatic:boolean, scene:Phaser.Scene) {
    this.groupsById.set(groupId, group);
  }

  /**
   * Remove entities in the "to be removed" map structure
   */
  removeEntities() {
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (entity) {
        const id = entity.id;
        const props = this.entitiesToRemove.get(id);
        if (props) {
          // remove from the group
          if (props.groupId) {
            const group = this.getGroupById(props.groupId);
            if (group) {
              group.remove(entity, false, true);
            }
          } else {
            entity.destroy();
          }
          this.entities[i] = this.nullEntity;
          this.entitiesToRemove.delete(id);
        } else if (this.entities[i - 1] && this.entities[i - 1].entityType === this.nullEntity.entityType) {
          // move entity to empty index
          this.entities[i] = this.nullEntity;
          this.entities[i - 1] = entity;
        }
      }
    }
    // remove null values from entities
    while (this.entities.length > 0 && this.entities[this.entities.length - 1].entityType === this.nullEntity.entityType) {
      this.entities.pop();
    }
  }

  update(time: number, delta: number) {
    const gameController = GameController.instance(this.scene);
    const commandManager = gameController.getCommandManager(this.scene);

    // add entities to the collection
    for (let i = 0; i < this.entitiesToAdd.length; i++) {
      const entityToAdd = this.entitiesToAdd[i];

      this.addEntity(entityToAdd);

      if (entityToAdd.groupId) {
        const group = this.getGroupById(entityToAdd.groupId);
        if (group) {
          group.add(entityToAdd.entity, false);
        }
      }
    }
    while (this.entitiesToAdd.length > 0) {
      this.entitiesToAdd.pop();
    }
    // this.entitiesToAdd = [];

    /**
     * Commands
     */
    if (commandManager) {
      // iterate the commands
      while (commandManager.size() > 0) {
        const command = commandManager.next();
        if (command) {
          gameController.sendCommandToSystems(command, this.scene);

          this.entityGraph.command(command);
          // sends commands to children
          this.entityGraph.sendCommand(command);
        }
      }
    }

    // update the input manager
    const inputManager = gameController.getInputManager(this.scene);
    if (inputManager) {
      inputManager.update();
    }
    const cameraManager = gameController.getCameraManager(this.scene);
    if (cameraManager) {
      // todo needs to use DELTA
      cameraManager.update(delta);
    }

    const levelManager = gameController.getLevelManager(this.scene);
    levelManager.update(delta);

    this.entityGraph.update(time, delta);

    levelManager.postUpdate(delta);

    // remove entities
    if (this.entitiesToRemove.size > 0) {
      this.removeEntities();
    }

    // post update the camera
    if (cameraManager) {
      cameraManager.postUpdate(delta);
    }
  }

  destroy() {
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities.length = 0;

    for (const toAdd of this.entitiesToAdd) {
      toAdd.entity.destroy();
    }
    this.entitiesToAdd.length = 0;

    this.entitiesToRemove.clear();
    this.groupsById.clear();

    this.entityGraph.destroy();
  }
}