import Phaser from "phaser";
import {GameConstants} from "../../GameConstants";
import {SceneConstants} from "../../scenes/SceneConstants";
import {EntityConstants} from "../../entities/EntityConstants";
import {LevelProperties} from "./LevelProperties";
import {CommandType} from "../../pattern/command/CommandType";
import {TileUtils} from "../../tile/TileUtils";
import GameController from "../../GameController";
import EntityManager from "../../entities/manager/EntityManager";
import Command from "../../pattern/command/Command";
import Entity from "../../entities/Entity";
import Player from "../../entities/player/Player";
import Collectable from "../../entities/collectables/Collectable";
import Item from "../../entities/collectables/items/Item";
import Asteroid from "../../entities/obstacles/Asteroid";
import Food from "../../entities/collectables/Food";
import Enemy from "../../entities/enemies/Enemy";
import Hands from "../../entities/enemies/Hands";
import Goal from "../../entities/obstacles/Goal";

/**
 * Holds information related to the current level.
 */
export default class LevelManager {
  scene:Phaser.Scene;
  level:number;
  next:boolean; // denotes changing levels
  complete:boolean; // level completed
  gameover:boolean;

  nextLevelTime:number; // time until we navigate to next level
  nextLevelTimeMax:number;
  nextLevelTimeSpd:number;

  player:Player|null;

  levelCompleteImg:Phaser.GameObjects.Image;
  levelCompleteImgTween:Phaser.Tweens.Tween;

  gameOverImg:Phaser.GameObjects.Image;
  gameOverImgTween:Phaser.Tweens.Tween;

  skyBG:Phaser.GameObjects.Image;
  clouds:Phaser.GameObjects.TileSprite;
  cloudsBig:Phaser.GameObjects.TileSprite;

  constructor(scene:Phaser.Scene) {
    this.scene = scene;
    this.level = 0;
    this.next = false;
    this.complete = false;
    this.gameover = false;

    this.nextLevelTimeMax = 35;
    this.nextLevelTime = this.nextLevelTimeMax;
    this.nextLevelTimeSpd = 10;

    this.player = null;

    this.levelCompleteImg = scene.add.image(GameConstants.Screen.ROOM_WIDTH * 0.5, 18, 'level-complete').setDepth(100).setVisible(false);
    this.levelCompleteImgTween = this.scene.tweens.add({
      targets: this.levelCompleteImg,
      props: {
        displayOriginY: {value: 14, duration: 600, ease: 'Sine.easeInOut', yoyo: true, repeat: -1}
      },
      paused: true
    });

    this.gameOverImg = scene.add.image(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.5, 'gameover').setDepth(100).setVisible(false);
    this.gameOverImgTween = this.scene.tweens.add({
      targets: this.gameOverImg,
      props: {
        displayOriginY: {value: 14, duration: 600, ease: 'Sine.easeInOut', yoyo: true, repeat: -1}
      },
      paused: true
    });

    /**
     * Background
     */
    this.skyBG = scene.add.image(0, 0, 'skyBG');
    this.skyBG.setOrigin(0, 0);
    this.skyBG.setScrollFactor(0);

    this.clouds = scene.add.tileSprite(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, 'clouds');
    this.clouds.setOrigin(0, 0);
    this.clouds.setDepth(0);
    this.clouds.setScrollFactor(0, 0);

    this.cloudsBig = scene.add.tileSprite(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, 'clouds-big');
    this.cloudsBig.setOrigin(0, 0);
    this.cloudsBig.setDepth(0);
    this.cloudsBig.setScrollFactor(0.2, 0.2);
    this.cloudsBig.setVisible(false);
  }

