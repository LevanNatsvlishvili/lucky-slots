import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CONFIG, SYMBOLS, PAYLINES, TOTAL_WEIGHT } from './config';
import { Reel } from './Reel';
import { UI } from './UI';
import { ParticleSystem } from './ParticleSystem';

export class SlotMachine {
  constructor(app) {
    this.app = app;
    this.reels = [];
    this.currentSymbols = [];
    this.isSpinning = false;

    // Game state
    this.balance = CONFIG.INITIAL_BALANCE;
    this.bet = CONFIG.BET_LEVELS[CONFIG.DEFAULT_BET_INDEX];
    this.currentBetIndex = CONFIG.DEFAULT_BET_INDEX;
    this.lastWin = 0;
  }

  async init() {
    this.createBackground();
    this.createReelArea();
    this.createFrame();
    this.createUI();
    this.createParticleSystem();
    this.setupKeyboardControls();

    // Start game loop
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
  }

  createBackground() {
    const bg = new Graphics();

    // Main background
    bg.rect(0, 0, 900, 600);
    bg.fill(0x1a0a2e);

    // Add decorative stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 900;
      const y = Math.random() * 600;
      const radius = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.2;
      bg.circle(x, y, radius);
      bg.fill({ color: 0xffffff, alpha });
    }

    this.app.stage.addChild(bg);

    // Title
    const titleStyle = new TextStyle({
      fontFamily: 'Arial Black, Arial',
      fontSize: 42,
      fontWeight: 'bold',
      fill: 0xffd700,
      stroke: { color: 0x000000, width: 5 },
      dropShadow: {
        color: 0x000000,
        blur: 4,
        distance: 3,
      },
    });

