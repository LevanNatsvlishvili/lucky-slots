import { Application } from 'pixi.js';
import { SlotMachine } from './SlotMachine';

async function init() {
  // Create the PixiJS Application
  const app = new Application();

  await app.init({
    width: 900,
    height: 600,
    backgroundColor: 0x1a0a2e,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // Add canvas to DOM
  document.getElementById('game-container').appendChild(app.canvas);

  // Create and start the slot machine
  const slotMachine = new SlotMachine(app);
  await slotMachine.init();
}

init().catch(console.error);
