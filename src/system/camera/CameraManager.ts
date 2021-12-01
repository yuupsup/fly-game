import Phaser from "phaser";
import {CommandType} from "../../pattern/command/CommandType";
import CameraTarget from "./CameraTarget";
import Entity from "../../entities/Entity";
import Command from "../../pattern/command/Command";

export default class CameraManager {
  scene:Phaser.Scene;
  camera:Phaser.Cameras.Scene2D.Camera;
  cameraTarget:CameraTarget;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene:Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    // todo need to set the camera bounds for the room
    // this.camera.setBounds(0, 0, GameConstants.ROOM_WIDTH, GameConstants.ROOM_HEIGHT);

    this.cameraTarget = new CameraTarget(scene);
    // this.camera.startFollow(this.cameraTarget.target);
  }

  getCamera() {
    return this.camera;
  }

  setTargetFollow(gameObject:Entity|null) {
    if (gameObject) {
      this.cameraTarget.setFollow(gameObject);
      this.camera.startFollow(this.cameraTarget.target);
    } else {
      this.cameraTarget.setFollow(null);
      this.camera.stopFollow();
    }
  }

  setTargetPosition(x:number, y:number) {
    this.cameraTarget.setPosition(x, y);
  }

  /**
   * @param {Command} command
   */
  command(command:Command) {

  }

  // todo needs to use DELTA
  update(delta:number) {
    // this.camera.centerOn(this.cameraTarget.target.x, this.cameraTarget.target.y);
  }

  postUpdate(delta:number) {
    this.cameraTarget.update(this.camera, true, delta, this.scene);
  }

  destroy() {

  }
}