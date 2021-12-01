import Phaser from 'phaser';
import {SceneConstants} from "../SceneConstants";
import GameController from "../../GameController";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SceneConstants.Scenes.UI);
  }

  create() {
    const gameController = GameController.instance(this);
    /**
     * Events
     */
    /**
     * Pause
     */
    gameController.onEvent(SceneConstants.Events.PAUSE, (function (self:Phaser.Scene) {
      return function (data) {
        self.scene.run(SceneConstants.Scenes.PAUSE, data);
        self.scene.moveBelow(SceneConstants.Scenes.LEVEL, SceneConstants.Scenes.PAUSE); // does not work when 'pause' scene is waking up
      };
    })(this));

    gameController.onEvent(SceneConstants.Events.UNPAUSE, (function (self:Phaser.Scene) {
      return function (data) {
        self.scene.sleep(SceneConstants.Scenes.PAUSE);
        if (data.pausedScene === SceneConstants.Scenes.LEVEL) {
          GameController.instance(self).emitEvent(SceneConstants.Events.LEVEL_RESUME, data);
          self.scene.moveBelow(SceneConstants.Scenes.LEVEL, SceneConstants.Scenes.PAUSE); // need to move the scene below
        }
      };
    })(this));

    /**
     * Level Completed
     */

    // /**
    //  * Game Over
    //  */
    // gameController.onEvent(SceneConstants.Events.GAME_OVER, (function (self:Phaser.Scene) {
    //   return function (data) {
    //     self.scene.run(SceneConstants.Scenes.GAME_OVER, data);
    //     self.scene.moveBelow(SceneConstants.Scenes.LEVEL, SceneConstants.Scenes.GAME_OVER);
    //   };
    // })(this));
  }

  update(time: number, delta: number) {
    super.update(time, delta);
  }
}