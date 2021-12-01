import Phaser from "phaser";
import {SceneConstants} from "./SceneConstants";
import GameController from "../GameController";
import AudioManager from "../system/audio/AudioManager";

/**
 * Controls the state of the game.
 * This scene is always running and will launch other scenes when needed.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SceneConstants.Scenes.GAME);
  }

  create() {
    /**
     * Initialize the game controller and global systems.
     */
    this.game.canvas.oncontextmenu = function(e) { e.preventDefault(); }; // prevents right-click on the canvas
    const gameController = GameController.instance(this);
    gameController.setAudioManager(new AudioManager(this));

    this.scene.run(SceneConstants.Scenes.UI);
    this.scene.run(SceneConstants.Scenes.LEVEL);
    this.scene.moveBelow(SceneConstants.Scenes.LEVEL, SceneConstants.Scenes.UI);
  }
}