import Phaser from 'phaser';
import {GameConstants} from "../../GameConstants";
import {EntityConstants} from "../EntityConstants";
import {CommandType} from "../../pattern/command/CommandType";
import {MathUtils} from "../../utils/MathUtils";
import GameController from "../../GameController";
import EntityManager from "../manager/EntityManager";
import Entity from "../Entity";
import Fly from "../bug/Fly";
import Segment from "../../utils/math/intersection/Segment";
import Obstacle from "../obstacles/Obstacle";
import Collectable from "../collectables/Collectable";
import TileManager from "../../tile/TileManager";
import {TileUtils} from "../../tile/TileUtils";

export default class Player extends Fly {
  /**
   * Screen border segments
   */
  screenBorders:any;

  /**
   * the line used to test for intersection with objects and screen bounds
   */
  testLine:Phaser.Geom.Line;

  /**
   * the length of the propel line
   */
  length:number;

  angleSpd:number;

  /**
   * the collision rectangle used to test overlaps with collectables and obstacles before performing circle-circle overlap test
   */
  testRect:Phaser.Geom.Rectangle;

  /**
   * particle emitter for the fumes out of the Player's jetpack
   */
  emitter:Phaser.GameObjects.Particles.ParticleEmitter;

  g:Phaser.GameObjects.Graphics;

  foodCollected:boolean;
  goal:boolean;

  attached:Entity|null;
  attachedAngle:number;
  attachedDist:number;
  ignoreAttached:boolean;
  detached:boolean;

  canMove:boolean;

  constructor(config:any) {
    super(config);
    this.entityType = EntityConstants.Type.PLAYER;
    this.setDisplayOrigin(config.displayX, config.displayY);
    this.setDepth(EntityConstants.Depth.PLAYER);

    this.bodyOffset.x = 4;
    this.bodyOffset.y = 4;

    const scene:Phaser.Scene = config.scene;
    this.emitter = scene.add.particles('fumes').setDepth(EntityConstants.Depth.PLAYER_FUMES).createEmitter({
      x: this.position.x,
      y: this.position.y,
      frame: 0,
      quantity: 1,
      frequency: 70,
      angle: {min: 0, max: 0},
      speed: 60,
      lifespan: 1000,
      follow: this,
      scale: {start: 1, end: 0}
    });
    this.emitter.on = false;

    this.testRect = new Phaser.Geom.Rectangle(config.x, config.y, config.width, config.height);

    this.hit.collision.type = "circle";
    this.hit.collision.bounds = new Phaser.Geom.Circle(config.x, config.y, config.radius * 0.1);

    this.hit.collectable.type = "circle";
    this.hit.collectable.bounds = new Phaser.Geom.Circle(config.x, config.y, config.radius);

    this.spd = 0;
    this.spdMax = 80;
    this.dir = 1;

    this.testLine = new Phaser.Geom.Line();
    // this.length = 48;
    this.length = 16;
    // this.angleSpd = 225;
    this.angleSpd = 250;

    this.g = config.scene.add.graphics();
    this.g.setDepth(EntityConstants.Depth.DEBUG_PLAYER_LINE);

    // this.debugAABB.setVisible(true);
    // this.debugAABB.fillColor = 0x99eeff;

    this.testLine.setTo(this.x, this.y, this.x, this.y);

    // this.velocity.x = MathUtils.Angle.lengthDirX(10, Phaser.Math.DegToRad(20));
    // this.velocity.y = MathUtils.Angle.lengthDirY(10, Phaser.Math.DegToRad(20));

    this.screenBorders = {
      LEFT: new Segment({x: 0, y: 0}, {x: 0, y: GameConstants.Screen.ROOM_HEIGHT}),
      TOP: new Segment({x: 0, y: 0}, {x: GameConstants.Screen.ROOM_WIDTH, y: 0}),
      RIGHT: new Segment({x: GameConstants.Screen.ROOM_WIDTH, y: 0}, {x: GameConstants.Screen.ROOM_WIDTH, y: GameConstants.Screen.ROOM_HEIGHT}),
      BOTTOM: new Segment({x: 0, y: GameConstants.Screen.ROOM_HEIGHT}, {x: GameConstants.Screen.ROOM_WIDTH, y: GameConstants.Screen.ROOM_HEIGHT})
    }

    this.attached = null;
    this.attachedAngle = 0;
    this.attachedDist = 0;
    this.ignoreAttached = false;
    this.detached = false;

    this.canMove = true;

    this.foodCollected = false;
    this.goal = false;

    this.States.NORMAL = 0;
    this.States.GOAL = 1;
    this.States.DEAD = 2;
    this.currentState = this.States.NORMAL;
  }

