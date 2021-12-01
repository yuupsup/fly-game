import Phaser from "phaser";
import {AudioConstants} from "./AudioConstants";

export default class AudioManager {
  music:Map<string, Phaser.Sound.BaseSound>;
  sfx:Map<string, Phaser.Sound.BaseSound>;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene:Phaser.Scene) {
    this.music = new Map<string, Phaser.Sound.BaseSound>();
    this.sfx = new Map<string, Phaser.Sound.BaseSound>();
  }

  getMusic(id:string) : Phaser.Sound.BaseSound|undefined {
    return this.music.get(id);
  }

  /**
   * @param id identifier used to store the sfx
   */
  getSFX(id:string) : Phaser.Sound.BaseSound|undefined {
    return this.sfx.get(id);
  }
}