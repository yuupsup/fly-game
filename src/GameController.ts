import Phaser from 'phaser';
import {GameConstants} from "./GameConstants";
import {SceneConstants} from "./scenes/SceneConstants";
import SceneProperties from "./scenes/SceneProperties";
import TileMapProperties from "./tile/TileMapProperties";
import InputManager from "./system/input/InputManager";
import AudioManager from "./system/audio/AudioManager";
import CommandManager from "./pattern/command/CommandManager";
import Command from "./pattern/command/Command";
import CameraManager from "./system/camera/CameraManager";
import LevelManager from "./system/level/LevelManager";
import DialogManager from "./gui/dialog/DialogManager";

export default class GameController {
  scenePropMap:Map<string, SceneProperties>; // mapping of scene keys to systems/managers that are needed by the scene
  sceneEventEmitter:Phaser.Events.EventEmitter; // used to communicate between scenes

  tilePropsByScene:Map<string, TileMapProperties>;

  audioManager:AudioManager|null;

  randGenerator:Phaser.Math.RandomDataGenerator;

  constructor() {
    this.scenePropMap = new Map<string, SceneProperties>();
    this.sceneEventEmitter = new Phaser.Events.EventEmitter();

    this.tilePropsByScene = new Map<string, TileMapProperties>();

    this.audioManager = null;

    this.randGenerator = new Phaser.Math.RandomDataGenerator();
  }

  static instance(scene:Phaser.Scene) : GameController {
    return scene.game.registry.get(GameConstants.Registry.GAME_CONTROLLER);
  }

  /**
   * System methods
   */
  /**
   * Registers a system for the Scene.
   * @param {Phaser.Scene} scene
   * @param {number} registerId register value in SceneConstants
   */
  registerSystem(scene:Phaser.Scene, registerId:number) {
    const sceneKey = scene.scene.key;
    if (!this.scenePropMap.has(sceneKey)) {
      this.scenePropMap.set(sceneKey, new SceneProperties());
    }
    const props = this.scenePropMap.get(sceneKey);
    if (props) {
      if (registerId === SceneConstants.Systems.INPUT) {
        props.registerInputManager();
      } else if (registerId === SceneConstants.Systems.CAMERA) {
        props.registerCameraManager(scene);
      } else if (registerId === SceneConstants.Systems.COMMAND) {
        props.registerCommandManager();
      } else if (registerId === SceneConstants.Systems.LEVEL) {
        props.registerLevelManager(scene);
      } else if (registerId === SceneConstants.Systems.DIALOG) {
        props.registerDialogManager(scene);
      }
    }
  }

  /**
   * Use this method within a Scene's shutdown event to remove stored scene properties.
   * @param {Phaser.Scene} scene
   */
  unregisterSystems(scene:Phaser.Scene) {
    const prop = this.scenePropMap.get(scene.scene.key);
    if (prop) {
      prop.unregisterInputManager();
      prop.unregisterCameraManager();
      prop.unregisterCommandManager();
      prop.unregisterLevelManager();
      prop.unregisterDialogManager();
      this.scenePropMap.delete(scene.scene.key);
    }
  }

  /**
   * @param {AudioManager} audio
   */
  setAudioManager(audio:AudioManager) {
    if (!this.audioManager) {
      this.audioManager = audio;
    }
  }

  playMusic(id:string) {
    if (this.audioManager) {
      const music = this.audioManager.getMusic(id);
      if (music) {
        music.play();
      }
    }
  }

  /**
   * Plays a sound from the AudioManager.
   * @param id identifier of the sound to be played
   * @param ignoreIfPlaying
   */
  playSFX(id:string, ignoreIfPlaying:boolean = false) {
    if (this.audioManager) {
      const sfx = this.audioManager.getSFX(id);
      if (sfx) {
        if (!ignoreIfPlaying || !sfx.isPlaying) {
          sfx.play();
        }
      }
    }
  }

