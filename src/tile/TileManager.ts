import Phaser from 'phaser';
import {GameConstants} from "../GameConstants";
import {TileUtils} from "./TileUtils";
import GameController from "../GameController";
import AABB from "../collision/AABB";

export default class TileManager {
  constructor() {
  }
  /**
   * Populates the provided list with tile collisions detected from the provided bounds.
   */
  static getTileCollisions(aabb:AABB, velocity:Phaser.Math.Vector2|any, sceneWidth:number, sceneHeight:number, tileLayerIds:Array<string>, tileListIn:Array<any>, ignoreTilesIn:Array<any>, ignoreSlope:boolean, scene:Phaser.Scene) {
    if (tileLayerIds.length === 0) {
      return;
    }

    let idIndex;
    for (idIndex = 0; idIndex < tileLayerIds.length; idIndex++) {
      const tileLayerId = tileLayerIds[idIndex];
      let startTilePos = TileManager.getTilePosition(aabb.x, aabb.y);
      let endTilePos = TileManager.getTilePosition(aabb.right, aabb.bottom, false);

      let tilePosLimitX = (sceneWidth / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
      let tilePosLimitY = (sceneHeight / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;

      let startTilePosX = Math.max(startTilePos.x, 0);
      let startTilePosY = Math.max(startTilePos.y, 0);

      let endTilePosX = Math.min(endTilePos.x, tilePosLimitX);
      let endTilePosY = Math.min(endTilePos.y, tilePosLimitY);

      // traverse all of the tiles the collision rectangle overlaps
      for (let i = startTilePosY; i <= endTilePosY; i += GameConstants.Tile.SIZE) {
        for (let j = startTilePosX; j <= endTilePosX; j += GameConstants.Tile.SIZE) {
          if (j >= tilePosLimitX || i >= tilePosLimitY) {
            continue;
          }
          let tile = this.getTileAtPosition(j, i, tileLayerId, scene);

          if (tile != null && tile.index >= 0) {
            let ignore = false;
            for (let k = 0; k < ignoreTilesIn.length; k++) {
              const ignoreTile = ignoreTilesIn[k];
              if (tile.x === ignoreTile.x && tile.y === ignoreTile.y) {
                ignore = true;
                break;
              }
            }
            if (ignore) {
              continue; // skip the current tile
            }

            const props = TileUtils.Tiles.Properties[tile.index];
            const skipCollide = !props;

            // check if the AABB overlaps the tile
            const tmpAABB = AABB.createCopy(aabb);
            // todo does this work with half width tiles?
            tmpAABB.x = Math.floor(tmpAABB.x);
            tmpAABB.y = Math.floor(tmpAABB.y);
            tmpAABB.left = Math.floor(tmpAABB.left);
            tmpAABB.top = Math.floor(tmpAABB.top);
            tmpAABB.right = Math.ceil(tmpAABB.right);
            tmpAABB.bottom = Math.ceil(tmpAABB.bottom);
            tmpAABB.width = (tmpAABB.right - tmpAABB.left) + 1;
            tmpAABB.height = (tmpAABB.bottom - tmpAABB.top) + 1;

            // todo do we want regular entities to have to pass the collision test?
            const tileAABB = this.getTileAABB(tile);

            if (skipCollide || tileAABB.isCollide(tmpAABB)) {
              const object:any = {};
              if (TileManager.isSlope(tile) && !ignoreSlope) {
                const slopeTile = TileManager.getSlope(tile);
                const line = slopeTile.line;
                const pos = {x: line.x1, y: line.y1};
                const bounds = AABB.create(pos, {}, slopeTile.stepw, 1);
                const overlaps = [];
                // todo currently only assumes ground tiles
                // todo currently only assumes right facing slopes
                if (slopeTile.stepw > 0) {
                  while (pos.x <= line.x2) {
                    if (bounds.isCollide(tmpAABB)) {
                      overlaps.push({x: pos.x, y: pos.y}); // todo need to generalize
                    }
                    pos.x += slopeTile.stepw;
                    pos.y--;
                    bounds.update(pos);
                  }
                }
                if (overlaps.length > 0) {
                  object.overlaps = overlaps;
                }
              }
              // if (TileManager.isSlope(tile)) {
              //   const slopeTile = TileManager.getSlope(tile);
              //   const points = slopeTile.line;
              //   const line = new Phaser.Geom.Line(points.x1, points.y1, points.x2, points.y2);
              //   const rect = new Phaser.Geom.Rectangle(tmpAABB.x, tmpAABB.y, tmpAABB.width, tmpAABB.height); // todo verify the coordinates match the tmpAABB
              //   if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) {
              //     object.line = line;
              //   }
              // }
              object.tile = tile;
              tileListIn.push(object);
            }
          }
        }
      }
    }
  }

  static getTileProperties(tile:Phaser.Tilemaps.Tile) : any {
    if (tile === null || tile.index < 0) {
      return null;
    }
    return TileUtils.Tiles.Properties[tile.index];
  }

  static isSlope(tile:Phaser.Tilemaps.Tile) : boolean {
    const props = TileManager.getTileProperties(tile);
    if (props && props.slope) {
      return true;
    }
    return false;
  }

  static getSlope(tile:Phaser.Tilemaps.Tile) : any|null {
    const props = TileManager.getTileProperties(tile);
    if (props && props.slope) {
      const line = TileManager.getTileLineSegment(tile);
      return {
        tile: tile,
        line: line,
        stepw: props.slope.stepw,
        steph: props.slope.steph
      }
    }
    return null;
  }

  static getTileAABB(tile:Phaser.Tilemaps.Tile) : AABB|null {
    if (tile === null || tile.index < 0) {
      return null;
    }
    const props = TileManager.getTileProperties(tile);
    if (props) {
      return AABB.create({x: tile.pixelX + props.left, y: tile.pixelY + props.top}, {}, props.width || GameConstants.Tile.SIZE, props.height || GameConstants.Tile.SIZE);
    } else {
      return AABB.create({x: tile.pixelX, y: tile.pixelY}, {}, GameConstants.Tile.SIZE, GameConstants.Tile.SIZE);
    }
  }

  static getTileLineSegment(tile:Phaser.Tilemaps.Tile) : any|null {
    const props = TileManager.getTileProperties(tile);
    if (props && props.slope) {
      return {
        x1: tile.pixelX + props.slope.x1,
        y1: tile.pixelY + props.slope.y1,
        x2: tile.pixelX + props.slope.x2,
        y2: tile.pixelY + props.slope.y2
      }
    }
    return null;
  }

  static collide(aabb:AABB, velocity:Phaser.Math.Vector2|any, sceneWidth:number, sceneHeight:number, tileLayerIds:Array<string>, scene:Phaser.Scene) : boolean {
    const tilesIn = [];
    TileManager.getTileCollisions(aabb, velocity, sceneWidth, sceneHeight, tileLayerIds, tilesIn, [], false, scene);
    const collision = tilesIn.length > 0;
    while (tilesIn.length > 0) {
      tilesIn.pop();
    }
    return collision;
  }

  static getOverlaps(aabb:AABB, velocity:Phaser.Math.Vector2|any, sceneWidth:number, sceneHeight:number, tileLayerIds:Array<string>, tileType:number, tilesIn:Array<any>, scene:Phaser.Scene) {
    const overlaps = [];
    TileManager.getTileCollisions(aabb, velocity, sceneWidth, sceneHeight, tileLayerIds, overlaps, [], false, scene);
    for (const obj of overlaps) {
      let success = true;
      if (tileType) {
        success = false;
        switch (tileType) {
          case TileUtils.Tiles.Type.SOLID:

          break;
          case TileUtils.Tiles.Type.SLOPE:
            const tile = obj.tile;
            if (TileManager.isSlope(tile)) {
              success = true;
            }
          break;
        }
      }
      if (success) {
        tilesIn.push(obj);
      }
    }
  }

  static getLineIntersectTiles(area:AABB, lineIn:Phaser.Geom.Line, tileRectIn:Phaser.Geom.Rectangle, scene:Phaser.Scene) : boolean {
    let intersect = false;

    const tileListIn = [];
    TileManager.getTileCollisions(area, {
      x: 0,
      y: 0
    }, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, [TileUtils.Layer.COLLISION], tileListIn, [], false, scene);
    if (tileListIn.length > 0) {
      for (let i = 0; i < tileListIn.length; i++) {
        const tile = tileListIn[i];
        const rx = tile.x * GameConstants.Tile.SIZE;
        const ry = tile.y * GameConstants.Tile.SIZE;
        // does the line intersect the tile?
        tileRectIn.setPosition(rx, ry);
        intersect = Phaser.Geom.Intersects.LineToRectangle(lineIn, tileRectIn);
        if (intersect) {
          break; // collision with tile
        }
      }
    }
    return intersect;
  }

  /**
   * Returns a tile position (in pixels) from the provided positions.
   * @param {number} x
   * @param {number} y
   * @param {boolean} floor
   * @returns a pair of the provided positions converted into tile positions (divided by the tile size and multiplied by the tile size)
   */
  static getTilePosition(x:number, y:number, floor:boolean = true) : any{
    let tlx = floor ? Math.floor(x / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE : Math.floor(Math.ceil(x) / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
    let tly = floor ? Math.floor(y / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE : Math.floor(Math.ceil(y) / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
    return {
      x: tlx,
      y: tly
    };
  }

  /**
   * Finds a tile from the provided position. The provided positions will be converted into an array index to retrieve the Tile instance if it exists.
   * @param {number} x x position of the tile (in pixels)
   * @param {number} y y position of the tile (in pixels)
   * @param {string} layerId
   * @param {Phaser.Scene} scene
   * @returns {Phaser.Tilemaps.Tile} a Tile instance from the tile map.
   */
  static getTileAtPosition(x:number, y:number, layerId:string, scene:Phaser.Scene) : Phaser.Tilemaps.Tile|null {
    return GameController.instance(scene).getTileAtWorldPosition(x, y, layerId, scene);
  }

  /**
   * Finds the next tile from the current tile and provided tile offsets.
   * If both offset values are 0, then null is returned.
   * @param {Phaser.Tilemaps.Tile} tile
   * @param {number} xoffset x offset from the provided tile (-1, 0, 1)
   * @param {number} yoffset y offset from the provided tile (-1, 0, 1)
   * @param {string} tileLayerId
   * @param {Phaser.Scene} scene
   */
  static getNextTile(tile:Phaser.Tilemaps.Tile, xoffset:number, yoffset:number, tileLayerId:string, scene:Phaser.Scene) : Phaser.Tilemaps.Tile|null {
    if (!tile || (xoffset === 0 && yoffset === 0)) {
      return null;
    }
    if ((xoffset === -1 || xoffset === 0 || xoffset === 1) && (yoffset === -1 || yoffset === 0 || yoffset === 1)) {
      const gameController = GameController.instance(scene);
      const next = gameController.getTileAtPosition(tile.x + xoffset, tile.y + yoffset, tileLayerId, scene);
      if (!next || next.index < 0) {
        return null;
      }
      return next;
    } else {
      throw 'Offset value must be -1, 0, or 1';
    }
  }
}