// Game Configuration
export const CONFIG = {
  // Reel settings
  REEL_COUNT: 5,
  ROW_COUNT: 3,
  SYMBOL_SIZE: 100,
  REEL_WIDTH: 120,

  // Animation settings
  SPIN_DURATION: 2000,
  SPIN_DELAY: 150,

  // Game settings
  INITIAL_BALANCE: 1000,
  BET_LEVELS: [1, 5, 10, 25, 50, 100],
  DEFAULT_BET_INDEX: 2,

  // Target RTP (Return to Player) ~94%
  TARGET_RTP: 0.94,
};

// Symbol definitions with payouts and weights
// Weight determines how often a symbol appears (higher = more common)
// Real slots: common symbols appear ~40-50%, rare symbols ~2-5%
export const SYMBOLS = [
  // RARE - High paying (appear less frequently)
  { id: 0, name: 'seven', color: 0xff0000, emoji: '7️⃣', weight: 2, payout: { 2: 5, 3: 25, 4: 100, 5: 500 } },
  { id: 1, name: 'diamond', color: 0x00ffff, emoji: '💎', weight: 3, payout: { 2: 3, 3: 15, 4: 50, 5: 250 } },

  // MEDIUM - Mid paying
  { id: 2, name: 'bell', color: 0xffd700, emoji: '🔔', weight: 6, payout: { 3: 10, 4: 25, 5: 100 } },
  { id: 3, name: 'cherry', color: 0xff1493, emoji: '🍒', weight: 8, payout: { 2: 2, 3: 8, 4: 20, 5: 75 } },
  { id: 4, name: 'star', color: 0xffff00, emoji: '⭐', weight: 10, payout: { 3: 6, 4: 15, 5: 50 } },

  // COMMON - Low paying (appear most frequently)
  { id: 5, name: 'orange', color: 0xffa500, emoji: '🍊', weight: 15, payout: { 3: 4, 4: 10, 5: 30 } },
  { id: 6, name: 'lemon', color: 0xffff00, emoji: '🍋', weight: 18, payout: { 3: 3, 4: 8, 5: 25 } },
  { id: 7, name: 'grapes', color: 0x9932cc, emoji: '🍇', weight: 18, payout: { 3: 2, 4: 6, 5: 20 } },
  { id: 8, name: 'watermelon', color: 0x2ecc71, emoji: '🍉', weight: 20, payout: { 3: 2, 4: 5, 5: 15 } },
];

// Calculate total weight for probability distribution
export const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

// Paylines - each array contains row indices (0=top, 1=middle, 2=bottom) for each reel
export const PAYLINES = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2], // Diagonal down
  [2, 2, 1, 0, 0], // Diagonal up
  [1, 0, 0, 0, 1], // Top zigzag
  [1, 2, 2, 2, 1], // Bottom zigzag
];
