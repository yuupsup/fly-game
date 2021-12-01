export const LevelProperties = {
  levels: [
    { // 1
      map: 'map1',
      level: 'level1',
      width: 240,
      height: 160
    },
    { // 2
      map: 'map2',
      level: 'level2',
      width: 480,
      height: 240
    }
  ],
  getMapForLevel: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].map;
    }
    return '';
  },
  getMapSize: function(level:number) : any {
    if (level >= 0 && level < this.levels.length) {
      return {
        x: this.levels[level].width,
        y: this.levels[level].height
      }
    }
    return {x: 240, y: 160};
  },
  getEntitiesForLevel: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].level;
    }
    return '';
  },
  isGameOver: function(level:number) : boolean {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].gameover;
    }
    return false;
  }
};