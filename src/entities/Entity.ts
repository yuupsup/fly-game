import Phaser from 'phaser';
import {EntityConstants} from "./EntityConstants";
import {CommandType} from "../pattern/command/CommandType";
import EntityManager from "./manager/EntityManager";
import AABB from "../collision/AABB";
import Command from "../pattern/command/Command";
import {GameConstants} from "../GameConstants";

export default class Entity extends Phaser.Physics.Arcade.Sprite {
  id:number;
  entityType:number;
  isEntity:boolean;
  groupId:string;

  position:Phaser.Math.Vector2;
  prevPosition:Phaser.Math.Vector2;

  initialX:number; // the initial x position when the entity is created
  initialY:number; // the initial y position when the entity is created

  velocity:Phaser.Math.Vector2;
  prevVelocity:Phaser.Math.Vector2;

  dimension:Phaser.Math.Vector2; // width and height
  offset:Phaser.Math.Vector2;
  bodyOffset:Phaser.Math.Vector2;
  radius:number;

  spd:number; // speed
  spdMax:number;

  hdir:number; // horizontal (input) direction
  vdir:number; // vertical (input) direction
  dir:number; // entity direction

  ignoreUpdate:boolean; // the update methods will not be invoked by the entity manager

  aabb:AABB;
  debugAABB:Phaser.GameObjects.Rectangle;

  paused:boolean;

  States:any;
  currentState:number;

  AnimStates:any;
  animState:number;

  hit:any; // holds information about collision details

  checkScreenBounds:boolean;
  screenBounceVelocity:number;

  constructor(config:any) {
    super(config.scene, config.x, config.y, config.texture);
    const scene:Phaser.Scene = config.scene;

    this.id = config.id;
    this.entityType = EntityConstants.Type.NONE;
    this.isEntity = true;
    this.groupId = config.groupId || "";

    this.position = new Phaser.Math.Vector2(config.x || 0, config.y || 0);
    this.prevPosition = new Phaser.Math.Vector2(config.x || 0, config.y || 0);

    this.initialX = this.position.x;
    this.initialY = this.position.y;

    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.prevVelocity = new Phaser.Math.Vector2(0, 0);

    this.offset = new Phaser.Math.Vector2(config.xoffset || 0, config.yoffset || 0);
    this.bodyOffset = new Phaser.Math.Vector2(config.bodyOffset ? config.bodyOffset : this.offset);
    this.dimension = new Phaser.Math.Vector2(config.width || 0, config.height || 0);

    this.radius = config.radius;

    this.spd = 0;
    this.spdMax = 0;

    this.hdir = 0;
    this.vdir = 0;
    this.dir = 1;

    this.aabb = AABB.create(this.position, this.offset, this.dimension.x, this.dimension.y);

    this.debugAABB = scene.add.rectangle(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height, 0xFF0000, 0.5);
    this.debugAABB.setOrigin(0, 0);
    this.debugAABB.setDepth(1000);
    this.debugAABB.setVisible(false);

    this.paused = false;

    this.States = {};
    this.currentState = null;

    this.AnimStates = {};
    this.animState = null;

    this.ignoreUpdate = false;

    this.hit = {
      collision: {type: "", bounds: null},
      collectable: {type: "", bounds: null}
    };

    this.checkScreenBounds = false;
    this.screenBounceVelocity = 0;

    // add the entity (DO NOT add the NullEntity, it is already added by the EntityGraph)
    if (!config.ignoreAdd) {
      EntityManager.instance(config.scene).addEntityToAdd(this, scene, true, this.groupId, config.parent);
    }
  }

  setup() {
    this.body.setSize(this.dimension.x, this.dimension.y);
    this.updateBody();
  }

  isNull() : boolean {
    return this.entityType === EntityConstants.Type.NULL;
  }

  createAnimations(scene:Phaser.Scene) {

  }

  isMoveable() : boolean {
    return true;
  }

  allowPause() : boolean {
    return true;
  }

  preUpdateCall(time:number, delta:number) {

  }

  update(time:number, delta:number) {
    super.update(time, delta);
    if (this.paused) {
      return;
    }

    if (this.isMoveable()) {
      const pos = {
        x: this.position.x + this.velocity.x * delta,
        y: this.position.y + this.velocity.y * delta
      };
      // screen bounds
      if (this.checkScreenBounds) {
        if (pos.x - this.offset.x <= 0) {
          pos.x = this.offset.x;
          this.velocity.x = this.screenBounceVelocity; // todo need bounce velocity variable
        } else if (pos.x + this.offset.x >= GameConstants.Screen.ROOM_WIDTH) {
          pos.x = GameConstants.Screen.ROOM_WIDTH - this.offset.x;
          this.velocity.x = -this.screenBounceVelocity;
        }
        if (pos.y - this.offset.y <= 0) {
          pos.y = this.offset.y;
          this.velocity.y = this.screenBounceVelocity; // todo need bounce velocity variable
        } else if (pos.y + this.offset.y >= GameConstants.Screen.ROOM_HEIGHT) {
          pos.y = GameConstants.Screen.ROOM_HEIGHT - this.offset.y;
          this.velocity.y = -this.screenBounceVelocity;
        }
      }
      this.updateTransform(pos, null);
    }

    // for static bodies only
    this.updateBody();
  }

  postUpdate(time:number, delta:number) {
    this.debugAABB.setPosition(this.aabb.left, this.aabb.top);
  }

  updateBody(pos:any = null) {
    if (pos) {
      this.x = pos.x !== undefined ? pos.x : this.x;
      this.y = pos.y !== undefined ? pos.y : this.y;
    } else {
      this.body.x = this.x - this.bodyOffset.x
      this.body.y = this.y - this.bodyOffset.y;
    }
    this.body.updateCenter();
  }

  /**
   * Used to update the Player, Obstacles, and Collectables collision bounds
   */
  updateCollisionBounds() {

  }

  getTransform(parentEntity:Entity|null) : any {
    return {
      entity: this,
      parent: parentEntity,
      position: {
        x: this.position.x,
        y: this.position.y
      },
      velocity: {
        x: this.velocity.x + (parentEntity ? parentEntity.velocity.x : 0),
        y: this.velocity.y + (parentEntity ? parentEntity.velocity.y : 0)
      },
      offset: {
        x: this.offset.x,
        y: this.offset.y
      }
    }
  }

  /**
   * Apply the parent transformation before processing the update method.
   * @param transform
   * @param delta
   */
  applyTransform(transform:any|null, delta:number) {

  }

  updateTransform(pos:Phaser.Math.Vector2|any, vel:Phaser.Math.Vector2|any=undefined, ignorePrevPosition:boolean=false) {
    if (!ignorePrevPosition) {
      this.prevPosition.x = this.position.x;
      this.prevPosition.y = this.position.y;
    }

    this.position.x = pos.x;
    this.position.y = pos.y;

    // update the sprites position
    this.x = pos.x;
    this.y = pos.y;

    // update the bounds
    this.aabb.update(this.position);

    if (vel) {
      this.velocity.x = vel.x;
      this.velocity.y = vel.y;
    }
  }

  command(command:Command) {
    if (command.type === CommandType.Entity.PAUSE) {
      if (this.allowPause()) {
        this.paused = true;
      }
    } else if (command.type === CommandType.Entity.UNPAUSE) {
      this.paused = false;
    }
  }
}