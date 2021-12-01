export const SceneConstants = {
  Scenes: {
    BOOT: "BootScene",
    PRELOADER: "PreLoaderScene",
    GAME: "GameScene",
    UI: "UIScene",
    LOGO: "LogoScene",
    GAME_MENU: "GameMenuScene",
    OPTIONS_MENU: "OptionsMenuScene",
    CREDITS_MENU: "CreditsMenuScene",
    CUTSCENE: "CutsceneScene",
    HUD: "HUDScene",
    PAUSE: "PauseScene",
    LEVEL: "LevelScene",
    GAME_OVER: "GameOverScene",
    TEST: "TestScene"
  },
  /**
   * Register scene properties in GameController.
   */
  Systems: {
    INPUT: 0,
    CAMERA: 1,
    COMMAND: 2,
    DIALOG: 3,
    LEVEL: 4
  },
  Events: {
    OPEN_MAIN_MENU: "ev-open-main-menu",
    CLOSE_MAIN_MENU: "ev-close-main-menu",
    START_CUTSCENE: "ev-start-cutscene",
    START_GAME: "ev-start-game",
    START_LEVEL: "ev-start-level",
    LEVEL_COMPLETED: "ev-level-completed",
    PREPARE_RESTART_LEVEL: "ev-prep-level-restart",
    RESTART_LEVEL: "ev-level-restart",
    LEVEL_PAUSE: "ev-level-pause",
    LEVEL_RESUME: "ev-level-resume",
    PAUSE: "ev-pause",
    UNPAUSE: "ev-unpause",
    SHOW_HUD: "ev-show-hud",
    GAME_OVER: "ev-game-over",
    UPDATE_HUD: "ev-update-hud"
  }
};