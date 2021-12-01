import Phaser from "phaser";
import {SceneConstants} from "./SceneConstants";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneConstants.Scenes.BOOT);
  }

  create() {
    this.scene.start(SceneConstants.Scenes.PRELOADER);
  }
}