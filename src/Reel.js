import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SYMBOLS, TOTAL_WEIGHT } from './config';

export class Reel {
  constructor(index, width, symbolSize, rowCount) {
    this.index = index;
    this.width = width;
    this.symbolSize = symbolSize;
    this.rowCount = rowCount;

    this.container = new Container();
    this.symbols = [];
    this.spinning = false;

    this.createSymbols();
  }

  createSymbols() {
    // Create extra symbols for scrolling effect (2 above, 2 below visible area)
    const totalSymbols = this.rowCount + 4;

    for (let i = 0; i < totalSymbols; i++) {
      const symbolContainer = this.createSymbolSprite(0);
      symbolContainer.y = (i - 2) * this.symbolSize + this.symbolSize / 2;
      this.container.addChild(symbolContainer);
      this.symbols.push({ container: symbolContainer, index: 0 });
    }
  }

  createSymbolSprite(symbolIndex) {
    const symbol = SYMBOLS[symbolIndex];
    const container = new Container();

    // Symbol background glow
    const glow = new Graphics();
    glow.roundRect(-40, -40, 80, 80, 12);
    glow.fill({ color: symbol.color, alpha: 0.25 });
    container.addChild(glow);
    container.glow = glow;

    // Symbol emoji
    const textStyle = new TextStyle({
      fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif',
      fontSize: 55,
    });
    const emojiText = new Text({ text: symbol.emoji, style: textStyle });
    emojiText.anchor.set(0.5);
    container.addChild(emojiText);
    container.emojiText = emojiText;

    container.symbolIndex = symbolIndex;
    return container;
  }

  updateSymbolGraphics(container, symbolIndex) {
    const symbol = SYMBOLS[symbolIndex];

    // Update glow
    container.glow.clear();
    container.glow.roundRect(-40, -40, 80, 80, 12);
    container.glow.fill({ color: symbol.color, alpha: 0.25 });

    // Update emoji
    container.emojiText.text = symbol.emoji;
    container.symbolIndex = symbolIndex;
  }

  setSymbols(symbolIndices) {
    for (let i = 0; i < this.symbols.length; i++) {
      const visibleIndex = i - 2;
      if (visibleIndex >= 0 && visibleIndex < this.rowCount) {
        const symbolIndex = symbolIndices[visibleIndex];
        this.updateSymbolGraphics(this.symbols[i].container, symbolIndex);
        this.symbols[i].index = symbolIndex;
      } else {
        // Random symbol for non-visible positions (weighted)
        const randomIndex = this.getWeightedRandomSymbol();
        this.updateSymbolGraphics(this.symbols[i].container, randomIndex);
        this.symbols[i].index = randomIndex;
      }
    }
  }

  // Weighted random selection for visual consistency
  getWeightedRandomSymbol() {
    let random = Math.random() * TOTAL_WEIGHT;
    for (let i = 0; i < SYMBOLS.length; i++) {
      random -= SYMBOLS[i].weight;
      if (random <= 0) return i;
    }
    return SYMBOLS.length - 1;
  }

  spin(finalSymbols, duration, callback) {
    this.spinning = true;
    const startTime = Date.now();
    const totalDistance = this.symbolSize * (12 + Math.random() * 5);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentDistance = totalDistance * easeOut;

      // Move all symbols
      for (let i = 0; i < this.symbols.length; i++) {
        const baseY = (i - 2) * this.symbolSize + this.symbolSize / 2;
        let newY = baseY + (currentDistance % (this.symbolSize * this.symbols.length));

        // Wrap around
        const maxY = this.symbolSize * (this.rowCount + 1);
        if (newY > maxY) {
          newY -= this.symbolSize * this.symbols.length;
          // Randomize symbol when wrapping (weighted)
          const randomIndex = this.getWeightedRandomSymbol();
          this.updateSymbolGraphics(this.symbols[i].container, randomIndex);
        }

        this.symbols[i].container.y = newY;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Set final positions and symbols
        this.setFinalSymbols(finalSymbols);
        this.spinning = false;

        // Stop bounce effect
        this.bounceEffect(callback);
      }
    };

    animate();
  }

  setFinalSymbols(finalSymbols) {
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].container.y = (i - 2) * this.symbolSize + this.symbolSize / 2;

      const visibleIndex = i - 2;
      if (visibleIndex >= 0 && visibleIndex < this.rowCount) {
        this.updateSymbolGraphics(this.symbols[i].container, finalSymbols[visibleIndex]);
        this.symbols[i].index = finalSymbols[visibleIndex];
      }
    }
  }

  bounceEffect(callback) {
    const startY = this.container.y;
    const bounceHeight = 8;
    const duration = 150;
    const startTime = Date.now();

    const bounce = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Bounce curve
      const bounceProgress = Math.sin(progress * Math.PI);
      this.container.y = startY + bounceProgress * bounceHeight;

      if (progress < 1) {
        requestAnimationFrame(bounce);
      } else {
        this.container.y = startY;
        if (callback) callback();
      }
    };

    bounce();
  }
}
