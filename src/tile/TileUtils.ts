/**
 * Tiles - Holds the tile indices.
 */
export const TileUtils = {
  TYPE_EMPTY: "empty",
  TYPE_SOLID: "solid",

  Layer: {
    BACKGROUND: "Background",
    FOREGROUND: "Foreground",
    GROUND: "Ground",
    COLLISION: "Collision"
  },

  Tiles: {
    Type: {
      SOLID: 0,
      SLOPE: 1
    },
    Properties: {
      2: {
        desc: "",
        left: 0,
        top: 8,
        width: 16,
        height: 8
      }
    }
  }
};