  createLevel() {
    if (this.level >= LevelProperties.levels.length) {
      return;
    }
    this.level = Phaser.Math.Clamp(this.level, 0, LevelProperties.levels.length - 1);
    this.next = false;
    this.complete = false;

    if (LevelProperties.isGameOver(this.level)) {
      this.gameOverImg.setVisible(true);
      this.gameOverImgTween.play();
      this.gameover = true;
    } else {
      // update the room width and height
      const size = LevelProperties.getMapSize(this.level);
      GameConstants.Screen.ROOM_WIDTH = size.x;
      GameConstants.Screen.ROOM_HEIGHT = size.y;

      // backgrounds
      this.clouds.width = GameConstants.Screen.ROOM_WIDTH;
      this.clouds.height = GameConstants.Screen.ROOM_HEIGHT;

      this.cloudsBig.width = GameConstants.Screen.ROOM_WIDTH;
      this.cloudsBig.height = GameConstants.Screen.ROOM_HEIGHT;

      this.createTilemap();
      this.createEntities();
      GameController.instance(this.scene).getCameraManager(this.scene).getCamera().setBounds(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT);
    }
  }

  /**
   * Setup the tile map
   */
  createTilemap() {
    GameController.createTileMapPropertiesForScene(this.scene, {
      map: LevelProperties.getMapForLevel(this.level),
      tileId: "tileset",
      tileIdExtruded: "tileset-extruded"
    });
    const gameController = GameController.instance(this.scene);

    gameController.addTilemapLayer(this.scene, TileUtils.Layer.COLLISION, 0, 0, 1);
    gameController.addTilemapLayer(this.scene, TileUtils.Layer.BACKGROUND, 0, 0, 0);
  }

  createEntities() {
    const entityManager = EntityManager.instance(this.scene);

    entityManager.createGroup(Collectable, EntityConstants.Group.OBSTACLE, true, this.scene);
    entityManager.createGroup(Collectable, EntityConstants.Group.COLLECTABLE, true, this.scene);
    entityManager.createGroup(Enemy, EntityConstants.Group.ENEMY, true, this.scene);
    entityManager.createGroup(Phaser.GameObjects.Arc, EntityConstants.Group.HAND_ZONE, true, this.scene);

    const data = this.scene.cache.json.get(LevelProperties.getEntitiesForLevel(this.level));
    if (!data) {
      console.log("Error loading level data. Level: " + this.level);
      return;
    }
    // obstacles need to be created first in order to assign collectables as a child of the obstacle (for example, orbit around asteroid)
    // obstacles will be held in a map in order for collectables to query for the entity to assign the obstacle as its parent
    const obstacleMap = new Map<string, Entity>();
    if (data.obstacles) {
      for (const o of data.obstacles) {
        let entity = null;
        if (o.type === "asteroid") {
          entity = new Asteroid({
            scene: this.scene,
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height,
            xoffset: o.width * 0.5,
            yoffset: o.height * 0.5,
            displayX: o.displayX,
            displayY: o.displayY,
            radius: o.radius || o.width * 0.5,
            bodyOffset: o.bodyOffset,
            texture: o.texture,
            groupId: EntityConstants.Group.OBSTACLE
          });
        } else if (o.type === "goal") {
          entity = new Goal({
            scene: this.scene,
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height,
            xoffset: o.width * 0.5,
            yoffset: o.height * 0.5,
            displayX: o.displayX,
            displayY: o.displayY,
            radius: o.width * 0.5,
            texture: o.texture,
            groupId: EntityConstants.Group.OBSTACLE
          });
        }
        // key used for the obstacles map
        if (entity && o.key) {
          obstacleMap.set(o.key, entity);
        }
      }
    }

    if (data.player) {
      const d = data.player;
      this.player = new Player({
        scene: this.scene,
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        xoffset: d.width * 0.5,
        yoffset: d.height * 0.5,
        displayX: d.displayX,
        displayY: d.displayY,
        radius: d.radius || d.width * 0.5,
        texture: 'player'
      });
      GameController.instance(this.scene).getCameraManager(this.scene).setTargetFollow(this.player);
    }

    if (data.enemies) {
      for (const enemy of data.enemies) {
        // new Fly({
        //   scene: this.scene,
        //   x: enemy.x,
        //   y: enemy.y,
        //   width: enemy.width,
        //   height: enemy.height,
        //   xoffset: enemy.width * 0.5,
        //   yoffset: enemy.height * 0.5,
        //   displayX: enemy.displayX,
        //   displayY: enemy.displayY,
        //   radius: enemy.width * 0.5,
        //   texture: "player",
        //   groupId: EntityConstants.Group.ENEMY
        // });
        new Hands({
          scene: this.scene,
          x: enemy.x,
          y: enemy.y,
          width: enemy.width,
          height: enemy.height,
          xoffset: enemy.width * 0.5,
          yoffset: enemy.height * 0.5,
          displayX: enemy.displayX,
          displayY: enemy.displayY,
          radius: enemy.width * 0.5,
          triggerRadius: enemy.triggerRadius || 32,
          texture: "hands",
          groupId: EntityConstants.Group.ENEMY
        });
      }
    }

    if (data.foods) {
      for (const food of data.foods) {
        new Food({
          scene: this.scene,
          x: food.x,
          y: food.y,
          width: food.width,
          height: food.height,
          xoffset: food.width * 0.5,
          yoffset: food.height * 0.5,
          displayX: food.displayX,
          displayY: food.displayY,
          radius: food.width * 0.5,
          collectedOffset: food.collectedOffset,
          texture: food.texture,
          frame: food.frame,
          groupId: EntityConstants.Group.COLLECTABLE
        });
      }
    }

    if (data.items) {
      for (const item of data.items) {
        new Item({
          scene: this.scene,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          xoffset: item.width * 0.5,
          yoffset: item.height * 0.5,
          displayX: item.displayX,
          displayY: item.displayY,
          radius: item.width * 0.5,
          texture: item.texture,
          groupId: EntityConstants.Group.COLLECTABLE
        });
      }
    }
  }

