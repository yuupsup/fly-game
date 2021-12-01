import Phaser from "phaser";
import {SceneConstants} from "./SceneConstants";
export default class PreLoaderScene extends Phaser.Scene {
  constructor() {
    super(SceneConstants.Scenes.PRELOADER);
  }

  preload() {
    /**
     * Tile maps
     */
    this.load.tilemapTiledJSON("map1", "assets/maps/map1.json");
    this.load.tilemapTiledJSON("map2", "assets/maps/map2.json");
    this.load.tilemapTiledJSON("map3", "assets/maps/map3.json");
    this.load.image("tileset-extruded", "assets/images/tileset-extruded.png");

    /**
     * Levels
     */
    this.load.json("level1", "assets/maps/level1.json");
    this.load.json("level2", "assets/maps/level2.json");
    this.load.json("level3", "assets/maps/level3.json");

    /**
     * Images
     */
    this.load.image("screen-overlay", "assets/images/screen-overlay.png");
    this.load.image("skyBG", "assets/images/bg.png");
    this.load.image("clouds", "assets/images/clouds.png");
    this.load.image("clouds-big", "assets/images/clouds-big.png");

    /**
     * Sprites
     */
    this.load.spritesheet("player", "assets/images/player.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("player-shadow", "assets/images/player-shadow.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("player-wings", "assets/images/player-wings.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("fumes", "assets/images/fumes.png", {frameWidth: 5, frameHeight: 5});
    this.load.spritesheet("hands", "assets/images/hands.png", {frameWidth: 17, frameHeight: 17});
    this.load.spritesheet("clap-dust", "assets/images/clap-dust.png", {frameWidth: 8, frameHeight: 8});
    this.load.spritesheet("girl", "assets/images/girl.png", {frameWidth: 15, frameHeight: 16});
    this.load.spritesheet("items", "assets/images/items.png", {frameWidth: 15, frameHeight: 15});
    this.load.spritesheet("food", "assets/images/food.png", {frameWidth: 31, frameHeight: 31});
    this.load.spritesheet("asteroid", "assets/images/asteroid.png", {frameWidth: 31, frameHeight: 31});
    this.load.spritesheet("goal", "assets/images/goal.png", {frameWidth: 31, frameHeight: 31});

    /**
     * Music
     */

    /**
     * SFX
     */

    /**
     * Font
     */
    this.load.bitmapFont('pixilator', "assets/fonts/pixilator.png", "assets/fonts/pixilator.xml");
    this.load.bitmapFont('pixilator-black', "assets/fonts/pixilator-black.png", "assets/fonts/pixilator-black.xml");
  }

  create() {
    this.scene.start(SceneConstants.Scenes.GAME);
  }
}