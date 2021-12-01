import Command from "./Command";
import Queue from "../../ds/Queue";

/**
 * This class is used to store Commands that can then be iterated in GameController.update method.
 */
export default class CommandManager {
  commands:Queue;
  toAdd:Queue; // commands to be added at the end of the scene update

  staticCommands:Map<number, Command>; // this SHOULD NOT be modified directly

  constructor() {
    this.commands = new Queue();
    this.toAdd = new Queue();

    this.staticCommands = new Map<number, Command>();
  }

  /**
   * Adds a command to the "to add" queue. These commands will be added at the end of the scene update.
   * @param {Command} command
   */
  add(command:Command) {
    this.toAdd.enqueue(command);
  }

  /**
   * Forcefully adds a command to the queue.
   * @param command
   */
  forceAdd(command:Command) {
    this.commands.enqueue(command);
  }

  /**
   * Adds a static command to the "to add" queue.
   * @param type
   */
  addStatic(type:number) {
    if (this.staticCommands.has(type)) {
      this.toAdd.enqueue(this.staticCommands.get(type));
    }
  }

  /**
   * These Commands CANNOT have data added to them.
   * @param type
   */
  setStatic(type:number) {
    if (!this.staticCommands.has(type)) {
      this.staticCommands.set(type, new Command(type));
    }
  }

  /**
   * Called at the end of the scene update method.
   */
  lateUpdate() {
    let size = this.toAdd.size();
    for (let i = 0; i < size; i++) {
      const command = this.toAdd.dequeue();
      this.commands.enqueue(command);
    }
  }

  /**
   * Returns the next command in the queue.
   * @returns {Command}
   */
  next() : Command|null {
    if (this.commands.size() === 0) {
      return null;
    }
    return this.commands.dequeue();
  }

  isEmpty() : boolean {
    return this.commands.isEmpty();
  }

  size() : number {
    return this.commands.size();
  }

  clear() {
    this.commands.clear();
    this.toAdd.clear();
  }

  destroy() {
    this.commands.clear();
    this.toAdd.clear();
    this.staticCommands.clear();
  }
}