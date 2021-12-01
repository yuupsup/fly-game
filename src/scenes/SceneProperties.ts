import Phaser from "phaser";
import InputManager from "../system/input/InputManager";
import CameraManager from "../system/camera/CameraManager";
import CommandManager from "../pattern/command/CommandManager";
import LevelManager from "../system/level/LevelManager";
import DialogManager from "../gui/dialog/DialogManager";

/**
 * This class is used to hold all managers related to a scene.
 */
export default class SceneProperties {
  inputManager:InputManager|null;
  cameraManager:CameraManager|null;
  commandManager:CommandManager|null;
  levelManager:LevelManager|null;
  dialogManager:DialogManager|null;

  constructor() {
    this.inputManager = null;
    this.cameraManager = null;
    this.commandManager = null;
    this.levelManager = null;
    this.dialogManager = null;
  }

  registerInputManager() {
    if (!this.inputManager) {
      this.inputManager = new InputManager();
    }
  }

  unregisterInputManager() {
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    this.inputManager = null;
  }

  /**
   * @param {Phaser.Scene} scene
   */
  registerCameraManager(scene:Phaser.Scene) {
    if (!this.cameraManager) {
      this.cameraManager = new CameraManager(scene);
    }
  }

  unregisterCameraManager() {
    if (this.cameraManager) {
      this.cameraManager.destroy();
    }
    this.cameraManager = null;
  }

  registerCommandManager() {
    if (!this.commandManager) {
      this.commandManager = new CommandManager();
    }
  }

  unregisterCommandManager() {
    if (this.commandManager) {
      this.commandManager.destroy();
    }
    this.commandManager = null;
  }

  registerLevelManager(scene:Phaser.Scene) {
    if (!this.levelManager) {
      this.levelManager = new LevelManager(scene);
    }
  }

  unregisterLevelManager() {
    if (this.levelManager) {
      this.levelManager.destroy();
    }
    this.levelManager = null;
  }

  /**
   * @param {Phaser.Scene} scene
   */
  registerDialogManager(scene:Phaser.Scene) {
    if (!this.dialogManager) {
      this.dialogManager = new DialogManager(scene);
    }
  }

  unregisterDialogManager() {
    if (this.dialogManager) {
      this.dialogManager.destroy();
    }
    this.dialogManager = null;
  }
}