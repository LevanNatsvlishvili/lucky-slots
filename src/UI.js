import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class UI {
    constructor(app, slotMachine) {
        this.app = app;
        this.slotMachine = slotMachine;
        this.container = new Container();
        this.app.stage.addChild(this.container);
        
        this.createPanels();
        this.createButtons();
    }

    createPanels() {
        // Balance Panel
        this.balancePanel = this.createPanel(70, 85, 'BALANCE', '$1000.00');
        this.balanceValue = this.balancePanel.valueText;

        // Win Panel
        this.winPanel = this.createPanel(830, 85, 'WIN', '$0.00');
        this.winValue = this.winPanel.valueText;

        // Bet Panel
        this.betPanel = this.createPanel(450, 545, 'BET', '$10.00', true);
        this.betValue = this.betPanel.valueText;
    }

    createPanel(x, y, label, value, small = false) {
        const panel = new Container();
        panel.x = x;
        panel.y = y;

        const width = small ? 100 : 140;
        const height = small ? 50 : 60;

        // Background
        const bg = new Graphics();
        bg.roundRect(-width/2, -height/2, width, height, 10);
        bg.fill(0x2a1a4a);
        bg.stroke({ color: 0xffd700, width: 2 });
        panel.addChild(bg);

        // Label
        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: small ? 10 : 12,
            fontWeight: 'bold',
            fill: 0xffd700,
            letterSpacing: 2,
        });
        const labelText = new Text({ text: label, style: labelStyle });
        labelText.anchor.set(0.5);
        labelText.y = small ? -12 : -15;
        panel.addChild(labelText);

        // Value
        const valueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: small ? 16 : 22,
            fontWeight: 'bold',
            fill: label === 'WIN' ? 0xffff00 : 0x00ff88,
        });
        const valueText = new Text({ text: value, style: valueStyle });
        valueText.anchor.set(0.5);
        valueText.y = small ? 8 : 10;
        panel.addChild(valueText);
        panel.valueText = valueText;

        this.container.addChild(panel);
        return panel;
    }

    createButtons() {
        // Spin Button
        this.spinButton = this.createSpinButton(450, 480);
        
        // Bet Down Button
        this.betDownButton = this.createControlButton(350, 545, '-', () => {
            this.slotMachine.changeBet(-1);
        });

        // Bet Up Button
        this.betUpButton = this.createControlButton(550, 545, '+', () => {
            this.slotMachine.changeBet(1);
        });

        // Max Bet Button
        this.maxBetButton = this.createMaxBetButton(680, 545);
    }

    createSpinButton(x, y) {
        const button = new Container();
        button.x = x;
        button.y = y;
        button.eventMode = 'static';
        button.cursor = 'pointer';

        // Button background
        const bg = new Graphics();
        bg.roundRect(-70, -25, 140, 50, 12);
        bg.fill({
            color: 0xd63031,
        });
        bg.stroke({ color: 0xffd700, width: 3 });
        button.addChild(bg);
        button.bg = bg;

        // Gradient overlay
        const overlay = new Graphics();
        overlay.roundRect(-68, -23, 136, 25, 10);
        overlay.fill({ color: 0xffffff, alpha: 0.2 });
        button.addChild(overlay);

        // Text
        const textStyle = new TextStyle({
            fontFamily: 'Arial Black, Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xffffff,
            letterSpacing: 3,
        });
        const text = new Text({ text: 'SPIN', style: textStyle });
        text.anchor.set(0.5);
        button.addChild(text);
        button.text = text;

        // Hover effects
        button.on('pointerover', () => {
            if (button.enabled !== false) {
                button.scale.set(1.05);
            }
        });

        button.on('pointerout', () => {
            button.scale.set(1);
        });

        button.on('pointerdown', () => {
            if (button.enabled !== false) {
                button.scale.set(0.95);
            }
        });

        button.on('pointerup', () => {
            if (button.enabled !== false) {
                button.scale.set(1.05);
                this.slotMachine.spin();
            }
        });

        this.container.addChild(button);
        return button;
    }

    createControlButton(x, y, label, onClick) {
        const button = new Container();
        button.x = x;
        button.y = y;
        button.eventMode = 'static';
        button.cursor = 'pointer';

        // Background
        const bg = new Graphics();
        bg.circle(0, 0, 20);
        bg.fill(0x4a2a7a);
        bg.stroke({ color: 0xffd700, width: 2 });
        button.addChild(bg);

        // Text
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xffd700,
        });
        const text = new Text({ text: label, style: textStyle });
        text.anchor.set(0.5);
        button.addChild(text);

        // Events
        button.on('pointerover', () => button.scale.set(1.1));
        button.on('pointerout', () => button.scale.set(1));
        button.on('pointerdown', () => button.scale.set(0.9));
        button.on('pointerup', () => {
            button.scale.set(1.1);
            onClick();
        });

        this.container.addChild(button);
        return button;
    }

    createMaxBetButton(x, y) {
        const button = new Container();
        button.x = x;
        button.y = y;
        button.eventMode = 'static';
        button.cursor = 'pointer';

        // Background
        const bg = new Graphics();
        bg.roundRect(-40, -18, 80, 36, 8);
        bg.fill(0x5a189a);
        bg.stroke({ color: 0xffd700, width: 2 });
        button.addChild(bg);

        // Text
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 0xffd700,
            letterSpacing: 1,
        });
        const text = new Text({ text: 'MAX BET', style: textStyle });
        text.anchor.set(0.5);
        button.addChild(text);

        // Events
        button.on('pointerover', () => button.scale.set(1.05));
        button.on('pointerout', () => button.scale.set(1));
        button.on('pointerdown', () => button.scale.set(0.95));
        button.on('pointerup', () => {
            button.scale.set(1.05);
            this.slotMachine.setMaxBet();
        });

        this.container.addChild(button);
        return button;
    }

    setSpinButtonEnabled(enabled) {
        this.spinButton.enabled = enabled;
        this.spinButton.alpha = enabled ? 1 : 0.5;
        this.spinButton.cursor = enabled ? 'pointer' : 'not-allowed';
    }

    updateBalance(value) {
        this.balanceValue.text = `$${value.toFixed(2)}`;
    }

    updateBet(value) {
        this.betValue.text = `$${value.toFixed(2)}`;
    }

    updateWin(value) {
        this.winValue.text = `$${value.toFixed(2)}`;
        
        // Pulse animation for wins
        if (value > 0) {
            this.winValue.scale.set(1.2);
            setTimeout(() => {
                this.winValue.scale.set(1);
            }, 200);
        }
    }
}