  update(delta:number) {
    const gameController = GameController.instance(this.scene);
    const inputManager = gameController.getInputManager(this.scene);

    this.clouds.tilePositionX += 0.05;
    this.cloudsBig.tilePositionX += 0.03;

    if (this.gameover) {
      return;
    }

    if (this.complete) {
      if (this.nextLevelTime > 0) {
        this.nextLevelTime -= this.nextLevelTimeSpd * delta;
        if (this.nextLevelTime <= 0) {
          // this.levelCompleteImg.setVisible(false);
          // this.levelCompleteImgTween.stop();
          const commandManager = gameController.getCommandManager(this.scene);
          commandManager.addStatic(CommandType.Level.NEXT_LEVEL);
        }
      }
    } else {
      if (this.player && (!this.player.isDead() && !this.player.isGoal())) {
        if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.ENTER)) {
          gameController.emitEvent(SceneConstants.Events.LEVEL_PAUSE);
        }
      }
    }
  }

  postUpdate(delta:number) {
    const commandManager = GameController.instance(this.scene).getCommandManager(this.scene);
    if (this.gameover) {
      return;
    }

    if (!this.complete) {
      // check if the level has been completed
      this.complete = this.player && this.player.isGoal();
      if (this.complete) {
        // show image and bounce
        // this.levelCompleteImg.setVisible(true);
        // this.levelCompleteImgTween.play(true);
        commandManager.clear();
        commandManager.addStatic(CommandType.Entity.PAUSE);
        this.nextLevelTime = this.nextLevelTimeMax;
      }
    }
  }

  command(command:Command) {
    const gameController = GameController.instance(this.scene);

    if ((command.type === CommandType.Level.NEXT_LEVEL
      || command.type === CommandType.Level.RESTART)
      && !this.next) {
      if (command.type === CommandType.Level.NEXT_LEVEL) {
        this.level++;
      }
      this.next = true;
      gameController.emitEvent(SceneConstants.Events.START_LEVEL);
    } else if (command.type === CommandType.Player.DEAD) {
      this.gameover = true;
      gameController.emitEvent(SceneConstants.Events.GAME_OVER);
    } else if (command.type === CommandType.Level.CLEARED_LEVEL) {
      this.nextLevelTime = this.nextLevelTimeMax;
    }
  }

  /**
   * Clean variable values/references.
   */
  clean() {
    this.player = null;
    this.gameover = false;
  }

  destroy() {

  }
}