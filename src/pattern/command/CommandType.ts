/**
 * Used to define the types of Commands that can be sent to observers.
 */
export const CommandType = {
  Entity: {
    PAUSE: 0,
    UNPAUSE: 1,
    MOVE_CHILD: 2 // moves a child node to another parent node
  },
  Player: {
    NORMAL: 40,
    DEAD: 41
  },
  Level: {
    NEXT_LEVEL: 50,
    CLEARED_LEVEL: 51,
    RESTART: 52,
  }
};