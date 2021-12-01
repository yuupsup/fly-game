/**
 * This class is used as a message that will be stored in a collection to be viewed by observers (entities/managers/etc.)
 * at the start of each update.
 * Every Command has a CommandType which will allow observers entities/managers/etc. to determine which Commands are
 * important to them.
 */
export default class Command {
  type:number;
  callback:any|null; // function to invoke when the Command has been observed
  context:any|null; // context to use for the callback function
  data:any|null; // map of information that is relevant to the observer

  /**
   * @param {number} type
   */
  constructor(type:number) {
    this.type = type;
    this.callback = null;
    this.context = null;
    this.data = null;
  }

  /**
   * @param {function} func
   * @param {object} context
   * @return {Command}
   */
  setCallback(func:any, context:any) : Command {
    this.callback = func;
    this.context = context || null;
    return this;
  }

  /**
   * Gets a value from the data.
   * @param {any} key
   * @return {object}
   */
  get(key:any) : any {
    const value = this.data[key];
    if (value === undefined) {
      return null;
    }
    return value;
  }

  /**
   * Adds a data map to the command. Observers of the command can check the data for relevant information.
   * @param {object} props represents a JavaScript object {}.
   * @return {Command}
   */
  addData(props:any) : Command {
    this.data = props;
    return this;
  }

  /**
   * Calls the callback function.
   */
  call() {
    if (this.callback) {
      if (this.context) {
        this.callback.call(this.context);
      } else {
        this.callback();
      }
    }
  }
}