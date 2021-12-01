import Phaser from "phaser";
import {GameConstants} from "./GameConstants";
import Game from "./Game";

const config = {
	type: Phaser.AUTO,
	physics: {
		default: "arcade",
		arcade: {
			debug: false
		}
	},
	render: {
		pixelArt: true,
		antialias: false,
		antialiasGL: false,
	},
	scale: {
		// mode: Phaser.Scale.NONE,
		mode: Phaser.Scale.FIT,
		parent: "game",
		width: GameConstants.Screen.WINDOW_WIDTH,
		height: GameConstants.Screen.WINDOW_HEIGHT
	},
	backgroundColor: '#34859d'
};

export default new Game(config).runGame();