  /**
   * Stops a sound from the AudioManager.
   * @param id identifier of the sound to be stopped
   */
  stopSFX(id:string) {
    if (this.audioManager) {
      const sfx = this.audioManager.getSFX(id);
      if (sfx && sfx.isPlaying) {
        sfx.stop();
      }
    }
  }

  /**
   * @param {Phaser.Scene} scene
   * @return {InputManager|null}
   */
  getInputManager(scene:Phaser.Scene) : InputManager|null {
    const sceneProps = this.scenePropMap.get(scene.scene.key);
    if (sceneProps) {
      return sceneProps.inputManager;
    }
    return null;
  }

  /**
   * @param {Phaser.Scene} scene
   * @return {CameraManager|null}
   */
  getCameraManager(scene:Phaser.Scene) : CameraManager|null {
    const sceneProps = this.scenePropMap.get(scene.scene.key);
    if (sceneProps) {
      return sceneProps.cameraManager;
    }
    return null;
  }

  /**
   * @param {Phaser.Scene} scene
   * @return {CommandManager|null}
   */
  getCommandManager(scene:Phaser.Scene) : CommandManager|null {
    const sceneProps = this.scenePropMap.get(scene.scene.key);
    if (sceneProps) {
      return sceneProps.commandManager;
    }
    return null;
  }

  /**
   * @param {Phaser.Scene} scene
   * @return {DialogManager|null}
   */
  getDialogManager(scene:Phaser.Scene) : DialogManager|null {
    const sceneProps = this.scenePropMap.get(scene.scene.key);
    if (sceneProps) {
      return sceneProps.dialogManager;
    }
    return null;
  }

  /**
   * @param {Phaser.Scene} scene
   * @return {LevelManager|null}
   */
  getLevelManager(scene:Phaser.Scene) : LevelManager|null {
    const sceneProps = this.scenePropMap.get(scene.scene.key);
    if (sceneProps) {
      return sceneProps.levelManager;
    }
    return null;
  }

  sendCommandToSystems(command:Command, scene:Phaser.Scene) {
    const cameraManager = this.getCameraManager(scene);
    if (cameraManager) {
      cameraManager.command(command);
    }
    const levelManager = this.getLevelManager(scene);
    if (levelManager) {
      levelManager.command(command);
    }
    const dialogManager = this.getDialogManager(scene);
    if (dialogManager) {
      dialogManager.command(command);
    }
  }

  /**
   * Events
   */
  /**
   * Setup the event listener for the provided context.
   * @param eventId
   * @param {function} callFunc callback function
   * @param context
   */
  onEvent(eventId, callFunc, context:any = null) {
    this.sceneEventEmitter.on(eventId, callFunc, context);
  }

  /**
   *
   * @param {string} eventId
   * @param {object} data
   */
  emitEvent(eventId, data:any = null) {
    this.sceneEventEmitter.emit(eventId, data);
  }

  /**
   * Tile methods
   */
  addTileProperties(scene:Phaser.Scene, tilemap:Phaser.Tilemaps.Tilemap, tileset:Phaser.Tilemaps.Tileset) {
    const key = scene.scene.key;
    if (!this.tilePropsByScene.has(key)) {
      this.tilePropsByScene.set(key, new TileMapProperties(tilemap, tileset));
    }
  }

  static createTileMapPropertiesForScene(scene:Phaser.Scene, config:any) {
    // const data = config.data; // represents the layout of tiles on the scene
    const tilemap = scene.make.tilemap({ key: config.map });
    const tileset = tilemap.addTilesetImage(config.tileId, config.tileIdExtruded, GameConstants.Tile.SIZE, GameConstants.Tile.SIZE, 1, 2);
    GameController.instance(scene).addTileProperties(scene, tilemap, tileset);
  }

