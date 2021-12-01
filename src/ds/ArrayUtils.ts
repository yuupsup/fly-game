export default class ArrayUtils {
  static clear(arr:Array<any>) {
    if (!arr || !Array.isArray(arr)) {
      return;
    }
    while (arr.length > 0) {
      arr.pop();
    }
  }
}