  setup() {
    super.setup();
    this.body.setCircle(this.radius);
  }

  isGoal() : boolean {
    return this.currentState === this.States.GOAL;
  }

  isDead() : boolean {
    return this.currentState === this.States.DEAD;
  }

  setDead() {
    this.currentState = this.States.DEAD;
  }

  allowPause(): boolean {
    if (this.isGoal()) {
      return false;
    }
    return super.allowPause();
  }

  preUpdateCall(time:number, delta:number) {
    super.preUpdateCall(time, delta);

    const gameController = GameController.instance(this.scene);
    const inputManager = gameController.getInputManager(this.scene);

    if (this.isGoal()) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.emitter.stop();
      return;
    }

    if (!this.isDead()) {
      this.hdir = 0;

      if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.LEFT)) {
        this.hdir = -1;
      }
      if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.RIGHT)) {
        this.hdir += 1;
      }

      this.vdir = 0;

      if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.UP)) {
        this.vdir = -1;
      }
      if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.DOWN)) {
        this.vdir += 1;
      }

      if (!this.canMove && inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.UP)) {
        // start detach
        this.ignoreAttached = true;
        this.canMove = true;
      }

      // apply velocity to the entity
      if (this.vdir < 0 && this.canMove) {
        const vel = new Phaser.Math.Vector2(this.testLine.x2 - this.position.x, this.testLine.y2 - this.position.y);
        vel.normalize().scale(220);
        // vel.normalize().scale(265);
        this.velocity.x += vel.x * delta;
        this.velocity.y += vel.y * delta;

        // particles
        if (!this.emitter.on) {
          this.emitter.start();
        }
      } else if (this.emitter.on) {
        this.emitter.stop();
      }
      const mag = this.velocity.length();
      if (mag > this.spdMax) {
        this.velocity.normalize().scale(this.spdMax);
      }

      if (this.hdir !== 0) {
        this.dir = MathUtils.Angle.add(this.dir, (this.angleSpd * this.hdir) * delta);
      }
    } else {
      this.velocity.y += 400 * delta;
    }
  }

  update(time: number, delta: number) {
    if (this.isOutsideScreenBounds()) {
      return;
    }
    super.update(time, delta);
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);

    if (!this.isDead() && !this.isGoal()) {
      const gameController = GameController.instance(this.scene);
      const entityManager = EntityManager.instance(this.scene);
      this.g.clear();

      // overlap obstacles
      this.detached = true;
      this.scene.physics.overlap(this, entityManager.getGroupById(EntityConstants.Group.OBSTACLE), this.obstacleOverlapped);
      // once free from overlapping attachable entity, allow entity to be attached
      if (this.detached && this.ignoreAttached) {
        this.attached = null;
        this.ignoreAttached = false;
      }

      // overlap collectables
      if (!this.isDead() && !this.isGoal()) {
        this.scene.physics.overlap(this, entityManager.getGroupById(EntityConstants.Group.COLLECTABLE), this.collectableOverlapped);

        // overlap hand hit zone
        this.scene.physics.overlap(this, entityManager.getGroupById(EntityConstants.Group.HAND_ZONE), this.handZoneOverlapped);

        if (this.attached && !this.ignoreAttached) {
          const pos = {x: this.x, y: this.y};
          pos.x = this.attached.x + MathUtils.Angle.lengthDirX(this.attachedDist, this.attachedAngle);
          pos.y = this.attached.y + MathUtils.Angle.lengthDirY(this.attachedDist, this.attachedAngle);
          this.updateTransform(pos);
        }

        // mouse logic
        // const sx = GameConstants.Screen.ROOM_WIDTH * 0.5;
        // const sy = GameConstants.Screen.ROOM_HEIGHT * 0.5;
        // const mpos = inputManager.getMouseWorldPosition(cameraManager.getCamera());
        // const mrad = Phaser.Math.Angle.Reverse(Phaser.Math.Angle.Between(sx, sy, mpos.x, mpos.y));
        const mrad = Phaser.Math.Angle.Normalize(Phaser.Math.DegToRad(this.dir));
        const px = this.x + MathUtils.Angle.lengthDirX(this.length, mrad);
        const py = this.y + MathUtils.Angle.lengthDirY(this.length, mrad);
        this.testLine.setTo(this.x + MathUtils.Angle.lengthDirX(8, mrad), this.y + MathUtils.Angle.lengthDirY(8, mrad), px, py);

        this.emitter.setAngle({
          start: MathUtils.Angle.add(this.dir, 180) - 8,
          end: MathUtils.Angle.add(this.dir, 180) + 8,
          random: true
        });

        this.g.lineStyle(1, 0x584563);
        this.g.strokeLineShape(this.testLine);

        // outside the bounds, send command to the level manager
        if (!this.isDead() && this.isOutsideScreenBounds()) {
          gameController.getCameraManager(this.scene).getCamera().shake(150, 0.01);
          this.currentState = this.States.DEAD;
        }
        if (!this.isDead()) {
          const tilesIn = [];
          TileManager.getTileCollisions(this.aabb, this.velocity, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, [TileUtils.Layer.COLLISION], tilesIn, [], true, this.scene);
          const circle = new Phaser.Geom.Circle(this.position.x, this.position.y, this.radius);
          for (const obj of tilesIn) {
            const tile = obj.tile;
            const rect = new Phaser.Geom.Rectangle(tile.pixelX, tile.pixelY, GameConstants.Tile.SIZE, GameConstants.Tile.SIZE);
            if (Phaser.Geom.Intersects.CircleToRectangle(circle, rect)) {
              // dead animation
              this.velocity.y = -100;
              const cameraManager = gameController.getCameraManager(this.scene);
              cameraManager.setTargetFollow(null);
              cameraManager.getCamera().shake(150, 0.01);
              this.setDead();
              break;
            }
          }
        }
        // overlap hand clap hit area
        if (!this.isDead()) {
          this.scene.physics.overlap(this, EntityManager.instance(this.scene).getGroupById(EntityConstants.Group.ENEMY), this.clapHitArea);
        }
      }

      if (this.isDead() && !this.isGoal()) {
        this.g.clear(); // remove the graphics
        this.attached = null;
        this.emitter.stop();
        gameController.getCommandManager(this.scene).addStatic(CommandType.Player.DEAD);
      }
    }

    this.updateWingPosition();
    this.updateWingAnimation(delta);
  }

  updateCollisionBounds() {
    super.updateCollisionBounds();
    this.hit.collision.bounds.setPosition(this.position.x, this.position.y);
    this.hit.collectable.bounds.setPosition(this.position.x, this.position.y);
  }

  isOutsideScreenBounds() {
    return ((this.position.x + this.aabb.halfWidth) < 0)
      || ((this.position.x - this.aabb.halfWidth) > GameConstants.Screen.ROOM_WIDTH)
      || ((this.position.y + this.aabb.halfHeight) < 0)
      || ((this.position.y - this.aabb.halfHeight) > GameConstants.Screen.ROOM_HEIGHT);
  }

  handZoneOverlapped(self, other) {
    const hand = other.getData('entity');
    hand.attack(self);
  }

  obstacleOverlapped(self:Player, other:Obstacle) {
    if (!self.isDead() && !self.isGoal()) {
      if (other.attachable) {
        if (self.attached) {
          if (self.attached.id === other.id) {
            self.detached = false;
          }
        } else {
          // stop movement
          self.attached = other;
          self.attachedAngle = Phaser.Math.Angle.BetweenPoints(self.attached.position, self.position);
          self.attachedDist = Phaser.Math.Distance.BetweenPoints(self.attached.position, self.position);
          self.velocity.x = 0;
          self.velocity.y = 0;
          self.canMove = false;
          self.detached = false;
        }
      }
      if (!self.isDead() && other.entityType === EntityConstants.Type.GOAL && self.foodCollected) {
        self.currentState = self.States.GOAL;
      }
    }
  }

  collectableOverlapped(self:Player, other:Collectable) {
    if (!self.isDead() && !self.isGoal()) {
      if (!other.isCollected()) {
        other.collect(self);
        if (other.entityType === EntityConstants.Type.FOOD) {
          self.foodCollected = true;
        }
      }
    }
  }

  clapHitArea(self, other:any) {
    if (!self.isDead() && !self.isGoal()) {
      if (other.isHitActive()) {
        // dead animation
        self.velocity.y = -100;

        const cameraManager = GameController.instance(self.scene).getCameraManager(self.scene);
        cameraManager.setTargetFollow(null);
        cameraManager.getCamera().shake(150, 0.01);
        self.setDead();
      }
    }
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.g.destroy();
    this.emitter.manager.destroy();
  }
}