  /**
   *
   * @param scene
   * @param tileA index of the tile to be replaced
   * @param tileB index of the tile to use
   * @param tileX x position of the tile in tile coordinates
   * @param tileY y position of the tile in tile coordinates
   * @param layerId identifier of the tile layer
   */
  swapTileAtPosition(scene:Phaser.Scene, tileA:number, tileB:number, tileX:number, tileY:number, layerId:string) {
    const tileProps = this.tilePropsByScene.get(scene.scene.key);
    if (tileProps) {
      tileProps.tilemap.swapByIndex(tileA, tileB, tileX, tileY, 1, 1, this.getTilemapLayer(scene, layerId));
    }
  }

  getTileIndexCountByLayer(scene:Phaser.Scene, index:number|Array<number>, layerId:string) : number {
    const key = scene.scene.key;
    const tileProps = this.tilePropsByScene.get(key);
    if (tileProps) {
      const tilemapLayer = tileProps.getTilemapLayer(layerId);
      const tiles = tilemapLayer.filterTiles((function(index:number|Array<number>) {
        return function(tile) {
          if (Array.isArray(index)) {
            for (let i = 0; i < index.length; i++) {
              if (tile.index === index[i]) {
                return true;
              }
            }
          } else if (tile.index === index) {
            return true;
          }
          return false;
        };
      })(index), null, 0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT);
      return tiles.length;
    }
    return 0;
  }

  /**
   * Adds a static layer to the tilemap stored in the Scene.
   * @param {Phaser.Scene} scene
   * @param {string} layerId
   * @param {number} x
   * @param {number} y
   * @param {number} depth
   */
  addTilemapLayer(scene:Phaser.Scene, layerId:string, x:number, y:number, depth:number=0) {
    const tileProps = this.tilePropsByScene.get(scene.scene.key);
    if (tileProps) {
      tileProps.addTilemapLayer(layerId, x, y, depth);
    }
  }

  getTilemapLayer(scene:Phaser.Scene, layerId:string) : Phaser.Tilemaps.TilemapLayer | undefined {
    const tileProps = this.tilePropsByScene.get(scene.scene.key);
    if (tileProps) {
      return tileProps.tilemapLayers.get(layerId);
    }
    return undefined;
  }

  /**
   * Destroys the tilemap properties (this includes destroying the tilemap and tile layers)
   * @param scene
   */
  destroyTilemap(scene:Phaser.Scene) {
    const key = scene.scene.key;
    const tileProps = this.tilePropsByScene.get(key);
    if (tileProps) {
      tileProps.destroy();
      this.tilePropsByScene.delete(key);
    }
  }

  /**
   * Returns a tile for the given layer and at the provided game object position
   * @param {number} x represents the x position of the tile (in pixels)
   * @param {number} y represents the y position of the tile (in pixels)
   * @param {string} layerId represents the layer of the tilemap to find the tile
   * @param {Phaser.Scene} scene
   */
  getTileAtWorldPosition(x:number, y:number, layerId:string, scene:Phaser.Scene) {
    let tileX = Math.floor(x / GameConstants.Tile.SIZE);
    let tileY = Math.floor(y / GameConstants.Tile.SIZE);
    return this.getTileAtPosition(tileX, tileY, layerId, scene);
  }

  /**
   * Returns a tile for the given layer and at the provided game object position
   * @param {number} tileX represents the x position of the tile (in tile units)
   * @param {number} tileY represents the y position of the tile (in tile units)
   * @param {string} layerId represents the layer of the tilemap to find the tile
   * @param {Phaser.Scene} scene
   */
  getTileAtPosition(tileX:number, tileY:number, layerId:string, scene:Phaser.Scene) : Phaser.Tilemaps.Tile|null {
    const tileProps = this.tilePropsByScene.get(scene.scene.key);
    if (tileProps) {
      const layer = this.getTilemapLayer(scene, layerId);
      return tileProps.tilemap.getTileAt(tileX, tileY, false, layer);
    }
    return null;
  }
}