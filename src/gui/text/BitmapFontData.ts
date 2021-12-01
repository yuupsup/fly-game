import Phaser from 'phaser'

export default class BitmapFontData {
  charDataMap:Map<string, Map<string, string>>

  /**
   * @param {Phaser.Scene} scene
   * @param {string} key identifier of the bitmap font that was preloaded in PreLoaderScene.
   */
  constructor(scene:Phaser.Scene, key:string) {
    this.charDataMap = new Map<string, Map<string, string>>();
    // add the data from the xml to the map
    const dom = scene.cache.xml.get(key);
    if (dom) {
      const elements = dom.getElementsByTagName("chars");
      if (elements.length) {
        const children = elements[0].children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const id = child.getAttribute("id");
          if (id) {
            this.charDataMap.set(id, new Map<string, string>());
            const attributes = child.getAttributeNames();
            for (let j = 0; j < attributes.length; j++) {
              const attr = attributes[j];
              const map = this.charDataMap.get(id);
              if (map) {
                map.set(attr, child.getAttribute(attr));
              }
            }
          }
        }
      }
    }
  }

  /**
   * Finds the width of the character from the provided unicode.
   * @param {string|number} id character unicode
   * @return {null|number}
   */
  getCharWidth(id:string|number) : number {
    if (typeof id !== "string") {
      id = id.toString();
    }
    if (this.charDataMap.has(id)) {
      const data = this.charDataMap.get(id);
      if (data) {
        const value = data.get("xadvance");
        if (value) {
          return parseInt(value);
        }
        return 0;
      }
    }
    // todo need to throw exception?
    return 0;
  }
}