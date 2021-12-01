import Phaser from 'phaser';
import GameController from "../../../GameController";
import {SceneConstants} from "../../SceneConstants";
import {GameConstants} from "../../../GameConstants";

export default class PauseScene extends Phaser.Scene {
  titleText:Phaser.GameObjects.BitmapText|null
  selectText:Phaser.GameObjects.BitmapText|null;

  select:number; // continue or restart/skip scene

  screenOverlay:Phaser.GameObjects.Image|null;

  pausedScene:string; // holds key to the scene that paused

  pauseType:string; // determines the type of pause (pause, game over, etc.)

  selectOptions:Map<string, any>;
  options:Array<any>;

  constructor() {
    super(SceneConstants.Scenes.PAUSE);

    this.titleText = null;
    this.selectText = null;

    this.select = 0;

    this.screenOverlay = null;

    this.pausedScene = "";

    this.selectOptions = new Map<string, Phaser.GameObjects.BitmapText>();
    this.options = new Array<Phaser.GameObjects.BitmapText>();
  }

  create(data) {
    this.pausedScene = data.pausedScene;

    const gameController = GameController.instance(this);
    gameController.registerSystem(this, SceneConstants.Systems.INPUT);
    gameController.registerSystem(this, SceneConstants.Systems.CAMERA);

    /**
     * Add controls
     */
    const inputManager = gameController.getInputManager(this);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.UP);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.DOWN);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.ENTER);

    /**
     * Text
     */
    this.screenOverlay = this.add.image(0, 0, 'screen-overlay');
    this.screenOverlay.setOrigin(0, 0);
    this.screenOverlay.setDepth(-100);
    this.screenOverlay.alpha = 0.85;

    this.titleText = this.add.bitmapText(GameConstants.Screen.WINDOW_WIDTH * 0.5, GameConstants.Screen.WINDOW_HEIGHT * 0.3, GameConstants.Font.FONT, data.title, GameConstants.Font.SIZE);
    this.titleText.setOrigin(0.5);
    this.titleText.setDropShadow(1, 1, 0x211E20, 1);

    this.createOptions(data);

    this.selectText = this.add.bitmapText(GameConstants.Screen.WINDOW_WIDTH * 0.35, GameConstants.Screen.WINDOW_HEIGHT * 0.4, GameConstants.Font.FONT, ">", GameConstants.Font.SIZE);
    this.selectText.setOrigin(0.5);
    this.selectText.setDropShadow(1, 1, 0x211E20, 1);

    /**
     * Events
     */
    this.events.on('wake', function(sys, data) {
      this.pausedScene = data.pausedScene;
      this.titleText.setText(data.title);
      this.createOptions(data);
      this.select = 0;
      this.selectText.setPosition(GameConstants.Screen.WINDOW_WIDTH * 0.35, GameConstants.Screen.WINDOW_HEIGHT * 0.4);
    }, this);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    const gameController = GameController.instance(this);
    const inputManager = gameController.getInputManager(this);
    inputManager.update();

    if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.ENTER)) {
      gameController.emitEvent(SceneConstants.Events.UNPAUSE, {pausedScene: this.pausedScene, type: this.options[this.select].type});
    } else {
      if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.UP)) {
        if (this.select > 0) {
          this.select--;
          this.selectText.setY(this.options[this.select].text.y);
        }
      } else if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.DOWN)) {
        if (this.select < (this.options.length - 1)) {
          this.select++;
          this.selectText.setY(this.options[this.select].text.y);
        }
      }
    }
  }

  createOptions(data:any) {
    if (!this.selectOptions.has('continue')) {
      this.selectOptions.set('continue', {
        type: 'continue',
        text: this.add.bitmapText(GameConstants.Screen.WINDOW_WIDTH * 0.5, 0, GameConstants.Font.FONT, 'Continue', GameConstants.Font.SIZE)
          .setOrigin(0.5).setDropShadow(1, 1, 0x211E20, 1).setVisible(false)
      });
    }
    if (!this.selectOptions.has('restart')) {
      this.selectOptions.set('restart', {
        type: 'restart',
        text: this.add.bitmapText(GameConstants.Screen.WINDOW_WIDTH * 0.5, 0, GameConstants.Font.FONT, 'Restart', GameConstants.Font.SIZE)
          .setOrigin(0.5).setDropShadow(1, 1, 0x211E20, 1).setVisible(false)
      });
    }
    if (!this.selectOptions.has('quit')) {
      this.selectOptions.set('quit', {
        type: 'quit',
        text: this.add.bitmapText(GameConstants.Screen.WINDOW_WIDTH * 0.5, 0, GameConstants.Font.FONT, 'Quit', GameConstants.Font.SIZE)
          .setOrigin(0.5).setDropShadow(1, 1, 0x211E20, 1).setVisible(false)
      });
    }

    // hide the text
    for (let i = this.options.length - 1; i >= 0; i--) {
      this.options[i].text.setVisible(false);
      this.options.pop();
    }
    // this.options.length = 0;

    let yoffset = 0.4;
    for (const op of data.options) {
      if (this.selectOptions.has(op)) {
        this.options.push(this.selectOptions.get(op));
        // update the y position
        this.options[this.options.length - 1].text.setY(GameConstants.Screen.WINDOW_HEIGHT * yoffset).setVisible(true);
        yoffset = yoffset + 0.07;
      }
    }
  }
}