    const title = new Text({ text: '✨ LUCKY SLOTS ✨', style: titleStyle });
    title.anchor.set(0.5);
    title.x = 450;
    title.y = 45;
    this.app.stage.addChild(title);
    this.titleText = title;
  }

  createReelArea() {
    const { REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_WIDTH } = CONFIG;

    const reelAreaWidth = REEL_COUNT * REEL_WIDTH;
    const reelAreaHeight = ROW_COUNT * SYMBOL_SIZE;
    const startX = (900 - reelAreaWidth) / 2;
    const startY = (600 - reelAreaHeight) / 2;

    // Main reel container
    this.reelContainer = new Container();
    this.reelContainer.x = startX;
    this.reelContainer.y = startY;
    this.app.stage.addChild(this.reelContainer);

    // Reel background
    const reelBg = new Graphics();
    reelBg.roundRect(-10, -10, reelAreaWidth + 20, reelAreaHeight + 20, 10);
    reelBg.fill(0x0d0d1a);
    this.reelContainer.addChild(reelBg);

    // Create mask
    const mask = new Graphics();
    mask.roundRect(-5, -5, reelAreaWidth + 10, reelAreaHeight + 10, 8);
    mask.fill(0xffffff);
    this.reelContainer.addChild(mask);

    // Create reels
    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel(i, REEL_WIDTH, SYMBOL_SIZE, ROW_COUNT);
      reel.container.x = i * REEL_WIDTH + REEL_WIDTH / 2;
      reel.container.mask = mask;
      this.reelContainer.addChild(reel.container);
      this.reels.push(reel);

      // Add reel separator
      if (i < REEL_COUNT - 1) {
        const separator = new Graphics();
        separator.moveTo((i + 1) * REEL_WIDTH, 0);
        separator.lineTo((i + 1) * REEL_WIDTH, reelAreaHeight);
        separator.stroke({ color: 0x3d3d5c, width: 2, alpha: 0.5 });
        this.reelContainer.addChild(separator);
      }
    }

    // Initialize symbols
    this.initializeReels();
  }

  createFrame() {
    const { REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_WIDTH } = CONFIG;

    const reelAreaWidth = REEL_COUNT * REEL_WIDTH;
    const reelAreaHeight = ROW_COUNT * SYMBOL_SIZE;
    const startX = (900 - reelAreaWidth) / 2;
    const startY = (600 - reelAreaHeight) / 2;

    const frame = new Graphics();

    // Outer glow
    frame.roundRect(startX - 20, startY - 20, reelAreaWidth + 40, reelAreaHeight + 40, 18);
    frame.stroke({ color: 0xffd700, width: 6 });

    // Inner shadow
    frame.roundRect(startX - 12, startY - 12, reelAreaWidth + 24, reelAreaHeight + 24, 12);
    frame.stroke({ color: 0x000000, width: 3, alpha: 0.5 });

    this.app.stage.addChild(frame);

    // Payline indicators
    this.createPaylineIndicators(startX, startY, reelAreaHeight);
  }

  createPaylineIndicators(startX, startY, reelAreaHeight) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0xff69b4, 0x7fff00];
    const { SYMBOL_SIZE } = CONFIG;

    for (let i = 0; i < 3; i++) {
      const indicator = new Graphics();
      indicator.circle(startX - 30, startY + SYMBOL_SIZE / 2 + i * SYMBOL_SIZE, 10);
      indicator.fill(colors[i]);
      indicator.stroke({ color: 0xffffff, width: 2 });
      this.app.stage.addChild(indicator);

      // Right side indicator
      const rightIndicator = new Graphics();
      rightIndicator.circle(
        startX + CONFIG.REEL_COUNT * CONFIG.REEL_WIDTH + 30,
        startY + SYMBOL_SIZE / 2 + i * SYMBOL_SIZE,
        10,
      );
      rightIndicator.fill(colors[i]);
      rightIndicator.stroke({ color: 0xffffff, width: 2 });
      this.app.stage.addChild(rightIndicator);
    }
  }

  createUI() {
    this.ui = new UI(this.app, this);
    this.ui.updateBalance(this.balance);
    this.ui.updateBet(this.bet);
    this.ui.updateWin(0);
  }

  createParticleSystem() {
    this.particleSystem = new ParticleSystem(this.app);
  }

  initializeReels() {
    this.currentSymbols = [];
    for (let i = 0; i < CONFIG.REEL_COUNT; i++) {
      const reelSymbols = [];
      for (let j = 0; j < CONFIG.ROW_COUNT; j++) {
        const symbolIndex = this.getWeightedRandomSymbol();
        reelSymbols.push(symbolIndex);
      }
      this.currentSymbols.push(reelSymbols);
      this.reels[i].setSymbols(reelSymbols);
    }
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.spin();
      }
    });
  }

  changeBet(direction) {
    if (this.isSpinning) return;

    this.currentBetIndex = Math.max(0, Math.min(CONFIG.BET_LEVELS.length - 1, this.currentBetIndex + direction));
    this.bet = CONFIG.BET_LEVELS[this.currentBetIndex];
    this.ui.updateBet(this.bet);
  }

  setMaxBet() {
    if (this.isSpinning) return;

    for (let i = CONFIG.BET_LEVELS.length - 1; i >= 0; i--) {
      if (CONFIG.BET_LEVELS[i] <= this.balance) {
        this.currentBetIndex = i;
        this.bet = CONFIG.BET_LEVELS[i];
        this.ui.updateBet(this.bet);
        break;
      }
    }
  }

  async spin() {
    if (this.isSpinning) return;

    if (this.balance < this.bet) {
      this.showMessage('Insufficient Balance!', 0xff0000);
      return;
    }

    this.isSpinning = true;
    this.ui.setSpinButtonEnabled(false);
    this.ui.updateWin(0);

    // Deduct bet
    this.balance -= this.bet;
    this.ui.updateBalance(this.balance);

    // Generate results
    const results = this.generateResults();

    // Animate reels
    await this.animateReels(results);

    // Check for wins
    const winAmount = this.checkWins(results);

    if (winAmount > 0) {
      this.balance += winAmount;
      this.lastWin = winAmount;
      this.ui.updateBalance(this.balance);
      this.ui.updateWin(winAmount);
      this.showMessage(`WIN! $${winAmount.toFixed(2)}`, 0x00ff00);
      this.celebrateWin(results);
    }

    this.currentSymbols = results;
    this.isSpinning = false;
    this.ui.setSpinButtonEnabled(true);
  }

  generateResults() {
    const results = [];
    for (let i = 0; i < CONFIG.REEL_COUNT; i++) {
      const reelResults = [];
      for (let j = 0; j < CONFIG.ROW_COUNT; j++) {
        reelResults.push(this.getWeightedRandomSymbol());
      }
      results.push(reelResults);
    }
    return results;
  }

  // Weighted random selection - common symbols appear more often
  getWeightedRandomSymbol() {
    let random = Math.random() * TOTAL_WEIGHT;

    for (let i = 0; i < SYMBOLS.length; i++) {
      random -= SYMBOLS[i].weight;
      if (random <= 0) {
        return i;
      }
    }

    return SYMBOLS.length - 1; // Fallback to last symbol
  }

  async animateReels(results) {
    const promises = [];

    for (let i = 0; i < this.reels.length; i++) {
      const delay = i * CONFIG.SPIN_DELAY;
      const duration = CONFIG.SPIN_DURATION + i * 100;

      const promise = new Promise((resolve) => {
        setTimeout(() => {
          this.reels[i].spin(results[i], duration, resolve);
        }, delay);
      });

      promises.push(promise);
    }

    await Promise.all(promises);
  }

  checkWins(results) {
    let totalWin = 0;
    const winningLines = [];

    for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
      const payline = PAYLINES[lineIndex];
      const lineSymbols = payline.map((row, reel) => results[reel][row]);

      // Check for consecutive matches from left
      const firstSymbol = lineSymbols[0];
      let matchCount = 1;

      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === firstSymbol) {
          matchCount++;
        } else {
          break;
        }
      }

      // Check if this symbol has a payout for this match count
      // Premium symbols (7, diamond, cherry) can win with just 2 matches
      const symbol = SYMBOLS[firstSymbol];
      const payout = symbol.payout[matchCount] || 0;

      if (payout > 0) {
        const lineWin = payout * (this.bet / 10);
        totalWin += lineWin;
        winningLines.push({ lineIndex, matchCount, symbolId: firstSymbol, win: lineWin, payline });
      }
    }

    this.winningLines = winningLines;
    return totalWin;
  }

  celebrateWin(results) {
    const { REEL_COUNT, ROW_COUNT, SYMBOL_SIZE, REEL_WIDTH } = CONFIG;
    const startX = (900 - REEL_COUNT * REEL_WIDTH) / 2;
    const startY = (600 - ROW_COUNT * SYMBOL_SIZE) / 2;

    // Add particles at winning positions
    if (this.winningLines) {
      this.winningLines.forEach((win) => {
        for (let reel = 0; reel < win.matchCount; reel++) {
          const row = win.payline[reel];
          const x = startX + reel * REEL_WIDTH + REEL_WIDTH / 2;
          const y = startY + row * SYMBOL_SIZE + SYMBOL_SIZE / 2;
          this.particleSystem.emit(x, y, 15);
        }
      });
    }

    // Animate title
    this.animateTitle();
  }

  animateTitle() {
    let elapsed = 0;
    const duration = 2000;

    const animate = (delta) => {
      elapsed += delta * 16.67;
      this.titleText.scale.set(1 + Math.sin(elapsed * 0.01) * 0.05);

      if (elapsed >= duration) {
        this.titleText.scale.set(1);
        this.app.ticker.remove(animate);
      }
    };

    this.app.ticker.add(animate);
  }

  showMessage(text, color) {
    const style = new TextStyle({
      fontFamily: 'Arial Black, Arial',
      fontSize: 36,
      fontWeight: 'bold',
      fill: color,
      stroke: { color: 0x000000, width: 4 },
      dropShadow: {
        color: 0x000000,
        blur: 4,
        distance: 2,
      },
    });

    const message = new Text({ text, style });
    message.anchor.set(0.5);
    message.x = 450;
    message.y = 550;
    message.alpha = 0;
    this.app.stage.addChild(message);

    // Fade in
    let alpha = 0;
    const fadeIn = (delta) => {
      alpha += 0.1;
      message.alpha = alpha;
      if (alpha >= 1) {
        this.app.ticker.remove(fadeIn);

        // Wait then fade out
        setTimeout(() => {
          const fadeOut = (delta) => {
            alpha -= 0.05;
            message.alpha = alpha;
            if (alpha <= 0) {
              this.app.ticker.remove(fadeOut);
              this.app.stage.removeChild(message);
            }
          };
          this.app.ticker.add(fadeOut);
        }, 1500);
      }
    };
    this.app.ticker.add(fadeIn);
  }

  update(delta) {
    this.particleSystem.update(delta);
  }
}
