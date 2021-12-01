import Phaser from "phaser";
import {GameConstants} from "./GameConstants";
import {SceneConstants} from "./scenes/SceneConstants";
import GameController from "./GameController";
import BootScene from "./scenes/BootScene";
import PreLoaderScene from "./scenes/PreLoaderScene";
import GameScene from "./scenes/GameScene";
import LevelScene from "./scenes/LevelScene";
import UIScene from "./scenes/ui/UIScene";
import PauseScene from "./scenes/ui/menu/PauseScene";

export default class Game extends Phaser.Game {
  constructor(config) {
    super(config);

    this.scene.add(SceneConstants.Scenes.BOOT, BootScene);
    this.scene.add(SceneConstants.Scenes.PRELOADER, PreLoaderScene);
    this.scene.add(SceneConstants.Scenes.GAME, GameScene);
    this.scene.add(SceneConstants.Scenes.UI, UIScene);
    this.scene.add(SceneConstants.Scenes.PAUSE, PauseScene);
    this.scene.add(SceneConstants.Scenes.LEVEL, LevelScene);

    this.registry.set(GameConstants.Registry.GAME_CONTROLLER, new GameController());
  }

  runGame() : Game {
    // start the game
    this.scene.start(SceneConstants.Scenes.BOOT);
    return this;
  }
}