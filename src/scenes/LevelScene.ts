import Phaser from 'phaser';
import {SceneConstants} from "./SceneConstants";
import {GameConstants} from "../GameConstants";
import {CommandType} from "../pattern/command/CommandType";
import GameController from "../GameController";
import EntityManager from "../entities/manager/EntityManager";
import Player from "../entities/player/Player";

export default class LevelScene extends Phaser.Scene {
  player:Player|null;
  entityManager:EntityManager;

  constructor() {
    super(SceneConstants.Scenes.LEVEL);
    this.player = null;

    this.entityManager = new EntityManager(this);
  }

  create() {
    const gameController = GameController.instance(this);
    gameController.registerSystem(this, SceneConstants.Systems.INPUT);
    gameController.registerSystem(this, SceneConstants.Systems.CAMERA);
    gameController.registerSystem(this, SceneConstants.Systems.COMMAND);
    gameController.registerSystem(this, SceneConstants.Systems.LEVEL);

    /**
     * Add static commands
     */
    const commandManager = gameController.getCommandManager(this);
    commandManager.setStatic(CommandType.Level.NEXT_LEVEL);
    commandManager.setStatic(CommandType.Level.RESTART);
    commandManager.setStatic(CommandType.Level.CLEARED_LEVEL);
    commandManager.setStatic(CommandType.Entity.PAUSE);
    commandManager.setStatic(CommandType.Player.NORMAL);
    commandManager.setStatic(CommandType.Player.DEAD);

    /**
     * Add controls
     */
    const inputManager = gameController.getInputManager(this);
    if (inputManager) {
      // inputManager.enableMouse(this);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.LEFT);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.RIGHT);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.UP);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.DOWN);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.Z);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.ENTER);
      inputManager.enableMouse(this);
    }

    /**
     * Entity Manager setup
     */
    this.entityManager.setup();

    gameController.getCameraManager(this).getCamera().setBounds(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT);

    // this.add.grid(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, 48, 48, 0x34859d).setAltFillStyle(0x34859d).setOutlineStyle().setOrigin(0, 0).setDepth(-100);

    /**
     * Level Manager
     */
    gameController.getLevelManager(this).createLevel();

    /**
     * Music
     */

    /**
     * Events
     */
    gameController.onEvent(SceneConstants.Events.START_LEVEL, (function (scene:LevelScene) {
      return function () {
        // 1. entity manager
        // 2. tile map
        scene.entityManager.destroy();
        scene.entityManager.resetId();
        const gameController = GameController.instance(scene);
        gameController.destroyTilemap(scene);
        const levelManager = gameController.getLevelManager(scene);
        levelManager.clean();
        levelManager.createLevel();
      };
    })(this), null);

    gameController.onEvent(SceneConstants.Events.LEVEL_PAUSE, (function (self:Phaser.Scene) {
      return function () {
        const gameController = GameController.instance(self);
        self.scene.pause(SceneConstants.Scenes.LEVEL);
        gameController.emitEvent(SceneConstants.Events.PAUSE, {pausedScene: self.scene.key, title: 'Paused', options: ['continue', 'restart', 'quit']});
      };
    })(this), null);

    gameController.onEvent(SceneConstants.Events.LEVEL_RESUME, (function (self:Phaser.Scene) {
      return function (data) {
        if (data.type === 'restart') {
          const gameController = GameController.instance(self);
          gameController.getCommandManager(self).addStatic(CommandType.Level.RESTART);
        }
        self.scene.resume(SceneConstants.Scenes.LEVEL);
      };
    })(this), null);

    gameController.onEvent(SceneConstants.Events.GAME_OVER, (function (self:Phaser.Scene) {
      return function () {
        const gameController = GameController.instance(self);
        //self.scene.pause(SceneConstants.Scenes.LEVEL);
        gameController.emitEvent(SceneConstants.Events.PAUSE, {pausedScene: self.scene.key, title: 'Game Over', options: ['restart', 'quit']});
      };
    })(this), null);
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.entityManager.update(time, delta * 0.001);

    const commandManager = GameController.instance(this).getCommandManager(this);
    if (commandManager) {
      commandManager.lateUpdate();
    }
  }
}