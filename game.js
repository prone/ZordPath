// ============================================================
// ZordPath - Logic Land RPG (Stardew Valley-style top-down)
// ============================================================

// ============================================================
// LOCAL STATS (localStorage)
// ============================================================
const STATS_KEY = 'zordpath_stats';

function loadStats() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
        launches: 0,
        gamesStarted: 0,
        totalPlayTime: 0,      // seconds
        enemiesDefeated: 0,
        zordsCaught: 0,
        fishCaught: 0,
        rubiesEarned: 0,
        quizAnswered: 0,
        quizCorrect: 0,
        templeCleared: false,
        bossDefeated: false,
        deaths: 0,
        bestFloor: 0,
        lastPlayed: null,
        lastCharacter: null
    };
}

function saveStats() {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {}
}

const stats = loadStats();
stats.launches++;
stats.lastPlayed = new Date().toISOString();
// Moon cycle: advances 1 day per launch, wraps at 30
if (stats.moonDay === undefined) stats.moonDay = 0;
stats.moonDay = (stats.moonDay + 1) % 30;
saveStats();

// Track play time (save every 30 seconds)
setInterval(() => {
    if (state && state.screen === 'game') {
        stats.totalPlayTime += 30;
        saveStats();
    }
}, 30000);

// Stat tracking helpers
function trackEnemyDefeated() { stats.enemiesDefeated++; saveStats(); }
function trackZordCaught() { stats.zordsCaught++; saveStats(); }
function trackFishCaught() { stats.fishCaught++; saveStats(); }
function trackRubiesEarned(amount) { stats.rubiesEarned += amount; saveStats(); }
function trackQuizAnswer(correct) {
    stats.quizAnswered++;
    if (correct) stats.quizCorrect++;
    saveStats();
}
function trackDeath() { stats.deaths++; saveStats(); }
function trackGameStart(charName) {
    stats.gamesStarted++;
    stats.lastCharacter = charName;
    saveStats();
}
function trackTempleFloor(floor) {
    if (floor > stats.bestFloor) stats.bestFloor = floor;
    saveStats();
}

// HTML escape for user-provided strings in innerHTML
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

const TILE = 48; // tile size in pixels (larger for detail)
const COLS = 24;
const ROWS = 14;

// --- TILE TYPES ---
const T = {
    GRASS:   0,
    WALL:    1,
    WATER:   2,
    PATH:    3,
    TREE:    4,
    ROCK:    5,
    DOOR:    6,   // area transition
    HOUSE:   7,
    STORE:   8,
    BUILD:   9,
    CAVE_FL: 10,  // cave floor
    CAVE_W:  11,  // cave wall
    CRYSTAL: 12,
    FLOWER:  13,
    FENCE:   14,
    SIGN:    15,
    BRIDGE:  16,
    TEMPLE_FL: 17,  // temple floor
    TEMPLE_W:  18,  // temple wall
    PILLAR:    19,
    STAIRS_UP: 20,
    STAIRS_DN: 21,
    LAVA:      22,
    ICE:       23,
    BOOKSHELF: 24,
    STATUE:    25,
    CARPET:    26,
    VOID:      27,
    PORTAL:    28,
    SAND:      29,
    PALM:      30,
    SEASHELL:  31,
    DOCK:      32,
    MTN_GROUND:33,
    MTN_WALL:  34,
    SNOW:      35,
    PINE:      36
};

// Tile colors
const TILE_COLORS = {
    [T.GRASS]:   '#3a7d44',
    [T.WALL]:    '#555555',
    [T.WATER]:   '#2980b9',
    [T.PATH]:    '#c4a663',
    [T.TREE]:    '#2d5a27',
    [T.ROCK]:    '#7f8c8d',
    [T.DOOR]:    '#e67e22',
    [T.HOUSE]:   '#8e6e53',
    [T.STORE]:   '#a65c32',
    [T.BUILD]:   '#6a994e',
    [T.CAVE_FL]: '#3d3d5c',
    [T.CAVE_W]:  '#2a2a3e',
    [T.CRYSTAL]: '#9b59b6',
    [T.FLOWER]:  '#e84393',
    [T.FENCE]:   '#795548',
    [T.SIGN]:    '#d4a853',
    [T.BRIDGE]:  '#a67c52',
    [T.TEMPLE_FL]:'#4a3f6b',
    [T.TEMPLE_W]: '#2d2844',
    [T.PILLAR]:   '#6e6199',
    [T.STAIRS_UP]:'#d4a853',
    [T.STAIRS_DN]:'#a08040',
    [T.LAVA]:     '#cc3300',
    [T.ICE]:      '#a8d8ea',
    [T.BOOKSHELF]:'#5c3d1e',
    [T.STATUE]:   '#808080',
    [T.CARPET]:   '#8b1a1a',
    [T.VOID]:     '#0a0a1a',
    [T.PORTAL]:   '#9b59b6',
    [T.SAND]:     '#e8d5a3',
    [T.PALM]:     '#2d5a27',
    [T.SEASHELL]: '#e8d5a3',
    [T.DOCK]:     '#8b6e4e',
    [T.MTN_GROUND]:'#7a7a6a',
    [T.MTN_WALL]: '#5a5a50',
    [T.SNOW]:     '#e8eef0',
    [T.PINE]:     '#1a4a20'
};

// Tile detail (drawn on top of base color)
const TILE_DETAILS = {
    [T.TREE]:    { symbol: '\u{1F332}', size: 20 },
    [T.ROCK]:    { symbol: '\u{1FAA8}', size: 16 },
    [T.CRYSTAL]: { symbol: '\u{1F48E}', size: 16 },
    [T.FLOWER]:  { symbol: '\u{1F33C}', size: 14 },
    [T.SIGN]:    { symbol: '\u{1FAA7}', size: 14 },
    [T.HOUSE]:   { symbol: '\u{1F3E0}', size: 18 },
    [T.STORE]:   { symbol: '\u{1F3EA}', size: 18 },
    [T.BUILD]:   { symbol: '\u{1F528}', size: 16 },
    [T.DOOR]:    { symbol: '\u{1F6AA}', size: 16 },
    [T.WATER]:   { symbol: '~', size: 14, color: '#5dade2' },
    [T.FENCE]:   { symbol: '\u{1AA}', size: 10 },
    [T.PILLAR]:    { symbol: '\u{1F3DB}\uFE0F', size: 16 },
    [T.STAIRS_UP]: { symbol: '\u{2B06}\uFE0F', size: 14 },
    [T.STAIRS_DN]: { symbol: '\u{2B07}\uFE0F', size: 14 },
    [T.LAVA]:      { symbol: '~', size: 14, color: '#ff6600' },
    [T.ICE]:       { symbol: '\u{2744}\uFE0F', size: 12 },
    [T.BOOKSHELF]: { symbol: '\u{1F4DA}', size: 14 },
    [T.STATUE]:    { symbol: '\u{1F5FF}', size: 16 },
    [T.CARPET]:    { symbol: '', size: 0 },
    [T.VOID]:      { symbol: '', size: 0 },
    [T.PORTAL]:    { symbol: '\u{1F300}', size: 18 },
    [T.PALM]:      { symbol: '\u{1F334}', size: 20 },
    [T.SEASHELL]:  { symbol: '\u{1F41A}', size: 14 },
    [T.DOCK]:      { symbol: '', size: 0 },
    [T.PINE]:      { symbol: '\u{1F332}', size: 20 },
    [T.SNOW]:      { symbol: '', size: 0 }
};

// Solid tiles (can't walk through)
const SOLID = new Set([T.WALL, T.WATER, T.TREE, T.ROCK, T.HOUSE, T.STORE, T.BUILD, T.CAVE_W, T.CRYSTAL, T.FENCE, T.TEMPLE_W, T.PILLAR, T.LAVA, T.BOOKSHELF, T.STATUE, T.VOID, T.PALM, T.PINE, T.MTN_WALL]);

// --- MAPS ---
function createMap(rows, cols, fill) {
    return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

// Cave map
function buildCaveMap() {
    const m = createMap(ROWS, COLS, T.CAVE_W);
    // Carve out floor
    for (let r = 3; r < ROWS - 3; r++) {
        for (let c = 3; c < COLS - 3; c++) {
            m[r][c] = T.CAVE_FL;
        }
    }
    // Add some cave walls as obstacles
    for (let i = 0; i < 15; i++) {
        const r = 5 + Math.floor(Math.random() * (ROWS - 10));
        const c = 5 + Math.floor(Math.random() * (COLS - 10));
        m[r][c] = T.ROCK;
    }
    // Crystals
    for (let i = 0; i < 6; i++) {
        const r = 4 + Math.floor(Math.random() * (ROWS - 8));
        const c = 4 + Math.floor(Math.random() * (COLS - 8));
        if (m[r][c] === T.CAVE_FL) m[r][c] = T.CRYSTAL;
    }
    // Exit door to town (right side) - clear a corridor to it
    const midRow = Math.floor(ROWS / 2);
    for (let c = COLS - 5; c <= COLS - 2; c++) {
        m[midRow][c] = T.CAVE_FL;
        m[midRow - 1][c] = T.CAVE_FL;
        m[midRow + 1][c] = T.CAVE_FL;
    }
    m[midRow][COLS - 3] = T.DOOR;
    // Sign near exit
    m[midRow - 2][COLS - 4] = T.SIGN;
    // Also add a door on the left for easy entry back
    m[midRow][2] = T.CAVE_FL;
    return m;
}

// Town map
function buildTownMap() {
    const m = createMap(ROWS, COLS, T.GRASS);
    // Paths
    for (let c = 0; c < COLS; c++) { m[Math.floor(ROWS / 2)][c] = T.PATH; }
    for (let r = 0; r < ROWS; r++) { m[r][Math.floor(COLS / 2)] = T.PATH; m[r][6] = T.PATH; m[r][COLS - 6] = T.PATH; }
    // Fences along edges
    for (let c = 0; c < COLS; c++) { m[0][c] = T.FENCE; m[ROWS - 1][c] = T.FENCE; }
    for (let r = 0; r < ROWS; r++) { m[r][0] = T.FENCE; m[r][COLS - 1] = T.FENCE; }
    // Store building
    m[3][10] = T.STORE; m[3][11] = T.STORE; m[3][12] = T.STORE;
    m[4][10] = T.STORE; m[4][12] = T.STORE;
    m[4][11] = T.PATH; // door
    // Build site
    m[3][18] = T.BUILD; m[3][19] = T.BUILD; m[3][20] = T.BUILD;
    m[4][18] = T.BUILD; m[4][20] = T.BUILD;
    m[4][19] = T.PATH; // door
    // Houses
    m[9][3] = T.HOUSE; m[9][4] = T.HOUSE;
    m[9][19] = T.HOUSE; m[9][20] = T.HOUSE;
    // Trees
    for (let i = 0; i < 8; i++) {
        const r = 1 + Math.floor(Math.random() * (ROWS - 2));
        const c = 1 + Math.floor(Math.random() * (COLS - 2));
        if (m[r][c] === T.GRASS) m[r][c] = T.TREE;
    }
    // Flowers
    for (let i = 0; i < 6; i++) {
        const r = 1 + Math.floor(Math.random() * (ROWS - 2));
        const c = 1 + Math.floor(Math.random() * (COLS - 2));
        if (m[r][c] === T.GRASS) m[r][c] = T.FLOWER;
    }
    // Pond
    for (let r = ROWS - 5; r < ROWS - 3; r++) for (let c = 10; c < 14; c++) m[r][c] = T.WATER;
    m[ROWS - 5][11] = T.BRIDGE;
    // Clear paths to doors (ensure nothing blocks them)
    const midR = Math.floor(ROWS / 2);
    // Door to cave (left side)
    for (let c = 0; c <= 2; c++) { m[midR][c] = T.PATH; m[midR - 1][c] = T.PATH; m[midR + 1][c] = T.PATH; }
    m[midR][1] = T.DOOR;
    // Door to forest (right side) - clear path to it
    for (let c = COLS - 3; c <= COLS - 1; c++) { m[midR][c] = T.PATH; m[midR - 1][c] = T.PATH; m[midR + 1][c] = T.PATH; }
    m[midR][COLS - 2] = T.DOOR;
    // Signs
    m[midR + 1][2] = T.SIGN;
    m[midR + 1][COLS - 3] = T.SIGN;
    // Door to beach (north, center)
    const townMidC = Math.floor(COLS / 2);
    for (let c = townMidC - 1; c <= townMidC + 1; c++) { m[0][c] = T.PATH; m[1][c] = T.PATH; }
    m[0][townMidC] = T.DOOR;
    m[1][townMidC + 2] = T.SIGN;
    // Door to mountains (south, center)
    for (let c = townMidC - 1; c <= townMidC + 1; c++) { m[ROWS - 1][c] = T.PATH; m[ROWS - 2][c] = T.PATH; }
    m[ROWS - 1][townMidC] = T.DOOR;
    m[ROWS - 2][townMidC + 2] = T.SIGN;
    return m;
}

// Forest map
function buildForestMap() {
    const m = createMap(ROWS, COLS, T.GRASS);
    // Dense trees
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (Math.random() < 0.3) m[r][c] = T.TREE;
    }
    // Carve paths
    for (let c = 0; c < COLS; c++) m[Math.floor(ROWS / 2)][c] = T.PATH;
    for (let r = 0; r < ROWS; r++) m[r][Math.floor(COLS / 2)] = T.PATH;
    // Clear some areas
    for (let r = 7; r < 13; r++) for (let c = 10; c < 20; c++) {
        if (m[r][c] === T.TREE && Math.random() < 0.6) m[r][c] = T.GRASS;
    }
    // Flowers
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (m[r][c] === T.GRASS && Math.random() < 0.08) m[r][c] = T.FLOWER;
    }
    // Edge trees (border)
    for (let c = 0; c < COLS; c++) { m[0][c] = T.TREE; m[ROWS - 1][c] = T.TREE; }
    for (let r = 0; r < ROWS; r++) { m[r][0] = T.TREE; m[r][COLS - 1] = T.TREE; }
    // Door back to town (left side)
    const fMid = Math.floor(ROWS / 2);
    m[fMid][1] = T.DOOR;
    m[fMid][0] = T.PATH;
    // Sign
    m[fMid + 1][2] = T.SIGN;
    // Temple entrance (right side) - large temple facade
    for (let c = COLS - 4; c <= COLS - 1; c++) { m[fMid][c] = T.PATH; m[fMid - 1][c] = T.PATH; m[fMid + 1][c] = T.PATH; }
    m[fMid][COLS - 2] = T.DOOR;
    m[fMid - 2][COLS - 3] = T.PILLAR;
    m[fMid + 2][COLS - 3] = T.PILLAR;
    m[fMid - 2][COLS - 2] = T.SIGN;
    return m;
}

// --- TEMPLE FLOOR DEFINITIONS ---
const TEMPLE_FLOORS = [
    { id: 'temple_1', name: 'Floor 1: Hall of Truth',      wallColor: '#2d2844', floorColor: '#4a3f6b', accent: T.PILLAR },
    { id: 'temple_2', name: 'Floor 2: Chamber of Negation', wallColor: '#1a1a2e', floorColor: '#2c2c4a', accent: T.STATUE },
    { id: 'temple_3', name: 'Floor 3: The Grand Library',   wallColor: '#3d2b1a', floorColor: '#5c4033', accent: T.BOOKSHELF },
    { id: 'temple_4', name: 'Floor 4: Frozen Sanctum',      wallColor: '#1a3040', floorColor: '#2a4a5a', accent: T.ICE },
    { id: 'temple_5', name: 'Floor 5: Lava Labyrinth',      wallColor: '#2a1010', floorColor: '#3d2020', accent: T.LAVA },
    { id: 'temple_6', name: 'Floor 6: The Void Between',    wallColor: '#050510', floorColor: '#101028', accent: T.VOID },
    { id: 'temple_7', name: 'Floor 7: Sanctum of the Arch-Logician', wallColor: '#1a0a2e', floorColor: '#2d1a4a', accent: T.PORTAL }
];

function buildTempleFloor(floorNum) {
    const m = createMap(ROWS, COLS, T.TEMPLE_W);
    const floor = TEMPLE_FLOORS[floorNum];

    // Carve main room
    for (let r = 2; r < ROWS - 2; r++) {
        for (let c = 2; c < COLS - 2; c++) {
            m[r][c] = T.TEMPLE_FL;
        }
    }

    // Central carpet path
    const midR = Math.floor(ROWS / 2);
    const midC = Math.floor(COLS / 2);
    for (let c = 3; c < COLS - 3; c++) m[midR][c] = T.CARPET;
    for (let r = 3; r < ROWS - 3; r++) m[r][midC] = T.CARPET;

    // Pillars along edges
    for (let c = 4; c < COLS - 4; c += 4) {
        if (m[3][c] === T.TEMPLE_FL) m[3][c] = T.PILLAR;
        if (m[ROWS - 4][c] === T.TEMPLE_FL) m[ROWS - 4][c] = T.PILLAR;
    }

    // Floor-specific decorations
    if (floorNum === 2) { // Library - bookshelves
        for (let r = 4; r < ROWS - 4; r += 3) {
            for (let c = 4; c < 10; c++) m[r][c] = T.BOOKSHELF;
            for (let c = COLS - 10; c < COLS - 4; c++) m[r][c] = T.BOOKSHELF;
        }
    } else if (floorNum === 3) { // Ice - frozen patches
        for (let i = 0; i < 20; i++) {
            const r = 3 + Math.floor(Math.random() * (ROWS - 6));
            const c = 3 + Math.floor(Math.random() * (COLS - 6));
            if (m[r][c] === T.TEMPLE_FL) m[r][c] = T.ICE;
        }
    } else if (floorNum === 4) { // Lava - lava pools
        for (let i = 0; i < 5; i++) {
            const lr = 4 + Math.floor(Math.random() * (ROWS - 8));
            const lc = 4 + Math.floor(Math.random() * (COLS - 8));
            for (let dr = 0; dr < 2; dr++) for (let dc = 0; dc < 3; dc++) {
                if (m[lr + dr][lc + dc] === T.TEMPLE_FL) m[lr + dr][lc + dc] = T.LAVA;
            }
        }
        // Ensure paths around lava
        for (let c = 3; c < COLS - 3; c++) m[midR][c] = T.CARPET;
    } else if (floorNum === 5) { // Void - gaps in floor
        for (let i = 0; i < 12; i++) {
            const r = 4 + Math.floor(Math.random() * (ROWS - 8));
            const c = 4 + Math.floor(Math.random() * (COLS - 8));
            if (m[r][c] === T.TEMPLE_FL) m[r][c] = T.VOID;
        }
    } else if (floorNum === 6) { // Boss room - grand
        // Statues lining the carpet
        for (let c = 6; c < COLS - 6; c += 4) {
            m[midR - 2][c] = T.STATUE;
            m[midR + 2][c] = T.STATUE;
        }
        // Portal at the back
        m[3][midC] = T.PORTAL;
        m[3][midC - 1] = T.PORTAL;
        m[3][midC + 1] = T.PORTAL;
    }

    // Random accent decorations
    if (floor.accent !== T.LAVA && floor.accent !== T.VOID && floor.accent !== T.PORTAL) {
        for (let i = 0; i < 6; i++) {
            const r = 3 + Math.floor(Math.random() * (ROWS - 6));
            const c = 3 + Math.floor(Math.random() * (COLS - 6));
            if (m[r][c] === T.TEMPLE_FL) m[r][c] = floor.accent;
        }
    }

    // Stairs down (entrance) at bottom center
    m[ROWS - 3][midC] = T.STAIRS_DN;
    // Clear around stairs
    m[ROWS - 3][midC - 1] = T.TEMPLE_FL;
    m[ROWS - 3][midC + 1] = T.TEMPLE_FL;

    // Stairs up (to next floor) at top center (not on final floor)
    if (floorNum < 6) {
        m[2][midC] = T.STAIRS_UP;
        m[2][midC - 1] = T.TEMPLE_FL;
        m[2][midC + 1] = T.TEMPLE_FL;
    }

    return m;
}

// Beach map (ocean to the north, sand area)
function buildBeachMap() {
    const m = createMap(ROWS, COLS, T.SAND);
    // Ocean along the top (rows 0-3)
    for (let r = 0; r < 4; r++) for (let c = 0; c < COLS; c++) m[r][c] = T.WATER;
    // Wavy shoreline at row 4 - mix of sand and water
    for (let c = 0; c < COLS; c++) {
        if (Math.sin(c * 0.8) > 0.3) m[4][c] = T.WATER;
    }
    // Dock extending into water
    for (let r = 1; r < 6; r++) m[r][18] = T.DOCK;
    m[1][17] = T.DOCK; m[1][19] = T.DOCK;
    // Palm trees scattered
    const palmSpots = [[5,2],[5,8],[6,14],[5,21],[7,5],[8,19],[6,22],[9,1]];
    for (const [pr, pc] of palmSpots) {
        if (pr < ROWS && pc < COLS) m[pr][pc] = T.PALM;
    }
    // Sandy path from south entrance
    const midC = Math.floor(COLS / 2);
    for (let r = ROWS - 1; r >= 5; r--) m[r][midC] = T.PATH;
    // Path branching east-west along beach
    for (let c = 3; c < COLS - 3; c++) m[6][c] = T.PATH;
    // Seashells
    const shellSpots = [[7,3],[8,10],[7,16],[9,7],[8,22],[5,11]];
    for (const [sr, sc] of shellSpots) {
        if (m[sr][sc] === T.SAND) m[sr][sc] = T.SEASHELL;
    }
    // Rocks along shoreline
    m[5][6] = T.ROCK; m[5][15] = T.ROCK; m[4][10] = T.ROCK;
    // Flowers in sandy area
    for (let i = 0; i < 4; i++) {
        const r = 7 + Math.floor(Math.random() * 5);
        const c = 1 + Math.floor(Math.random() * (COLS - 2));
        if (m[r][c] === T.SAND) m[r][c] = T.FLOWER;
    }
    // Bottom edge - fence/border (except path)
    for (let c = 0; c < COLS; c++) {
        if (c !== midC && c !== midC - 1 && c !== midC + 1) m[ROWS - 1][c] = T.FENCE;
    }
    // Door back to town (south, center)
    m[ROWS - 2][midC] = T.DOOR;
    // Sign
    m[ROWS - 3][midC + 1] = T.SIGN;
    // Fishing spot sign near dock
    m[6][17] = T.SIGN;
    return m;
}

// Mountain map
function buildMountainMap() {
    const m = createMap(ROWS, COLS, T.MTN_GROUND);
    // Mountain walls along top and sides (craggy edges)
    for (let c = 0; c < COLS; c++) {
        m[0][c] = T.MTN_WALL;
        if (Math.sin(c * 0.7) > 0.2) m[1][c] = T.MTN_WALL;
    }
    for (let r = 0; r < ROWS; r++) {
        m[r][0] = T.MTN_WALL; m[r][COLS - 1] = T.MTN_WALL;
        if (Math.sin(r * 1.2) > 0.3) { m[r][1] = T.MTN_WALL; m[r][COLS - 2] = T.MTN_WALL; }
    }
    // Snow patches at the top
    for (let c = 2; c < COLS - 2; c++) {
        if (Math.random() < 0.5) m[2][c] = T.SNOW;
        if (Math.random() < 0.3) m[3][c] = T.SNOW;
    }
    // Rocky path winding through
    const midC = Math.floor(COLS / 2);
    for (let r = 2; r < ROWS; r++) m[r][midC] = T.PATH;
    // Horizontal path
    for (let c = 3; c < COLS - 3; c++) m[8][c] = T.PATH;
    // Pine trees
    const pineSpots = [[4,3],[4,9],[5,17],[6,4],[4,20],[7,10],[3,15],[6,20],[9,3],[9,20],[5,6]];
    for (const [pr, pc] of pineSpots) {
        if (pr < ROWS && pc < COLS && m[pr][pc] === T.MTN_GROUND) m[pr][pc] = T.PINE;
    }
    // Rocks scattered
    const rockSpots = [[5,8],[6,14],[7,3],[8,18],[10,6],[10,16],[5,22]];
    for (const [rr, rc] of rockSpots) {
        if (rr < ROWS && rc < COLS && m[rr][rc] === T.MTN_GROUND) m[rr][rc] = T.ROCK;
    }
    // Small mountain lake
    m[6][11] = T.WATER; m[6][12] = T.WATER; m[6][13] = T.WATER;
    m[7][12] = T.WATER;
    // Bottom edge
    for (let c = 0; c < COLS; c++) {
        if (c !== midC && c !== midC - 1 && c !== midC + 1) m[ROWS - 1][c] = T.MTN_WALL;
    }
    // Door to town (north, center)
    m[0][midC] = T.DOOR;
    for (let c = midC - 1; c <= midC + 1; c++) { m[0][c] = T.PATH; m[1][c] = T.PATH; }
    m[0][midC] = T.DOOR;
    // Sign
    m[2][midC + 1] = T.SIGN;
    // Sign deeper in
    m[8][midC + 2] = T.SIGN;
    return m;
}

const MAPS = {
    cave: buildCaveMap(),
    town: buildTownMap(),
    forest: buildForestMap(),
    beach: buildBeachMap(),
    mountains: buildMountainMap()
};

// Build temple floors
for (let i = 0; i < 7; i++) {
    MAPS['temple_' + (i + 1)] = buildTempleFloor(i);
}

// --- AREA TRANSITIONS ---
const TRANSITIONS = {
    cave: [
        { col: COLS - 3, row: Math.floor(ROWS / 2), target: 'town', spawnCol: 2, spawnRow: Math.floor(ROWS / 2) }
    ],
    town: [
        { col: 1, row: Math.floor(ROWS / 2), target: 'cave', spawnCol: COLS - 4, spawnRow: Math.floor(ROWS / 2) },
        { col: COLS - 2, row: Math.floor(ROWS / 2), target: 'forest', spawnCol: 2, spawnRow: Math.floor(ROWS / 2) },
        { col: Math.floor(COLS / 2), row: 0, target: 'beach', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 3 },
        { col: Math.floor(COLS / 2), row: ROWS - 1, target: 'mountains', spawnCol: Math.floor(COLS / 2), spawnRow: 2 }
    ],
    beach: [
        { col: Math.floor(COLS / 2), row: ROWS - 2, target: 'town', spawnCol: Math.floor(COLS / 2), spawnRow: 2 }
    ],
    mountains: [
        { col: Math.floor(COLS / 2), row: 0, target: 'town', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 2 }
    ],
    forest: [
        { col: 1, row: Math.floor(ROWS / 2), target: 'town', spawnCol: COLS - 3, spawnRow: Math.floor(ROWS / 2) },
        { col: COLS - 2, row: Math.floor(ROWS / 2), target: 'temple_1', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_1: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'forest', spawnCol: COLS - 4, spawnRow: Math.floor(ROWS / 2) },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_2', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_2: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_1', spawnCol: Math.floor(COLS / 2), spawnRow: 3 },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_3', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_3: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_2', spawnCol: Math.floor(COLS / 2), spawnRow: 3 },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_4', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_4: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_3', spawnCol: Math.floor(COLS / 2), spawnRow: 3 },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_5', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_5: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_4', spawnCol: Math.floor(COLS / 2), spawnRow: 3 },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_6', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_6: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_5', spawnCol: Math.floor(COLS / 2), spawnRow: 3 },
        { col: Math.floor(COLS / 2), row: 2, target: 'temple_7', spawnCol: Math.floor(COLS / 2), spawnRow: ROWS - 4 }
    ],
    temple_7: [
        { col: Math.floor(COLS / 2), row: ROWS - 3, target: 'temple_6', spawnCol: Math.floor(COLS / 2), spawnRow: 3 }
    ]
};

// --- SIGN TEXTS ---
const SIGN_TEXTS = {
    cave: 'Exit to Logic Land Town -->',
    town_left: '<-- The Cave (enemies!)',
    town_right: 'Enchanted Forest -->',
    town_north: 'Coral Cove Beach ^',
    town_south: 'v Iron Peak Mountains',
    forest_left: '<-- Back to Town',
    forest_right: 'Temple of Logic --> (Defeat the Logic Lord first!)',
    beach_south: 'Back to Town v',
    beach_dock: 'Fishing Dock - Cast your line!',
    mtn_north: 'Back to Town ^',
    mtn_deep: 'Beware! Strong creatures dwell deeper in the peaks.'
};

// --- MAP NPC PLACEMENTS ---
const MAP_NPCS = {
    town: [
        { npcIndex: 0, col: 6, row: 8 },   // Elder Tautology
        { npcIndex: 1, col: 11, row: 6 },   // Merchant Mira (near store)
        { npcIndex: 2, col: 20, row: 8 },   // Scout Axiom
        { npcIndex: 3, col: 19, row: 6 },   // Al-Muṣawwir (near build site)
        { npcIndex: 4, col: 12, row: 11 }   // ZordTamer Kira (south of town)
    ],
    beach: [
        { npcIndex: 5, col: 16, row: 8 }   // Captain Coral (near dock)
    ],
    mountains: [
        { npcIndex: 6, col: 14, row: 6 }   // Ranger Flint
    ]
};

// --- MAP ENEMY ZONES ---
// roam: max tiles from spawn the enemy wanders
const ENEMY_ZONES = {
    cave: [
        { col: 6, row: 5, enemyIndex: 0, roam: 2 },
        { col: 12, row: 9, enemyIndex: 1, roam: 2 },
        { col: 16, row: 5, enemyIndex: 3, roam: 2 },
        { col: 8, row: 10, enemyIndex: 4, roam: 2 },
        { col: 18, row: 8, enemyIndex: 2, roam: 3 },
        { col: 14, row: 6, enemyIndex: 5, roam: 3 }   // Fang Bat
    ],
    forest: [
        { col: 6, row: 5, enemyIndex: 8, roam: 3 },    // +1
        { col: 16, row: 9, enemyIndex: 6, roam: 2 },
        { col: 12, row: 4, enemyIndex: 9, roam: 3 },
        { col: 20, row: 6, enemyIndex: 7, roam: 2 },
        { col: 10, row: 10, enemyIndex: 10, roam: 3 },
        { col: 5, row: 8, enemyIndex: 11, roam: 2 },
        { col: 15, row: 11, enemyIndex: 12, roam: 3 }
    ],
    beach: [
        { col: 5, row: 7, enemyIndex: 30, roam: 2 },
        { col: 12, row: 9, enemyIndex: 31, roam: 3 },
        { col: 20, row: 7, enemyIndex: 32, roam: 2 },
        { col: 8, row: 5, enemyIndex: 33, roam: 3 },
        { col: 15, row: 10, enemyIndex: 34, roam: 2 },
        { col: 3, row: 10, enemyIndex: 35, roam: 2 }
    ],
    mountains: [
        { col: 5, row: 5, enemyIndex: 36, roam: 3 },
        { col: 18, row: 4, enemyIndex: 37, roam: 2 },
        { col: 8, row: 10, enemyIndex: 38, roam: 3 },
        { col: 16, row: 7, enemyIndex: 39, roam: 2 },
        { col: 4, row: 8, enemyIndex: 40, roam: 2 },
        { col: 19, row: 10, enemyIndex: 41, roam: 2 }
    ],
    temple_1: [
        { col: 6, row: 5, enemyIndex: 13, roam: 2 },
        { col: 16, row: 6, enemyIndex: 14, roam: 2 },
        { col: 11, row: 10, enemyIndex: 13, roam: 2 }
    ],
    temple_2: [
        { col: 6, row: 5, enemyIndex: 15, roam: 3 },
        { col: 18, row: 5, enemyIndex: 16, roam: 3 },
        { col: 12, row: 10, enemyIndex: 15, roam: 2 }
    ],
    temple_3: [
        { col: 12, row: 5, enemyIndex: 17, roam: 2 },
        { col: 6, row: 9, enemyIndex: 18, roam: 2 },
        { col: 18, row: 9, enemyIndex: 18, roam: 2 }
    ],
    temple_4: [
        { col: 6, row: 5, enemyIndex: 19, roam: 3 },
        { col: 16, row: 5, enemyIndex: 20, roam: 3 },
        { col: 12, row: 10, enemyIndex: 19, roam: 2 }
    ],
    temple_5: [
        { col: 6, row: 5, enemyIndex: 21, roam: 2 },
        { col: 18, row: 5, enemyIndex: 22, roam: 2 },
        { col: 12, row: 10, enemyIndex: 23, roam: 2 }
    ],
    temple_6: [
        { col: 6, row: 5, enemyIndex: 24, roam: 3 },
        { col: 18, row: 5, enemyIndex: 25, roam: 3 },
        { col: 8, row: 10, enemyIndex: 26, roam: 2 },
        { col: 16, row: 10, enemyIndex: 24, roam: 2 }
    ],
    temple_7: [
        { col: 8, row: 6, enemyIndex: 27, roam: 2 },
        { col: 16, row: 6, enemyIndex: 28, roam: 2 },
        { col: 12, row: 9, enemyIndex: 29, roam: 1 }  // Boss
    ]
};

// Runtime enemy positions (pixel-based for smooth movement)
const enemyPos = {};

function findWalkableTile(map, startCol, startRow) {
    // If the start tile is walkable, use it
    if (startRow >= 0 && startRow < ROWS && startCol >= 0 && startCol < COLS &&
        !SOLID.has(map[startRow][startCol])) return { col: startCol, row: startRow };
    // Search outward in a spiral for a walkable tile
    for (let radius = 1; radius < 6; radius++) {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const r = startRow + dr, c2 = startCol + dc;
                if (r >= 1 && r < ROWS - 1 && c2 >= 1 && c2 < COLS - 1 && !SOLID.has(map[r][c2])) {
                    return { col: c2, row: r };
                }
            }
        }
    }
    return { col: startCol, row: startRow }; // fallback
}

function initEnemyPositions() {
    const allLocs = ['cave', 'forest', 'beach', 'mountains', 'temple_1', 'temple_2', 'temple_3', 'temple_4', 'temple_5', 'temple_6', 'temple_7'];
    for (const loc of allLocs) {
        if (!ENEMY_ZONES[loc] || !MAPS[loc]) continue;
        const map = MAPS[loc];
        enemyPos[loc] = ENEMY_ZONES[loc].map(z => {
            // Find a walkable tile near the specified position
            const safe = findWalkableTile(map, z.col, z.row);
            return {
                x: safe.col * TILE + TILE / 2,
                y: safe.row * TILE + TILE / 2,
                dx: (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4),
                dy: (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3),
                dirTimer: 60 + Math.floor(Math.random() * 120),
                spawnX: safe.col * TILE + TILE / 2,
                spawnY: safe.row * TILE + TILE / 2,
                roam: z.roam * TILE
            };
        });
    }
}
initEnemyPositions();

function updateEnemyMovement() {
    const positions = enemyPos[state.location];
    if (!positions) return;
    const map = MAPS[state.location];

    positions.forEach((ep, i) => {
        const key = `${state.location}_${i}`;
        if (state.defeatedZones.has(key)) return;

        // Direction change timer
        ep.dirTimer--;
        if (ep.dirTimer <= 0) {
            ep.dx = (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
            ep.dy = (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3);
            ep.dirTimer = 60 + Math.floor(Math.random() * 120);
        }

        // Move
        let nx = ep.x + ep.dx;
        let ny = ep.y + ep.dy;

        // Stay within roam radius of spawn
        const distFromSpawn = Math.sqrt((nx - ep.spawnX) ** 2 + (ny - ep.spawnY) ** 2);
        if (distFromSpawn > ep.roam) {
            // Bounce back toward spawn
            ep.dx = (ep.spawnX - ep.x) * 0.02;
            ep.dy = (ep.spawnY - ep.y) * 0.02;
            nx = ep.x + ep.dx;
            ny = ep.y + ep.dy;
        }

        // Don't walk into walls
        const tileCol = Math.floor(nx / TILE);
        const tileRow = Math.floor(ny / TILE);
        if (tileCol >= 0 && tileCol < COLS && tileRow >= 0 && tileRow < ROWS) {
            if (!SOLID.has(map[tileRow][tileCol])) {
                ep.x = nx;
                ep.y = ny;
            } else {
                // Reverse direction
                ep.dx *= -1;
                ep.dy *= -1;
                ep.dirTimer = 30;
            }
        } else {
            ep.dx *= -1;
            ep.dy *= -1;
        }
    });
}

// --- CHARACTER CLASSES ---
const CHARACTER_CLASSES = [
    {
        id: 'nyela', name: 'Nyela', sprite: '\u{1F9D9}',
        desc: '2x rubies from quizzes. Zords gain 2x XP.',
        hp: 90, attack: 9, defense: 7,
        perk: 'scholar', // double quiz ruby bonus + double Zord XP
        color: '#9b59b6', hair: '#1a1a2e', skin: '#c4956a', pants: '#3a2860', eyes: '#222'
    },
    {
        id: 'nasir', name: 'Nasir', sprite: '\u{1F9D1}\u200D\u2694\uFE0F',
        desc: 'Hits hard. 20% lifesteal on attacks.',
        hp: 100, attack: 13, defense: 7,
        perk: 'warrior', // heals 20% of damage dealt in battle
        color: '#e74c3c', hair: '#6b3a1f', skin: '#b8844a', pants: '#4a2020', eyes: '#222'
    },
    {
        id: 'duncan', name: 'Duncan', sprite: '\u{1F9DD}',
        desc: 'Tough. Takes 30% less damage.',
        hp: 110, attack: 9, defense: 10,
        perk: 'tank', // 30% damage reduction
        color: '#27ae60', hair: '#8b6914', hat: 'turban', skin: '#ffd5a3', pants: '#2a4a6a', eyes: '#1a3a80'
    },
    {
        id: 'laila', name: 'Laila', sprite: '\u{1F9DA}',
        desc: 'Fast. Moves faster. 2x catch rate.',
        hp: 85, attack: 10, defense: 6,
        perk: 'tamer', // faster movement + double ZordCage catch rate
        color: '#e67e22', hair: '#2c1810', cape: '#c03050', skin: '#c09060', pants: '#5a3018', eyes: '#222'
    }
];

// --- LOGIC LESSONS (based on Stanford intrologic concepts, written for kids!) ---
const LOGIC_LESSONS = [
    {
        id: 'propositional-basics',
        title: 'True or False? Statements in Logic',
        content: `In logic, we work with STATEMENTS - sentences that are either TRUE or FALSE. That's it! Every statement has to be one or the other.

Here are some examples:
- "Dogs are animals." --> This is TRUE!
- "The Sun is cold." --> This is FALSE!
- "2 + 3 = 5" --> This is TRUE!
- "Fish can fly." --> This is FALSE!

But watch out! Not everything is a statement:
- "What's your name?" is a QUESTION, not a statement.
- "Close the window!" is a COMMAND, not a statement.
- "Wow!" is just an exclamation.

Only sentences that can be TRUE or FALSE count as statements in logic.

We can also combine statements using special words:
- AND: Both things must be true. "It is sunny AND warm" is only true if BOTH parts are true.
- NOT: This flips the answer. If "It is raining" is TRUE, then "It is NOT raining" is FALSE.`,
        questions: [
            {
                q: 'Which of these is a statement (something that is true or false)?',
                choices: ['"How old are you?"', '"Please sit down!"', '"Cats have four legs."', '"Hooray!"'],
                answer: 2
            },
            {
                q: '"It is sunny AND it is Monday." When is this true?',
                choices: ['Only when it is sunny', 'Only when it is Monday', 'When BOTH are true', 'When either one is true'],
                answer: 2
            },
            {
                q: 'If "The dog is sleeping" is TRUE, what is "The dog is NOT sleeping"?',
                choices: ['TRUE', 'FALSE', 'Maybe', 'We can\'t tell'],
                answer: 1
            },
            {
                q: '"7 is greater than 10." Is this a statement?',
                choices: ['No, because it is wrong', 'Yes - it is FALSE but still a statement', 'No, it is a question', 'Only if you believe it'],
                answer: 1
            },
            {
                q: '"I like pizza AND I like tacos." I like pizza but hate tacos. Is this true?',
                choices: ['TRUE - pizza is enough', 'FALSE - both must be true for AND', 'Maybe', 'Only on Fridays'],
                answer: 1
            },
            {
                q: 'If "It is raining" is FALSE, what is "It is NOT raining"?',
                choices: ['FALSE', 'TRUE', 'Maybe', 'It depends on the weather'],
                answer: 1
            },
            {
                q: '"The sky is green." Is this a statement?',
                choices: ['No, because it is silly', 'No, because it is false', 'Yes - it can be TRUE or FALSE', 'Only sometimes'],
                answer: 2
            },
            {
                q: '"Go clean your room AND do your homework." What must you do?',
                choices: ['Just one of them', 'Either one', 'BOTH of them', 'Neither - it is not a statement'],
                answer: 2
            },
            {
                q: 'NOT NOT TRUE equals:',
                choices: ['TRUE', 'FALSE', 'MAYBE', 'ERROR'],
                answer: 0
            },
            {
                q: '"I am hungry AND I am thirsty AND I am tired." All three are true except I am NOT thirsty. Is the whole thing true?',
                choices: ['TRUE - two out of three is enough', 'FALSE - ALL must be true for AND', 'TRUE - majority wins', 'We cannot tell'],
                answer: 1
            },
            {
                q: 'Which of these is NOT a statement?',
                choices: ['"Elephants can fly."', '"2 + 2 = 4"', '"Open the window!"', '"The moon is made of rock."'],
                answer: 2
            },
            {
                q: '"The Earth is round AND water is wet." Is this true?',
                choices: ['FALSE - the Earth is not perfectly round', 'TRUE - both parts are true', 'We need more information', 'Only one is true'],
                answer: 1
            },
            {
                q: 'If NOT FALSE is TRUE, what is NOT TRUE?',
                choices: ['TRUE', 'NOT', 'FALSE', 'MAYBE'],
                answer: 2
            }
        ]
    },
    {
        id: 'truth-tables',
        title: 'AND and OR - Combining Ideas',
        content: `Let's learn two important ways to combine statements: AND and OR!

AND means BOTH things must be true:
- "I have a cat AND a dog" is TRUE only if you have BOTH a cat and a dog.
- If you only have a cat but no dog, the whole thing is FALSE.

Think of it like a checklist where EVERYTHING must be checked off!

OR means AT LEAST ONE thing must be true:
- "I'll have pizza OR pasta" is TRUE if you have pizza, or pasta, or even both!
- It's only FALSE if you have NEITHER pizza nor pasta.

Think of it like a checklist where you need at least ONE check!

Let's practice:
- "It is raining OR it is sunny"
  - Raining and sunny? TRUE (at least one is true - both are!)
  - Raining but not sunny? TRUE (raining counts!)
  - Not raining but sunny? TRUE (sunny counts!)
  - Not raining and not sunny? FALSE (neither one is true!)`,
        questions: [
            {
                q: '"I like chocolate OR I like vanilla." I like chocolate but not vanilla. Is this true?',
                choices: ['FALSE - I need to like both', 'TRUE - I like at least one of them', 'We can\'t tell', 'Only sometimes'],
                answer: 1
            },
            {
                q: '"I am tall AND I am fast." I am tall but I am not fast. Is this true?',
                choices: ['TRUE', 'FALSE', 'Maybe', 'Only on Tuesdays'],
                answer: 1
            },
            {
                q: '"I have a bike OR I have a scooter." I don\'t have either one. Is this true?',
                choices: ['TRUE', 'FALSE', 'Maybe', 'It depends'],
                answer: 1
            },
            {
                q: 'What does OR mean in logic?',
                choices: ['Both must be true', 'Exactly one must be true', 'At least one must be true', 'Neither is true'],
                answer: 2
            },
            {
                q: '"I like red OR I like blue." I like BOTH red and blue. Is this true?',
                choices: ['FALSE - you can only pick one', 'TRUE - at least one is true', 'FALSE - OR means only one', 'It depends'],
                answer: 1
            },
            {
                q: '"I have a dog AND a cat OR a fish." I have a dog and a fish but no cat. Is this true?',
                choices: ['TRUE', 'FALSE', 'We need more info', 'Only if AND comes first'],
                answer: 0
            },
            {
                q: '"It is raining OR it is snowing." It is doing neither. Is this true?',
                choices: ['TRUE', 'FALSE', 'Maybe later', 'Only in winter'],
                answer: 1
            },
            {
                q: 'Which is EASIER to make true: "A AND B" or "A OR B"?',
                choices: ['AND is easier', 'OR is easier - only one needs to be true', 'They are the same', 'Neither can be true'],
                answer: 1
            },
            {
                q: '"I will bring a jacket AND an umbrella." I bring a jacket but forget the umbrella. Did I do what I said?',
                choices: ['Yes, a jacket is enough', 'No - AND means I needed both', 'Yes, close enough', 'Only if it rains'],
                answer: 1
            },
            {
                q: '"The answer is 5 OR the answer is 7." The answer is 5. Is the statement true?',
                choices: ['FALSE - because it is not 7', 'TRUE - 5 is one of the options', 'FALSE - both must match', 'We need the question'],
                answer: 1
            },
            {
                q: 'TRUE AND TRUE equals:',
                choices: ['FALSE', 'TRUE', 'MAYBE', 'BOTH'],
                answer: 1
            },
            {
                q: 'FALSE AND TRUE equals:',
                choices: ['TRUE', 'FALSE', 'MAYBE', 'TRUE AND FALSE'],
                answer: 1
            },
            {
                q: 'FALSE OR FALSE equals:',
                choices: ['TRUE', 'FALSE', 'MAYBE', 'OR'],
                answer: 1
            },
            {
                q: '"I ate breakfast OR I ate lunch OR I ate dinner." I only ate lunch. Is this true?',
                choices: ['FALSE - I missed two meals', 'TRUE - at least one is true', 'FALSE - I need all three', 'Only if lunch was big'],
                answer: 1
            }
        ]
    },
    {
        id: 'implication',
        title: 'If-Then Statements',
        content: `One of the most powerful ideas in logic is the IF-THEN statement!

"IF it rains, THEN I will bring an umbrella."

The IF part is called the CONDITION. The THEN part is the RESULT.

Here's the tricky part - when is an if-then statement FALSE?

It's ONLY false when the IF part happens but the THEN part DOESN'T:
- It rains and I bring an umbrella = TRUE (I kept my promise!)
- It rains and I DON'T bring an umbrella = FALSE (I broke my promise!)
- It doesn't rain and I bring an umbrella = TRUE (I didn't break any promise!)
- It doesn't rain and I don't bring an umbrella = TRUE (No promise to break!)

Think of it like a PROMISE: "If you clean your room, then you get ice cream."
- You clean and get ice cream? Promise kept! TRUE!
- You clean but get NO ice cream? Promise broken! FALSE!
- You don't clean but get ice cream anyway? The promise wasn't broken! TRUE!
- You don't clean and no ice cream? The promise still wasn't broken! TRUE!

The promise is only broken when you DO the first thing but DON'T get the second thing.`,
        questions: [
            {
                q: '"If it snows, then school is cancelled." It snows and school IS cancelled. Is the statement true?',
                choices: ['TRUE', 'FALSE', 'We can\'t tell', 'Only sometimes'],
                answer: 0
            },
            {
                q: '"If it snows, then school is cancelled." It snows but school is NOT cancelled. Is the statement true?',
                choices: ['TRUE', 'FALSE', 'We can\'t tell', 'Only sometimes'],
                answer: 1
            },
            {
                q: '"If you eat your veggies, you get dessert." You DON\'T eat veggies but still get dessert. Is the promise broken?',
                choices: ['Yes, the promise is broken', 'No, the promise is NOT broken', 'We can\'t tell', 'That\'s not fair!'],
                answer: 1
            },
            {
                q: 'An if-then statement is only FALSE when:',
                choices: ['The IF part is false', 'The THEN part is true', 'The IF part is true but the THEN part is false', 'Both parts are false'],
                answer: 2
            },
            {
                q: '"If I study, I will pass." I don\'t study and I don\'t pass. Is the promise broken?',
                choices: ['Yes - I failed!', 'No - the promise only covers what happens IF I study', 'Yes - I should have studied', 'We cannot tell'],
                answer: 1
            },
            {
                q: '"If it is a square, then it has 4 sides." This is:',
                choices: ['FALSE - not all 4-sided shapes are squares', 'TRUE - every square does have 4 sides', 'Only sometimes true', 'FALSE - squares have corners not sides'],
                answer: 1
            },
            {
                q: '"If I press the button, the light turns on." The light is already on and I never pressed the button. Is this false?',
                choices: ['Yes - the light shouldn\'t be on', 'No - the promise is only broken if I press it and it stays off', 'Yes - something is wrong', 'We need more info'],
                answer: 1
            },
            {
                q: '"If you are a dog, then you are an animal." Max is a cat (an animal). Does this break the rule?',
                choices: ['Yes - Max is not a dog', 'No - the rule only talks about dogs, not cats', 'Yes - cats and dogs are different', 'Only if Max barks'],
                answer: 1
            },
            {
                q: '"If it rains, I bring an umbrella." It is sunny and I bring an umbrella anyway. TRUE or FALSE?',
                choices: ['FALSE - no rain means no umbrella', 'TRUE - I did not break my promise', 'FALSE - umbrellas are for rain', 'It depends on the weather'],
                answer: 1
            },
            {
                q: 'Which of these would make "If A then B" FALSE?',
                choices: ['A is false, B is false', 'A is false, B is true', 'A is true, B is true', 'A is true, B is false'],
                answer: 3
            },
            {
                q: '"If you finish dinner, you get dessert." You finish dinner. You MUST get:',
                choices: ['Nothing', 'Dessert', 'More dinner', 'A drink'],
                answer: 1
            },
            {
                q: '"If it is Saturday, then there is no school." Today is Wednesday and there IS school. Is the statement false?',
                choices: ['Yes - there is school today', 'No - the rule is about Saturday, not Wednesday', 'Yes - school is open', 'Only during summer'],
                answer: 1
            },
            {
                q: '"If I am taller than you, and you are taller than Sam, then I am taller than Sam." Is this good logic?',
                choices: ['No, height does not work that way', 'Yes - if A > B and B > C, then A > C', 'Only if everyone is standing up', 'We need to measure'],
                answer: 1
            },
            {
                q: 'How many ways can "If P then Q" be TRUE?',
                choices: ['Only 1 way', '2 ways', '3 ways', '4 ways'],
                answer: 2
            }
        ]
    },
    {
        id: 'equivalence',
        title: 'Saying the Same Thing Different Ways',
        content: `Sometimes two statements that LOOK different actually mean the SAME thing! When two statements always have the same answer (both true or both false), we say they are EQUIVALENT.

Here's a really useful trick called De Morgan's Rules:

Rule 1: "NOT (A AND B)" means the same as "NOT A, OR NOT B"

Example: "It is NOT true that I have a cat AND a dog."
This is the same as: "I don't have a cat, OR I don't have a dog."
(At least one of them is missing!)

Rule 2: "NOT (A OR B)" means the same as "NOT A, AND NOT B"

Example: "It is NOT true that it is raining OR snowing."
This is the same as: "It is NOT raining AND it is NOT snowing."
(Neither one is happening!)

Think about it:
- If someone says "It's not true that I like BOTH spinach and broccoli" - they're saying they dislike at least one of them.
- If someone says "It's not true that I like spinach OR broccoli" - they're saying they don't like either one!`,
        questions: [
            {
                q: '"It\'s NOT true that the light is on AND the fan is on." What does this mean?',
                choices: ['Both are off', 'At least one of them is off', 'Both are on', 'Neither is on'],
                answer: 1
            },
            {
                q: '"I do NOT have a cat OR a dog." What does this mean?',
                choices: ['I have one but not the other', 'I have both', 'I don\'t have a cat AND I don\'t have a dog', 'I have at least one'],
                answer: 2
            },
            {
                q: 'Two statements are "equivalent" when they:',
                choices: ['Sound the same', 'Are both short', 'Always give the same true/false answer', 'Are both about the same topic'],
                answer: 2
            },
            {
                q: '"NOT (I have a pen AND a pencil)" means:',
                choices: ['I have neither', 'I am missing at least one of them', 'I have both', 'I have a pen but not a pencil'],
                answer: 1
            },
            {
                q: '"NOT (I like math OR science)" means:',
                choices: ['I like at least one', 'I don\'t like math AND I don\'t like science', 'I like both', 'I only like one'],
                answer: 1
            },
            {
                q: '"It is NOT cold AND NOT rainy" is the same as:',
                choices: ['"It is NOT (cold OR rainy)"', '"It is cold AND rainy"', '"It is NOT cold OR NOT rainy"', '"It is cold OR rainy"'],
                answer: 0
            },
            {
                q: '"I don\'t have a cat OR I don\'t have a dog." This means:',
                choices: ['I am missing BOTH', 'I am missing at least one of them', 'I have both', 'I have neither pet'],
                answer: 1
            },
            {
                q: 'Are "NOT (A AND B)" and "NOT A AND NOT B" the same thing?',
                choices: ['Yes, always', 'No - the first means missing at least one, the second means missing both', 'Yes, if A and B are true', 'Only sometimes'],
                answer: 1
            },
            {
                q: '"It is NOT true that the movie is long AND boring." What do we know?',
                choices: ['The movie is short', 'The movie is fun', 'The movie is either not long OR not boring (or both)', 'Nothing'],
                answer: 2
            },
            {
                q: '"I will NOT eat cake AND I will NOT eat pie." How many desserts am I eating?',
                choices: ['Two', 'One', 'Zero', 'We cannot tell'],
                answer: 2
            },
            {
                q: '"NOT (the door is open OR the window is open)" means:',
                choices: ['At least one is open', 'Both are closed', 'Both are open', 'One is open and one is closed'],
                answer: 1
            },
            {
                q: 'Which pair says the SAME thing?',
                choices: ['"NOT (A OR B)" and "NOT A OR NOT B"', '"NOT (A AND B)" and "NOT A OR NOT B"', '"NOT A" and "A"', '"A AND B" and "A OR B"'],
                answer: 1
            },
            {
                q: '"It\'s not true that I finished my homework AND cleaned my room." My room is clean. What about homework?',
                choices: ['Homework is done too', 'Homework is NOT done', 'We cannot tell about homework', 'Both are done'],
                answer: 1
            }
        ]
    },
    {
        id: 'valid-reasoning',
        title: 'Good Reasoning vs. Bad Reasoning',
        content: `Let's learn how to tell GOOD reasoning from BAD reasoning!

GOOD reasoning (called "valid"): If the clues are true, the answer MUST be true.

Here's a pattern of good reasoning:
  Clue 1: "If it is a dog, then it is an animal."
  Clue 2: "Buddy is a dog."
  Answer: "Buddy is an animal."
This HAS to be right! If all dogs are animals and Buddy is a dog, Buddy MUST be an animal.

Now here's BAD reasoning (a TRICK to watch out for!):
  Clue 1: "If it is a dog, then it is an animal."
  Clue 2: "Mittens is an animal."
  Wrong answer: "Mittens is a dog."
This is WRONG! Mittens could be a cat, a fish, or any animal! Just because all dogs are animals doesn't mean all animals are dogs!

Another good pattern:
  Clue 1: "If it is a dog, then it is an animal."
  Clue 2: "Zorp is NOT an animal."
  Answer: "Zorp is NOT a dog."
This works! If all dogs are animals and Zorp ISN'T an animal, then Zorp CAN'T be a dog!`,
        questions: [
            {
                q: '"All birds can fly. Tweety is a bird. So Tweety can fly." Is this good reasoning?',
                choices: ['No, that\'s bad reasoning', 'Yes, that\'s good reasoning', 'We can\'t tell', 'Only if Tweety is small'],
                answer: 1
            },
            {
                q: '"All fish live in water. Nemo lives in water. So Nemo is a fish." Is this good reasoning?',
                choices: ['Yes, definitely!', 'No - Nemo could be something else that lives in water', 'Only if Nemo has fins', 'We need more clues'],
                answer: 1
            },
            {
                q: '"If you study, you pass the test. You did NOT pass. So you did NOT study." Is this good reasoning?',
                choices: ['No, that\'s wrong', 'Yes, that\'s good reasoning', 'Only sometimes', 'We can\'t tell'],
                answer: 1
            },
            {
                q: 'What makes reasoning "good" (valid)?',
                choices: ['The answer sounds right', 'You have lots of clues', 'If the clues are true, the answer MUST be true', 'Everyone agrees with it'],
                answer: 2
            },
            {
                q: '"All cats are animals. Whiskers is a cat. So Whiskers is an animal." Is this valid?',
                choices: ['No', 'Yes', 'Maybe', 'Only on weekdays'],
                answer: 1
            },
            {
                q: '"All apples are fruit. This is a fruit. So this is an apple." Is this good reasoning?',
                choices: ['Yes - fruit means apple', 'No - it could be an orange or banana', 'Yes - apples are common', 'Only if it is red'],
                answer: 1
            },
            {
                q: '"If you practice, you get better. Sam got better. So Sam must have practiced." Is this valid?',
                choices: ['Yes - getting better means practicing', 'No - Sam might have gotten better another way', 'Yes - practice always works', 'Only for sports'],
                answer: 1
            },
            {
                q: '"All squares are rectangles. This is not a rectangle. So this is not a square." Is this valid?',
                choices: ['No - squares and rectangles are different', 'Yes - if it is not a rectangle it cannot be a square', 'Only for shapes', 'We need to measure'],
                answer: 1
            },
            {
                q: '"Every time I wash my car, it rains. I washed my car today. So it will rain." What is wrong?',
                choices: ['Nothing - it will rain', 'Washing a car does not CAUSE rain - this is a coincidence', 'Cars don\'t cause weather', 'It depends on the season'],
                answer: 1
            },
            {
                q: '"No reptiles have fur. My pet has fur. So my pet is not a reptile." Is this valid?',
                choices: ['No - some reptiles might have fur', 'Yes - if no reptiles have fur and my pet has fur, it cannot be a reptile', 'Only if my pet is a dog', 'We need to see the pet'],
                answer: 1
            },
            {
                q: '"Students who study get As. Maria got an A." Can we conclude Maria studied?',
                choices: ['Yes - she got an A so she must have studied', 'No - maybe she already knew the material', 'Yes - As require studying', 'Only if the test was hard'],
                answer: 1
            },
            {
                q: '"All dogs bark. Rex does not bark. Therefore Rex is not a dog." This uses:',
                choices: ['Bad reasoning', 'Good reasoning - if all dogs bark and Rex doesn\'t, Rex can\'t be a dog', 'Guessing', 'Common sense only'],
                answer: 1
            },
            {
                q: '"If it is Tuesday, the store is closed. The store is open." What can we conclude?',
                choices: ['It is Tuesday', 'It is NOT Tuesday', 'The store is broken', 'Nothing'],
                answer: 1
            },
            {
                q: '"All my friends like music. Jake likes music." Can we conclude Jake is my friend?',
                choices: ['Yes - he likes music like my friends', 'No - lots of people like music who are not my friends', 'Yes - music lovers are friends', 'Only if Jake is nice'],
                answer: 1
            },
            {
                q: 'Which is the TRICK to watch out for in logic?',
                choices: ['Assuming the conclusion proves the clue', 'Reading the clues carefully', 'Using too many clues', 'Asking for help'],
                answer: 0
            }
        ]
    }
];

// --- ELEMENT SYSTEM ---
// Fire > Nature > Ice > Fire, Shadow > Light > Shadow, Arcane is neutral
const ELEMENTS = {
    fire:    { name: 'Fire',    color: '#e74c3c', icon: '\u{1F525}', strong: 'nature', weak: 'ice' },
    ice:     { name: 'Ice',     color: '#5dade2', icon: '\u{2744}\uFE0F', strong: 'fire', weak: 'nature' },
    nature:  { name: 'Nature',  color: '#27ae60', icon: '\u{1F33F}', strong: 'ice', weak: 'fire' },
    shadow:  { name: 'Shadow',  color: '#8e44ad', icon: '\u{1F311}', strong: 'light', weak: 'light' },
    light:   { name: 'Light',   color: '#f5c842', icon: '\u{2728}', strong: 'shadow', weak: 'shadow' },
    arcane:  { name: 'Arcane',  color: '#9b59b6', icon: '\u{1F52E}', strong: null, weak: null },
    earth:   { name: 'Earth',   color: '#a0522d', icon: '\u{1FAA8}', strong: 'electric', weak: 'nature' },
    electric:{ name: 'Electric',color: '#f1c40f', icon: '\u{26A1}', strong: 'ice', weak: 'earth' },
    void:    { name: 'Void',    color: '#1a1a3e', icon: '\u{1F30C}', strong: 'arcane', weak: 'light' },
    water:   { name: 'Water',   color: '#2980b9', icon: '\u{1F4A7}', strong: 'fire', weak: 'electric' }
};

function getElementMultiplier(attackEl, defendEl) {
    const atk = ELEMENTS[attackEl];
    if (!atk) return 1;
    if (atk.strong === defendEl) return 1.5;  // super effective
    if (atk.weak === defendEl) return 0.6;    // not very effective
    return 1;
}

// --- ZORDS (enemies / tameable creatures) ---
// moveType: vertical, fly, roam, slow | attackType: fireball, icebeam, electric, shadow, spread, bomb, laser | speed: movement multiplier
const ENEMIES = [
    // === CAVE ZORDS (0-5) ===
    { name: 'Glitch Goblin',  sprite: '\u{1F47A}', hp: 40, attack: 6,  rubies: 3,  lessonId: 'propositional-basics', catchRate: 0.6,  element: 'arcane',  power: { name: 'Glitch Pulse', damage: 12, element: 'arcane' },   moveType: 'vertical', attackType: 'fireball', speed: 0.8 },
    { name: 'Paradox Bat',    sprite: '\u{1F987}', hp: 50, attack: 8,  rubies: 5,  lessonId: 'truth-tables',         catchRate: 0.5,  element: 'shadow',  power: { name: 'Echo Screech', damage: 15, element: 'shadow' },   moveType: 'fly', attackType: 'shadow', speed: 1.2 },
    { name: 'Fallacy Fox',    sprite: '\u{1F98A}', hp: 60, attack: 10, rubies: 7,  lessonId: 'implication',          catchRate: 0.4,  element: 'fire',    power: { name: 'Trick Flame', damage: 18, element: 'fire' },     moveType: 'roam', attackType: 'bite', speed: 1.5 },
    { name: 'Cave Slug',      sprite: '\u{1F40C}', hp: 25, attack: 4,  rubies: 2,  lessonId: 'propositional-basics', catchRate: 0.8,  element: 'earth',   power: { name: 'Slime Shield', damage: 8, element: 'earth' },    moveType: 'slow', attackType: 'bomb', speed: 0.3 },
    { name: 'Crystal Spider', sprite: '\u{1F577}\uFE0F', hp: 35, attack: 7,  rubies: 4,  lessonId: 'truth-tables',  catchRate: 0.55, element: 'light',   power: { name: 'Prism Web', damage: 14, element: 'light' },      moveType: 'roam', attackType: 'spread', speed: 1.0 },
    { name: 'Fang Bat',      sprite: '\u{1F987}', hp: 45, attack: 9,  rubies: 5,  lessonId: 'propositional-basics', catchRate: 0.5,  element: 'shadow',  power: { name: 'Venom Bite', damage: 16, element: 'shadow' },    moveType: 'fly', attackType: 'bite', speed: 1.8 },
    // === FOREST ZORDS (6-12) ===
    { name: 'Riddle Wraith',  sprite: '\u{1F47B}', hp: 75, attack: 12, rubies: 10, lessonId: 'equivalence',          catchRate: 0.3,  element: 'shadow',  power: { name: 'Mind Warp', damage: 22, element: 'shadow' },     moveType: 'fly', attackType: 'shadow', speed: 1.0 },
    { name: 'Logic Lord',     sprite: '\u{1F432}', hp: 100,attack: 15, rubies: 20, lessonId: 'valid-reasoning',      catchRate: 0.1,  element: 'arcane',  power: { name: 'Proof Strike', damage: 30, element: 'arcane' },   moveType: 'roam', attackType: 'laser', speed: 1.2, escapeRate: 0.4 },
    { name: 'Thorn Sprite',   sprite: '\u{1F33F}', hp: 55, attack: 9,  rubies: 6,  lessonId: 'implication',          catchRate: 0.5,  element: 'nature',  power: { name: 'Vine Lash', damage: 16, element: 'nature' },     moveType: 'vertical', attackType: 'spread', speed: 0.7 },
    { name: 'Moss Troll',     sprite: '\u{1F9CC}', hp: 80, attack: 11, rubies: 8,  lessonId: 'equivalence',          catchRate: 0.35, element: 'nature',  power: { name: 'Root Slam', damage: 20, element: 'nature' },     moveType: 'slow', attackType: 'bomb', speed: 0.5 },
    { name: 'Ember Wisp',     sprite: '\u{1FA94}', hp: 45, attack: 8,  rubies: 5,  lessonId: 'propositional-basics', catchRate: 0.6,  element: 'fire',    power: { name: 'Spark Burst', damage: 14, element: 'fire' },     moveType: 'fly', attackType: 'fireball', speed: 1.4 },
    { name: 'Shadow Lynx',    sprite: '\u{1F408}', hp: 65, attack: 13, rubies: 9,  lessonId: 'truth-tables',         catchRate: 0.3,  element: 'shadow',  power: { name: 'Dark Pounce', damage: 24, element: 'shadow' },   moveType: 'roam', attackType: 'bite', speed: 2.0 },
    { name: 'Wind Hawk',      sprite: '\u{1F985}', hp: 50, attack: 10, rubies: 7,  lessonId: 'implication',          catchRate: 0.45, element: 'electric',power: { name: 'Gale Bolt', damage: 18, element: 'electric' },    moveType: 'fly', attackType: 'electric', speed: 1.6 },
    // === TEMPLE FLOOR 1-2 (13-16) ===
    { name: 'Stone Sentinel', sprite: '\u{1F5FF}', hp: 70, attack: 10, rubies: 8,  lessonId: 'propositional-basics', catchRate: 0.35, element: 'earth',   power: { name: 'Boulder Crush', damage: 20, element: 'earth' },  moveType: 'slow', attackType: 'bomb', speed: 0.4 },
    { name: 'Rune Beetle',    sprite: '\u{1FAB2}', hp: 55, attack: 9,  rubies: 7,  lessonId: 'truth-tables',         catchRate: 0.5,  element: 'arcane',  power: { name: 'Rune Blast', damage: 16, element: 'arcane' },    moveType: 'roam', attackType: 'fireball', speed: 1.1 },
    { name: 'Shadow Negator', sprite: '\u{1F311}', hp: 80, attack: 12, rubies: 10, lessonId: 'truth-tables',         catchRate: 0.3,  element: 'shadow',  power: { name: 'Negate Force', damage: 22, element: 'shadow' },  moveType: 'fly', attackType: 'shadow', speed: 0.9 },
    { name: 'Gloom Moth',     sprite: '\u{1FAB3}', hp: 45, attack: 8,  rubies: 6,  lessonId: 'propositional-basics', catchRate: 0.55, element: 'shadow',  power: { name: 'Dust Cloud', damage: 14, element: 'shadow' },    moveType: 'fly', attackType: 'spread', speed: 1.3 },
    // === TEMPLE FLOOR 3-4 (17-20) ===
    { name: 'Ink Phantom',    sprite: '\u{1F4D6}', hp: 85, attack: 11, rubies: 10, lessonId: 'implication',          catchRate: 0.3,  element: 'arcane',  power: { name: 'Ink Torrent', damage: 20, element: 'arcane' },   moveType: 'fly', attackType: 'spread', speed: 1.0 },
    { name: 'Page Golem',     sprite: '\u{1F4DA}', hp: 90, attack: 13, rubies: 12, lessonId: 'truth-tables',         catchRate: 0.25, element: 'earth',   power: { name: 'Paper Storm', damage: 24, element: 'earth' },    moveType: 'slow', attackType: 'bomb', speed: 0.6 },
    { name: 'Frost Construct',sprite: '\u{2744}\uFE0F', hp: 95, attack: 14, rubies: 12, lessonId: 'equivalence',     catchRate: 0.25, element: 'ice',     power: { name: 'Blizzard', damage: 26, element: 'ice' },         moveType: 'vertical', attackType: 'icebeam', speed: 0.8 },
    { name: 'Ice Wraith',     sprite: '\u{1F9CA}', hp: 85, attack: 13, rubies: 11, lessonId: 'implication',          catchRate: 0.3,  element: 'ice',     power: { name: 'Frost Bite', damage: 22, element: 'ice' },       moveType: 'fly', attackType: 'icebeam', speed: 1.1 },
    // === TEMPLE FLOOR 5-6 (21-26) ===
    { name: 'Magma Beast',    sprite: '\u{1F525}', hp: 110,attack: 16, rubies: 15, lessonId: 'valid-reasoning',      catchRate: 0.2,  element: 'fire',    power: { name: 'Eruption', damage: 30, element: 'fire' },       moveType: 'roam', attackType: 'spread', speed: 1.0 },
    { name: 'Lava Serpent',   sprite: '\u{1F40D}', hp: 100,attack: 15, rubies: 14, lessonId: 'equivalence',          catchRate: 0.25, element: 'fire',    power: { name: 'Magma Coil', damage: 28, element: 'fire' },     moveType: 'roam', attackType: 'fireball', speed: 1.3 },
    { name: 'Cinder Scorpion',sprite: '\u{1F982}', hp: 90, attack: 14, rubies: 12, lessonId: 'implication',          catchRate: 0.3,  element: 'fire',    power: { name: 'Ember Sting', damage: 24, element: 'fire' },    moveType: 'roam', attackType: 'electric', speed: 1.5 },
    { name: 'Void Walker',    sprite: '\u{1F573}\uFE0F', hp: 120,attack: 17, rubies: 18, lessonId: 'valid-reasoning',catchRate: 0.15, element: 'void',    power: { name: 'Rift Tear', damage: 32, element: 'void' },      moveType: 'fly', attackType: 'laser', speed: 0.8 },
    { name: 'Null Entity',    sprite: '\u{1F47E}', hp: 115,attack: 16, rubies: 16, lessonId: 'equivalence',          catchRate: 0.2,  element: 'void',    power: { name: 'Null Wave', damage: 28, element: 'void' },      moveType: 'fly', attackType: 'shadow', speed: 1.0 },
    { name: 'Phase Jellyfish', sprite: '\u{1FABC}', hp: 70, attack: 12, rubies: 10, lessonId: 'truth-tables',        catchRate: 0.35, element: 'electric',power: { name: 'Phase Shock', damage: 20, element: 'electric' },  moveType: 'fly', attackType: 'electric', speed: 0.7 },
    // === TEMPLE FLOOR 7 (27-28) ===
    { name: 'Temple Guardian',sprite: '\u{1F916}', hp: 130,attack: 18, rubies: 20, lessonId: 'valid-reasoning',      catchRate: 0.1,  element: 'light',   power: { name: 'Holy Smite', damage: 34, element: 'light' },    moveType: 'roam', attackType: 'laser', speed: 1.2 },
    { name: 'Prismatic Drake',sprite: '\u{1F409}', hp: 140,attack: 19, rubies: 22, lessonId: 'equivalence',          catchRate: 0.08, element: 'light',   power: { name: 'Prisma Beam', damage: 36, element: 'light' },   moveType: 'fly', attackType: 'laser', speed: 1.5 },
    // === BOSSES (uncatchable) (29) ===
    { name: 'Arch-Logician Zephyr', sprite: '\u{1F9D9}\u200D\u2642\uFE0F', hp: 200, attack: 22, rubies: 50, lessonId: 'valid-reasoning', catchRate: 0, element: 'arcane', power: { name: 'Axiom Annihilation', damage: 45, element: 'arcane' }, moveType: 'fly', attackType: 'laser', speed: 1.8, escapeRate: 0.15 },
    // === BEACH ZORDS (30-35) ===
    { name: 'Tide Crab',      sprite: '\u{1F980}', hp: 45, attack: 7,  rubies: 4,  lessonId: 'propositional-basics', catchRate: 0.6,  element: 'water',   power: { name: 'Pinch Tide', damage: 12, element: 'water' },     moveType: 'roam', attackType: 'bite', speed: 0.8 },
    { name: 'Sand Serpent',   sprite: '\u{1F40D}', hp: 60, attack: 9,  rubies: 6,  lessonId: 'truth-tables',         catchRate: 0.45, element: 'earth',   power: { name: 'Sand Blast', damage: 16, element: 'earth' },     moveType: 'roam', attackType: 'spread', speed: 1.2 },
    { name: 'Coral Sprite',   sprite: '\u{1FAB8}', hp: 50, attack: 8,  rubies: 5,  lessonId: 'implication',          catchRate: 0.5,  element: 'water',   power: { name: 'Reef Pulse', damage: 14, element: 'water' },     moveType: 'vertical', attackType: 'fireball', speed: 0.9 },
    { name: 'Gull Phantom',   sprite: '\u{1F426}', hp: 40, attack: 7,  rubies: 4,  lessonId: 'propositional-basics', catchRate: 0.55, element: 'electric',power: { name: 'Squall Dive', damage: 13, element: 'electric' },  moveType: 'fly', attackType: 'shadow', speed: 1.6 },
    { name: 'Jellyfish Drift',sprite: '\u{1FABC}', hp: 55, attack: 10, rubies: 7,  lessonId: 'equivalence',          catchRate: 0.4,  element: 'electric',power: { name: 'Shock Sting', damage: 18, element: 'electric' },  moveType: 'fly', attackType: 'electric', speed: 0.7 },
    { name: 'Shell Golem',    sprite: '\u{1F41A}', hp: 80, attack: 11, rubies: 8,  lessonId: 'truth-tables',         catchRate: 0.3,  element: 'earth',   power: { name: 'Shell Slam', damage: 20, element: 'earth' },     moveType: 'slow', attackType: 'bomb', speed: 0.4 },
    // === MOUNTAIN ZORDS (36-41) ===
    { name: 'Frost Wolf',     sprite: '\u{1F43A}', hp: 70, attack: 12, rubies: 8,  lessonId: 'implication',          catchRate: 0.35, element: 'ice',     power: { name: 'Howling Blizzard', damage: 20, element: 'ice' },  moveType: 'roam', attackType: 'icebeam', speed: 1.4 },
    { name: 'Boulder Beetle', sprite: '\u{1FAB2}', hp: 90, attack: 10, rubies: 7,  lessonId: 'truth-tables',         catchRate: 0.4,  element: 'earth',   power: { name: 'Rock Roll', damage: 18, element: 'earth' },      moveType: 'slow', attackType: 'bomb', speed: 0.5 },
    { name: 'Peak Eagle',     sprite: '\u{1F985}', hp: 55, attack: 11, rubies: 7,  lessonId: 'equivalence',          catchRate: 0.4,  element: 'electric',power: { name: 'Storm Talon', damage: 19, element: 'electric' },  moveType: 'fly', attackType: 'electric', speed: 1.8 },
    { name: 'Snow Wraith',    sprite: '\u{1F47B}', hp: 65, attack: 13, rubies: 9,  lessonId: 'valid-reasoning',      catchRate: 0.3,  element: 'ice',     power: { name: 'Frost Wail', damage: 22, element: 'ice' },       moveType: 'fly', attackType: 'shadow', speed: 1.0 },
    { name: 'Iron Ram',       sprite: '\u{1F40F}', hp: 95, attack: 14, rubies: 10, lessonId: 'propositional-basics', catchRate: 0.25, element: 'earth',   power: { name: 'Horn Charge', damage: 24, element: 'earth' },    moveType: 'roam', attackType: 'bite', speed: 1.2 },
    { name: 'Crystal Yeti',   sprite: '\u{1F9CC}', hp: 110,attack: 15, rubies: 12, lessonId: 'equivalence',          catchRate: 0.2,  element: 'ice',     power: { name: 'Avalanche', damage: 28, element: 'ice' },        moveType: 'slow', attackType: 'spread', speed: 0.6 }
];

// --- NPCs ---
const NPCS = [
    {
        name: 'Elder Tautology', sprite: '\u{1F9D3}',
        dialogue: [
            'Welcome to Logic Land, traveler! Here, truth and reason are your greatest weapons.',
            'Remember: a statement is either TRUE or FALSE. There is no in-between in classical logic!',
            'If you want to defeat the Logic Lord, you must master all five lessons. Study hard!'
        ]
    },
    {
        name: 'Merchant Mira', sprite: '\u{1F9D5}',
        dialogue: [
            'Looking to buy something? Head to the store!',
            'I heard the Paradox Bat drops lots of rubies if you can beat its quiz.',
            'Building a home in Logic Land? You will need wood, stone, and nails from the store.'
        ]
    },
    {
        name: 'Scout Axiom', sprite: '\u{1F575}\uFE0F',
        dialogue: [
            'I have been exploring the caves nearby. There are enemies lurking in every corner!',
            'Before each battle, you will need to study a logic lesson and answer questions about it.',
            'The harder the enemy, the more rubies you earn. But the quizzes get tougher too!'
        ]
    },
    {
        name: 'Al-Muṣawwir', sprite: '\u{1F477}',
        dialogue: [
            'Ah, a fellow builder! Once you have enough materials, come talk to me about construction.',
            'A small cabin needs 5 wood and 3 stone. A workshop needs even more!',
            'Rubies are nice, but materials are what build civilizations!'
        ]
    },
    {
        name: 'ZordTamer Kira', sprite: '\u{1F9D1}\u200D\u{1F3A4}',
        isZordTamer: true,
        dialogue: [
            'Welcome, young tamer! Zords are the creatures that roam these lands. With a ZordCage, you can tame them!',
            'Weaken a Zord in battle, then press C to throw a ZordCage. The weaker it is, the easier to catch!',
            'I can sell you ZordCages and heal your Zords. Press Z anytime to see your ZordList!',
            'Some Zords are very rare. The Prismatic Drake in the temple is nearly impossible to catch!',
            'Collect them all and become the greatest ZordTamer in Logic Land!'
        ]
    },
    {
        name: 'Captain Coral', sprite: '\u{1F9D4}',
        dialogue: [
            'Ahoy! Welcome to Coral Cove Beach! The sea breeze clears the mind for logical thinking.',
            'Watch out for the Tide Crabs — they pinch hard! And the Shell Golems are tough as barnacles.',
            'The dock over there is great for fishing. Bigger fish swim in the ocean than the town pond!',
            'If you see a Jellyfish Drift, be careful of its Shock Sting. Electric attacks hurt!'
        ]
    },
    {
        name: 'Ranger Flint', sprite: '\u{1F9D1}\u200D\u{1F3ED}',
        dialogue: [
            'Welcome to Iron Peak Mountains! The air is thin up here, but the views are worth it.',
            'The Crystal Yeti is the mightiest creature in these peaks. Few have caught one!',
            'Frost Wolves hunt in the snowfields. They are fast and hit hard with ice attacks.',
            'There is a small alpine lake deeper in — good for fishing if you have a pole.'
        ]
    }
];

// --- STORE ITEMS ---
const STORE_ITEMS = [
    // Equipment
    { id: 'potion', name: 'Health Potion', desc: 'Restores 30 HP', price: 40, icon: '\u{1F9EA}', stock: 10, cat: 'equip' },
    { id: 'shield', name: 'Wooden Shield', desc: '+3 Def, block in battle (Shift)', price: 80, icon: '\u{1F6E1}\uFE0F', stock: 1, cat: 'equip' },
    { id: 'sword', name: 'Iron Sword', desc: '+5 Atk, faster slash in battle', price: 100, icon: '\u{2694}\uFE0F', stock: 1, cat: 'equip' },
    { id: 'staff', name: 'Magic Staff', desc: 'Shoot fireballs in battle!', price: 150, icon: '\u{1FA84}', stock: 1, cat: 'equip' },
    { id: 'fishpole', name: 'Fishing Pole', desc: 'Fish at the lake! Eat or sell fish.', price: 60, icon: '\u{1F3A3}', stock: 1, cat: 'equip' },
    // Building Materials
    { id: 'wood', name: 'Wood Planks', desc: 'Basic building material', price: 20, icon: '\u{1FAB5}', stock: 20, cat: 'build' },
    { id: 'stone', name: 'Stone Blocks', desc: 'Sturdy building material', price: 30, icon: '\u{1FAA8}', stock: 15, cat: 'build' },
    { id: 'nails', name: 'Iron Nails', desc: 'Holds everything together', price: 10, icon: '\u{1F529}', stock: 25, cat: 'build' },
    { id: 'glass', name: 'Glass Panes', desc: 'For windows', price: 30, icon: '\u{1FA9F}', stock: 10, cat: 'build' },
    { id: 'rope', name: 'Rope', desc: 'Useful for building', price: 20, icon: '\u{1FAA2}', stock: 8, cat: 'build' }
];

// Track remaining merchant stock
const merchantStock = {};
STORE_ITEMS.forEach(item => { merchantStock[item.id] = item.stock; });

// --- FISH TYPES ---
// Fish types - rarity shifts with experience (more catches = better fish)
// hp < 0 means eating it hurts you
const FISH_TYPES = [
    // Pond/lake fish (default)
    { id: 'milfoil',   name: 'Milfoil',       icon: '\u{1FAB4}', rarity: 0.15, sellPrice: 0,   hp: -5,  desc: 'Gross weed. Eat and get gas.', water: 'pond' },
    { id: 'boot',      name: 'Old Boot',       icon: '\u{1F462}', rarity: 0.10, sellPrice: 0,   hp: -10, desc: 'A soggy boot. Eat and get sick.', water: 'pond' },
    { id: 'pikeminnow',name: 'Pike Minnow',    icon: '\u{1F41F}', rarity: 0.30, sellPrice: 5,   hp: 8,   desc: 'Tiny fish. Not worth much.', water: 'pond' },
    { id: 'bass',      name: 'Bass',           icon: '\u{1F41F}', rarity: 0.20, sellPrice: 25,  hp: 20,  desc: 'Medium catch. Decent meal.', water: 'pond' },
    { id: 'trout',     name: 'Trout',          icon: '\u{1F41F}', rarity: 0.12, sellPrice: 50,  hp: 35,  desc: 'Good size. Tasty and valuable.', water: 'pond' },
    { id: 'kokanee',   name: 'Kokanee',        icon: '\u{1F420}', rarity: 0.05, sellPrice: 120, hp: 60,  desc: 'Large and prized. Very valuable!', water: 'pond' },
    // Ocean fish (beach)
    { id: 'seaweed',   name: 'Seaweed',        icon: '\u{1FAB4}', rarity: 0.15, sellPrice: 2,   hp: 3,   desc: 'Salty seaweed. Barely edible.', water: 'ocean' },
    { id: 'perch',     name: 'Perch',          icon: '\u{1F41F}', rarity: 0.25, sellPrice: 10,  hp: 12,  desc: 'Small ocean fish. Common catch.', water: 'ocean' },
    { id: 'rockfish',  name: 'Rockfish',       icon: '\u{1F41F}', rarity: 0.20, sellPrice: 40,  hp: 25,  desc: 'A solid catch from the rocks.', water: 'ocean' },
    { id: 'flounder',  name: 'Flounder',       icon: '\u{1F41F}', rarity: 0.15, sellPrice: 45,  hp: 28,  desc: 'Flatfish. Good eating.', water: 'ocean' },
    { id: 'chinook',   name: 'Chinook Salmon', icon: '\u{1F420}', rarity: 0.08, sellPrice: 100, hp: 50,  desc: 'King of salmon! Highly prized.', water: 'ocean' },
    { id: 'halibut',   name: 'Halibut',        icon: '\u{1F420}', rarity: 0.05, sellPrice: 150, hp: 65,  desc: 'Massive flatfish. Incredible value!', water: 'ocean' },
    // Mountain lake fish
    { id: 'algae',     name: 'Alpine Algae',   icon: '\u{1FAB4}', rarity: 0.12, sellPrice: 0,   hp: -3,  desc: 'Cold slimy algae. Unpleasant.', water: 'mountain' },
    { id: 'mtn_trout', name: 'Mountain Trout', icon: '\u{1F41F}', rarity: 0.30, sellPrice: 30,  hp: 22,  desc: 'Cold water trout. Fresh and clean.', water: 'mountain' },
    { id: 'char',      name: 'Arctic Char',    icon: '\u{1F420}', rarity: 0.10, sellPrice: 80,  hp: 45,  desc: 'Rare mountain fish. Excellent!', water: 'mountain' }
];

// --- WEAPON DEFINITIONS (for battle) ---
const WEAPONS = {
    shovel:  { name: 'Shovel',      range: 40, speed: 0.6, damage: 1.0, color: '#aaa',    type: 'melee' },
    sword:   { name: 'Iron Sword',  range: 55, speed: 1.0, damage: 1.5, color: '#c0c0c0', type: 'melee' },
    staff:   { name: 'Magic Staff', range: 0,  speed: 0.8, damage: 1.2, color: '#e879f9', type: 'ranged' }
};

// --- BUILD RECIPES ---
const BUILD_RECIPES = [
    { id: 'cabin', name: 'Small Cabin', desc: 'A cozy place to rest', requires: { wood: 5, stone: 3, nails: 4 }, sprite: '\u{1F3E0}' },
    { id: 'workshop', name: 'Workshop', desc: 'Craft better equipment', requires: { wood: 8, stone: 5, nails: 6, glass: 2 }, sprite: '\u{1F3ED}' },
    { id: 'watchtower', name: 'Watchtower', desc: 'See enemies from afar', requires: { wood: 10, stone: 8, nails: 5, rope: 3 }, sprite: '\u{1F3F0}' },
    { id: 'cart', name: 'Wooden Cart', desc: 'A vehicle for traveling', requires: { wood: 6, nails: 4, rope: 2 }, sprite: '\u{1F6D2}' }
];

// ============================================================
// UNIVERSAL CANVAS SCALING
// ============================================================
// Scales a canvas of internal resolution (iw x ih) to fit the viewport
// while maintaining aspect ratio and pixel-perfect rendering
function scaleCanvasToFit(canvas, iw, ih) {
    canvas.width = iw;
    canvas.height = ih;
    canvas.classList.add('pixel-canvas');

    function resize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scale = Math.min(vw / iw, vh / ih);
        canvas.style.width = Math.floor(iw * scale) + 'px';
        canvas.style.height = Math.floor(ih * scale) + 'px';
    }
    resize();
    window.addEventListener('resize', resize);
    return resize;
}

// Standard game resolution (SNES-like)
const GAME_W = 512, GAME_H = 448;

// ============================================================
// TITLE SCREEN RENDERER (pixel-art canvas)
// ============================================================
(function initTitleScreen() {
    const tc = document.getElementById('title-canvas');
    if (!tc) return;
    const c = tc.getContext('2d');
    // Draw at 256x224 internally, canvas is 512x448, CSS fills viewport
    const W = 256, H = 224;
    tc.width = 512;
    tc.height = 448;
    c.scale(2, 2); // everything drawn at 2x

    // Pre-generate terrain
    const mountains = [];
    for (let i = 0; i < 3; i++) {
        const pts = [];
        for (let x = 0; x <= W; x += 4) {
            pts.push(80 + i * 20 + Math.sin(x * 0.02 + i * 2) * 15 + Math.sin(x * 0.05 + i) * 8);
        }
        mountains.push(pts);
    }

    // Stars
    const stars = [];
    for (let i = 0; i < 40; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * 80, brightness: 0.3 + Math.random() * 0.7, speed: 0.5 + Math.random() * 2 });
    }

    // Waterfall particles
    const waterDrops = [];
    for (let i = 0; i < 30; i++) {
        waterDrops.push({ x: W / 2 - 8 + Math.random() * 16, y: Math.random() * 80, speed: 0.5 + Math.random() * 1.5 });
    }

    // Torch flames (on cliff edges)
    const torches = [
        { x: 50, y: 100 }, { x: 206, y: 100 },
        { x: 30, y: 140 }, { x: 226, y: 140 }
    ];

    // Rat that sneaks across every 15 seconds
    const rat = {
        x: -20, y: H - 12,
        phase: 'waiting',
        timer: 0,
        flipX: false,
        legFrame: 0
    };

    const cat = {
        x: -30, y: H - 14,
        phase: 'waiting',  // waiting -> chasing -> looking -> meowing -> resuming -> waiting
        timer: 0,
        legFrame: 0,
        meowTimer: 0
    };

    // Bats that flutter around every 30 seconds
    const bats = [];
    for (let i = 0; i < 3; i++) {
        bats.push({
            x: -30 - i * 20, y: 30 + i * 15,
            vx: 0, vy: 0,
            wingFrame: i * 10,
            phase: 'waiting', // waiting -> flying -> exiting -> waiting
            timer: 1800 + i * 40, // staggered start
            targetX: 0, targetY: 0
        });
    }

    // Flying Zord (dragon silhouette that glides across when idle)
    const flyingZord = {
        x: -40, y: 55,
        phase: 'waiting', // waiting -> flyingIn -> hovering -> flyingOut -> waiting
        timer: 0,
        wingFrame: 0,
        dir: 1 // 1 = left to right, -1 = right to left
    };

    const TITLE_TEXT = 'ZORDPATH';
    const SUBTITLE = 'JOURNEY THROUGH THE WORLDS OF KNOWLEDGE';

    let frame = 0;
    let running = true;

    function drawPixelRect(x, y, w, h, color) {
        c.fillStyle = color;
        c.fillRect(Math.floor(x), Math.floor(y), w, h);
    }

    function render() {
        if (!running) return;
        frame++;

        // --- SKY (brightness adjusts with moon phase) ---
        // moonLight: 0 = new moon (darkest), 1 = full moon (brightest)
        const moonPhase = stats.moonDay < 15 ? stats.moonDay / 15 : (30 - stats.moonDay) / 15;
        const ml = moonPhase * 0.6; // max 60% brightness boost

        for (let y = 0; y < H; y++) {
            const t = y / H;
            let r, g, b;
            if (t < 0.35) {
                r = Math.floor((10 + t * 60) * (1 + ml * 0.4));
                g = Math.floor((10 + t * 80) * (1 + ml * 0.5));
                b = Math.floor((40 + t * 120) * (1 + ml * 0.3));
            } else if (t < 0.55) {
                const ht = (t - 0.35) / 0.2;
                r = Math.floor((31 + ht * 50) * (1 + ml * 0.3));
                g = Math.floor((38 + ht * 60) * (1 + ml * 0.3));
                b = Math.floor((82 + ht * 30) * (1 + ml * 0.2));
            } else {
                const gt = (t - 0.55) / 0.45;
                r = Math.floor((25 + gt * 10) * (1 + ml * 0.2));
                g = Math.floor((40 + gt * 5) * (1 + ml * 0.2));
                b = Math.floor((20 + gt * 10) * (1 + ml * 0.15));
            }
            drawPixelRect(0, y, W, 1, `rgb(${r},${g},${b})`);
        }

        // --- STARS (brighter on full moon) ---
        stars.forEach(s => {
            const twinkle = Math.sin(frame * 0.05 * s.speed + s.x) * 0.4 + 0.6;
            const bright = Math.min(255, Math.floor(s.brightness * twinkle * 255 * (1 + ml * 0.3)));
            const sz = moonPhase > 0.7 ? 2 : 1; // bigger stars on bright nights
            drawPixelRect(s.x, s.y, sz, sz, `rgb(${bright},${bright},${Math.min(255, bright + 40)})`);
        });

        // --- MOUNTAINS (parallax layers) ---
        const mColors = ['#1a2a1a', '#152015', '#0f180f'];
        mountains.forEach((pts, i) => {
            const offset = Math.sin(frame * 0.003 * (i + 1)) * (3 - i);
            c.fillStyle = mColors[i];
            c.beginPath();
            c.moveTo(0, H);
            pts.forEach((y, xi) => {
                c.lineTo(xi * 4 + offset, y + i * 5);
            });
            c.lineTo(W, H);
            c.closePath();
            c.fill();
        });

        // --- CLIFF WALLS ---
        // Left cliff
        for (let y = 70; y < H; y += 2) {
            const w = 55 + Math.sin(y * 0.1) * 8 + Math.sin(y * 0.3) * 3;
            const shade = 35 + Math.sin(y * 0.15 + frame * 0.01) * 5;
            drawPixelRect(0, y, w, 2, `rgb(${shade + 5},${shade},${shade - 5})`);
            // Brick lines
            if (y % 8 === 0) drawPixelRect(0, y, w, 1, `rgb(${shade - 8},${shade - 10},${shade - 12})`);
        }
        // Right cliff
        for (let y = 70; y < H; y += 2) {
            const w = 55 + Math.sin(y * 0.1 + 2) * 8 + Math.sin(y * 0.3 + 1) * 3;
            const shade = 35 + Math.sin(y * 0.15 + frame * 0.01 + 1) * 5;
            drawPixelRect(W - w, y, w, 2, `rgb(${shade + 5},${shade},${shade - 5})`);
            if (y % 8 === 0) drawPixelRect(W - w, y, w, 1, `rgb(${shade - 8},${shade - 10},${shade - 12})`);
        }

        // --- WATERFALL ---
        const wfX = W / 2 - 10;
        const wfW = 20;
        for (let y = 90; y < H - 10; y += 2) {
            const shimmer = Math.sin((y + frame * 2) * 0.3) * 20;
            const r = 80 + shimmer;
            const g = 150 + shimmer;
            const b = 200 + shimmer * 0.5;
            drawPixelRect(wfX, y, wfW, 2, `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`);
        }
        // Waterfall spray
        waterDrops.forEach(d => {
            d.y += d.speed;
            if (d.y > H - 10) { d.y = 90; d.x = W / 2 - 8 + Math.random() * 16; }
            const alpha = 0.3 + Math.sin(frame * 0.1 + d.x) * 0.2;
            drawPixelRect(d.x, d.y, 1, 2, `rgba(180,220,240,${alpha})`);
        });
        // Splash at bottom
        for (let i = 0; i < 5; i++) {
            const sx = W / 2 - 15 + Math.sin(frame * 0.08 + i * 1.3) * 15;
            const sy = H - 14 + Math.sin(frame * 0.12 + i) * 3;
            drawPixelRect(sx, sy, 2, 2, `rgba(200,235,255,${0.3 + Math.sin(frame * 0.1 + i) * 0.2})`);
        }

        // --- TORCHES ---
        torches.forEach((t, ti) => {
            // Pole
            drawPixelRect(t.x, t.y, 2, 12, '#5a4020');
            // Flame (animated)
            const fh = 5 + Math.sin(frame * 0.15 + ti * 2) * 2;
            const fw = 3 + Math.sin(frame * 0.2 + ti) * 1;
            // Orange core
            drawPixelRect(t.x - fw / 2, t.y - fh, fw + 2, fh, `rgb(${200 + Math.floor(Math.sin(frame*0.2+ti)*30)},${100 + Math.floor(Math.sin(frame*0.15+ti)*40)},20)`);
            // Yellow tip
            drawPixelRect(t.x, t.y - fh - 2, 2, 3, `rgb(255,${200 + Math.floor(Math.sin(frame*0.3+ti)*30)},60)`);
            // Glow
            c.fillStyle = `rgba(255,150,50,${0.03 + Math.sin(frame * 0.1 + ti) * 0.015})`;
            c.beginPath();
            c.arc(t.x + 1, t.y - 2, 20, 0, Math.PI * 2);
            c.fill();
        });

        // --- VINES on cliff edges ---
        for (let y = 70; y < H; y += 6) {
            const lx = 50 + Math.sin(y * 0.15) * 8;
            const rx = W - 50 - Math.sin(y * 0.15 + 2) * 8;
            drawPixelRect(lx, y, 2, 4, `rgb(30,${60 + Math.floor(Math.sin(y*0.2)*15)},25)`);
            drawPixelRect(rx, y, 2, 4, `rgb(30,${60 + Math.floor(Math.sin(y*0.2+1)*15)},25)`);
            // Leaves
            if (y % 12 === 0) {
                drawPixelRect(lx + 2, y, 3, 2, `rgb(40,${80 + Math.floor(Math.sin(y)*10)},35)`);
                drawPixelRect(rx - 3, y, 3, 2, `rgb(40,${80 + Math.floor(Math.sin(y+1)*10)},35)`);
            }
        }

        // --- MOON (phase based on launches) ---
        // Draw using clipping so only the lit part is visible against the sky
        const moonX = W - 35, moonY = 25, moonR = 12;
        const moonDay = stats.moonDay; // 0-29, 15 = full
        const mPhase = moonDay < 15 ? moonDay / 15 : (30 - moonDay) / 15; // 0=new, 1=full

        if (mPhase > 0.02) { // Don't draw on new moon
            c.save();
            // Clip to moon circle
            c.beginPath();
            c.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            c.clip();

            // Draw the lit portion by filling moon then erasing shadow with sky
            // Full moon surface
            c.fillStyle = '#e8e0c8';
            c.fillRect(moonX - moonR, moonY - moonR, moonR * 2, moonR * 2);

            // Craters (drawn before shadow so they only show on lit part)
            c.fillStyle = '#d0c8a8';
            c.beginPath(); c.arc(moonX - 3, moonY - 2, 2.5, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(moonX + 4, moonY + 4, 2, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(moonX - 1, moonY + 5, 1.5, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#c8c0a0';
            c.beginPath(); c.arc(moonX + 2, moonY - 4, 1.5, 0, Math.PI * 2); c.fill();

            // Erase the unlit part with the actual sky color at that position
            // Sample the sky gradient at the moon's Y position
            const skyT = moonY / H;
            const skyR = Math.floor((10 + skyT * 60) * (1 + ml * 0.4));
            const skyG = Math.floor((10 + skyT * 80) * (1 + ml * 0.5));
            const skyB = Math.floor((40 + skyT * 120) * (1 + ml * 0.3));

            if (mPhase < 1) {
                // Shadow circle offset to create crescent/gibbous shape
                const shadowOff = (1 - mPhase) * moonR * 2;
                const shadowDir = moonDay < 15 ? 1 : -1;
                c.fillStyle = `rgb(${skyR},${skyG},${skyB})`;
                c.beginPath();
                c.arc(moonX + (shadowOff - moonR) * shadowDir, moonY, moonR + 0.5, 0, Math.PI * 2);
                c.fill();
            }

            c.restore();

            // Subtle glow around lit portion (scales with phase)
            c.fillStyle = `rgba(232,224,192,${0.03 + mPhase * 0.06})`;
            c.beginPath();
            c.arc(moonX, moonY, moonR + 6 + mPhase * 4, 0, Math.PI * 2);
            c.fill();
        }

        // --- LOGO FRAME ---
        const fx = 38, fy = 24, fw = 180, fh = 70;
        // Dark background
        drawPixelRect(fx, fy, fw, fh, '#0a0a18');
        // Border (double line, gold)
        c.strokeStyle = '#8a7a50';
        c.lineWidth = 1;
        c.strokeRect(fx, fy, fw, fh);
        c.strokeStyle = '#6a5a30';
        c.strokeRect(fx - 2, fy - 2, fw + 4, fh + 4);
        // Corner decorations
        [[fx - 2, fy - 2], [fx + fw, fy - 2], [fx - 2, fy + fh], [fx + fw, fy + fh]].forEach(([cx, cy]) => {
            drawPixelRect(cx, cy, 5, 5, '#c4a663');
            drawPixelRect(cx + 1, cy + 1, 3, 3, '#e8d090');
        });
        // Green vine border
        for (let x = fx + 6; x < fx + fw - 4; x += 6) {
            drawPixelRect(x, fy - 1, 4, 2, `rgb(40,${80 + ((x * 7) % 20)},30)`);
            drawPixelRect(x, fy + fh - 1, 4, 2, `rgb(40,${80 + ((x * 7 + 10) % 20)},30)`);
        }

        // Helper: draw outlined text (black outline for crispness)
        function drawOutlinedText(text, x, y, font, fillColor) {
            c.font = font;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            // Black outline (4 directions + diagonals)
            c.fillStyle = '#000';
            for (let ox = -1; ox <= 1; ox++) {
                for (let oy = -1; oy <= 1; oy++) {
                    if (ox === 0 && oy === 0) continue;
                    c.fillText(text, x + ox, y + oy);
                }
            }
            // Fill
            c.fillStyle = fillColor;
            c.fillText(text, x, y);
        }

        // "The Legend of" above title
        drawOutlinedText('THE  LEGEND  OF', W / 2, fy + 12, '6px "Press Start 2P", monospace', '#ccccdd');

        // Main title
        c.font = '18px "Press Start 2P", monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        // Deep shadow
        c.fillStyle = '#302010';
        c.fillText(TITLE_TEXT, W / 2 + 1, fy + 32 + 1);
        // Black outline
        c.fillStyle = '#000';
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                c.fillText(TITLE_TEXT, W / 2 + ox, fy + 32 + oy);
            }
        }
        // Gold fill
        c.fillStyle = '#f0d070';
        c.fillText(TITLE_TEXT, W / 2, fy + 32);
        // Top highlight
        c.fillStyle = '#fff8d0';
        c.fillText(TITLE_TEXT, W / 2, fy + 31);

        // Glint on the Z corner (top-left of the Z)
        c.font = '18px "Press Start 2P", monospace';
        c.textAlign = 'center';
        const textW = c.measureText(TITLE_TEXT).width;
        const zCornerX = W / 2 - textW / 2 + 1;
        const zCornerY = fy + 24;

        // Glint cycle: dramatic star burst every 30 seconds
        // Phase 1 (0-60): fast flash in, rays extend dramatically
        // Phase 2 (60-120): rays at full extension, hold
        // Phase 3 (120-180): rays pull back in and fade
        const glintCycle = frame % 1800; // 30 sec at 60fps
        if (glintCycle < 180) { // active for 3 seconds
            const phase = glintCycle < 60 ? 0 : glintCycle < 120 ? 1 : 2;
            let intensity, rayLen;

            if (phase === 0) {
                // Burst out
                const t = glintCycle / 60;
                intensity = Math.min(1, t * 2);
                rayLen = t * 40;
            } else if (phase === 1) {
                // Hold at full
                intensity = 1;
                rayLen = 40;
            } else {
                // Pull back in and fade
                const t = (glintCycle - 120) / 60;
                intensity = 1 - t;
                rayLen = 40 * (1 - t);
            }

            // Core white point
            c.globalAlpha = intensity;
            c.fillStyle = '#ffffff';
            c.fillRect(zCornerX - 1, zCornerY - 1, 3, 3);

            // Star rays - 4 main directions (long)
            c.fillStyle = '#fffce0';
            for (let r = 0; r < rayLen; r += 1) {
                const fade = 1 - r / rayLen;
                c.globalAlpha = intensity * fade * 0.8;
                c.fillRect(zCornerX - r, zCornerY, 1, 1);
                c.fillRect(zCornerX + r, zCornerY, 1, 1);
                c.fillRect(zCornerX, zCornerY - r, 1, 1);
                c.fillRect(zCornerX, zCornerY + r, 1, 1);
            }

            // Diagonal rays (70% length)
            const diagLen = rayLen * 0.7;
            c.fillStyle = '#fff8d0';
            for (let r = 0; r < diagLen; r += 1) {
                const fade = 1 - r / diagLen;
                c.globalAlpha = intensity * fade * 0.5;
                const d = Math.floor(r * 0.707);
                c.fillRect(zCornerX - d, zCornerY - d, 1, 1);
                c.fillRect(zCornerX + d, zCornerY - d, 1, 1);
                c.fillRect(zCornerX - d, zCornerY + d, 1, 1);
                c.fillRect(zCornerX + d, zCornerY + d, 1, 1);
            }

            // Glow halo
            c.globalAlpha = intensity * 0.3;
            c.fillStyle = '#fff8d0';
            c.beginPath();
            c.arc(zCornerX, zCornerY, 4 + rayLen * 0.15, 0, Math.PI * 2);
            c.fill();

            c.globalAlpha = 1;
        }

        // Subtitle
        drawOutlinedText('WORLDS OF KNOWLEDGE', W / 2, fy + 55, '5px "Press Start 2P", monospace', '#9999bb');

        // --- GROUND DETAIL ---
        for (let x = 0; x < W; x += 2) {
            const gh = 4 + Math.sin(x * 0.3) * 2;
            drawPixelRect(x, H - gh, 2, gh, `rgb(${20 + (x % 6)},${35 + (x % 8)},${15 + (x % 5)})`);
        }

        // --- GRASS TUFTS ---
        for (let x = 10; x < W; x += 14) {
            if (x > 60 && x < 196) continue;
            const gy = H - 6 - Math.sin(x * 0.5) * 2;
            const sway = Math.sin(frame * 0.03 + x * 0.1) * 1;
            drawPixelRect(x + sway, gy - 4, 1, 4, '#2a5520');
            drawPixelRect(x + 2 + sway, gy - 5, 1, 5, '#356628');
            drawPixelRect(x + 4 - sway, gy - 3, 1, 3, '#2a5520');
        }

        // --- BATS ---
        bats.forEach(bat => {
            bat.timer--;
            bat.wingFrame++;

            if (bat.phase === 'waiting') {
                if (bat.timer <= 0) {
                    bat.phase = 'flying';
                    bat.x = -20;
                    bat.y = 20 + Math.random() * 40;
                    bat.targetX = 40 + Math.random() * (W - 80);
                    bat.targetY = 20 + Math.random() * 50;
                    bat.timer = 300 + Math.floor(Math.random() * 200); // flutter for 5-8 sec
                }
            } else if (bat.phase === 'flying') {
                // Fly toward target with fluttery movement
                const dx = bat.targetX - bat.x;
                const dy = bat.targetY - bat.y;
                bat.x += dx * 0.02 + Math.sin(bat.wingFrame * 0.1) * 0.8;
                bat.y += dy * 0.02 + Math.cos(bat.wingFrame * 0.13) * 0.6;
                // Pick new target occasionally
                if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                    bat.targetX = 30 + Math.random() * (W - 60);
                    bat.targetY = 15 + Math.random() * 50;
                }
                if (bat.timer <= 0) {
                    bat.phase = 'exiting';
                    bat.targetX = W + 30;
                    bat.targetY = -20;
                }
            } else if (bat.phase === 'exiting') {
                bat.x += 1.5;
                bat.y -= 0.5 + Math.sin(bat.wingFrame * 0.15) * 0.3;
                if (bat.x > W + 40) {
                    bat.phase = 'waiting';
                    bat.timer = 1800; // 30 seconds
                }
            }

            // Draw bat
            if (bat.phase !== 'waiting') {
                const bx = Math.floor(bat.x);
                const by = Math.floor(bat.y);
                const wing = Math.sin(bat.wingFrame * 0.3) * 3;
                // Body
                drawPixelRect(bx - 1, by - 1, 3, 3, '#2a1a2a');
                // Wings
                drawPixelRect(bx - 4 - wing, by - 1, 3, 2, '#3a2a3a');
                drawPixelRect(bx + 2 + wing, by - 1, 3, 2, '#3a2a3a');
                // Wing tips
                drawPixelRect(bx - 5 - wing, by - 2, 2, 1, '#3a2a3a');
                drawPixelRect(bx + 4 + wing, by - 2, 2, 1, '#3a2a3a');
                // Eyes
                drawPixelRect(bx - 1, by - 1, 1, 1, '#ff4444');
                drawPixelRect(bx + 1, by - 1, 1, 1, '#ff4444');
            }
        });

        // --- FLYING ZORD (dragon silhouette) ---
        flyingZord.timer++;
        flyingZord.wingFrame++;

        if (flyingZord.phase === 'waiting') {
            // Wait ~20 seconds between appearances (when no rat/cat happening)
            if (flyingZord.timer > 1200 && rat.phase === 'waiting' && cat.phase === 'waiting') {
                flyingZord.phase = 'flyingIn';
                flyingZord.timer = 0;
                flyingZord.dir = Math.random() < 0.5 ? 1 : -1;
                flyingZord.x = flyingZord.dir > 0 ? -40 : W + 40;
                flyingZord.y = 30 + Math.random() * 30;
            }
        } else if (flyingZord.phase === 'flyingIn') {
            flyingZord.x += 0.3 * flyingZord.dir;
            flyingZord.y += Math.sin(flyingZord.wingFrame * 0.02) * 0.15;
            if ((flyingZord.dir > 0 && flyingZord.x >= W * 0.5) || (flyingZord.dir < 0 && flyingZord.x <= W * 0.5)) {
                flyingZord.phase = 'hovering';
                flyingZord.timer = 0;
            }
        } else if (flyingZord.phase === 'hovering') {
            flyingZord.y += Math.sin(flyingZord.wingFrame * 0.03) * 0.2;
            if (flyingZord.timer > 180) { // hover ~3 seconds
                flyingZord.phase = 'flyingOut';
                flyingZord.dir *= -1; // turn around
            }
        } else if (flyingZord.phase === 'flyingOut') {
            flyingZord.x += 0.35 * flyingZord.dir; // fly out facing the new direction
            flyingZord.y += Math.sin(flyingZord.wingFrame * 0.02) * 0.15;
            if ((flyingZord.dir > 0 && flyingZord.x < -40) || (flyingZord.dir < 0 && flyingZord.x > W + 40)) {
                flyingZord.phase = 'waiting';
                flyingZord.timer = 0;
            }
        }

        // Draw flying Zord
        if (flyingZord.phase !== 'waiting') {
            const zx = Math.floor(flyingZord.x);
            const zy = Math.floor(flyingZord.y);
            const zd = flyingZord.dir;
            const wf = Math.sin(flyingZord.wingFrame * 0.08) * 4;

            // Wings
            drawPixelRect(zx - 12 * zd - wf * zd, zy - 2, 10, 5, '#1a3a20');
            drawPixelRect(zx - 16 * zd - wf * zd, zy - 4, 6, 4, '#143018');
            drawPixelRect(zx + 4 * zd + wf * zd, zy - 2, 10, 5, '#1a3a20');
            drawPixelRect(zx + 10 * zd + wf * zd, zy - 4, 6, 4, '#143018');
            // Body
            drawPixelRect(zx - 4, zy - 2, 8, 6, '#2a5a30');
            drawPixelRect(zx - 3, zy - 1, 6, 4, '#3a7a40');
            // Head
            drawPixelRect(zx + 5 * zd, zy - 3, 5 * zd, 4, '#2a5a30');
            drawPixelRect(zx + 8 * zd, zy - 2, 2 * zd, 2, '#3a7a40');
            // Eye
            drawPixelRect(zx + 7 * zd, zy - 2, 1, 1, '#ff4040');
            // Tail
            const tw = Math.sin(flyingZord.wingFrame * 0.05) * 2;
            drawPixelRect(zx - 6 * zd, zy + tw, 6 * -zd, 2, '#1a4a20');
            drawPixelRect(zx - 10 * zd, zy - 1 + tw, 4 * -zd, 2, '#143818');
        }

        // --- RAT ---
        rat.timer++;
        const stopX = W * 0.7;

        if (rat.phase === 'waiting') {
            if (rat.timer > 3600) { // 1 minute
                rat.phase = 'sneaking';
                rat.timer = 0;
                rat.x = -10;
                rat.flipX = false;
                // Trigger cat 5 seconds later
                cat.timer = 300;
                cat.phase = 'countdown';
            }
        } else if (rat.phase === 'sneaking') {
            rat.x += 0.6;
            rat.legFrame++;
            if (rat.x >= stopX) {
                rat.phase = 'looking';
                rat.timer = 0;
            }
        } else if (rat.phase === 'looking') {
            if (rat.timer > 120) {
                rat.phase = 'fleeing';
                rat.flipX = true;
                rat.timer = 0;
            }
        } else if (rat.phase === 'fleeing') {
            rat.x += 1.2;
            rat.legFrame++;
            if (rat.x > W + 20) {
                rat.phase = 'waiting';
                rat.timer = 0;
                rat.x = -20;
            }
        }

        // Draw rat
        if (rat.phase !== 'waiting') {
            const rx = Math.floor(rat.x);
            const ry = rat.y;
            const dir = rat.flipX ? -1 : 1;
            c.fillStyle = '#5a4a3a';
            drawPixelRect(rx - 3, ry - 4, 7, 4, '#5a4a3a');
            drawPixelRect(rx + dir * 4, ry - 5, 3 * dir, 3, '#6a5a48');
            drawPixelRect(rx + dir * 5, ry - 7, 2, 2, '#7a6a58');
            if (rat.phase === 'looking') {
                drawPixelRect(rx + dir * 5, ry - 5, 1, 1, '#ff3333');
            } else {
                drawPixelRect(rx + dir * 6, ry - 4, 1, 1, '#111');
            }
            c.strokeStyle = '#4a3a2a'; c.lineWidth = 1; c.beginPath();
            c.moveTo(rx - dir * 3, ry - 2);
            const tailWag = Math.sin(rat.legFrame * 0.3) * 2;
            c.quadraticCurveTo(rx - dir * 8, ry - 6 + tailWag, rx - dir * 10, ry - 3 + tailWag);
            c.stroke();
            c.fillStyle = '#4a3a2a';
            if (rat.phase === 'sneaking' || rat.phase === 'fleeing') {
                const legAnim = Math.sin(rat.legFrame * 0.5) * 1.5;
                drawPixelRect(rx - 2, ry, 1, 2 + legAnim, '#4a3a2a');
                drawPixelRect(rx + 2, ry, 1, 2 - legAnim, '#4a3a2a');
            } else {
                drawPixelRect(rx - 2, ry, 1, 2, '#4a3a2a');
                drawPixelRect(rx + 2, ry, 1, 2, '#4a3a2a');
            }
            drawPixelRect(rx + dir * 7, ry - 4, 1, 1, '#e8a0a0');
        }

        // --- CAT (chases rat 15 seconds later) ---
        if (cat.phase === 'countdown') {
            cat.timer--;
            if (cat.timer <= 0) {
                cat.phase = 'chasing';
                cat.x = -20;
                cat.legFrame = 0;
                cat.timer = 0;
            }
        } else if (cat.phase === 'chasing') {
            cat.x += 1.0;
            cat.legFrame++;
            if (cat.x >= W * 0.5) {
                cat.phase = 'looking';
                cat.timer = 0;
            }
        } else if (cat.phase === 'looking') {
            // Cat stops and looks at the player
            cat.timer++;
            if (cat.timer > 60) {
                cat.phase = 'meowing';
                cat.timer = 0;
                cat.meowTimer = 0;
                playSound('meow');
            }
        } else if (cat.phase === 'meowing') {
            cat.timer++;
            cat.meowTimer++;
            if (cat.timer > 90) {
                cat.phase = 'resuming';
                cat.timer = 0;
            }
        } else if (cat.phase === 'resuming') {
            cat.x += 1.5;
            cat.legFrame++;
            if (cat.x > W + 30) {
                cat.phase = 'waiting';
                cat.timer = 0;
                cat.x = -30;
            }
        }

        // Draw cat
        if (cat.phase !== 'waiting' && cat.phase !== 'countdown') {
            const cx2 = Math.floor(cat.x);
            const cy2 = cat.y;
            const isLooking = cat.phase === 'looking' || cat.phase === 'meowing';
            const isMoving = cat.phase === 'chasing' || cat.phase === 'resuming';

            // Body (black cat, slightly bigger than rat)
            drawPixelRect(cx2 - 5, cy2 - 6, 10, 6, '#1a1a1a');
            // Back arch when looking
            if (isLooking) {
                drawPixelRect(cx2 - 4, cy2 - 8, 8, 3, '#1a1a1a');
            }
            // Head
            drawPixelRect(cx2 + 6, cy2 - 8, 5, 5, '#1a1a1a');
            // Ears (pointed)
            drawPixelRect(cx2 + 6, cy2 - 11, 2, 3, '#1a1a1a');
            drawPixelRect(cx2 + 9, cy2 - 11, 2, 3, '#1a1a1a');
            // Inner ears
            drawPixelRect(cx2 + 7, cy2 - 10, 1, 2, '#3a2020');
            drawPixelRect(cx2 + 9, cy2 - 10, 1, 2, '#3a2020');
            // Eyes
            if (isLooking) {
                // Looking at player - big green eyes facing up
                drawPixelRect(cx2 + 7, cy2 - 7, 2, 2, '#30ff30');
                drawPixelRect(cx2 + 10, cy2 - 7, 2, 2, '#30ff30');
                // Slit pupils
                drawPixelRect(cx2 + 7, cy2 - 7, 1, 2, '#000');
                drawPixelRect(cx2 + 10, cy2 - 7, 1, 2, '#000');
            } else {
                drawPixelRect(cx2 + 9, cy2 - 7, 1, 1, '#30dd30');
            }
            // Tail (curvy, upright when looking)
            c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; c.beginPath();
            c.moveTo(cx2 - 5, cy2 - 4);
            if (isLooking) {
                const tw = Math.sin(cat.timer * 0.1) * 3;
                c.quadraticCurveTo(cx2 - 12, cy2 - 14 + tw, cx2 - 8, cy2 - 18 + tw);
            } else {
                const tw = Math.sin(cat.legFrame * 0.2) * 3;
                c.quadraticCurveTo(cx2 - 12, cy2 - 10 + tw, cx2 - 14, cy2 - 6 + tw);
            }
            c.stroke();
            // Legs
            if (isMoving) {
                const la = Math.sin(cat.legFrame * 0.4) * 2;
                drawPixelRect(cx2 - 3, cy2, 2, 3 + la, '#1a1a1a');
                drawPixelRect(cx2 + 3, cy2, 2, 3 - la, '#1a1a1a');
                drawPixelRect(cx2 - 1, cy2, 2, 3 - la, '#1a1a1a');
                drawPixelRect(cx2 + 1, cy2, 2, 3 + la, '#1a1a1a');
            } else {
                drawPixelRect(cx2 - 3, cy2, 2, 3, '#1a1a1a');
                drawPixelRect(cx2 + 3, cy2, 2, 3, '#1a1a1a');
            }
            // Whiskers
            c.strokeStyle = '#444'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(cx2 + 8, cy2 - 5); c.lineTo(cx2 + 14, cy2 - 6); c.stroke();
            c.beginPath(); c.moveTo(cx2 + 8, cy2 - 4); c.lineTo(cx2 + 14, cy2 - 3); c.stroke();

            // Meow visual: cat opens mouth
            if (cat.phase === 'meowing') {
                drawPixelRect(cx2 + 9, cy2 - 4, 2, 2, '#e08080');
            }
        }

        requestAnimationFrame(render);
    }

    // Stop when leaving title
    const observer = new MutationObserver(() => {
        running = tc.closest('.screen.active') !== null;
        if (running) requestAnimationFrame(render);
    });
    observer.observe(tc.closest('.screen'), { attributes: true, attributeFilter: ['class'] });

    render();
})();

// ============================================================
// GAME STATE
// ============================================================
const state = {
    screen: 'title',
    character: null,
    name: '',
    hp: 0,
    maxHp: 0,
    attack: 0,
    defense: 0,
    rubies: 5,
    inventory: { shovel: 1 },
    location: 'cave',
    playerCol: 5,
    playerRow: Math.floor(ROWS / 2),
    facing: 'down',
    defeatedEnemies: [],
    defeatedZones: new Set(),   // track which enemy zone instances are cleared
    builtItems: [],
    fish: {},           // { fishId: count }
    zordList: [],       // [{ nickname, species, sprite, hp, maxHp, attack, element, power, level, xp, catchLocation }]
    zordBench: [],      // indices into zordList (max 3 on bench, these gain XP)
    currentEnemy: null,
    currentLesson: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    battlePlayerHp: 0,
    battleEnemyHp: 0,
    npcDialogueIndex: {},
    inventoryOpen: false,
    dialogueOpen: false,
    paused: false,       // pause movement during menus
    animFrame: 0,
    walkFrame: 0
};

// ============================================================
// SOUND SYSTEM (Web Audio API - no external files needed)
// ============================================================
// Create AudioContext and force-unlock it immediately
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Workaround: browsers block AudioContext until user gesture.
// We attach a one-shot listener to EVERY possible user event to resume it ASAP.
// Also create an inaudible oscillator to "prime" the audio pipeline.
(function forceUnlockAudio() {
    const unlock = () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                // Play a silent buffer to fully unlock on iOS Safari
                const buf = audioCtx.createBuffer(1, 1, 22050);
                const src = audioCtx.createBufferSource();
                src.buffer = buf;
                src.connect(audioCtx.destination);
                src.start(0);
            });
        }
    };
    // Listen on everything - first interaction unlocks permanently
    ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'pointerdown'].forEach(evt => {
        document.addEventListener(evt, unlock, { capture: true, once: false });
    });
    // Also try immediately (works if page was already interacted with, e.g. reload)
    unlock();
})();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'step':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120 + Math.random() * 40, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start(); osc.stop(audioCtx.currentTime + 0.08);
            break;
        case 'gem':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
            // Second tone (sparkle)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(900, audioCtx.currentTime + 0.05);
            osc2.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.2);
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc2.start(audioCtx.currentTime + 0.05); osc2.stop(audioCtx.currentTime + 0.35);
            break;
        case 'hit':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'swing':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
            osc.start(); osc.stop(audioCtx.currentTime + 0.12);
            break;
        case 'shoot':
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'hurt':
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            osc.start(); osc.stop(audioCtx.currentTime + 0.25);
            break;
        case 'victory':
            [523, 659, 784, 1047].forEach((freq, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
                g.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.15);
                g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.3);
                o.start(audioCtx.currentTime + i * 0.15);
                o.stop(audioCtx.currentTime + i * 0.15 + 0.3);
            });
            return; // skip the default osc
        case 'defeat':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
            osc.start(); osc.stop(audioCtx.currentTime + 0.6);
            break;
        case 'block':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
            break;
        case 'meow':
            // Cat meow: rising then falling tone with vibrato
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.12);
            osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.3);
            osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.45);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
            gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.start(); osc.stop(audioCtx.currentTime + 0.5);
            // Add a second harmonic for texture
            const mOsc = audioCtx.createOscillator();
            const mGain = audioCtx.createGain();
            mOsc.connect(mGain); mGain.connect(audioCtx.destination);
            mOsc.type = 'triangle';
            mOsc.frequency.setValueAtTime(750, audioCtx.currentTime);
            mOsc.frequency.linearRampToValueAtTime(1350, audioCtx.currentTime + 0.12);
            mOsc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.3);
            mOsc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.45);
            mGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            mGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
            mOsc.start(); mOsc.stop(audioCtx.currentTime + 0.45);
            return;
        case 'encounter':
            // Dramatic enemy encounter stinger - DUN DUN DUNNN (LOUD)
            [
                { freq: 220, delay: 0, dur: 0.18, type: 'sawtooth', vol: 0.25 },
                { freq: 220, delay: 0.22, dur: 0.18, type: 'sawtooth', vol: 0.25 },
                { freq: 165, delay: 0.45, dur: 0.6, type: 'sawtooth', vol: 0.3 },
                // High accent
                { freq: 440, delay: 0, dur: 0.12, type: 'square', vol: 0.15 },
                { freq: 440, delay: 0.22, dur: 0.12, type: 'square', vol: 0.15 },
                { freq: 330, delay: 0.45, dur: 0.5, type: 'square', vol: 0.18 },
                // Low rumble
                { freq: 55, delay: 0.45, dur: 0.7, type: 'triangle', vol: 0.2 },
                // Extra tension - descending
                { freq: 294, delay: 0.6, dur: 0.4, type: 'sawtooth', vol: 0.12 },
                { freq: 262, delay: 0.7, dur: 0.4, type: 'sawtooth', vol: 0.1 },
            ].forEach(n => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = n.type;
                o.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.delay);
                g.gain.setValueAtTime(n.vol, audioCtx.currentTime + n.delay);
                g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + n.delay + n.dur);
                o.start(audioCtx.currentTime + n.delay);
                o.stop(audioCtx.currentTime + n.delay + n.dur);
            });
            return;
    }
}

// ============================================================
// GEM PICKUP SYSTEM
// ============================================================
const mapGems = { cave: [], town: [], forest: [] };
const gemsNeedRespawn = new Set(); // locations waiting for a quiz answer to respawn

function spawnGems(location) {
    const map = MAPS[location];
    const gems = [];
    const isTemple = location.startsWith('temple_');
    const count = isTemple ? 4 : location === 'forest' ? 8 : location === 'beach' ? 7 : location === 'mountains' ? 6 : location === 'cave' ? 6 : 5;
    const gemValue = isTemple ? (2 + parseInt(location.split('_')[1])) : location === 'forest' ? 2 : location === 'beach' ? 2 : location === 'mountains' ? 3 : 1;
    for (let i = 0; i < count; i++) {
        let r, c, attempts = 0;
        do {
            r = 2 + Math.floor(Math.random() * (ROWS - 4));
            c = 2 + Math.floor(Math.random() * (COLS - 4));
            attempts++;
        } while ((SOLID.has(map[r][c]) || map[r][c] === T.DOOR || map[r][c] === T.STAIRS_UP || map[r][c] === T.STAIRS_DN) && attempts < 50);
        if (attempts < 50) {
            gems.push({ col: c, row: r, value: gemValue, collected: false });
        }
    }
    mapGems[location] = gems;
}

// Initialize gems
spawnGems('cave');
spawnGems('town');
spawnGems('forest');
spawnGems('beach');
spawnGems('mountains');
for (let i = 1; i <= 7; i++) { mapGems['temple_' + i] = []; spawnGems('temple_' + i); }

function checkGemPickup() {
    const gems = mapGems[state.location];
    if (!gems) return;
    for (const gem of gems) {
        if (!gem.collected && gem.col === state.playerCol && gem.row === state.playerRow) {
            gem.collected = true;
            state.rubies += gem.value;
            updateHUD();
            playSound('gem');
            // Mark for respawn after next quiz answer
            if (gems.every(g => g.collected)) {
                gemsNeedRespawn.add(state.location);
            }
        }
    }
}

// Called after answering a quiz question to respawn any depleted gem locations
function tryRespawnGems() {
    for (const loc of gemsNeedRespawn) {
        spawnGems(loc);
    }
    gemsNeedRespawn.clear();
}

function drawGems() {
    const gems = mapGems[state.location];
    if (!gems) return;
    gems.forEach(gem => {
        if (gem.collected) return;
        const x = gem.col * TILE;
        const y = gem.row * TILE;
        const bob = Math.sin(state.animFrame * 0.1 + gem.col + gem.row) * 3;
        // Glow
        const pulse = Math.sin(state.animFrame * 0.08 + gem.col) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(233, 69, 96, ${pulse})`;
        ctx.beginPath();
        ctx.ellipse(x + TILE / 2, y + TILE / 2 + bob, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Gem
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u{1F48E}', x + TILE / 2, y + TILE / 2 + bob);
    });
}

// ============================================================
// CANVAS SETUP (full-screen game canvas with HUD)
// ============================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game canvas = tile map + HUD bar at top (32px)
const HUD_H = 36;
const CANVAS_W = COLS * TILE;
const CANVAS_H = ROWS * TILE + HUD_H;

let resizeGameCanvas;
function resizeCanvas() {
    if (resizeGameCanvas) resizeGameCanvas();
}

function initGameCanvas() {
    resizeGameCanvas = scaleCanvasToFit(canvas, CANVAS_W, CANVAS_H);
}

window.addEventListener('resize', resizeCanvas);

// Draw pixel-art HUD icons
(function drawHudIcons() {
    function px(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    // Inventory icon (chest/bag)
    const inv = document.getElementById('icon-inv');
    if (inv) {
        const c = inv.getContext('2d');
        px(c, 4, 6, 12, 10, '#8a6a30');   // chest body
        px(c, 5, 7, 10, 8, '#a07a40');    // lighter front
        px(c, 3, 5, 14, 2, '#6a5020');    // lid
        px(c, 3, 4, 14, 2, '#7a6030');    // lid top
        px(c, 9, 10, 2, 3, '#f5c842');    // clasp
        px(c, 8, 11, 4, 1, '#c4a050');    // clasp base
    }

    // Map icon (scroll)
    const map = document.getElementById('icon-map');
    if (map) {
        const c = map.getContext('2d');
        px(c, 4, 3, 12, 14, '#c4a060');   // parchment
        px(c, 5, 4, 10, 12, '#d4b878');   // lighter center
        px(c, 3, 2, 2, 16, '#8a6a30');    // left roll
        px(c, 15, 2, 2, 16, '#8a6a30');   // right roll
        px(c, 4, 2, 1, 16, '#a07a40');    // roll highlight
        px(c, 16, 2, 1, 16, '#a07a40');
        // Map lines
        px(c, 7, 6, 6, 1, '#8a7040');
        px(c, 7, 9, 5, 1, '#8a7040');
        px(c, 7, 12, 7, 1, '#8a7040');
        // X mark
        px(c, 12, 6, 2, 2, '#c03030');
    }

    // Zord icon (creature in cage)
    const zord = document.getElementById('icon-zord');
    if (zord) {
        const c = zord.getContext('2d');
        // Cage circle
        px(c, 6, 2, 8, 2, '#888');
        px(c, 4, 4, 2, 10, '#888');
        px(c, 14, 4, 2, 10, '#888');
        px(c, 6, 14, 8, 2, '#888');
        px(c, 6, 2, 2, 14, '#666');       // bar
        px(c, 12, 2, 2, 14, '#666');      // bar
        // Creature inside
        px(c, 7, 7, 6, 5, '#e94560');     // body
        px(c, 8, 5, 4, 3, '#e94560');     // head
        px(c, 8, 6, 2, 1, '#fff');        // eye
        px(c, 11, 6, 2, 1, '#fff');       // eye
    }

    // Help icon (question mark)
    const help = document.getElementById('icon-help');
    if (help) {
        const c = help.getContext('2d');
        px(c, 7, 3, 6, 2, '#5588cc');     // top of ?
        px(c, 13, 3, 2, 4, '#5588cc');    // right curve
        px(c, 10, 7, 3, 2, '#5588cc');    // middle
        px(c, 9, 9, 2, 3, '#5588cc');     // stem
        px(c, 9, 14, 2, 2, '#5588cc');    // dot
        // Lighter highlights
        px(c, 8, 3, 4, 1, '#70a0dd');
        px(c, 9, 14, 1, 1, '#70a0dd');
    }
})();

// ============================================================
// SCREEN MANAGEMENT
// ============================================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screenId);
    if (el) el.classList.add('active');
    state.screen = screenId;
    charSelectRunning = (screenId === 'character');
    if (screenId === 'game') {
        state.paused = false;
        initGameCanvas();
    } else {
        state.paused = true;
    }
}

// ============================================================
// TITLE SCREEN
// ============================================================
document.getElementById('btn-new-game').addEventListener('click', () => {
    showScreen('character');
    renderCharacterSelection();
});

// ============================================================
// CHARACTER CREATION (Canvas-rendered)
// ============================================================
let charSelectCanvas, charSelectCtx;
let charSelectRunning = false;
let charSelectFrame = 0;
let selectedCharIdx = -1;

// Character slot layout on canvas
const CS_W = 640, CS_H = 400;
const charSlots = [];

// Detailed character sprite drawer (32x40 pixel characters)
function drawCharSprite(c, x, y, cls, frame, scale, moving) {
    const P = scale || 2; // pixel size

    // Cape (drawn behind everything)
    if (cls.cape) {
        const capeWave = Math.sin(frame * 0.08) * P;
        const capeDark = cls.cape.replace(/[0-9a-f]{2}/gi, m => Math.max(0, parseInt(m, 16) - 30).toString(16).padStart(2, '0'));
        // Main cape body (flows from shoulders down)
        c.fillStyle = cls.cape;
        c.fillRect(x - 6 * P, y + 1 * P, 12 * P, 14 * P + capeWave);
        // Flare at bottom
        c.fillRect(x - 7 * P, y + 12 * P + capeWave, 14 * P, 4 * P);
        c.fillRect(x - 8 * P, y + 14 * P + capeWave, 16 * P, 3 * P);
        // Darker inner folds
        c.fillStyle = capeDark;
        c.fillRect(x - 2 * P, y + 4 * P, 2 * P, 10 * P + capeWave);
        c.fillRect(x + 3 * P, y + 6 * P, 2 * P, 8 * P + capeWave);
        // Highlight edge
        c.fillStyle = cls.cape.replace(/[0-9a-f]{2}/gi, m => Math.min(255, parseInt(m, 16) + 25).toString(16).padStart(2, '0'));
        c.fillRect(x - 6 * P, y + 1 * P, 2 * P, 14 * P + capeWave);
        // Gold clasp at neck
        c.fillStyle = '#c4a040';
        c.fillRect(x - 4 * P, y + 0.5 * P, 8 * P, P);
        c.fillStyle = '#e0c060';
        c.fillRect(x - P, y, 2 * P, 2 * P);
    }

    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath();
    c.ellipse(x, y + 20 * P, 7 * P, 2 * P, 0, 0, Math.PI * 2);
    c.fill();

    // Leg stride animation (only when moving, subtle)
    const stride = moving ? Math.sin(frame * 0.2) * 1.2 * P : 0;
    const leftLegY = stride;
    const rightLegY = -stride;

    // Legs (pants)
    c.fillStyle = cls.pants || '#4a3a25';
    c.fillRect(x - 4 * P, y + 10 * P + leftLegY, 3 * P, 5 * P);
    c.fillRect(x + 1 * P, y + 10 * P + rightLegY, 3 * P, 5 * P);

    // Boots (move with legs)
    c.fillStyle = '#3d2b1a';
    c.fillRect(x - 5 * P, y + 15 * P + leftLegY, 4 * P, 4 * P);
    c.fillRect(x + 1 * P, y + 15 * P + rightLegY, 4 * P, 4 * P);
    // Boot highlight
    c.fillStyle = '#5a4020';
    c.fillRect(x - 5 * P, y + 15 * P + leftLegY, 4 * P, P);
    c.fillRect(x + 1 * P, y + 15 * P + rightLegY, 4 * P, P);

    // Body / tunic
    c.fillStyle = cls.color;
    c.fillRect(x - 6 * P, y + 1 * P, 12 * P, 10 * P);
    // Tunic shading (darker bottom)
    const darkerColor = cls.color.replace(/[0-9a-f]{2}/gi, (m) => Math.max(0, parseInt(m, 16) - 30).toString(16).padStart(2, '0'));
    c.fillStyle = darkerColor;
    c.fillRect(x - 6 * P, y + 7 * P, 12 * P, 4 * P);
    // Belt
    c.fillStyle = '#8a6a30';
    c.fillRect(x - 6 * P, y + 6 * P, 12 * P, P);
    c.fillStyle = '#c4a050';
    c.fillRect(x - P, y + 5.5 * P, 2 * P, 2 * P); // buckle

    // Skin colors (per character)
    const skinBase = cls.skin || '#ffd5a3';
    const skinLight = skinBase;
    const skinDark = skinBase.replace(/[0-9a-f]{2}/gi, m => Math.max(0, parseInt(m, 16) - 20).toString(16).padStart(2, '0'));

    // Arms
    c.fillStyle = skinDark;
    c.fillRect(x - 7 * P, y + 2 * P, 2 * P, 6 * P);
    c.fillRect(x + 5 * P, y + 2 * P, 2 * P, 6 * P);
    // Sleeves
    c.fillStyle = cls.color;
    c.fillRect(x - 7 * P, y + 1 * P, 2 * P, 2 * P);
    c.fillRect(x + 5 * P, y + 1 * P, 2 * P, 2 * P);

    // Neck
    c.fillStyle = skinDark;
    c.fillRect(x - 2 * P, y - 1 * P, 4 * P, 3 * P);

    // Head
    c.fillStyle = skinBase;
    c.fillRect(x - 5 * P, y - 9 * P, 10 * P, 9 * P);
    // Face shading
    c.fillStyle = skinDark;
    c.fillRect(x - 5 * P, y - 3 * P, 10 * P, 2 * P);

    // Hair
    c.fillStyle = cls.hair;
    // Top
    c.fillRect(x - 6 * P, y - 12 * P, 12 * P, 5 * P);
    // Sides
    c.fillRect(x - 6 * P, y - 8 * P, 2 * P, 5 * P);
    c.fillRect(x + 4 * P, y - 8 * P, 2 * P, 5 * P);
    // Hair highlight
    c.fillStyle = cls.hair.replace(/[0-9a-f]{2}/gi, (m) => Math.min(255, parseInt(m, 16) + 25).toString(16).padStart(2, '0'));
    c.fillRect(x - 3 * P, y - 12 * P, 4 * P, 2 * P);

    // Hat/headwear
    if (cls.hat === 'turban') {
        // Turban - purple/blue fabric with gold trim
        // Main wrap (covers top of head and sides)
        c.fillStyle = '#6050a0';
        c.fillRect(x - 6 * P, y - 14 * P, 12 * P, 6 * P);
        c.fillRect(x - 7 * P, y - 12 * P, 14 * P, 3 * P);
        // Top fold
        c.fillStyle = '#7060b8';
        c.fillRect(x - 4 * P, y - 16 * P, 8 * P, 3 * P);
        c.fillRect(x - 3 * P, y - 17 * P, 6 * P, 2 * P);
        // Lighter highlights (fabric folds)
        c.fillStyle = '#8878cc';
        c.fillRect(x - 2 * P, y - 15 * P, 4 * P, 2 * P);
        c.fillRect(x + 3 * P, y - 13 * P, 2 * P, 3 * P);
        // Gold band/trim
        c.fillStyle = '#c4a040';
        c.fillRect(x - 6 * P, y - 10 * P, 12 * P, P);
        c.fillStyle = '#e0c060';
        c.fillRect(x - 1 * P, y - 10 * P, 3 * P, P);
        // Draping fabric on right side
        c.fillStyle = '#584890';
        c.fillRect(x + 5 * P, y - 10 * P, 3 * P, 6 * P);
        c.fillStyle = '#6858a8';
        c.fillRect(x + 6 * P, y - 9 * P, 2 * P, 5 * P);
        // Gold edge on drape
        c.fillStyle = '#c4a040';
        c.fillRect(x + 5 * P, y - 4 * P, 3 * P, P);
    } else if (cls.hat) {
        // Generic hat (color string)
        const hatLight = cls.hat.replace(/[0-9a-f]{2}/gi, m => Math.min(255, parseInt(m, 16) + 30).toString(16).padStart(2, '0'));
        c.fillStyle = cls.hat;
        c.fillRect(x - 7 * P, y - 12 * P, 14 * P, 2 * P);
        c.fillStyle = cls.hat;
        c.fillRect(x - 5 * P, y - 16 * P, 10 * P, 5 * P);
        c.fillStyle = hatLight;
        c.fillRect(x - 4 * P, y - 16 * P, 6 * P, 2 * P);
        c.fillStyle = '#c4a050';
        c.fillRect(x - 5 * P, y - 12.5 * P, 10 * P, P);
    }

    // Eyes
    c.fillStyle = '#fff';
    c.fillRect(x - 3 * P, y - 6 * P, 3 * P, 2 * P);
    c.fillRect(x + 1 * P, y - 6 * P, 3 * P, 2 * P);
    // Pupils (custom eye color)
    c.fillStyle = cls.eyes || '#222';
    c.fillRect(x - 2 * P, y - 6 * P, 2 * P, 2 * P);
    c.fillRect(x + 2 * P, y - 6 * P, 2 * P, 2 * P);
    // Eye shine
    c.fillStyle = '#fff';
    c.fillRect(x - 2 * P, y - 6 * P, P, P);
    c.fillRect(x + 2 * P, y - 6 * P, P, P);

    // Mouth
    c.fillStyle = '#c08060';
    c.fillRect(x - P, y - 3 * P, 2 * P, P);

    // Nose
    c.fillStyle = '#e8b888';
    c.fillRect(x, y - 4.5 * P, P, P);
}

function renderCharacterSelection() {
    charSelectCanvas = document.getElementById('charselect-canvas');
    charSelectCtx = charSelectCanvas.getContext('2d');
    charSelectCanvas.width = CS_W;
    charSelectCanvas.height = CS_H;
    selectedCharIdx = -1;
    charSelectRunning = true;

    charSlots.length = 0;
    const slotH = 65;
    const startY = 70;
    CHARACTER_CLASSES.forEach((cls, i) => {
        charSlots.push({ cls, y: startY + i * (slotH + 6), h: slotH });
    });

    charSelectCanvas.onclick = (e) => {
        const rect = charSelectCanvas.getBoundingClientRect();
        const scaleX = CS_W / rect.width;
        const scaleY = CS_H / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        charSlots.forEach((slot, i) => {
            if (mx > 50 && mx < CS_W - 50 && my > slot.y && my < slot.y + slot.h) {
                selectedCharIdx = i;
                selectCharacter(slot.cls);
            }
        });
    };

    charSelectLoop();
}

function charSelectLoop() {
    if (!charSelectRunning) return;
    charSelectFrame++;
    drawCharSelect();
    requestAnimationFrame(charSelectLoop);
}

function drawCharSelect() {
    const c = charSelectCtx;

    // --- Background gradient ---
    for (let y = 0; y < CS_H; y++) {
        const t = y / CS_H;
        c.fillStyle = `rgb(${Math.floor(8 + t * 15)},${Math.floor(8 + t * 20)},${Math.floor(30 + t * 25)})`;
        c.fillRect(0, y, CS_W, 1);
    }

    // Stars
    for (let i = 0; i < 35; i++) {
        const sx = (i * 37 + 11) % CS_W;
        const sy = (i * 23 + 7) % 120;
        const twinkle = Math.sin(charSelectFrame * 0.04 + i) * 0.3 + 0.5;
        const b = Math.floor(twinkle * 200);
        c.fillStyle = `rgb(${b},${b},${Math.min(255, b + 30)})`;
        c.fillRect(sx, sy, 2, 2);
    }

    // Stone walls
    for (let y = 0; y < CS_H; y += 4) {
        const shade = 28 + Math.sin(y * 0.06) * 4;
        c.fillStyle = `rgb(${shade + 4},${shade},${shade - 3})`;
        c.fillRect(0, y, 44, 4);
        c.fillRect(CS_W - 44, y, 44, 4);
        if (y % 16 === 0) {
            c.fillStyle = `rgb(${shade - 6},${shade - 8},${shade - 10})`;
            c.fillRect(0, y, 44, 2);
            c.fillRect(CS_W - 44, y, 44, 2);
        }
    }

    // Torches (bigger)
    [[32, 60], [CS_W - 36, 60], [32, 260], [CS_W - 36, 260]].forEach(([tx, ty], ti) => {
        c.fillStyle = '#5a4020';
        c.fillRect(tx, ty, 4, 20);
        const fh = 8 + Math.sin(charSelectFrame * 0.15 + ti * 3) * 4;
        c.fillStyle = `rgb(${210 + Math.floor(Math.sin(charSelectFrame * 0.2 + ti) * 30)},${110 + Math.floor(Math.sin(charSelectFrame * 0.15 + ti) * 30)},20)`;
        c.fillRect(tx - 2, ty - fh, 8, fh);
        c.fillStyle = `rgb(255,${210 + Math.floor(Math.sin(charSelectFrame * 0.3 + ti) * 20)},60)`;
        c.fillRect(tx, ty - fh - 3, 4, 4);
        c.fillStyle = `rgba(255,150,50,${0.04 + Math.sin(charSelectFrame * 0.1 + ti) * 0.02})`;
        c.beginPath();
        c.arc(tx + 2, ty, 35, 0, Math.PI * 2);
        c.fill();
    });

    // --- HEADER BANNER ---
    const bannerY = 10, bannerH = 36;
    for (let y = bannerY; y < bannerY + bannerH; y++) {
        const bt = (y - bannerY) / bannerH;
        c.fillStyle = `rgb(${Math.floor(196 - bt * 40)},${Math.floor(166 - bt * 40)},${Math.floor(99 - bt * 30)})`;
        c.fillRect(60, y, CS_W - 120, 1);
    }
    c.fillStyle = '#6a5a30';
    c.fillRect(60, bannerY, CS_W - 120, 2);
    c.fillRect(60, bannerY + bannerH - 2, CS_W - 120, 2);
    drawOutlinedTextCS(c, 'PLAYER  SELECT', CS_W / 2, bannerY + bannerH / 2, '16px "Press Start 2P", monospace', '#1a1a2e');

    // --- DARK INNER PANEL ---
    const px = 50, py = 55, pw = CS_W - 100, ph = CS_H - 85;
    c.fillStyle = '#08081a';
    c.fillRect(px, py, pw, ph);
    c.strokeStyle = '#3a3a2a';
    c.lineWidth = 2;
    c.strokeRect(px, py, pw, ph);

    // --- CHARACTER SLOTS ---
    const textLeft = 160; // text starts well right of sprites

    charSlots.forEach((slot, i) => {
        const cls = slot.cls;
        const selected = i === selectedCharIdx;
        const sy = slot.y;

        // Highlight
        if (selected) {
            c.fillStyle = 'rgba(245, 200, 66, 0.08)';
            c.fillRect(55, sy, CS_W - 110, slot.h);
            c.strokeStyle = '#f5c842';
            c.lineWidth = 2;
            c.strokeRect(55, sy, CS_W - 110, slot.h);

            if (charSelectFrame % 40 < 25) {
                drawOutlinedTextCS(c, '\u25B6', 65, sy + slot.h / 2, '12px monospace', '#f5c842');
            }
        }

        // Character sprite
        drawCharSprite(c, 110, sy + slot.h / 2 + 4, cls, charSelectFrame);

        // Number + Name (editable if selected)
        let displayName = `${i + 1}. ${cls.name}`;
        if (selected && editingName) {
            const currentName = document.getElementById('char-name').value || cls.name;
            displayName = `${i + 1}. ${currentName}`;
            // Blinking cursor
            if (charSelectFrame % 40 < 25) displayName += '_';
        }

        c.font = '14px "Press Start 2P", monospace';
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        c.fillStyle = '#000';
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
            if (ox || oy) c.fillText(displayName, textLeft + ox, sy + 16 + oy);
        }
        c.fillStyle = selected && editingName ? '#fff' : '#f0d070';
        c.fillText(displayName, textLeft, sy + 16);

        // Description
        c.font = '7px "Press Start 2P", monospace';
        c.fillStyle = '#000';
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
            if (ox || oy) c.fillText(cls.desc, textLeft + ox, sy + 35 + oy);
        }
        c.fillStyle = '#7777aa';
        c.fillText(cls.desc, textLeft, sy + 35);

        // Stats
        const statsText = `HP:${cls.hp}  ATK:${cls.attack}  DEF:${cls.defense}`;
        c.fillStyle = '#000';
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
            if (ox || oy) c.fillText(statsText, textLeft + ox, sy + 50 + oy);
        }
        c.fillStyle = '#5588aa';
        c.fillText(statsText, textLeft, sy + 50);

        // Hearts (right side)
        const hearts = Math.ceil(cls.hp / 25);
        for (let h = 0; h < hearts; h++) {
            const hx = CS_W - 150 + h * 14;
            const hy = sy + 14;
            c.fillStyle = '#e94560';
            c.fillRect(hx, hy, 4, 3);
            c.fillRect(hx + 5, hy, 4, 3);
            c.fillRect(hx - 1, hy + 3, 11, 3);
            c.fillRect(hx, hy + 6, 9, 3);
            c.fillRect(hx + 2, hy + 9, 5, 2);
            c.fillRect(hx + 3, hy + 11, 3, 1);
            c.fillStyle = '#ff7088';
            c.fillRect(hx + 1, hy + 1, 2, 2);
        }
    });

    // --- BOTTOM ---
    c.textAlign = 'center';
    if (selectedCharIdx >= 0 && editingName) {
        if (charSelectFrame % 50 < 35) drawOutlinedTextCS(c, 'TYPE NAME  -  PRESS ENTER TO START', CS_W / 2, CS_H - 20, '9px "Press Start 2P", monospace', '#f5c842');
    } else if (selectedCharIdx < 0) {
        if (charSelectFrame % 50 < 35) drawOutlinedTextCS(c, 'CLICK A CHARACTER TO SELECT', CS_W / 2, CS_H - 20, '10px "Press Start 2P", monospace', '#ccccdd');
    }
}

function drawOutlinedTextCS(ctx, text, x, y, font, fillColor) {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
            if (ox === 0 && oy === 0) continue;
            ctx.fillText(text, x + ox, y + oy);
        }
    }
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
}

let editingName = false;

function selectCharacter(cls) {
    state.character = cls;
    const inp = document.getElementById('char-name');
    inp.value = cls.name;
    editingName = true;
    // Focus the hidden input to capture keyboard
    setTimeout(() => inp.focus(), 50);
}

// Sync hidden input back to canvas rendering
document.getElementById('char-name').addEventListener('input', () => {
    // Just let the canvas read from the input each frame
});

document.getElementById('char-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && editingName && state.character) {
        beginAdventure();
    }
});

function beginAdventure() {
    const name = document.getElementById('char-name').value.trim();
    if (!name) { document.getElementById('char-name').style.borderColor = 'var(--accent)'; return; }
    if (!state.character) return;

    state.name = name;
    trackGameStart(name);
    state.hp = state.character.hp;
    state.maxHp = state.character.hp;
    state.attack = state.character.attack;
    state.defense = state.character.defense;
    MOVE_DELAY = state.character.perk === 'tamer' ? 80 : 120;
    state.location = 'cave';
    state.playerCol = 5;
    state.playerRow = Math.floor(ROWS / 2);

    showScreen('game');
    updateHUD();
    gameLoop();
}

document.getElementById('btn-start-adventure').addEventListener('click', beginAdventure);
document.getElementById('char-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') beginAdventure();
});

// ============================================================
// HUD
// ============================================================
function updateHUD() {
    // HUD is now drawn on canvas each frame in drawCanvasHUD()
    // This function is kept as a no-op for compatibility with existing calls
}

// ============================================================
// INVENTORY
// ============================================================
document.getElementById('hud-inventory-btn').addEventListener('click', toggleInventory);
document.getElementById('hud-zordlist-btn').addEventListener('click', toggleZordList);
document.getElementById('hud-map-btn').addEventListener('click', toggleWorldMap);
document.getElementById('close-inventory').addEventListener('click', toggleInventory);

function toggleInventory() {
    state.inventoryOpen = !state.inventoryOpen;
    document.getElementById('inventory-overlay').style.display = state.inventoryOpen ? 'flex' : 'none';
    state.paused = state.inventoryOpen || state.dialogueOpen;
    if (state.inventoryOpen) renderInventory();
}

function renderInventory() {
    const container = document.getElementById('inventory-items');
    const items = Object.entries(state.inventory).filter(([, qty]) => qty > 0);
    if (items.length === 0) {
        container.innerHTML = '<div class="inv-item"><span class="inv-item-name">Empty</span></div>';
    } else {
        container.innerHTML = '';
        items.forEach(([name, qty]) => {
            const storeItem = STORE_ITEMS.find(i => i.id === name);
            const displayName = storeItem ? `${storeItem.icon} ${storeItem.name}` : name.charAt(0).toUpperCase() + name.slice(1);
            const div = document.createElement('div');
            div.className = 'inv-item';
            div.style.flexWrap = 'wrap';
            if (name === 'potion') {
                div.innerHTML = `
                    <span class="inv-item-name">${displayName} x${qty}</span>
                    <button class="btn btn-primary" style="font-size:7px;padding:4px 8px;" onclick="usePotion()">Use +30HP</button>`;
            } else {
                div.innerHTML = `
                    <span class="inv-item-name">${displayName}</span>
                    <span class="inv-item-qty">x${qty}</span>`;
            }
            container.appendChild(div);
        });
    }
    // Fish section
    const fishEntries = Object.entries(state.fish).filter(([, qty]) => qty > 0);
    if (fishEntries.length > 0) {
        container.innerHTML += '<div class="inv-item" style="border-top:2px solid var(--border);margin-top:8px;padding-top:8px;"><span class="inv-item-name" style="color:var(--gold)">-- Fish --</span></div>';
        fishEntries.forEach(([fishId, qty]) => {
            const ft = FISH_TYPES.find(f => f.id === fishId);
            if (!ft) return;
            const div = document.createElement('div');
            div.className = 'inv-item';
            div.style.flexWrap = 'wrap';
            const isJunk = ft.hp < 0;
            const eatLabel = isJunk ? `Eat ${ft.hp}HP` : `Eat +${ft.hp}HP`;
            const eatColor = isJunk ? 'var(--accent)' : '';
            div.innerHTML = `
                <span class="inv-item-name">${ft.icon} ${ft.name} x${qty}</span>
                <span style="font-size:7px;color:var(--text-dim)">${ft.desc || ''}</span>
                <span style="display:flex;gap:4px;">
                    <button class="btn ${isJunk ? 'btn-secondary' : 'btn-primary'}" style="font-size:7px;padding:4px 8px;${eatColor ? 'color:'+eatColor : ''}" onclick="eatFish('${fishId}')">${eatLabel}</button>
                    ${ft.sellPrice > 0 ? `<button class="btn btn-secondary" style="font-size:7px;padding:4px 8px;" onclick="sellFish('${fishId}')">Sell ${ft.sellPrice}r</button>` : '<span style="font-size:7px;color:var(--text-dim)">No value</span>'}
                </span>`;
            container.appendChild(div);
        });
    }

    const buildsEl = document.getElementById('inventory-builds');
    if (state.builtItems.length > 0) {
        const built = BUILD_RECIPES.filter(r => state.builtItems.includes(r.id));
        buildsEl.innerHTML = 'Built: ' + built.map(r => r.sprite + ' ' + r.name).join(' | ');
    } else {
        buildsEl.innerHTML = '';
    }
}

function usePotion() {
    if ((state.inventory.potion || 0) <= 0) return;
    if (state.hp >= state.maxHp) return; // already full
    state.inventory.potion--;
    const healed = Math.min(30, state.maxHp - state.hp);
    state.hp += healed;
    updateHUD();
    renderInventory();
    playSound('gem');
}

function eatFish(fishId) {
    if ((state.fish[fishId] || 0) <= 0) return;
    const ft = FISH_TYPES.find(f => f.id === fishId);
    state.fish[fishId]--;
    if (ft.hp < 0) {
        // Bad item - lose HP
        state.hp = Math.max(1, state.hp + ft.hp);
        playSound('hurt');
    } else {
        state.hp = Math.min(state.maxHp, state.hp + ft.hp);
        playSound('gem');
    }
    updateHUD();
    renderInventory();
}

function sellFish(fishId) {
    if ((state.fish[fishId] || 0) <= 0) return;
    const ft = FISH_TYPES.find(f => f.id === fishId);
    state.fish[fishId]--;
    state.rubies += ft.sellPrice;
    updateHUD();
    renderInventory();
    playSound('gem');
}

// ============================================================
// ZORDLIST
// ============================================================
let zordListOpen = false;

document.getElementById('close-zordlist').addEventListener('click', toggleZordList);

function toggleZordList() {
    zordListOpen = !zordListOpen;
    document.getElementById('zordlist-overlay').style.display = zordListOpen ? 'flex' : 'none';
    state.paused = zordListOpen || state.inventoryOpen || state.dialogueOpen;
    if (zordListOpen) renderZordList();
}

function showZordList() {
    zordListOpen = true;
    document.getElementById('zordlist-overlay').style.display = 'flex';
    state.paused = true;
    renderZordList();
}

function getZordLevel(zord) {
    // XP needed per level: level * 20
    return zord.level;
}

function getZordXpNeeded(zord) {
    return zord.level * 20;
}

function zordLevelUp(zord) {
    while (zord.xp >= getZordXpNeeded(zord)) {
        zord.xp -= getZordXpNeeded(zord);
        zord.level++;
        zord.maxHp += 5;
        zord.currentHp = zord.maxHp;
        zord.attack += 1;
        zord.power.damage += 2;
    }
}

// Grant XP to bench Zords after battles
function grantBenchXp(amount) {
    const xp = state.character.perk === 'scholar' ? amount * 2 : amount;
    state.zordBench.forEach(idx => {
        const z = state.zordList[idx];
        if (z) {
            z.xp += xp;
            zordLevelUp(z);
        }
    });
}

function renderZordList() {
    const container = document.getElementById('zordlist-items');
    if (state.zordList.length === 0) {
        container.innerHTML = '<div class="inv-item"><span class="inv-item-name" style="color:var(--text-dim)">No Zords caught yet. Buy ZordCages from Kira in town!</span></div>';
        return;
    }

    // Bench section
    const benchMax = 3;
    let html = `<div style="margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid var(--border);">
        <span style="color:var(--gold);font-size:10px;">Zord Bench (${state.zordBench.length}/${benchMax}) - Bench Zords gain XP!</span></div>`;

    if (state.zordBench.length > 0) {
        state.zordBench.forEach(idx => {
            const z = state.zordList[idx];
            if (!z) return;
            const el = ELEMENTS[z.element];
            html += `<div class="inv-item" style="flex-wrap:wrap;gap:4px;background:rgba(245,200,66,0.05);border-left:3px solid ${el ? el.color : '#888'};">
                <span>${z.sprite} <strong style="color:var(--gold)">${escapeHtml(z.nickname)}</strong> <span style="font-size:8px;color:var(--text-dim)">Lv.${z.level}</span></span>
                <span style="font-size:8px;color:${el ? el.color : '#888'}">${el ? el.icon + ' ' + el.name : ''}</span>
                <span style="font-size:7px;color:var(--text-dim)">HP:${z.currentHp}/${z.maxHp} ATK:${z.attack} | ${z.power.name} (${z.power.damage}dmg)</span>
                <span style="font-size:7px;color:var(--text-dim)">XP: ${z.xp}/${getZordXpNeeded(z)}</span>
                <button class="btn btn-secondary" style="font-size:7px;padding:3px 6px;" onclick="removeFromBench(${idx})">Remove</button>
            </div>`;
        });
    } else {
        html += '<div class="inv-item"><span style="color:var(--text-dim);font-size:8px">Bench is empty. Add Zords below!</span></div>';
    }

    html += '<div style="margin:10px 0 6px;border-bottom:1px solid var(--border);padding-bottom:4px;"><span style="color:var(--text-dim);font-size:9px;">All Zords (${state.zordList.length})</span></div>';
    container.innerHTML = html;

    // All Zords
    state.zordList.forEach((zord, i) => {
        const el = ELEMENTS[zord.element];
        const onBench = state.zordBench.includes(i);
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.style.cssText = 'flex-wrap:wrap;gap:4px;' + (onBench ? 'opacity:0.5;' : '');
        div.innerHTML = `
            <span>${zord.sprite} <strong style="color:var(--gold)">${escapeHtml(zord.nickname)}</strong> <span style="font-size:8px;color:var(--text-dim)">Lv.${zord.level}</span></span>
            <span style="font-size:8px;color:${el ? el.color : '#888'}">${el ? el.icon + ' ' + el.name : ''}</span>
            <span style="font-size:7px;color:var(--text-dim)">${zord.species} | HP:${zord.currentHp}/${zord.maxHp} ATK:${zord.attack}</span>
            <span style="font-size:7px;color:var(--text-dim)">${zord.power.name} (${zord.power.damage} ${el ? el.name : ''} dmg)</span>
            <span style="display:flex;gap:3px;">
                ${!onBench && state.zordBench.length < benchMax ? `<button class="btn btn-primary" style="font-size:7px;padding:3px 6px;" onclick="addToBench(${i})">Bench</button>` : ''}
                ${onBench ? '<span style="font-size:7px;color:var(--gold);">ON BENCH</span>' : ''}
                <button class="btn btn-secondary" style="font-size:7px;padding:3px 6px;" onclick="renameZord(${i})">Rename</button>
            </span>`;
        container.appendChild(div);
    });

    // Discovery count
    const uniqueSpecies = new Set(state.zordList.map(z => z.species));
    const totalSpecies = ENEMIES.filter(e => e.catchRate > 0).length;
    const disc = document.createElement('div');
    disc.className = 'inv-item';
    disc.style.cssText = 'margin-top:8px;border-top:2px solid var(--border);padding-top:8px;';
    disc.innerHTML = `<span style="color:var(--text-dim);font-size:8px">Species discovered: ${uniqueSpecies.size} / ${totalSpecies}</span>`;
    container.appendChild(disc);
}

function addToBench(idx) {
    if (state.zordBench.length >= 3 || state.zordBench.includes(idx)) return;
    state.zordBench.push(idx);
    renderZordList();
}

function removeFromBench(idx) {
    state.zordBench = state.zordBench.filter(i => i !== idx);
    renderZordList();
}

function renameZord(index) {
    const zord = state.zordList[index];
    document.getElementById('zordname-sprite').textContent = zord.sprite;
    document.getElementById('zordname-species').textContent = 'Rename ' + zord.species;
    const nameInput = document.getElementById('zordname-input');
    nameInput.value = zord.nickname;
    document.getElementById('zordname-overlay').style.display = 'flex';
    setTimeout(() => { nameInput.focus(); nameInput.select(); }, 100);

    const confirmBtn = document.getElementById('zordname-confirm');
    const onConfirm = () => {
        confirmBtn.removeEventListener('click', onConfirm);
        nameInput.removeEventListener('keydown', onEnter);
        const newName = nameInput.value.trim();
        if (newName) zord.nickname = newName.slice(0, 16);
        document.getElementById('zordname-overlay').style.display = 'none';
        renderZordList();
    };
    const onEnter = (e) => { if (e.key === 'Enter') onConfirm(); };
    confirmBtn.addEventListener('click', onConfirm);
    nameInput.addEventListener('keydown', onEnter);
}

// ============================================================
// WORLD MAP
// ============================================================
let worldMapOpen = false;
const discoveredAreas = new Set(['cave']); // start with cave discovered

document.getElementById('close-worldmap').addEventListener('click', toggleWorldMap);

function toggleWorldMap() {
    worldMapOpen = !worldMapOpen;
    document.getElementById('worldmap-overlay').style.display = worldMapOpen ? 'flex' : 'none';
    state.paused = worldMapOpen || state.inventoryOpen || zordListOpen || state.dialogueOpen;
    if (worldMapOpen) renderWorldMap();
}

// ============================================================
// HELP SCREEN
// ============================================================
let helpOpen = false;

document.getElementById('close-help').addEventListener('click', toggleHelp);

function toggleHelp() {
    helpOpen = !helpOpen;
    document.getElementById('help-overlay').style.display = helpOpen ? 'flex' : 'none';
    state.paused = helpOpen || worldMapOpen || state.inventoryOpen || zordListOpen || state.dialogueOpen;
}

// Track area discovery on transitions
function discoverArea(loc) {
    discoveredAreas.add(loc);
}

function renderWorldMap() {
    const canvas = document.getElementById('worldmap-canvas');
    const c = canvas.getContext('2d');
    const W = 480, H = 360;
    canvas.width = W;
    canvas.height = H;

    const P = 2; // pixel size for map details

    // Map regions as landscape tiles
    const regions = [
        { id: 'cave', name: 'The Cave', x: 10, y: 120, w: 120, h: 100,
          draw: (c, x, y, w, h) => {
            // Dark cave terrain
            c.fillStyle = '#2a2840'; c.fillRect(x, y, w, h);
            // Rocky texture
            for (let dy = 0; dy < h; dy += 6) for (let dx = 0; dx < w; dx += 8) {
                c.fillStyle = `rgb(${34 + (dx*3+dy*7)%10},${30 + (dx*5+dy*3)%8},${48 + (dx+dy*2)%10})`;
                c.fillRect(x + dx, y + dy, 6, 4);
            }
            // Cave entrance (dark hole)
            c.fillStyle = '#0a0814'; c.fillRect(x + 40, y + 30, 40, 30);
            c.fillStyle = '#16142a'; c.fillRect(x + 35, y + 25, 50, 8);
            // Rocks around entrance
            c.fillStyle = '#3a3650'; c.fillRect(x + 30, y + 20, 12, 45);
            c.fillRect(x + 78, y + 20, 12, 45);
            // Crystals
            c.fillStyle = '#8060c0'; c.fillRect(x + 20, y + 50, 4, 8);
            c.fillStyle = '#a080e0'; c.fillRect(x + 90, y + 40, 3, 6);
            c.fillStyle = '#7050b0'; c.fillRect(x + 60, y + 70, 5, 10);
          }
        },
        { id: 'town', name: 'Logic Land Town', x: 140, y: 80, w: 150, h: 140,
          draw: (c, x, y, w, h) => {
            // Green grass base
            c.fillStyle = '#3a8044'; c.fillRect(x, y, w, h);
            for (let dy = 0; dy < h; dy += 4) for (let dx = 0; dx < w; dx += 4) {
                if ((dx + dy) % 8 === 0) { c.fillStyle = '#348038'; c.fillRect(x + dx, y + dy, 3, 2); }
            }
            // Paths (cross)
            c.fillStyle = '#b0a058'; c.fillRect(x, y + h/2 - 4, w, 8);
            c.fillRect(x + w/2 - 4, y, 8, h);
            // Buildings
            // Store
            c.fillStyle = '#c4a060'; c.fillRect(x + 20, y + 16, 28, 20);
            c.fillStyle = '#2060a0'; c.fillRect(x + 18, y + 10, 32, 10);
            c.fillStyle = '#3a2010'; c.fillRect(x + 30, y + 28, 8, 8);
            // Build site
            c.fillStyle = '#6a8a50'; c.fillRect(x + 90, y + 16, 28, 20);
            c.fillStyle = '#506838'; c.fillRect(x + 88, y + 10, 32, 10);
            // Houses
            c.fillStyle = '#b0885a'; c.fillRect(x + 15, y + 90, 20, 16);
            c.fillStyle = '#a04030'; c.fillRect(x + 13, y + 86, 24, 8);
            c.fillStyle = '#b0885a'; c.fillRect(x + 110, y + 90, 20, 16);
            c.fillStyle = '#a04030'; c.fillRect(x + 108, y + 86, 24, 8);
            // Pond
            c.fillStyle = '#2070a0'; c.fillRect(x + 55, y + 100, 30, 16);
            c.fillStyle = '#3090b8'; c.fillRect(x + 58, y + 103, 24, 10);
            // Trees
            for (const tx of [8, 50, 80, 130]) {
                c.fillStyle = '#1a5020'; c.fillRect(x + tx, y + 50, 10, 10);
                c.fillStyle = '#287030'; c.fillRect(x + tx + 2, y + 48, 6, 8);
            }
          }
        },
        { id: 'beach', name: 'Coral Cove Beach', x: 160, y: 10, w: 110, h: 60,
          draw: (c, x, y, w, h) => {
            // Sand base
            c.fillStyle = '#e0c888'; c.fillRect(x, y + h * 0.4, w, h * 0.6);
            for (let dy = Math.floor(h * 0.4); dy < h; dy += 4) for (let dx = 0; dx < w; dx += 6) {
                if ((dx + dy) % 10 === 0) { c.fillStyle = '#d4b870'; c.fillRect(x + dx, y + dy, 4, 3); }
            }
            // Ocean
            c.fillStyle = '#1a6090'; c.fillRect(x, y, w, h * 0.4);
            for (let dx = 0; dx < w; dx += 8) {
                c.fillStyle = '#2080b0'; c.fillRect(x + dx, y + h * 0.15, 6, 2);
                c.fillStyle = '#3098c8'; c.fillRect(x + dx + 3, y + h * 0.3, 5, 2);
            }
            // Wavy shore
            for (let dx = 0; dx < w; dx += 3) {
                const wy = Math.sin(dx * 0.2) * 3;
                c.fillStyle = '#c0e8f8'; c.fillRect(x + dx, y + h * 0.38 + wy, 3, 2);
            }
            // Palm trees
            c.fillStyle = '#2a5020'; c.fillRect(x + 10, y + h * 0.45, 6, 8);
            c.fillStyle = '#3a7030'; c.fillRect(x + 8, y + h * 0.42, 10, 6);
            c.fillStyle = '#2a5020'; c.fillRect(x + 80, y + h * 0.5, 6, 8);
            c.fillStyle = '#3a7030'; c.fillRect(x + 78, y + h * 0.47, 10, 6);
            // Dock
            c.fillStyle = '#7a5a38'; c.fillRect(x + 60, y + h * 0.2, 4, h * 0.4);
            c.fillRect(x + 56, y + h * 0.18, 12, 3);
            // Seashells
            c.fillStyle = '#f0d0a0'; c.fillRect(x + 30, y + h * 0.7, 3, 3);
            c.fillStyle = '#e8c090'; c.fillRect(x + 50, y + h * 0.6, 3, 3);
          }
        },
        { id: 'mountains', name: 'Iron Peak Mountains', x: 150, y: 230, w: 130, h: 80,
          draw: (c, x, y, w, h) => {
            // Rocky base
            c.fillStyle = '#5a5a50'; c.fillRect(x, y, w, h);
            for (let dy = 0; dy < h; dy += 4) for (let dx = 0; dx < w; dx += 6) {
                const shade = 70 + (dx * 3 + dy * 5) % 20;
                c.fillStyle = `rgb(${shade},${shade - 2},${shade - 10})`;
                c.fillRect(x + dx, y + dy, 5, 3);
            }
            // Mountain peaks (triangles)
            for (const [px2, pw, ph2] of [[20, 40, 50], [60, 50, 60], [100, 35, 45]]) {
                c.fillStyle = '#6a6a60';
                c.beginPath(); c.moveTo(x + px2, y + h * 0.8); c.lineTo(x + px2 + pw/2, y + h * 0.8 - ph2); c.lineTo(x + px2 + pw, y + h * 0.8); c.closePath(); c.fill();
                c.fillStyle = '#7a7a70';
                c.beginPath(); c.moveTo(x + px2 + 5, y + h * 0.8); c.lineTo(x + px2 + pw/2, y + h * 0.8 - ph2 + 5); c.lineTo(x + px2 + pw - 5, y + h * 0.8); c.closePath(); c.fill();
                // Snow caps
                c.fillStyle = '#e0e8f0';
                c.beginPath(); c.moveTo(x + px2 + pw/2 - 8, y + h * 0.8 - ph2 + 14); c.lineTo(x + px2 + pw/2, y + h * 0.8 - ph2); c.lineTo(x + px2 + pw/2 + 8, y + h * 0.8 - ph2 + 14); c.closePath(); c.fill();
            }
            // Pine trees
            c.fillStyle = '#1a4a20';
            for (const tx of [8, 45, 85, 115]) {
                c.fillRect(x + tx, y + h * 0.65, 4, 10);
                c.fillRect(x + tx - 3, y + h * 0.6, 10, 6);
                c.fillRect(x + tx - 1, y + h * 0.55, 6, 5);
            }
            // Alpine lake
            c.fillStyle = '#2070a0'; c.fillRect(x + 55, y + h * 0.7, 20, 8);
            c.fillStyle = '#3090b8'; c.fillRect(x + 58, y + h * 0.72, 14, 4);
          }
        },
        { id: 'forest', name: 'Enchanted Forest', x: 300, y: 80, w: 120, h: 140,
          draw: (c, x, y, w, h) => {
            // Dense dark green
            c.fillStyle = '#2a5a27'; c.fillRect(x, y, w, h);
            // Many trees
            for (let dy = 0; dy < h; dy += 14) for (let dx = 0; dx < w; dx += 12) {
                const shade = 20 + (dx * 3 + dy * 7) % 20;
                c.fillStyle = `rgb(${shade},${shade + 40},${shade - 5})`;
                c.fillRect(x + dx, y + dy, 10, 12);
                c.fillStyle = `rgb(${shade + 10},${shade + 50},${shade + 5})`;
                c.fillRect(x + dx + 2, y + dy, 6, 8);
            }
            // Path through
            c.fillStyle = '#8a7a40'; c.fillRect(x, y + h/2 - 3, w, 6);
            // Clearings
            c.fillStyle = '#3a7a38'; c.fillRect(x + 40, y + 30, 30, 20);
            c.fillStyle = '#3a7a38'; c.fillRect(x + 20, y + 80, 25, 18);
            // Flowers
            c.fillStyle = '#e84393'; c.fillRect(x + 45, y + 35, 3, 3);
            c.fillStyle = '#ffd93d'; c.fillRect(x + 55, y + 40, 3, 3);
            c.fillStyle = '#6c5ce7'; c.fillRect(x + 30, y + 88, 3, 3);
          }
        },
        { id: 'temple_1', name: 'Temple', x: 430, y: 30, w: 40, h: 40,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#4a3f6b', 1); } },
        { id: 'temple_2', name: 'F2', x: 430, y: 75, w: 40, h: 35,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#2c2c4a', 2); } },
        { id: 'temple_3', name: 'F3', x: 430, y: 115, w: 40, h: 35,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#5c4033', 3); } },
        { id: 'temple_4', name: 'F4', x: 430, y: 155, w: 40, h: 35,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#2a4a5a', 4); } },
        { id: 'temple_5', name: 'F5', x: 430, y: 195, w: 40, h: 35,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#3d2020', 5); } },
        { id: 'temple_6', name: 'F6', x: 430, y: 235, w: 40, h: 35,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#101028', 6); } },
        { id: 'temple_7', name: 'Sanctum', x: 430, y: 275, w: 40, h: 40,
          draw: (c, x, y, w, h) => { drawTempleRegion(c, x, y, w, h, '#2d1a4a', 7); } }
    ];

    function drawTempleRegion(c, x, y, w, h, baseColor, floor) {
        c.fillStyle = baseColor; c.fillRect(x, y, w, h);
        // Brick pattern
        for (let dy = 0; dy < h; dy += 6) {
            const off = (Math.floor(dy / 6) % 2) * 8;
            for (let dx = 0; dx < w; dx += 16) {
                c.fillStyle = 'rgba(0,0,0,0.15)';
                c.fillRect(x + (dx + off) % w, y + dy, 1, 6);
            }
            c.fillRect(x, y + dy + 5, w, 1);
        }
        // Floor accent
        if (floor === 5) { c.fillStyle = '#cc3300'; c.fillRect(x + 10, y + 12, 20, 8); } // lava
        if (floor === 4) { c.fillStyle = '#88c8e0'; c.fillRect(x + 8, y + 10, 16, 6); }  // ice
        if (floor === 7) { // portal
            c.fillStyle = '#8040c0'; c.beginPath();
            c.arc(x + w/2, y + h/2, 8, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#b080f0'; c.beginPath();
            c.arc(x + w/2, y + h/2, 4, 0, Math.PI * 2); c.fill();
        }
        // Pillars
        c.fillStyle = 'rgba(255,255,255,0.1)';
        c.fillRect(x + 4, y + 2, 3, h - 4);
        c.fillRect(x + w - 7, y + 2, 3, h - 4);
    }

    // Background (ocean/void)
    c.fillStyle = '#08081a'; c.fillRect(0, 0, W, H);
    // Surrounding terrain (mountains/hills)
    for (let y2 = 0; y2 < H; y2 += 4) for (let x2 = 0; x2 < W; x2 += 4) {
        const n = Math.sin(x2 * 0.03 + y2 * 0.02) * 0.5 + Math.sin(x2 * 0.01 - y2 * 0.03) * 0.3;
        const shade = Math.floor(12 + n * 6);
        c.fillStyle = `rgb(${shade},${shade + 2},${shade + 6})`;
        c.fillRect(x2, y2, 4, 4);
    }

    // Draw path connections
    function drawConnection(a, next) {
        if (!discoveredAreas.has(a.id) || !discoveredAreas.has(next.id)) return;
        c.strokeStyle = '#8a7a40';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(a.x + a.w / 2, a.y + a.h / 2);
        c.lineTo(next.x + next.w / 2, next.y + next.h / 2);
        c.stroke();
        c.strokeStyle = '#a89850';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(a.x + a.w / 2, a.y + a.h / 2);
        c.lineTo(next.x + next.w / 2, next.y + next.h / 2);
        c.stroke();
    }
    regions.forEach(a => {
        const nexts = regions.filter(r => {
            if (a.id === 'cave') return r.id === 'town';
            if (a.id === 'town') return r.id === 'forest' || r.id === 'beach' || r.id === 'mountains';
            if (a.id === 'forest') return r.id === 'temple_1';
            if (a.id.startsWith('temple_')) {
                const n = parseInt(a.id.split('_')[1]) + 1;
                return r.id === 'temple_' + n;
            }
            return false;
        });
        nexts.forEach(next => drawConnection(a, next));
    });

    // Draw regions
    regions.forEach(a => {
        const discovered = discoveredAreas.has(a.id);
        const isCurrent = state.location === a.id;

        if (discovered) {
            a.draw(c, a.x, a.y, a.w, a.h);
        } else {
            // Greyed out - dark with noise
            c.fillStyle = '#151520';
            c.fillRect(a.x, a.y, a.w, a.h);
            for (let dy = 0; dy < a.h; dy += 4) for (let dx = 0; dx < a.w; dx += 4) {
                if ((dx + dy) % 8 === 0) { c.fillStyle = '#1a1a28'; c.fillRect(a.x + dx, a.y + dy, 3, 3); }
            }
            c.fillStyle = '#333';
            c.font = '10px "Press Start 2P", monospace';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText('?', a.x + a.w / 2, a.y + a.h / 2);
        }

        // Border
        c.strokeStyle = isCurrent ? '#f5c842' : discovered ? '#555' : '#222';
        c.lineWidth = isCurrent ? 3 : 1;
        c.strokeRect(a.x, a.y, a.w, a.h);

        // Current pulse
        if (isCurrent) {
            c.strokeStyle = `rgba(245, 200, 66, ${0.3 + Math.sin(Date.now() * 0.005) * 0.2})`;
            c.lineWidth = 2;
            c.strokeRect(a.x - 2, a.y - 2, a.w + 4, a.h + 4);
        }

        // Name label
        if (discovered) {
            c.font = `${a.w > 60 ? '6' : '5'}px "Press Start 2P", monospace`;
            c.textAlign = 'center'; c.textBaseline = 'top';
            // Shadow
            c.fillStyle = '#000';
            c.fillText(a.name, a.x + a.w / 2 + 1, a.y + a.h + 3);
            c.fillStyle = isCurrent ? '#f5c842' : '#aaa';
            c.fillText(a.name, a.x + a.w / 2, a.y + a.h + 2);
        }

        // Player marker (blinking)
        if (isCurrent && Math.floor(Date.now() / 400) % 2 === 0) {
            const mx = a.x + a.w / 2, my = a.y + a.h / 2;
            c.fillStyle = state.character.color;
            c.fillRect(mx - 4, my - 6, 8, 10);
            c.fillStyle = '#ffd5a3';
            c.fillRect(mx - 3, my - 9, 6, 5);
            c.fillStyle = state.character.hair;
            c.fillRect(mx - 3, my - 11, 6, 3);
        }
    });

    // Title banner
    c.fillStyle = 'rgba(0,0,0,0.7)';
    c.fillRect(0, 0, W, 18);
    c.fillStyle = '#f5c842';
    c.font = '8px "Press Start 2P", monospace';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('LOGIC  LAND  -  WORLD  MAP', W / 2, 9);

    // Legend
    const legendEl = document.getElementById('worldmap-legend');
    const disc = regions.filter(a => discoveredAreas.has(a.id)).length;
    legendEl.textContent = `Areas: ${disc}/${regions.length} | [M] Close`;
}

// ============================================================
// INPUT HANDLING
// ============================================================
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // K+B combo: toggle touch controls
    if ((e.key.toLowerCase() === 'k' && keys['b']) || (e.key.toLowerCase() === 'b' && keys['k'])) {
        window._touchHidden = !window._touchHidden;
        const toggleEl = document.getElementById('touch-toggle');
        if (toggleEl) toggleEl.textContent = window._touchHidden ? 'SHOW' : 'CTRL';
        e.preventDefault();
        return;
    }

    // Inventory toggle
    if (e.key.toLowerCase() === 'i' && state.screen === 'game') {
        toggleInventory();
        e.preventDefault();
        return;
    }

    // ZordList toggle
    if (e.key.toLowerCase() === 'z' && state.screen === 'game') {
        toggleZordList();
        e.preventDefault();
        return;
    }

    // World Map toggle
    if (e.key.toLowerCase() === 'm' && state.screen === 'game') {
        toggleWorldMap();
        e.preventDefault();
        return;
    }

    // Help toggle
    if (e.key.toLowerCase() === 'h' && state.screen === 'game') {
        toggleHelp();
        e.preventDefault();
        return;
    }

    // Interact
    if ((e.key === ' ' || e.key.toLowerCase() === 'e') && state.screen === 'game') {
        if (state.dialogueOpen) {
            advanceDialogue();
        } else if (!state.paused) {
            tryInteract();
        }
        e.preventDefault();
    }

    // Cheat codes: hold 0 then press 1 or 2
    if (e.key === '1' && keys['0']) {
        state.rubies += 100;
        updateHUD();
        playSound('gem');
        e.preventDefault();
        return;
    }
    if (e.key === '2' && keys['0'] && state.screen === 'quiz') {
        state.quizIndex = state.quizTotal;
        renderQuiz(); // triggers startBattle
        e.preventDefault();
        return;
    }

    // Close dialogue with Escape
    if (e.key === 'Escape') {
        if (helpOpen) toggleHelp();
        if (worldMapOpen) toggleWorldMap();
        if (state.inventoryOpen) toggleInventory();
        if (zordListOpen) toggleZordList();
        if (state.dialogueOpen) hideDialogue();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Movement timing
let lastMoveTime = 0;
let MOVE_DELAY = 120; // ms between steps (Laila perk makes this faster)

function handleMovement(now) {
    if (state.paused || state.dialogueOpen) return;
    if (now - lastMoveTime < MOVE_DELAY) return;

    let dr = 0, dc = 0;
    if (keys['arrowup'] || keys['w']) { dr = -1; state.facing = 'up'; }
    else if (keys['arrowdown'] || keys['s']) { dr = 1; state.facing = 'down'; }
    else if (keys['arrowleft'] || keys['a']) { dc = -1; state.facing = 'left'; }
    else if (keys['arrowright'] || keys['d']) { dc = 1; state.facing = 'right'; }

    if (dr === 0 && dc === 0) return;

    const nr = state.playerRow + dr;
    const nc = state.playerCol + dc;

    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;

    const map = MAPS[state.location];
    const tile = map[nr][nc];

    if (SOLID.has(tile)) return;

    state.playerRow = nr;
    state.playerCol = nc;
    state.walkFrame++;
    lastMoveTime = now;
    playSound('step');

    // Check gem pickups
    checkGemPickup();
    // Check transitions
    checkTransition();
    // Check enemy encounters
    checkEnemyZone();
    // Update interact prompt
    updateInteractPrompt();
}

// ============================================================
// INTERACTIONS
// ============================================================
function getFacingTile() {
    const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dr, dc] = dirs[state.facing];
    return { row: state.playerRow + dr, col: state.playerCol + dc };
}

function getInteractable() {
    const { row, col } = getFacingTile();
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;

    const map = MAPS[state.location];
    const tile = map[row][col];

    // NPC?
    if (MAP_NPCS[state.location]) {
        const npc = MAP_NPCS[state.location].find(n => n.col === col && n.row === row);
        if (npc) return { type: 'npc', data: NPCS[npc.npcIndex] };
    }

    // Store?
    if (tile === T.STORE) return { type: 'store' };
    // Build site?
    if (tile === T.BUILD) return { type: 'build' };
    // Sign?
    if (tile === T.SIGN) return { type: 'sign', row, col };
    // Door?
    if (tile === T.DOOR) return { type: 'door' };
    // Water (fishing)?
    if (tile === T.WATER && (state.inventory.fishpole || 0) > 0) return { type: 'fish' };

    return null;
}

function updateInteractPrompt() {
    const interactable = getInteractable();
    const prompt = document.getElementById('interact-prompt');
    const text = document.getElementById('interact-text');

    if (interactable && !state.dialogueOpen) {
        prompt.style.display = 'block';
        switch (interactable.type) {
            case 'npc': text.textContent = `[E/Space] Talk to ${interactable.data.name}`; break;
            case 'store': text.textContent = '[E/Space] Enter Store'; break;
            case 'build': text.textContent = '[E/Space] Open Build Menu'; break;
            case 'sign': text.textContent = '[E/Space] Read Sign'; break;
            case 'door': text.textContent = '[E/Space] Enter'; break;
            case 'fish': text.textContent = '[E/Space] Fish here'; break;
        }
    } else {
        prompt.style.display = 'none';
    }
}

function tryInteract() {
    const interactable = getInteractable();
    if (!interactable) return;

    switch (interactable.type) {
        case 'npc': talkToNPC(interactable.data); break;
        case 'store': openStore(); break;
        case 'build': openBuild(); break;
        case 'sign': readSign(interactable.row, interactable.col); break;
        case 'fish': startFishing(); break;
        case 'door': {
            const trans = TRANSITIONS[state.location];
            const { row, col } = getFacingTile();
            const t = trans.find(t => t.col === col && t.row === row);
            if (t) doTransition(t);
            break;
        }
    }
}

function readSign(row, col) {
    let text = 'A weathered sign.';
    if (state.location === 'cave') text = SIGN_TEXTS.cave;
    else if (state.location === 'forest') {
        if (col < COLS / 2) text = SIGN_TEXTS.forest_left;
        else text = SIGN_TEXTS.forest_right;
    } else if (state.location === 'town') {
        if (row < 3) text = SIGN_TEXTS.town_north;
        else if (row > ROWS - 4) text = SIGN_TEXTS.town_south;
        else if (col < COLS / 2) text = SIGN_TEXTS.town_left;
        else text = SIGN_TEXTS.town_right;
    } else if (state.location === 'mountains') {
        if (row < 5) text = SIGN_TEXTS.mtn_north;
        else text = SIGN_TEXTS.mtn_deep;
    } else if (state.location === 'beach') {
        if (col > 15 && row < 8) text = SIGN_TEXTS.beach_dock;
        else text = SIGN_TEXTS.beach_south;
    } else if (state.location.startsWith('temple_')) {
        const floorNum = parseInt(state.location.split('_')[1]);
        text = TEMPLE_FLOORS[floorNum - 1].name;
    }
    showDialogue('\u{1FAA7}', 'Sign', text);
}

// ============================================================
// AREA TRANSITIONS
// ============================================================
function checkTransition() {
    const trans = TRANSITIONS[state.location];
    if (!trans) return;
    // Check if player is on or adjacent to a door transition
    for (const t of trans) {
        const dist = Math.abs(state.playerCol - t.col) + Math.abs(state.playerRow - t.row);
        if (dist === 0) {
            doTransition(t);
            return;
        }
    }
    // Also check if standing on any DOOR tile (map may have door not in transitions list)
    const map = MAPS[state.location];
    const curTile = map[state.playerRow] && map[state.playerRow][state.playerCol];
    if (curTile === T.DOOR || curTile === T.STAIRS_UP || curTile === T.STAIRS_DN) {
        // Find closest transition
        let closest = null, minDist = Infinity;
        for (const t of trans) {
            const d = Math.abs(state.playerCol - t.col) + Math.abs(state.playerRow - t.row);
            if (d < minDist) { minDist = d; closest = t; }
        }
        if (closest && minDist <= 2) {
            doTransition(closest);
        }
    }
}

function doTransition(t) {
    // Check forest lock
    if (t.target === 'forest' && state.defeatedZones.size < 3) {
        showDialogue('\u{1F6AB}', 'Blocked', `The forest is too dangerous! Defeat at least 3 enemies first. (${state.defeatedZones.size}/3)`);
        state.playerCol -= (state.facing === 'right' ? 1 : state.facing === 'left' ? -1 : 0);
        state.playerRow -= (state.facing === 'down' ? 1 : state.facing === 'up' ? -1 : 0);
        return;
    }
    // Check temple lock - must defeat Logic Lord
    if (t.target === 'temple_1' && !state.defeatedEnemies.includes('Logic Lord')) {
        showDialogue('\u{1F3DB}\uFE0F', 'Temple Sealed', 'The ancient doors are sealed. Only one who has defeated the Logic Lord may enter.');
        state.playerCol -= (state.facing === 'right' ? 1 : state.facing === 'left' ? -1 : 0);
        state.playerRow -= (state.facing === 'down' ? 1 : state.facing === 'up' ? -1 : 0);
        return;
    }
    state.location = t.target;
    state.playerCol = t.spawnCol;
    state.playerRow = t.spawnRow;
    discoverArea(t.target);
    if (t.target.startsWith('temple_')) trackTempleFloor(parseInt(t.target.split('_')[1]));
    updateHUD();
    updateInteractPrompt();
}

// ============================================================
// ENEMY ZONE ENCOUNTERS
// ============================================================
function checkEnemyZone() {
    if (state._encounterCooldown > 0) { state._encounterCooldown--; return; }
    const zones = ENEMY_ZONES[state.location];
    const positions = enemyPos[state.location];
    if (!zones || !positions) return;

    const px = state.playerCol * TILE + TILE / 2;
    const py = state.playerRow * TILE + TILE / 2;

    for (let i = 0; i < zones.length; i++) {
        const key = `${state.location}_${i}`;
        if (state.defeatedZones.has(key)) continue;

        const ep = positions[i];
        const dist = Math.sqrt((px - ep.x) ** 2 + (py - ep.y) ** 2);
        if (dist < TILE * 1.2) {
            state._pendingZoneKey = key;
            encounterEnemy(zones[i].enemyIndex);
            return;
        }
    }
}

function encounterEnemy(enemyIndex) {
    const enemy = ENEMIES[enemyIndex];
    state.currentEnemy = { ...enemy, currentHp: enemy.hp };
    playSound('encounter');

    // Weak enemies (index 0-1) only trigger lessons 50% of the time
    const isWeak = enemyIndex <= 1;
    const skipLesson = isWeak && Math.random() < 0.5;

    if (skipLesson) {
        state.quizCorrect = 0;
        state.quizTotal = 0;
        startBattle();
    } else {
        const lesson = LOGIC_LESSONS.find(l => l.id === enemy.lessonId);
        // Pick 4-5 random questions from the pool
        const numQ = Math.min(lesson.questions.length, 3 + Math.floor(Math.random() * 3));
        const shuffled = [...lesson.questions].sort(() => Math.random() - 0.5);
        state.currentLesson = { ...lesson, questions: shuffled.slice(0, numQ) };
        state.quizIndex = 0;
        state.quizCorrect = 0;
        state.quizTotal = numQ;
        showScreen('quiz');
        renderQuiz();
    }
}

// ============================================================
// NPC DIALOGUE
// ============================================================
let currentDialogueNPC = null;

function talkToNPC(npc) {
    if (npc.isZordTamer) {
        showZordTamerMenu(npc);
        return;
    }
    if (!state.npcDialogueIndex[npc.name]) state.npcDialogueIndex[npc.name] = 0;
    currentDialogueNPC = npc;

    const idx = state.npcDialogueIndex[npc.name];
    const line = npc.dialogue[idx % npc.dialogue.length];
    const hasMore = ((idx + 1) % npc.dialogue.length) !== 0;

    showDialogue(npc.sprite, npc.name, line, hasMore);
}

function showZordTamerMenu(npc) {
    state.dialogueOpen = true;
    state.paused = true;
    const panel = document.getElementById('dialogue-panel');
    panel.style.display = 'flex';
    document.getElementById('dialogue-portrait').textContent = npc.sprite;
    document.getElementById('dialogue-speaker').textContent = npc.name;
    document.getElementById('dialogue-text').textContent = `Hello ${state.name}! I can help you with your Zords. What do you need?`;
    document.getElementById('interact-prompt').style.display = 'none';

    const choicesEl = document.getElementById('dialogue-choices');
    choicesEl.innerHTML = '';

    // Buy ZordCages
    const cages = state.inventory.zordcage || 0;
    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-choice';
    buyBtn.textContent = `Buy ZordCage (50 rubies) [You have: ${cages}]`;
    buyBtn.addEventListener('click', () => {
        if (state.rubies >= 50) {
            state.rubies -= 50;
            if (!state.inventory.zordcage) state.inventory.zordcage = 0;
            state.inventory.zordcage++;
            updateHUD();
            showZordTamerMenu(npc);
            playSound('gem');
        }
    });
    choicesEl.appendChild(buyBtn);

    // Heal player
    const healBtn = document.createElement('button');
    healBtn.className = 'btn btn-choice';
    healBtn.textContent = `Heal me to full HP (free)`;
    healBtn.addEventListener('click', () => {
        state.hp = state.maxHp;
        updateHUD();
        document.getElementById('dialogue-text').textContent = 'There you go! All healed up!';
        playSound('gem');
    });
    choicesEl.appendChild(healBtn);

    // Chat
    const chatBtn = document.createElement('button');
    chatBtn.className = 'btn btn-choice';
    chatBtn.textContent = 'Tell me about Zords';
    chatBtn.addEventListener('click', () => {
        if (!state.npcDialogueIndex[npc.name]) state.npcDialogueIndex[npc.name] = 0;
        currentDialogueNPC = npc;
        const idx = state.npcDialogueIndex[npc.name];
        const line = npc.dialogue[idx % npc.dialogue.length];
        const hasMore = ((idx + 1) % npc.dialogue.length) !== 0;
        document.getElementById('dialogue-text').textContent = line;
        choicesEl.innerHTML = hasMore
            ? '<span style="color:var(--text-dim);font-size:9px">[Space] ...</span>'
            : '<span style="color:var(--text-dim);font-size:9px">[Space] Close</span>';
    });
    choicesEl.appendChild(chatBtn);

    // View ZordList
    const listBtn = document.createElement('button');
    listBtn.className = 'btn btn-choice';
    listBtn.textContent = `View ZordList (${state.zordList.length} caught)`;
    listBtn.addEventListener('click', () => {
        hideDialogue();
        showZordList();
    });
    choicesEl.appendChild(listBtn);

    // Leave
    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'btn btn-choice';
    leaveBtn.textContent = 'Goodbye';
    leaveBtn.addEventListener('click', () => hideDialogue());
    choicesEl.appendChild(leaveBtn);
}

function advanceDialogue() {
    if (currentDialogueNPC) {
        const npc = currentDialogueNPC;
        state.npcDialogueIndex[npc.name] = (state.npcDialogueIndex[npc.name] || 0) + 1;
        const idx = state.npcDialogueIndex[npc.name];
        if (idx % npc.dialogue.length === 0) {
            hideDialogue();
            currentDialogueNPC = null;
        } else {
            const line = npc.dialogue[idx % npc.dialogue.length];
            const hasMore = ((idx + 1) % npc.dialogue.length) !== 0;
            document.getElementById('dialogue-text').textContent = line;
            document.getElementById('dialogue-choices').innerHTML = hasMore
                ? '<span style="color:var(--text-dim);font-size:9px;animation:fadeIn 0.5s ease infinite alternate">[Space] ...</span>'
                : '<span style="color:var(--text-dim);font-size:9px">[Space] Close</span>';
        }
    } else {
        hideDialogue();
    }
}

function showDialogue(portrait, speaker, text, hasMore) {
    state.dialogueOpen = true;
    state.paused = true;
    const panel = document.getElementById('dialogue-panel');
    panel.style.display = 'flex';
    document.getElementById('dialogue-portrait').textContent = portrait;
    document.getElementById('dialogue-speaker').textContent = speaker;
    document.getElementById('dialogue-text').textContent = text;
    document.getElementById('interact-prompt').style.display = 'none';

    const choicesEl = document.getElementById('dialogue-choices');
    if (hasMore) {
        choicesEl.innerHTML = '<span style="color:var(--text-dim);font-size:9px;animation:fadeIn 0.5s ease infinite alternate">[Space] ...</span>';
    } else {
        choicesEl.innerHTML = '<span style="color:var(--text-dim);font-size:9px">[Space] Close</span>';
    }
}

function hideDialogue() {
    state.dialogueOpen = false;
    state.paused = state.inventoryOpen;
    document.getElementById('dialogue-panel').style.display = 'none';
    currentDialogueNPC = null;
}

// ============================================================
// STORE
// ============================================================
function openStore() {
    state.paused = true;
    showScreen('store');
    renderStore();
}

function renderStore() {
    document.getElementById('store-rubies').textContent = state.rubies;
    const equipCol = document.getElementById('store-equip');
    const buildCol = document.getElementById('store-build');
    equipCol.innerHTML = '<div style="padding:6px 8px;color:var(--gold);font-size:10px;border-bottom:2px solid var(--border);">-- Equipment --</div>';
    buildCol.innerHTML = '<div style="padding:6px 8px;color:var(--gold);font-size:10px;border-bottom:2px solid var(--border);">-- Building Materials --</div>';

    STORE_ITEMS.forEach(item => {
        const container = item.cat === 'equip' ? equipCol : buildCol;
        const canAfford = state.rubies >= item.price;
        const div = document.createElement('div');
        div.className = 'store-item';
        const remaining = merchantStock[item.id] || 0;
        const canBuy = canAfford && remaining > 0;
        div.innerHTML = `
            <div class="store-item-info">
                <span class="store-item-name">${item.icon} ${item.name}</span>
                <span class="store-item-desc">${item.desc}</span>
            </div>
            <span class="store-item-price">${item.price}r</span>
            <span style="font-size:8px;color:${remaining > 0 ? 'var(--text-dim)' : 'var(--accent)'};margin-right:8px;">
                ${remaining > 0 ? 'x' + remaining : 'SOLD OUT'}
            </span>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Buy';
        btn.disabled = !canBuy;
        btn.style.opacity = canBuy ? '1' : '0.4';
        btn.addEventListener('click', () => buyItem(item));
        div.appendChild(btn);
        container.appendChild(div);
    });
}

function buyItem(item) {
    if (state.rubies < item.price) return;
    if ((merchantStock[item.id] || 0) <= 0) return;
    state.rubies -= item.price;
    merchantStock[item.id]--;
    if (!state.inventory[item.id]) state.inventory[item.id] = 0;
    state.inventory[item.id]++;
    if (item.id === 'shield' && state.inventory.shield === 1) state.defense += 3;
    else if (item.id === 'sword' && state.inventory.sword === 1) state.attack += 5;
    else if (item.id === 'staff' && state.inventory.staff === 1) state.attack += 3;
    trackRubiesEarned(-item.price);
    playSound('gem');
    updateHUD();
    renderStore();
}

document.getElementById('btn-leave-store').addEventListener('click', () => {
    showScreen('game');
    updateHUD();
});

// ============================================================
// BUILD SYSTEM
// ============================================================
function openBuild() {
    state.paused = true;
    showScreen('build');
    renderBuild();
}

function renderBuild() {
    const container = document.getElementById('build-options');
    container.innerHTML = '';

    BUILD_RECIPES.forEach(recipe => {
        const alreadyBuilt = state.builtItems.includes(recipe.id);
        const hasResources = Object.entries(recipe.requires).every(([item, qty]) => (state.inventory[item] || 0) >= qty);

        const div = document.createElement('div');
        div.className = 'build-option';
        const reqText = Object.entries(recipe.requires).map(([item, qty]) => {
            const have = state.inventory[item] || 0;
            const color = have >= qty ? 'var(--success)' : 'var(--accent)';
            return `<span style="color:${color}">${item}: ${have}/${qty}</span>`;
        }).join(', ');

        div.innerHTML = `<div>
            <span class="build-option-name">${recipe.sprite} ${recipe.name}</span><br>
            <span style="font-size:8px;color:var(--text-dim)">${recipe.desc}</span><br>
            <span class="build-option-req">${reqText}</span>
        </div>`;

        if (alreadyBuilt) {
            const tag = document.createElement('span');
            tag.className = 'built-item';
            tag.textContent = 'BUILT';
            div.appendChild(tag);
        } else {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = 'Build';
            btn.disabled = !hasResources;
            btn.style.opacity = hasResources ? '1' : '0.4';
            btn.addEventListener('click', () => buildItem(recipe));
            div.appendChild(btn);
        }
        container.appendChild(div);
    });

    const preview = document.getElementById('build-preview');
    if (state.builtItems.length > 0) {
        const built = BUILD_RECIPES.filter(r => state.builtItems.includes(r.id));
        preview.innerHTML = '<br>Your builds: ' + built.map(r => r.sprite + ' ' + r.name).join(' | ');
    } else {
        preview.innerHTML = 'Collect materials from the store to build!';
    }
}

function buildItem(recipe) {
    Object.entries(recipe.requires).forEach(([item, qty]) => { state.inventory[item] -= qty; });
    state.builtItems.push(recipe.id);
    if (recipe.id === 'cabin') { state.maxHp += 20; state.hp = Math.min(state.hp + 20, state.maxHp); }
    else if (recipe.id === 'workshop') state.attack += 3;
    else if (recipe.id === 'watchtower') state.defense += 3;
    updateHUD();
    renderBuild();
}

document.getElementById('btn-leave-build').addEventListener('click', () => {
    showScreen('game');
    updateHUD();
});

// ============================================================
// QUIZ SYSTEM
// ============================================================
function renderQuiz() {
    const lesson = state.currentLesson;
    const qi = state.quizIndex;

    if (qi >= lesson.questions.length) {
        startBattle();
        return;
    }

    const question = lesson.questions[qi];
    if (qi === 0) {
        document.getElementById('quiz-lesson').innerHTML = `<h3>${lesson.title}</h3><p>${lesson.content.replace(/\n/g, '<br>')}</p>`;
    }

    document.getElementById('quiz-question').textContent = `Q${qi + 1}: ${question.q}`;
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-feedback').className = 'quiz-feedback';
    document.getElementById('quiz-progress').textContent = `Question ${qi + 1} of ${lesson.questions.length} | Correct: ${state.quizCorrect}`;

    const choicesEl = document.getElementById('quiz-choices');
    choicesEl.innerHTML = '';

    // Shuffle choices while tracking the correct answer
    const indexed = question.choices.map((text, i) => ({ text, isCorrect: i === question.answer }));
    for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    const correctShuffled = indexed.findIndex(c => c.isCorrect);

    indexed.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-choice';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => answerQuiz(i, correctShuffled, btn));
        choicesEl.appendChild(btn);
    });
}

function answerQuiz(selected, correct, btnEl) {
    const buttons = document.querySelectorAll('#quiz-choices .btn-choice');
    buttons.forEach(b => b.style.pointerEvents = 'none');
    buttons[correct].classList.add('correct');

    trackQuizAnswer(selected === correct);
    if (selected === correct) {
        state.quizCorrect++;
        document.getElementById('quiz-feedback').textContent = 'Correct!';
        document.getElementById('quiz-feedback').className = 'quiz-feedback correct';
    } else {
        btnEl.classList.add('incorrect');
        document.getElementById('quiz-feedback').textContent = `Incorrect. The answer was: ${state.currentLesson.questions[state.quizIndex].choices[correct]}`;
        document.getElementById('quiz-feedback').className = 'quiz-feedback incorrect';
    }
    document.getElementById('quiz-progress').textContent = `Question ${state.quizIndex + 1} of ${state.quizTotal} | Correct: ${state.quizCorrect}`;

    // Respawn any depleted gem locations now that a question was answered
    tryRespawnGems();

    setTimeout(() => { state.quizIndex++; renderQuiz(); }, 1500);
}

// ============================================================
// ACTION BATTLE SYSTEM (Canvas-based minigame)
// ============================================================
const BW = 600; // battle canvas width
const BH = 400; // battle canvas height

let battleCanvas, battleCtx;
let battle = null; // active battle state

function getBestWeapon() {
    if (state.inventory.staff > 0) return WEAPONS.staff;
    if (state.inventory.sword > 0) return WEAPONS.sword;
    return WEAPONS.shovel;
}

function hasShield() { return (state.inventory.shield || 0) > 0; }

// Apply character perks to incoming damage
function applyDamageReduction(dmg) {
    if (state.character.perk === 'tank') return Math.max(1, Math.floor(dmg * 0.7));
    return dmg;
}

function startBattle() {
    showScreen('battle');
    battleCanvas = document.getElementById('battle-canvas');
    battleCtx = battleCanvas.getContext('2d');
    scaleCanvasToFit(battleCanvas, BW, BH);

    const enemy = state.currentEnemy;
    const weapon = getBestWeapon();

    battle = {
        running: true,
        over: false,
        frame: 0,
        weapon: weapon,
        // Player (restricted to ground area)
        px: 80, py: BH * 0.7, pSpeed: 4, pFacing: 1, // 1=right, -1=left
        playerHp: state.hp, playerMaxHp: state.maxHp,
        attackCooldown: 0,
        swingAngle: 0, swinging: false,
        blocking: false,
        iframes: 0, // invincibility frames after hit
        // Enemy (restricted to ground area)
        ex: BW - 120, ey: BH * 0.7, eSpeed: 1.5 + enemy.attack * 0.1,
        enemyHp: enemy.hp, enemyMaxHp: enemy.hp,
        enemyDir: 1,
        enemyAttackTimer: 60 + Math.floor(Math.random() * 60),
        enemyCharging: false, enemyChargeX: 0,
        // Projectiles
        playerProjectiles: [],
        enemyProjectiles: [],
        // Particles
        particles: [],
        // Damage numbers
        damageNums: [],
        // Quiz bonus
        quizBonus: state.quizCorrect,
        // ZordCage
        cageThrown: false,
        cageFlying: false,
        cageX: 0, cageY: 0,
        cageTargetX: 0, cageTargetY: 0,
        // Escape door (flush with ground)
        escapeDoorX: 60 + Math.random() * (BW - 120),
        escapeDoorY: BH * 0.55,
        escapeDoorBlocked: false,
        escapeRate: enemy.escapeRate !== undefined ? enemy.escapeRate : 0.75
    };

    // Controls hint
    let hint = 'WASD / Arrows: Move | Space: Attack';
    if (weapon.type === 'ranged') hint = 'WASD / Arrows: Move | Space: Shoot Fireballs';
    if (hasShield()) hint += ' | Shift: Block';
    hint += ' | P: Potion';
    if ((state.inventory.zordcage || 0) > 0) hint += ` | C: ZordCage (${state.inventory.zordcage})`;
    if (state.zordBench.length > 0) hint += ' | D: Deploy Zord';
    document.getElementById('battle-controls-text').textContent = hint;

    // HUD
    document.getElementById('battle-hud-name').textContent = state.name;
    document.getElementById('battle-enemy-name').textContent = enemy.name;
    document.getElementById('battle-hud-info').textContent = `${weapon.name} | Quiz Bonus: +${state.quizCorrect}`;
    document.getElementById('battle-result').style.display = 'none';

    updateBattleHUD();
    battleLoop();
}

function updateBattleHUD() {
    if (!battle) return;
    const pPct = Math.max(0, (battle.playerHp / battle.playerMaxHp) * 100);
    const ePct = Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100);
    const pBar = document.getElementById('battle-player-hp');
    pBar.style.width = pPct + '%';
    pBar.className = 'battle-hp-fill' + (pPct < 30 ? ' low' : '');
    const eBar = document.getElementById('battle-enemy-hp');
    eBar.style.width = ePct + '%';
    eBar.className = 'battle-hp-fill' + (ePct < 30 ? ' low' : '');
    document.getElementById('battle-player-hp-text').textContent = `${battle.playerHp}/${battle.playerMaxHp}`;
    document.getElementById('battle-enemy-hp-text').textContent = `${battle.enemyHp}/${battle.enemyMaxHp}`;
}

function battleLoop() {
    if (!battle || !battle.running) return;
    battle.frame++;
    battleUpdate();
    battleRender();
    updateBattleHUD();
    requestAnimationFrame(battleLoop);
}

function battleUpdate() {
    if (battle.over) return;
    const b = battle;

    // --- Player movement (restricted to ground area) ---
    const groundTop = BH * 0.55 + 10;  // top of walkable ground
    const groundBot = BH - 15;          // bottom of walkable ground
    if (keys['arrowup'] || keys['w']) b.py = Math.max(groundTop, b.py - b.pSpeed);
    if (keys['arrowdown'] || keys['s']) b.py = Math.min(groundBot, b.py + b.pSpeed);
    if (keys['arrowleft'] || keys['a']) { b.px = Math.max(40, b.px - b.pSpeed); b.pFacing = -1; }
    if (keys['arrowright'] || keys['d']) { b.px = Math.min(BW - 40, b.px + b.pSpeed); b.pFacing = 1; }

    // Check escape door (player must be near the door position on the ground)
    if (!b.escapeDoorBlocked && !b.over) {
        const nearDoorX = Math.abs(b.px - b.escapeDoorX) < 30;
        const nearDoorY = b.py < groundTop + 30;
        if (nearDoorX && nearDoorY) {
            // Attempt escape
            if (Math.random() < b.escapeRate) {
                // Success - escaped, enemy stays on map
                b.over = true;
                state.hp = b.playerHp;
                state._pendingZoneKey = null;
                state._encounterCooldown = 90;
                playSound('gem');
                const resultEl = document.getElementById('battle-result');
                document.getElementById('battle-result-text').innerHTML = 'Escaped!';
                resultEl.style.display = 'flex';
                document.getElementById('battle-result-btn').textContent = 'Continue';
                document.getElementById('battle-result-btn').onclick = () => {
                    battle.running = false; battle = null;
                    updateHUD(); showScreen('game');
                };
            } else {
                // Failed - door is now blocked
                b.escapeDoorBlocked = true;
                b.damageNums.push({ x: b.escapeDoorX, y: b.escapeDoorY - 20, text: 'BLOCKED!', color: '#e94560', life: 60 });
                playSound('hurt');
                // Push player away from door
                b.px += (b.px < BW / 2) ? 30 : -30;
            }
        }
    }

    // Blocking
    b.blocking = hasShield() && (keys['shift'] || keys['shiftleft'] || keys['shiftright']);

    // Attack cooldown
    if (b.attackCooldown > 0) b.attackCooldown--;

    // Attack input
    if (keys[' '] && b.attackCooldown <= 0) {
        const cooldownFrames = Math.floor(30 / b.weapon.speed);
        b.attackCooldown = cooldownFrames;

        if (b.weapon.type === 'melee') {
            b.swinging = true;
            b.swingAngle = 0;
            playSound('swing');
        } else if (b.weapon.type === 'ranged') {
            b.playerProjectiles.push({
                x: b.px + 30 * b.pFacing, y: b.py, vx: 7 * b.pFacing, vy: 0,
                damage: (state.attack + b.quizBonus) * b.weapon.damage,
                color: b.weapon.color, size: 6, life: 120
            });
            playSound('shoot');
        }
    }

    // Potion
    if (keys['p'] && (state.inventory.potion || 0) > 0 && b.playerHp < b.playerMaxHp) {
        keys['p'] = false;
        state.inventory.potion--;
        const healed = Math.min(30, b.playerMaxHp - b.playerHp);
        b.playerHp += healed;
        b.damageNums.push({ x: b.px, y: b.py - 20, text: `+${healed}`, color: '#4ecca3', life: 40 });
    }

    // Deploy Zord (switch to turn-based)
    if (keys['d'] && state.zordBench.length > 0 && !b.over) {
        keys['d'] = false;
        // Pause action battle and switch to Zord battle
        battle.running = false;
        startZordBattle();
        return;
    }

    // Throw ZordCage
    if (keys['c'] && (state.inventory.zordcage || 0) > 0 && !b.cageThrown) {
        keys['c'] = false;
        const enemy = state.currentEnemy;
        if (enemy.catchRate <= 0) {
            b.damageNums.push({ x: b.ex, y: b.ey - 40, text: 'UNCATCHABLE!', color: '#e94560', life: 50 });
        } else {
            state.inventory.zordcage--;
            b.cageThrown = true;
            b.cageX = b.px + 20;
            b.cageY = b.py;
            b.cageTargetX = b.ex;
            b.cageTargetY = b.ey;
            b.cageFlying = true;
            playSound('swing');
        }
    }

    // Animate cage throw
    if (b.cageFlying) {
        const cdx = b.cageTargetX - b.cageX;
        const cdy = b.cageTargetY - b.cageY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < 10) {
            b.cageFlying = false;
            // Calculate catch chance
            const enemy = state.currentEnemy;
            const hpRatio = b.enemyHp / enemy.hp;
            // Lower HP = higher chance. Base catch rate * (2 - hpRatio)
            const catchMult = state.character.perk === 'tamer' ? 2 : 1;
            const chance = enemy.catchRate * (2 - hpRatio) * catchMult;
            const roll = Math.random();
            if (roll < chance) {
                // CAUGHT! Show in-game naming overlay
                b.over = true;
                playSound('victory');

                // Store catch data for after naming
                b.pendingCatch = {
                    species: enemy.name,
                    sprite: enemy.sprite,
                    maxHp: enemy.hp,
                    attack: enemy.attack,
                    element: enemy.element,
                    power: { ...enemy.power },
                    rubies: Math.floor(enemy.rubies / 2)
                };

                // Show naming overlay
                document.getElementById('zordname-sprite').textContent = enemy.sprite;
                document.getElementById('zordname-species').textContent = enemy.name;
                const nameInput = document.getElementById('zordname-input');
                nameInput.value = enemy.name;
                document.getElementById('zordname-overlay').style.display = 'flex';
                setTimeout(() => { nameInput.focus(); nameInput.select(); }, 100);

                // Handle confirm
                const confirmBtn = document.getElementById('zordname-confirm');
                const onConfirm = () => {
                    confirmBtn.removeEventListener('click', onConfirm);
                    nameInput.removeEventListener('keydown', onEnter);
                    const nickname = (nameInput.value.trim() || enemy.name).slice(0, 16);
                    document.getElementById('zordname-overlay').style.display = 'none';

                    state.zordList.push({
                        nickname,
                        species: b.pendingCatch.species,
                        sprite: b.pendingCatch.sprite,
                        maxHp: b.pendingCatch.maxHp,
                        currentHp: b.pendingCatch.maxHp,
                        attack: b.pendingCatch.attack,
                        element: b.pendingCatch.element,
                        power: { ...b.pendingCatch.power },
                        level: 1, xp: 0,
                        catchLocation: state.location
                    });
                    trackZordCaught();
                    state.hp = battle.playerHp;
                    state.rubies += b.pendingCatch.rubies;
                    if (!state.defeatedEnemies.includes(enemy.name)) state.defeatedEnemies.push(enemy.name);

                    const resultEl = document.getElementById('battle-result');
                    const textEl = document.getElementById('battle-result-text');
                    resultEl.style.display = 'flex';
                    textEl.innerHTML = `${escapeHtml(b.pendingCatch.species)} caught!<br><br>Named: <span style="color:var(--gold)">${escapeHtml(nickname)}</span><br>+${b.pendingCatch.rubies} rubies`;
                    document.getElementById('battle-result-btn').textContent = 'Continue';
                    document.getElementById('battle-result-btn').onclick = () => {
                        battle.running = false; battle = null;
                        updateHUD(); showScreen('game');
                    };
                };
                const onEnter = (e) => { if (e.key === 'Enter') onConfirm(); };
                confirmBtn.addEventListener('click', onConfirm);
                nameInput.addEventListener('keydown', onEnter);
            } else {
                b.cageThrown = false;
                b.damageNums.push({ x: b.ex, y: b.ey - 40, text: 'Broke free!', color: '#e94560', life: 50 });
                playSound('hurt');
            }
        } else {
            b.cageX += (cdx / cdist) * 8;
            b.cageY += (cdy / cdist) * 8;
        }
    }

    // --- Swing animation & melee hit detection ---
    if (b.swinging) {
        b.swingAngle += 12 * b.weapon.speed;
        if (b.swingAngle >= 120) {
            b.swinging = false;
            // Check if enemy in range AND in facing direction
            const dist = Math.sqrt((b.ex - b.px) ** 2 + (b.ey - b.py) ** 2);
            const inFacingDir = (b.pFacing > 0 && b.ex > b.px - 10) || (b.pFacing < 0 && b.ex < b.px + 10);
            if (dist < b.weapon.range + 40 && inFacingDir) {
                const dmg = Math.max(1, Math.floor((state.attack + b.quizBonus) * b.weapon.damage));
                b.enemyHp = Math.max(0, b.enemyHp - dmg);
                b.damageNums.push({ x: b.ex, y: b.ey - 30, text: `-${dmg}`, color: '#f5c842', life: 40 });
                b.particles.push(...createHitParticles(b.ex - 20, b.ey, '#f5c842'));
                // Warrior perk: 20% lifesteal
                if (state.character.perk === 'warrior') {
                    const heal = Math.max(1, Math.floor(dmg * 0.2));
                    b.playerHp = Math.min(b.playerMaxHp, b.playerHp + heal);
                    b.damageNums.push({ x: b.px, y: b.py - 30, text: `+${heal}`, color: '#4ecca3', life: 30 });
                }
                playSound('hit');
                if (b.enemyHp <= 0) { endBattle(true); return; }
            }
        }
    }

    // --- Player projectiles ---
    for (let i = b.playerProjectiles.length - 1; i >= 0; i--) {
        const p = b.playerProjectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        // Trail particles
        if (b.frame % 2 === 0) {
            b.particles.push({ x: p.x, y: p.y, vx: -1 + Math.random() * 2, vy: -1 + Math.random() * 2,
                color: p.color, life: 10, size: 3 });
        }
        // Hit enemy
        if (Math.abs(p.x - b.ex) < 30 && Math.abs(p.y - b.ey) < 30) {
            const dmg = Math.max(1, Math.floor(p.damage));
            b.enemyHp = Math.max(0, b.enemyHp - dmg);
            b.damageNums.push({ x: b.ex, y: b.ey - 30, text: `-${dmg}`, color: '#e879f9', life: 40 });
            b.particles.push(...createHitParticles(b.ex - 20, b.ey, '#e879f9'));
            playSound('hit');
            b.playerProjectiles.splice(i, 1);
            if (b.enemyHp <= 0) { endBattle(true); return; }
            continue;
        }
        if (p.x > BW || p.life <= 0) b.playerProjectiles.splice(i, 1);
    }

    // --- Enemy AI ---
    const enemy = state.currentEnemy;
    const mt = enemy.moveType || 'vertical';
    const spd = (enemy.speed || 1) * b.eSpeed;
    const eGroundTop = BH * 0.55 + 10;
    const eGroundBot = BH - 15;

    // Movement patterns
    if (mt === 'vertical') {
        b.ey += spd * b.enemyDir;
        if (b.ey > eGroundBot || b.ey < eGroundTop) b.enemyDir *= -1;
    } else if (mt === 'roam') {
        b.ey += spd * b.enemyDir;
        if (b.ey > eGroundBot || b.ey < eGroundTop) b.enemyDir *= -1;
        // Also move horizontally
        if (!b.enemyHDir) b.enemyHDir = -1;
        b.ex += spd * 0.5 * b.enemyHDir;
        if (b.ex > BW - 50 || b.ex < BW * 0.4) b.enemyHDir *= -1;
    } else if (mt === 'fly') {
        // Fast back-and-forth with vertical weaving
        if (!b.flyDirX) b.flyDirX = -1;
        if (!b.flyDirY) b.flyDirY = 1;
        b.ex += spd * 1.2 * b.flyDirX;
        b.ey += spd * 0.6 * b.flyDirY;
        if (b.ex > BW - 50 || b.ex < BW * 0.35) b.flyDirX *= -1;
        if (b.ey > eGroundBot || b.ey < eGroundTop) b.flyDirY *= -1;
        // Randomly change vertical direction
        if (Math.random() < 0.01) b.flyDirY *= -1;
    } else if (mt === 'slow') {
        b.ey += spd * 0.3 * b.enemyDir;
        if (b.ey > eGroundBot || b.ey < eGroundTop) b.enemyDir *= -1;
    }

    // Attack timer
    b.enemyAttackTimer--;
    const atkType = enemy.attackType || 'fireball';
    const atkDmg = Math.max(1, enemy.attack - state.defense);
    const elColor = ELEMENTS[enemy.element] ? ELEMENTS[enemy.element].color : '#e94560';

    if (b.enemyAttackTimer <= 0 && !b.enemyCharging) {
        // Charge attack (all types can charge occasionally)
        if (enemy.attack >= 12 && Math.random() < 0.25 && mt !== 'slow') {
            b.enemyCharging = true;
            b.enemyChargeX = b.ex;
        } else if (atkType === 'fireball') {
            b.enemyProjectiles.push({
                x: b.ex - 20, y: b.ey, vx: -(3.5 + enemy.attack * 0.12), vy: 0,
                damage: atkDmg, color: elColor, size: 6, life: 150, type: 'fireball'
            });
        } else if (atkType === 'icebeam') {
            // Solid beam - long thin projectile that moves fast
            b.enemyProjectiles.push({
                x: b.ex - 20, y: b.ey, vx: -8, vy: 0,
                damage: atkDmg, color: '#5dade2', size: 3, life: 80, type: 'icebeam',
                beamLen: 40
            });
        } else if (atkType === 'electric') {
            // Charge up then zap everything nearby
            if (!b.electricCharging) {
                b.electricCharging = true;
                b.electricTimer = 45;
            }
        } else if (atkType === 'shadow') {
            // Homing projectile that tracks the player
            b.enemyProjectiles.push({
                x: b.ex - 20, y: b.ey, vx: -2, vy: 0,
                damage: atkDmg, color: '#8040c0', size: 5, life: 200, type: 'shadow',
                targetX: b.px, targetY: b.py
            });
        } else if (atkType === 'spread') {
            // 3-5 projectiles in a fan
            const count = 3 + Math.floor(enemy.attack / 8);
            for (let s = 0; s < count; s++) {
                const angle = -0.4 + (s / (count - 1)) * 0.8;
                b.enemyProjectiles.push({
                    x: b.ex - 16, y: b.ey,
                    vx: -(3 + enemy.attack * 0.1) * Math.cos(angle),
                    vy: -(3 + enemy.attack * 0.1) * Math.sin(angle),
                    damage: Math.max(1, Math.floor(atkDmg * 0.7)),
                    color: elColor, size: 4, life: 120, type: 'fireball'
                });
            }
        } else if (atkType === 'bomb') {
            // Arcing projectile that explodes on landing
            b.enemyProjectiles.push({
                x: b.ex - 16, y: b.ey, vx: -2.5, vy: -4,
                damage: atkDmg, color: '#a06020', size: 7, life: 120, type: 'bomb',
                gravity: 0.08
            });
        } else if (atkType === 'laser') {
            // Instant beam across the screen at enemy's Y
            b.enemyProjectiles.push({
                x: b.ex, y: b.ey, vx: 0, vy: 0,
                damage: Math.floor(atkDmg * 1.3), color: elColor, size: 4, life: 20, type: 'laser',
                laserWarning: 15
            });
        } else if (atkType === 'bite') {
            // Lunge at player - charge attack but always
            b.enemyCharging = true;
            b.enemyChargeX = b.ex;
        }
        b.enemyAttackTimer = 40 + Math.floor(Math.random() * 50) - Math.floor(enemy.attack * 0.5);
        if (b.enemyAttackTimer < 20) b.enemyAttackTimer = 20;
    }

    // Electric pulse attack (delayed)
    if (b.electricCharging) {
        b.electricTimer--;
        if (b.electricTimer <= 0) {
            b.electricCharging = false;
            // Zap: damage player if within range
            const dist = Math.sqrt((b.ex - b.px) ** 2 + (b.ey - b.py) ** 2);
            if (dist < 150) {
                const rawDmg2 = b.blocking ? Math.max(1, Math.floor(atkDmg * 0.3)) : atkDmg;
                const dmg2 = applyDamageReduction(rawDmg2);
                b.playerHp = Math.max(0, b.playerHp - dmg2);
                b.iframes = 20;
                playSound('hurt');
                b.damageNums.push({ x: b.px, y: b.py - 25, text: `-${dmg2}`, color: '#f0e040', life: 40 });
            }
            // Visual: add electric particles
            for (let i = 0; i < 12; i++) {
                b.particles.push({
                    x: b.ex + (Math.random() - 0.5) * 100,
                    y: b.ey + (Math.random() - 0.5) * 80,
                    vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 6,
                    color: '#f0e040', life: 15, size: 3
                });
            }
            playSound('hit');
        }
    }

    // Charge attack
    if (b.enemyCharging) {
        b.ex -= 6;
        if (b.ex < 60) {
            // Reset
            b.enemyCharging = false;
            b.ex = b.enemyChargeX;
            b.enemyAttackTimer = 60;
        }
        // Hit player while charging
        if (Math.abs(b.ex - b.px) < 35 && Math.abs(b.ey - b.py) < 30 && b.iframes <= 0) {
            const rawDmg = b.blocking ? Math.max(1, Math.floor(state.currentEnemy.attack * 0.3)) : Math.max(1, state.currentEnemy.attack - state.defense);
            const dmg = applyDamageReduction(rawDmg);
            b.playerHp = Math.max(0, b.playerHp - dmg);
            b.iframes = 30;
            if (b.blocking) {
                playSound('block');
                b.damageNums.push({ x: b.px, y: b.py - 25, text: `BLOCKED -${dmg}`, color: '#5dade2', life: 40 });
            } else {
                playSound('hurt');
                b.damageNums.push({ x: b.px, y: b.py - 25, text: `-${dmg}`, color: '#e94560', life: 40 });
            }
            b.particles.push(...createHitParticles(b.px + 20, b.py, '#e94560'));
            b.enemyCharging = false;
            b.ex = b.enemyChargeX;
            b.enemyAttackTimer = 40;
            if (b.playerHp <= 0) { endBattle(false); return; }
        }
    }

    // --- Enemy projectiles ---
    for (let i = b.enemyProjectiles.length - 1; i >= 0; i--) {
        const p = b.enemyProjectiles[i];

        // Type-specific movement
        if (p.type === 'shadow' && p.life > 50) {
            // Homing: steer toward player
            const dx = b.px - p.x, dy = b.py - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            p.vx += (dx / dist) * 0.15;
            p.vy += (dy / dist) * 0.15;
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > 4) { p.vx *= 4 / spd; p.vy *= 4 / spd; }
        }
        if (p.type === 'bomb' && p.gravity) {
            p.vy += p.gravity; // arc downward
            if (p.y > BH - 20) {
                // Explode on landing
                for (let s = 0; s < 8; s++) {
                    b.particles.push({ x: p.x, y: p.y, vx: (Math.random()-0.5)*6, vy: -Math.random()*4,
                        color: p.color, life: 20, size: 4 });
                }
                // Damage if near
                if (Math.abs(p.x - b.px) < 50 && Math.abs(p.y - b.py) < 50 && b.iframes <= 0) {
                    let dmg = p.damage;
                    if (b.blocking) dmg = Math.max(1, Math.floor(dmg * 0.3));
                    dmg = applyDamageReduction(dmg);
                    b.playerHp = Math.max(0, b.playerHp - dmg);
                    b.iframes = 20;
                    playSound('hurt');
                    b.damageNums.push({ x: b.px, y: b.py - 25, text: `-${dmg}`, color: '#e94560', life: 40 });
                    if (b.playerHp <= 0) { endBattle(false); return; }
                }
                playSound('hit');
                b.enemyProjectiles.splice(i, 1);
                continue;
            }
        }
        if (p.type === 'laser') {
            // Laser: warning phase then instant damage across Y band
            if (p.laserWarning > 0) {
                p.laserWarning--;
            } else if (p.life > 0 && !p.laserFired) {
                p.laserFired = true;
                // Check if player is in the laser Y band
                if (Math.abs(p.y - b.py) < 20 && b.iframes <= 0) {
                    let dmg = p.damage;
                    if (b.blocking) dmg = Math.max(1, Math.floor(dmg * 0.3));
                    dmg = applyDamageReduction(dmg);
                    b.playerHp = Math.max(0, b.playerHp - dmg);
                    b.iframes = 25;
                    playSound('hurt');
                    b.damageNums.push({ x: b.px, y: b.py - 25, text: `-${dmg}`, color: p.color, life: 40 });
                    if (b.playerHp <= 0) { endBattle(false); return; }
                }
            }
            p.life--;
            if (p.life <= 0) b.enemyProjectiles.splice(i, 1);
            continue;
        }

        p.x += p.vx; p.y += p.vy; p.life--;

        // Hit detection (for non-laser/bomb types)
        const hitRange = p.type === 'icebeam' ? 25 : 20;
        if (Math.abs(p.x - b.px) < hitRange && Math.abs(p.y - b.py) < 20 && b.iframes <= 0) {
            let dmg = p.damage;
            if (b.blocking) dmg = Math.max(1, Math.floor(dmg * 0.3));
            dmg = applyDamageReduction(dmg);
            b.playerHp = Math.max(0, b.playerHp - dmg);
            b.iframes = 20;
            if (b.blocking) {
                playSound('block');
                b.damageNums.push({ x: b.px, y: b.py - 25, text: `BLOCKED -${dmg}`, color: '#5dade2', life: 40 });
            } else {
                playSound('hurt');
                b.damageNums.push({ x: b.px, y: b.py - 25, text: `-${dmg}`, color: '#e94560', life: 40 });
            }
            b.particles.push(...createHitParticles(b.px, b.py, p.color));
            b.enemyProjectiles.splice(i, 1);
            if (b.playerHp <= 0) { endBattle(false); return; }
            continue;
        }
        if (p.x < -30 || p.x > BW + 30 || p.y < -30 || p.y > BH + 30 || p.life <= 0) b.enemyProjectiles.splice(i, 1);
    }

    // iframes countdown
    if (b.iframes > 0) b.iframes--;

    // Particles update
    for (let i = b.particles.length - 1; i >= 0; i--) {
        const p = b.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) b.particles.splice(i, 1);
    }

    // Damage numbers
    for (let i = b.damageNums.length - 1; i >= 0; i--) {
        const d = b.damageNums[i];
        d.y -= 0.8; d.life--;
        if (d.life <= 0) b.damageNums.splice(i, 1);
    }
}

function createHitParticles(x, y, color) {
    const ps = [];
    for (let i = 0; i < 8; i++) {
        ps.push({
            x, y,
            vx: -3 + Math.random() * 6,
            vy: -3 + Math.random() * 6,
            color, life: 15 + Math.floor(Math.random() * 10),
            size: 2 + Math.random() * 3
        });
    }
    return ps;
}

function drawBattleBackground(c) {
    const loc = state.location;
    const f = battle.frame;

    const templeFloor = loc.startsWith('temple_') ? parseInt(loc.split('_')[1]) : 0;
    const highTemple = templeFloor >= 5; // floors 5-7 have sky views

    if (loc === 'cave' || (loc.startsWith('temple_') && !highTemple)) {
        // --- CAVE / LOWER TEMPLE ---
        for (let y = 0; y < BH * 0.55; y++) {
            const t = y / (BH * 0.55);
            c.fillStyle = `rgb(${Math.floor(6 + t * 12)},${Math.floor(6 + t * 10)},${Math.floor(16 + t * 20)})`;
            c.fillRect(0, y, BW, 1);
        }
        for (let y = Math.floor(BH * 0.55); y < BH; y++) {
            const t = (y - BH * 0.55) / (BH * 0.45);
            c.fillStyle = `rgb(${Math.floor(28 + t * 8)},${Math.floor(24 + t * 6)},${Math.floor(38 + t * 10)})`;
            c.fillRect(0, y, BW, 1);
        }
        for (let gx = 0; gx < BW; gx += 20) {
            c.fillStyle = 'rgba(60,50,80,0.3)';
            c.fillRect(gx, BH * 0.55 + Math.sin(gx * 0.1) * 4, 18, 3);
        }
        for (let i = 0; i < 8; i++) {
            const sx = i * 80 + 30 + Math.sin(i * 2.3) * 20;
            const sh = 30 + Math.sin(i * 1.7) * 20;
            c.fillStyle = '#1a1830'; c.fillRect(sx - 4, 0, 8, sh); c.fillRect(sx - 6, 0, 12, sh * 0.6);
            c.fillStyle = '#242040'; c.fillRect(sx - 2, 0, 4, sh);
            if (Math.sin(f * 0.02 + i) > 0.8) { c.fillStyle = 'rgba(100,140,200,0.4)'; c.fillRect(sx - 1, sh + Math.sin(f * 0.05 + i) * 10, 2, 4); }
        }
        for (let i = 0; i < 6; i++) {
            const sx = i * 100 + 50 + Math.sin(i * 3.1) * 30, sh = 15 + Math.sin(i * 2.1) * 10;
            c.fillStyle = '#222040'; c.fillRect(sx - 5, BH - sh, 10, sh); c.fillRect(sx - 3, BH - sh - 4, 6, sh + 4);
            c.fillStyle = '#2a2848'; c.fillRect(sx - 2, BH - sh, 4, sh);
        }
        for (let i = 0; i < 5; i++) {
            const cx2 = i * 130 + 40, cy2 = 40 + Math.sin(i * 1.5) * 20;
            const glow = Math.sin(f * 0.04 + i * 2) * 0.15 + 0.25;
            c.fillStyle = `rgba(120,80,200,${glow})`; c.beginPath(); c.arc(cx2, cy2, 14, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#8060c0'; c.fillRect(cx2 - 4, cy2 - 8, 8, 14);
            c.fillStyle = '#a080e0'; c.fillRect(cx2 - 2, cy2 - 6, 4, 10);
        }
        for (let y = 0; y < BH; y += 4) {
            const lw = 35 + Math.sin(y * 0.08) * 10, rw = 35 + Math.sin(y * 0.08 + 2) * 10;
            const shade = 18 + Math.sin(y * 0.12) * 4;
            c.fillStyle = `rgb(${shade+4},${shade+2},${shade+10})`;
            c.fillRect(0, y, lw, 4); c.fillRect(BW - rw, y, rw, 4);
        }
    } else if (highTemple) {
        // --- HIGH TEMPLE (floors 5-7) - Sky views through windows ---
        const isTop = templeFloor >= 7;
        const isSunset = templeFloor === 6;

        // Sky gradient (evening/sunset for higher floors)
        for (let y = 0; y < BH * 0.55; y++) {
            const t = y / (BH * 0.55);
            let r, g, b2;
            if (isTop) {
                // Night sky with stars
                r = Math.floor(8 + t * 10); g = Math.floor(6 + t * 12); b2 = Math.floor(20 + t * 30);
            } else if (isSunset) {
                // Orange/purple sunset
                r = Math.floor(60 + t * 80); g = Math.floor(20 + t * 40); b2 = Math.floor(40 + t * 50);
            } else {
                // Evening blue-green
                r = Math.floor(15 + t * 30); g = Math.floor(25 + t * 45); b2 = Math.floor(50 + t * 60);
            }
            c.fillStyle = `rgb(${r},${g},${b2})`;
            c.fillRect(0, y, BW, 1);
        }

        // Stars (on top floor)
        if (isTop) {
            for (let i = 0; i < 25; i++) {
                const sx = (i * 47 + 13) % BW, sy = (i * 29 + 7) % Math.floor(BH * 0.45);
                const tw = Math.sin(f * 0.04 + i) * 0.3 + 0.6;
                const br = Math.floor(tw * 220);
                c.fillStyle = `rgb(${br},${br},${Math.min(255, br + 30)})`;
                c.fillRect(sx, sy, 2, 2);
            }
        }

        // Sunset clouds (floor 6)
        if (isSunset) {
            for (let i = 0; i < 4; i++) {
                const cx3 = (f * 0.15 + i * 160) % (BW + 100) - 50;
                const cy3 = 30 + i * 25 + Math.sin(i * 2) * 10;
                c.fillStyle = `rgba(200,100,60,${0.15 + Math.sin(f * 0.01 + i) * 0.05})`;
                c.fillRect(cx3, cy3, 80, 12);
                c.fillStyle = `rgba(220,140,80,${0.1})`;
                c.fillRect(cx3 + 10, cy3 - 4, 60, 8);
            }
        }

        // Distant mountains/landscape
        for (let layer = 0; layer < 3; layer++) {
            const mBase = BH * 0.35 + layer * 20;
            c.fillStyle = isTop ? `rgb(${10 + layer * 5},${14 + layer * 6},${24 + layer * 8})` :
                           isSunset ? `rgb(${30 + layer * 10},${15 + layer * 8},${20 + layer * 6})` :
                           `rgb(${15 + layer * 8},${25 + layer * 10},${12 + layer * 6})`;
            c.beginPath(); c.moveTo(0, BH * 0.55);
            for (let x = 0; x <= BW; x += 8) {
                c.lineTo(x, mBase + Math.sin(x * 0.015 + layer * 2) * 20 + Math.sin(x * 0.04 + layer) * 8);
            }
            c.lineTo(BW, BH * 0.55); c.closePath(); c.fill();
        }

        // Green land at horizon
        if (!isTop) {
            c.fillStyle = isSunset ? '#2a3a18' : '#1a3a15';
            c.fillRect(0, BH * 0.48, BW, BH * 0.07);
            // Tiny trees on horizon
            for (let i = 0; i < 20; i++) {
                const tx = i * 30 + 10;
                c.fillStyle = isSunset ? '#1a2a10' : '#103010';
                c.fillRect(tx, BH * 0.46, 6, 10);
                c.fillRect(tx - 2, BH * 0.44, 10, 8);
            }
        }

        // Stone floor
        for (let y = Math.floor(BH * 0.55); y < BH; y++) {
            const t = (y - BH * 0.55) / (BH * 0.45);
            c.fillStyle = `rgb(${Math.floor(35 + t * 8)},${Math.floor(30 + t * 6)},${Math.floor(48 + t * 10)})`;
            c.fillRect(0, y, BW, 1);
        }
        for (let gx = 0; gx < BW; gx += 20) {
            c.fillStyle = 'rgba(60,50,80,0.3)';
            c.fillRect(gx, BH * 0.55 + Math.sin(gx * 0.1) * 3, 18, 3);
        }

        // Pillars framing the view
        for (const px2 of [30, BW - 50]) {
            c.fillStyle = '#3a3060'; c.fillRect(px2, 0, 20, BH * 0.55);
            c.fillStyle = '#4a4070'; c.fillRect(px2 + 4, 0, 12, BH * 0.55);
            c.fillStyle = '#5a5088'; c.fillRect(px2 + 7, 0, 6, BH * 0.55);
            // Capital
            c.fillStyle = '#3a3060'; c.fillRect(px2 - 4, 0, 28, 12);
            c.fillRect(px2 - 4, BH * 0.55 - 8, 28, 8);
        }

        // Arched window frame at top
        c.fillStyle = '#2a2050';
        c.fillRect(50, 0, BW - 100, 8);
        c.fillRect(50, BH * 0.55 - 4, BW - 100, 4);

        // Torches on pillars
        for (const tx of [38, BW - 42]) {
            c.fillStyle = '#5a3a10'; c.fillRect(tx, BH * 0.35, 4, 12);
            const fh = 6 + Math.sin(f * 0.15 + tx) * 3;
            c.fillStyle = `rgb(${220 + Math.floor(Math.sin(f * 0.2 + tx) * 25)},${120 + Math.floor(Math.sin(f * 0.15 + tx) * 30)},30)`;
            c.fillRect(tx - 1, BH * 0.35 - fh, 6, fh);
            c.fillStyle = `rgba(255,150,50,${0.04 + Math.sin(f * 0.1 + tx) * 0.02})`;
            c.beginPath(); c.arc(tx + 2, BH * 0.35, 25, 0, Math.PI * 2); c.fill();
        }
    } else if (loc === 'forest') {
        // --- FOREST ENVIRONMENT (rich, detailed) ---
        // Dappled sky through canopy
        for (let y2 = 0; y2 < BH * 0.5; y2++) {
            const t = y2 / (BH * 0.5);
            const r = Math.floor(15 + t * 25 + Math.sin(y2 * 0.1) * 4);
            const g = Math.floor(30 + t * 45 + Math.sin(y2 * 0.08) * 5);
            const b2 = Math.floor(10 + t * 20);
            c.fillStyle = `rgb(${r},${g},${b2})`;
            c.fillRect(0, y2, BW, 1);
        }

        // Light rays filtering through canopy
        for (let i = 0; i < 4; i++) {
            const rx = 80 + i * 150 + Math.sin(i * 2.5) * 30;
            const sway = Math.sin(f * 0.008 + i) * 8;
            c.fillStyle = `rgba(180,200,80,${0.03 + Math.sin(f * 0.01 + i) * 0.01})`;
            c.beginPath();
            c.moveTo(rx + sway - 8, 0);
            c.lineTo(rx + sway + 8, 0);
            c.lineTo(rx + sway + 30, BH * 0.55);
            c.lineTo(rx + sway - 10, BH * 0.55);
            c.closePath();
            c.fill();
        }

        // Far background trees (dark, distant)
        for (let i = 0; i < 12; i++) {
            const tx = i * 52 + 5 + Math.sin(i * 3.1) * 10;
            const th = 80 + Math.sin(i * 1.7) * 25;
            // Trunk
            c.fillStyle = '#1a2a10';
            c.fillRect(tx + 6, BH * 0.5 - th * 0.35, 5, th * 0.35);
            // Foliage (layered, dark)
            c.fillStyle = '#0e2008';
            c.fillRect(tx - 6, BH * 0.5 - th, 28, th * 0.55);
            c.fillStyle = '#122a0c';
            c.fillRect(tx - 2, BH * 0.5 - th + 6, 20, th * 0.4);
        }

        // Mid-ground trees (more detail)
        for (let i = 0; i < 6; i++) {
            const tx = i * 105 + 20 + Math.sin(i * 2.3) * 20;
            const th = 100 + Math.sin(i * 1.2) * 20;
            const trunkW = 10 + (i % 2) * 4;
            // Trunk with bark texture
            c.fillStyle = '#3a2810';
            c.fillRect(tx + 8, BH * 0.5 - th * 0.4, trunkW, th * 0.4 + 10);
            c.fillStyle = '#4a3818';
            c.fillRect(tx + 10, BH * 0.5 - th * 0.4, trunkW - 4, th * 0.4 + 10);
            // Bark lines
            c.fillStyle = '#2e2010';
            for (let by = 0; by < th * 0.4; by += 8) {
                c.fillRect(tx + 9, BH * 0.5 - th * 0.4 + by, trunkW - 2, 2);
            }
            // Knot
            if (i % 2 === 0) {
                c.fillStyle = '#2a1808';
                c.fillRect(tx + 12, BH * 0.5 - th * 0.2, 5, 5);
                c.fillStyle = '#3a2810';
                c.fillRect(tx + 13, BH * 0.5 - th * 0.2 + 1, 3, 3);
            }
            // Roots
            c.fillStyle = '#3a2810';
            c.fillRect(tx + 4, BH * 0.5 + 4, 8, 4);
            c.fillRect(tx + trunkW + 6, BH * 0.5 + 2, 8, 4);
            // Foliage (5 layers, dark to light)
            c.fillStyle = '#0c2808';
            c.fillRect(tx - 14, BH * 0.5 - th + 10, 48, th * 0.35);
            c.fillStyle = '#143810';
            c.fillRect(tx - 10, BH * 0.5 - th + 4, 40, th * 0.3);
            c.fillStyle = '#1c4818';
            c.fillRect(tx - 6, BH * 0.5 - th, 32, th * 0.25);
            c.fillStyle = '#245820';
            c.fillRect(tx, BH * 0.5 - th - 4, 20, th * 0.18);
            // Leaf highlights
            c.fillStyle = '#30682a';
            c.fillRect(tx - 4, BH * 0.5 - th + 6, 6, 5);
            c.fillRect(tx + 14, BH * 0.5 - th + 12, 8, 4);
            c.fillRect(tx + 6, BH * 0.5 - th + 20, 5, 4);
            // Branches poking out
            c.fillStyle = '#3a2810';
            c.fillRect(tx - 10, BH * 0.5 - th * 0.5, 12, 3);
            c.fillRect(tx + trunkW + 4, BH * 0.5 - th * 0.45, 10, 3);
        }

        // Ground (rich multi-shade)
        for (let y2 = Math.floor(BH * 0.5); y2 < BH; y2++) {
            const t = (y2 - BH * 0.5) / (BH * 0.5);
            c.fillStyle = `rgb(${Math.floor(30 + t * 12)},${Math.floor(60 + t * 15)},${Math.floor(24 + t * 8)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Ground texture
        for (let gx = 0; gx < BW; gx += 10) {
            const shade = Math.sin(gx * 0.3) * 5;
            c.fillStyle = `rgb(${28 + shade},${55 + shade},${22 + shade})`;
            c.fillRect(gx, BH * 0.5, 8, 3);
        }
        // Fallen leaves
        for (let i = 0; i < 8; i++) {
            const lx = (i * 73 + 20) % BW;
            const ly = BH * 0.55 + (i * 37) % Math.floor(BH * 0.35);
            c.fillStyle = ['#6a4a10', '#8a6020', '#5a6a20', '#7a5a18'][i % 4];
            c.fillRect(lx, ly, 4, 3);
        }
        // Mushrooms
        c.fillStyle = '#a03020'; c.fillRect(50, BH * 0.55, 8, 5);
        c.fillStyle = '#c04030'; c.fillRect(51, BH * 0.53, 6, 4);
        c.fillStyle = '#fff'; c.fillRect(53, BH * 0.54, 2, 2);
        c.fillStyle = '#5a3a18'; c.fillRect(53, BH * 0.55 + 4, 3, 5);

        c.fillStyle = '#a03020'; c.fillRect(420, BH * 0.58, 6, 4);
        c.fillStyle = '#c04030'; c.fillRect(421, BH * 0.56, 4, 3);
        c.fillStyle = '#fff'; c.fillRect(422, BH * 0.57, 2, 1);
        c.fillStyle = '#5a3a18'; c.fillRect(422, BH * 0.58 + 3, 2, 4);

        // Grass tufts (denser, varied)
        for (let gx = 6; gx < BW; gx += 12) {
            const sway = Math.sin(f * 0.02 + gx * 0.1) * 2;
            const shade = (gx * 3) % 20;
            c.fillStyle = `rgb(${20 + shade},${50 + shade},${18 + shade})`;
            c.fillRect(gx + sway, BH * 0.5 - 5, 2, 7);
            c.fillRect(gx + 3 + sway, BH * 0.5 - 7, 2, 9);
            c.fillRect(gx + 6 - sway, BH * 0.5 - 4, 2, 6);
        }
        // Flowers on ground
        for (let i = 0; i < 5; i++) {
            const fx2 = 100 + i * 110;
            const fy2 = BH * 0.56 + (i * 23) % 30;
            c.fillStyle = '#1e5020'; c.fillRect(fx2 + 1, fy2 + 3, 1, 4);
            c.fillStyle = ['#e84393', '#ffd93d', '#6c5ce7', '#ff6b6b', '#4ecdc4'][i];
            c.fillRect(fx2, fy2, 3, 3);
            c.fillStyle = '#ffd040'; c.fillRect(fx2 + 1, fy2 + 1, 1, 1);
        }
        // Fireflies (animated)
        for (let i = 0; i < 5; i++) {
            const ffx = 80 + i * 120 + Math.sin(f * 0.015 + i * 2) * 20;
            const ffy = BH * 0.3 + Math.sin(f * 0.02 + i * 3) * 30;
            const ffBright = Math.sin(f * 0.06 + i * 1.5) * 0.3 + 0.3;
            c.fillStyle = `rgba(200,230,80,${ffBright})`;
            c.fillRect(ffx, ffy, 2, 2);
            c.fillStyle = `rgba(200,230,80,${ffBright * 0.3})`;
            c.beginPath(); c.arc(ffx + 1, ffy + 1, 4, 0, Math.PI * 2); c.fill();
        }
    } else if (loc === 'mountains') {
        // --- MOUNTAIN ENVIRONMENT ---
        // Pale blue sky
        for (let y2 = 0; y2 < BH * 0.35; y2++) {
            const t = y2 / (BH * 0.35);
            c.fillStyle = `rgb(${Math.floor(140 + t * 40)},${Math.floor(170 + t * 40)},${Math.floor(210 + t * 20)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Distant mountain range
        for (let layer = 0; layer < 3; layer++) {
            const mBase = BH * 0.25 + layer * 25;
            const shade = 60 + layer * 20;
            c.fillStyle = `rgb(${shade},${shade - 2},${shade - 8})`;
            c.beginPath(); c.moveTo(0, BH * 0.55);
            for (let x2 = 0; x2 <= BW; x2 += 6) {
                c.lineTo(x2, mBase + Math.sin(x2 * 0.012 + layer * 1.5) * 30 + Math.sin(x2 * 0.035 + layer) * 12);
            }
            c.lineTo(BW, BH * 0.55); c.closePath(); c.fill();
            // Snow on peaks
            if (layer < 2) {
                c.fillStyle = `rgba(220,230,240,${0.5 - layer * 0.15})`;
                c.beginPath(); c.moveTo(0, BH * 0.55);
                for (let x2 = 0; x2 <= BW; x2 += 6) {
                    const peak = mBase + Math.sin(x2 * 0.012 + layer * 1.5) * 30 + Math.sin(x2 * 0.035 + layer) * 12;
                    c.lineTo(x2, peak + 8);
                }
                c.lineTo(BW, BH * 0.55); c.closePath(); c.fill();
            }
        }
        // Rocky ground
        for (let y2 = Math.floor(BH * 0.55); y2 < BH; y2++) {
            const t = (y2 - BH * 0.55) / (BH * 0.45);
            c.fillStyle = `rgb(${Math.floor(80 + t * 15)},${Math.floor(76 + t * 12)},${Math.floor(65 + t * 10)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Ground texture (rocky)
        for (let gx = 0; gx < BW; gx += 16) {
            c.fillStyle = '#5a5a4a'; c.fillRect(gx, BH * 0.55, 12, 3);
            c.fillStyle = '#6a6a58'; c.fillRect(gx + 5, BH * 0.57, 8, 2);
        }
        // Scattered rocks
        for (let i = 0; i < 6; i++) {
            const rx = (i * 97 + 30) % BW;
            const ry = BH * 0.6 + (i * 43) % Math.floor(BH * 0.25);
            c.fillStyle = '#5a5850'; c.fillRect(rx, ry, 12, 8);
            c.fillStyle = '#6a6860'; c.fillRect(rx + 2, ry, 8, 6);
        }
        // Pine tree silhouettes
        for (const px2 of [40, 180, 350, 500]) {
            c.fillStyle = '#3a2810'; c.fillRect(px2 + 4, BH * 0.38, 4, BH * 0.17);
            c.fillStyle = '#1a4020';
            c.fillRect(px2 - 4, BH * 0.32, 20, 8);
            c.fillRect(px2 - 2, BH * 0.28, 16, 6);
            c.fillRect(px2, BH * 0.25, 12, 5);
        }
        // Clouds
        for (let i = 0; i < 2; i++) {
            const cx3 = (f * 0.08 + i * 300) % (BW + 80) - 40;
            c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(cx3, 15 + i * 20, 50, 8);
            c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(cx3 + 8, 10 + i * 20, 34, 6);
        }
        // Snow particles
        for (let i = 0; i < 8; i++) {
            const sx = (f * 0.3 + i * 73) % BW;
            const sy = (f * 0.5 + i * 51) % (BH * 0.55);
            c.fillStyle = 'rgba(220,230,240,0.6)';
            c.fillRect(sx, sy, 2, 2);
        }
    } else if (loc === 'beach') {
        // --- BEACH ENVIRONMENT ---
        // Sky gradient (bright blue)
        for (let y2 = 0; y2 < BH * 0.35; y2++) {
            const t = y2 / (BH * 0.35);
            c.fillStyle = `rgb(${Math.floor(80 + t * 60)},${Math.floor(160 + t * 50)},${Math.floor(220 + t * 20)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Clouds
        for (let i = 0; i < 3; i++) {
            const cx3 = (f * 0.1 + i * 200) % (BW + 100) - 50;
            const cy3 = 20 + i * 18;
            c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(cx3, cy3, 60, 10);
            c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(cx3 + 10, cy3 - 5, 40, 8);
            c.fillRect(cx3 + 5, cy3 + 8, 50, 6);
        }
        // Ocean
        for (let y2 = Math.floor(BH * 0.35); y2 < Math.floor(BH * 0.55); y2++) {
            const t = (y2 - BH * 0.35) / (BH * 0.2);
            const wave = Math.sin(y2 * 0.15 + f * 0.03) * 3;
            c.fillStyle = `rgb(${Math.floor(20 + t * 20 + wave)},${Math.floor(80 + t * 40 + wave)},${Math.floor(140 + t * 40)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Wave crests
        for (let i = 0; i < 5; i++) {
            const wy = BH * 0.4 + i * 8;
            const wx = Math.sin(f * 0.02 + i * 1.5) * 15;
            c.fillStyle = 'rgba(200,230,255,0.2)';
            c.fillRect(wx + i * 120, wy, 40, 2);
        }
        // Shore foam line
        const foam = BH * 0.55;
        for (let fx2 = 0; fx2 < BW; fx2 += 6) {
            const fwy = Math.sin(fx2 * 0.1 + f * 0.04) * 3;
            c.fillStyle = 'rgba(220,240,255,0.7)'; c.fillRect(fx2, foam - 4 + fwy, 5, 3);
            c.fillStyle = 'rgba(200,230,255,0.4)'; c.fillRect(fx2 + 2, foam - 7 + fwy, 3, 2);
        }
        // Sandy ground
        for (let y2 = Math.floor(BH * 0.55); y2 < BH; y2++) {
            const t = (y2 - BH * 0.55) / (BH * 0.45);
            c.fillStyle = `rgb(${Math.floor(220 - t * 15)},${Math.floor(195 - t * 15)},${Math.floor(140 - t * 10)})`;
            c.fillRect(0, y2, BW, 1);
        }
        // Sand texture
        for (let gx = 0; gx < BW; gx += 14) {
            c.fillStyle = '#c8a860'; c.fillRect(gx, BH * 0.55 + 2, 10, 2);
        }
        // Beach items: shells, starfish
        c.fillStyle = '#f0c8a0'; c.fillRect(100, BH * 0.65, 5, 4);
        c.fillStyle = '#e8a878'; c.fillRect(350, BH * 0.7, 4, 4);
        c.fillStyle = '#f08050'; c.fillRect(450, BH * 0.62, 5, 5); // starfish
        c.fillRect(448, BH * 0.64, 2, 2); c.fillRect(456, BH * 0.64, 2, 2);
        // Palm tree silhouettes in background
        for (const px2 of [60, BW - 80]) {
            c.fillStyle = '#6a4a28'; c.fillRect(px2, BH * 0.3, 5, BH * 0.25);
            c.fillStyle = '#2a7030'; c.fillRect(px2 - 14, BH * 0.26, 20, 8);
            c.fillRect(px2 + 2, BH * 0.24, 18, 8);
            c.fillRect(px2 - 8, BH * 0.22, 14, 6);
        }
    } else {
        // --- DEFAULT / TOWN ---
        for (let y = 0; y < BH * 0.55; y++) {
            const t = y / (BH * 0.55);
            c.fillStyle = `rgb(${Math.floor(30 + t * 40)},${Math.floor(50 + t * 50)},${Math.floor(80 + t * 30)})`;
            c.fillRect(0, y, BW, 1);
        }
        c.fillStyle = '#4a7a40'; c.fillRect(0, BH * 0.55, BW, BH * 0.45);
        c.fillStyle = '#3a6a30';
        for (let gx = 0; gx < BW; gx += 12) c.fillRect(gx, BH * 0.55, 10, 3);
    }
}

// Pixel art helper: draw a filled rect with black outline
function px(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
}
function pxo(c, x, y, w, h, color) {
    // Outlined pixel block
    c.fillStyle = '#111';
    c.fillRect(x - 1, y - 1, w + 2, h + 2);
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
}

// Sprite category lookup
function getEnemySpriteType(name) {
    const map = {
        'Glitch Goblin': 'goblin', 'Rune Beetle': 'goblin',
        'Paradox Bat': 'bat', 'Fang Bat': 'bat', 'Gloom Moth': 'bat', 'Wind Hawk': 'bat',
        'Fallacy Fox': 'fox', 'Shadow Lynx': 'fox',
        'Cave Slug': 'slime', 'Thorn Sprite': 'slime',
        'Crystal Spider': 'spider', 'Cinder Scorpion': 'spider',
        'Riddle Wraith': 'ghost', 'Shadow Negator': 'ghost', 'Ice Wraith': 'ghost', 'Void Walker': 'ghost', 'Null Entity': 'ghost', 'Ink Phantom': 'ghost',
        'Logic Lord': 'dragon', 'Prismatic Drake': 'dragon',
        'Moss Troll': 'golem', 'Stone Sentinel': 'golem', 'Page Golem': 'golem', 'Frost Construct': 'golem', 'Temple Guardian': 'golem',
        'Ember Wisp': 'fire', 'Magma Beast': 'fire', 'Lava Serpent': 'snake', 'Sand Serpent': 'snake',
        'Phase Jellyfish': 'jelly', 'Jellyfish Drift': 'jelly',
        'Tide Crab': 'spider', 'Coral Sprite': 'slime', 'Gull Phantom': 'bat', 'Shell Golem': 'golem',
        'Frost Wolf': 'fox', 'Boulder Beetle': 'golem', 'Peak Eagle': 'bat', 'Snow Wraith': 'ghost',
        'Iron Ram': 'ram', 'Crystal Yeti': 'golem',
        'Arch-Logician Zephyr': 'wizard'
    };
    return map[name] || 'goblin';
}

function drawBattleEnemy(c, ex, ey, enemy, frame) {
    const eBob = Math.sin(frame * 0.06) * 5;
    const el = ELEMENTS[enemy.element] || { color: '#804040' };
    const elColor = el.color;

    const dk = elColor.replace(/[0-9a-f]{2}/gi, m => Math.max(0, parseInt(m, 16) - 40).toString(16).padStart(2, '0'));
    const lt = elColor.replace(/[0-9a-f]{2}/gi, m => Math.min(255, parseInt(m, 16) + 40).toString(16).padStart(2, '0'));
    const y = ey + eBob;
    const P = 3; // pixel scale

    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.ellipse(ex, ey + 42, 28, 7, 0, 0, Math.PI * 2); c.fill();

    const spriteType = getEnemySpriteType(enemy.name);

    if (spriteType === 'goblin') {
        // --- GOBLIN: pointy ears, hunched, big nose ---
        pxo(c, ex-12, y-8, 24, 28, elColor);       // body
        px(c, ex-8, y+2, 16, 14, lt);                // belly
        pxo(c, ex-10, y-22, 20, 16, elColor);        // head
        px(c, ex-8, y-18, 16, 10, lt);               // face
        // Ears
        pxo(c, ex-16, y-24, 6, 10, elColor); px(c, ex-14, y-22, 3, 6, lt);
        pxo(c, ex+10, y-24, 6, 10, elColor); px(c, ex+12, y-22, 3, 6, lt);
        // Eyes
        px(c, ex-6, y-16, 5, 4, '#fff'); px(c, ex+2, y-16, 5, 4, '#fff');
        px(c, ex-4, y-15, 3, 3, '#200'); px(c, ex+4, y-15, 3, 3, '#200');
        px(c, ex-4, y-16, 2, 1, '#fff'); px(c, ex+4, y-16, 2, 1, '#fff');
        // Nose
        px(c, ex-1, y-12, 4, 4, dk);
        // Mouth
        px(c, ex-5, y-7, 12, 3, '#1a0808');
        px(c, ex-3, y-7, 3, 2, '#fff'); px(c, ex+3, y-7, 3, 2, '#fff');
        // Arms
        pxo(c, ex-18, y-4, 8, 5, dk); pxo(c, ex+12, y-4, 8, 5, dk);
        // Legs
        const la = Math.sin(frame * 0.1) * 2;
        pxo(c, ex-8, y+20+la, 8, 10, dk); pxo(c, ex+2, y+20-la, 8, 10, dk);
        px(c, ex-10, y+28+la, 12, 3, dk); px(c, ex, y+28-la, 12, 3, dk);

    } else if (spriteType === 'bat') {
        // --- BAT: wide wings, small body, fangs, BITES when charging ---
        const biting = battle && battle.enemyCharging;
        const wingFlap = Math.sin(frame * 0.2) * (biting ? 6 : 12);
        const jawOpen = biting ? Math.abs(Math.sin(frame * 0.35)) * 6 : 0;
        // Wings
        pxo(c, ex-35-wingFlap, y-10, 24, 14, dk); px(c, ex-32-wingFlap, y-8, 18, 8, elColor);
        pxo(c, ex+12+wingFlap, y-10, 24, 14, dk); px(c, ex+14+wingFlap, y-8, 18, 8, elColor);
        // Wing tips
        px(c, ex-38-wingFlap, y-14, 6, 6, dk); px(c, ex+34+wingFlap, y-14, 6, 6, dk);
        // Body
        pxo(c, ex-10, y-6, 20, 18, elColor); px(c, ex-6, y-2, 12, 10, lt);
        // Head
        pxo(c, ex-8, y-16, 16, 12, elColor);
        // Ears
        px(c, ex-8, y-22, 4, 8, dk); px(c, ex+4, y-22, 4, 8, dk);
        // Eyes (brighter when biting)
        px(c, ex-5, y-13, 4, 3, biting ? '#ff4040' : '#ff2020');
        px(c, ex+2, y-13, 4, 3, biting ? '#ff4040' : '#ff2020');
        px(c, ex-4, y-12, 2, 2, '#fff'); px(c, ex+3, y-12, 2, 2, '#fff');
        // Mouth/Fangs (jaw opens when biting)
        if (biting) {
            // Open mouth
            px(c, ex-5, y-6-jawOpen, 10, 3, dk); // upper jaw
            px(c, ex-5, y-2+jawOpen, 10, 3, dk); // lower jaw
            px(c, ex-4, y-3, 8, jawOpen + 2, '#600'); // mouth interior
            // Long fangs
            px(c, ex-3, y-5, 2, 5+jawOpen, '#fff');
            px(c, ex+2, y-5, 2, 5+jawOpen, '#fff');
        } else {
            px(c, ex-3, y-5, 2, 4, '#fff'); px(c, ex+2, y-5, 2, 4, '#fff');
        }
        // Feet
        px(c, ex-6, y+12, 4, 4, dk); px(c, ex+3, y+12, 4, 4, dk);

    } else if (spriteType === 'fox') {
        // --- FOX/LYNX: sleek, tail, pointed snout, BITES when charging ---
        const biting = battle && battle.enemyCharging;
        const jawOpen = biting ? Math.abs(Math.sin(frame * 0.3)) * 5 : 0;
        // Body (horizontal)
        pxo(c, ex-18, y-4, 36, 18, elColor); px(c, ex-14, y, 28, 10, lt);
        // Head
        pxo(c, ex-26, y-12, 16, 16, elColor); px(c, ex-24, y-8, 12, 10, lt);
        // Snout (opens when biting)
        px(c, ex-30, y-6-jawOpen, 8, 4, lt); // upper jaw
        px(c, ex-30, y-2+jawOpen, 8, 4, dk); // lower jaw
        px(c, ex-32, y-4-jawOpen, 3, 2, '#111'); // nose
        // Teeth (visible when biting)
        if (biting) {
            px(c, ex-30, y-3, 2, 2+jawOpen, '#fff');
            px(c, ex-26, y-3, 2, 2+jawOpen, '#fff');
            // Red mouth inside
            px(c, ex-29, y-2, 5, jawOpen, '#c03030');
        }
        // Ears
        px(c, ex-24, y-20, 4, 10, elColor); px(c, ex-16, y-20, 4, 10, elColor);
        px(c, ex-23, y-18, 2, 6, '#e8a0a0'); px(c, ex-15, y-18, 2, 6, '#e8a0a0');
        // Eyes (angry when biting)
        px(c, ex-22, y-8, 4, 3, biting ? '#ff2020' : '#fff');
        px(c, ex-21, y-7, 2, 2, biting ? '#ff0' : '#0a0');
        // Tail (flowing)
        const tailW = Math.sin(frame * 0.08) * 6;
        pxo(c, ex+16, y-8+tailW, 14, 6, elColor); pxo(c, ex+26, y-12+tailW, 8, 6, lt);
        // Legs
        const la = Math.sin(frame * 0.12) * 2;
        pxo(c, ex-14, y+14+la, 6, 12, dk); pxo(c, ex-4, y+14-la, 6, 12, dk);
        pxo(c, ex+6, y+14+la, 6, 12, dk); pxo(c, ex+14, y+14-la, 6, 12, dk);

    } else if (spriteType === 'slime') {
        // --- SLIME: blobby, jiggly, cute/menacing ---
        const jiggle = Math.sin(frame * 0.1) * 3;
        pxo(c, ex-16, y-10+jiggle, 32, 30, elColor);
        pxo(c, ex-20, y+4, 40, 16, elColor);
        px(c, ex-12, y-4+jiggle, 24, 18, lt);
        // Drips
        px(c, ex-18, y+18, 4, 6, dk); px(c, ex+14, y+16, 4, 8, dk);
        // Face
        px(c, ex-8, y-4+jiggle, 5, 5, '#fff'); px(c, ex+4, y-4+jiggle, 5, 5, '#fff');
        px(c, ex-6, y-2+jiggle, 3, 3, '#111'); px(c, ex+6, y-2+jiggle, 3, 3, '#111');
        // Mouth
        px(c, ex-4, y+6+jiggle, 10, 3, '#1a0808');
        // Shine
        px(c, ex-10, y-8+jiggle, 4, 4, lt);

    } else if (spriteType === 'spider') {
        // --- SPIDER: 8 legs, round body, fangs ---
        // Abdomen
        pxo(c, ex-4, y+2, 18, 14, dk);
        // Body
        pxo(c, ex-10, y-10, 20, 18, elColor); px(c, ex-6, y-6, 12, 10, lt);
        // Eyes (8 eyes!)
        for (let i = 0; i < 4; i++) { px(c, ex-8+i*5, y-8, 3, 3, '#ff2020'); px(c, ex-7+i*5, y-7, 1, 1, '#fff'); }
        // Fangs
        px(c, ex-4, y+6, 2, 5, '#ddd'); px(c, ex+4, y+6, 2, 5, '#ddd');
        // Legs (4 per side)
        for (let i = 0; i < 4; i++) {
            const la2 = Math.sin(frame * 0.15 + i) * 3;
            px(c, ex-16-i*4, y-6+i*5+la2, 8, 2, '#111');
            px(c, ex+10+i*4, y-6+i*5-la2, 8, 2, '#111');
        }

    } else if (spriteType === 'ghost') {
        // --- GHOST/WRAITH: floating, wispy tail, hollow eyes ---
        const float = Math.sin(frame * 0.07) * 4;
        // Wispy bottom
        for (let i = 0; i < 5; i++) {
            const wx = ex - 16 + i * 8;
            const wy = y + 16 + float + Math.sin(frame * 0.1 + i) * 4;
            px(c, wx, wy, 6, 10, `rgba(${parseInt(elColor.slice(1,3),16)},${parseInt(elColor.slice(3,5),16)},${parseInt(elColor.slice(5,7),16)},0.5)`);
        }
        // Body
        c.globalAlpha = 0.85;
        pxo(c, ex-16, y-18+float, 32, 36, elColor);
        px(c, ex-12, y-12+float, 24, 24, lt);
        c.globalAlpha = 1;
        // Hood/head
        pxo(c, ex-14, y-26+float, 28, 14, dk);
        px(c, ex-10, y-24+float, 20, 8, elColor);
        // Eyes (hollow, glowing)
        px(c, ex-8, y-16+float, 6, 6, '#000'); px(c, ex+3, y-16+float, 6, 6, '#000');
        px(c, ex-6, y-14+float, 3, 3, elColor); px(c, ex+5, y-14+float, 3, 3, elColor);

    } else if (spriteType === 'dragon') {
        // --- DRAGON: wings, long neck, tail, scales ---
        const wingF = Math.sin(frame * 0.08) * 8;
        // Wings
        pxo(c, ex-36, y-24-wingF, 20, 20, dk); px(c, ex-32, y-20-wingF, 14, 12, elColor);
        pxo(c, ex+18, y-24-wingF, 20, 20, dk); px(c, ex+20, y-20-wingF, 14, 12, elColor);
        // Body
        pxo(c, ex-14, y-6, 28, 26, elColor); px(c, ex-10, y-2, 20, 16, lt);
        // Scales
        for (let i = 0; i < 3; i++) px(c, ex-8+i*8, y+2, 5, 4, dk);
        // Neck/Head
        pxo(c, ex-22, y-22, 18, 18, elColor); px(c, ex-18, y-18, 12, 10, lt);
        // Snout
        px(c, ex-28, y-16, 10, 8, elColor); px(c, ex-30, y-14, 4, 3, '#111');
        // Eye
        px(c, ex-18, y-18, 5, 4, '#fff'); px(c, ex-16, y-17, 3, 3, '#c02020');
        px(c, ex-16, y-18, 2, 1, '#fff');
        // Horns
        px(c, ex-18, y-28, 3, 8, '#c0a040'); px(c, ex-12, y-28, 3, 8, '#c0a040');
        // Teeth
        px(c, ex-26, y-10, 2, 3, '#fff'); px(c, ex-22, y-10, 2, 3, '#fff');
        // Tail
        const tw = Math.sin(frame * 0.06) * 5;
        pxo(c, ex+12, y+6+tw, 16, 6, dk); pxo(c, ex+26, y+4+tw, 10, 5, dk);
        px(c, ex+34, y+2+tw, 6, 4, elColor);
        // Legs
        pxo(c, ex-10, y+20, 8, 12, dk); pxo(c, ex+4, y+20, 8, 12, dk);
        px(c, ex-12, y+30, 12, 3, dk); px(c, ex+2, y+30, 12, 3, dk);

    } else if (spriteType === 'golem') {
        // --- GOLEM: massive, blocky, rocky ---
        // Body (large rectangular)
        pxo(c, ex-18, y-14, 36, 34, elColor);
        px(c, ex-14, y-10, 28, 26, lt);
        // Rock texture
        px(c, ex-10, y-4, 8, 6, dk); px(c, ex+6, y+2, 6, 5, dk); px(c, ex-4, y+10, 10, 4, dk);
        // Head
        pxo(c, ex-12, y-28, 24, 16, dk);
        px(c, ex-8, y-24, 16, 8, elColor);
        // Eyes (glowing)
        px(c, ex-6, y-22, 5, 4, '#fff'); px(c, ex+3, y-22, 5, 4, '#fff');
        px(c, ex-4, y-21, 3, 3, '#40a0ff'); px(c, ex+5, y-21, 3, 3, '#40a0ff');
        // Mouth (crack)
        px(c, ex-4, y-16, 10, 2, '#1a1a1a');
        // Arms (massive)
        pxo(c, ex-30, y-8, 14, 10, dk); pxo(c, ex-28, y, 10, 16, elColor);
        pxo(c, ex+18, y-8, 14, 10, dk); pxo(c, ex+20, y, 10, 16, elColor);
        // Fists
        px(c, ex-30, y+14, 12, 8, dk); px(c, ex+20, y+14, 12, 8, dk);
        // Legs (thick)
        pxo(c, ex-14, y+20, 12, 14, dk); pxo(c, ex+4, y+20, 12, 14, dk);

    } else if (spriteType === 'fire') {
        // --- FIRE CREATURE: flames, ember eyes ---
        const flicker = Math.sin(frame * 0.15) * 3;
        // Flame body
        pxo(c, ex-14, y-6, 28, 26, elColor);
        px(c, ex-10, y-2, 20, 16, lt);
        // Flame top
        px(c, ex-8, y-14+flicker, 16, 10, elColor);
        px(c, ex-4, y-22+flicker, 8, 10, '#ff8800');
        px(c, ex-2, y-28+flicker, 4, 8, '#ffcc00');
        // Side flames
        px(c, ex-18, y-8+flicker, 6, 10, '#ff6600');
        px(c, ex+14, y-10-flicker, 6, 12, '#ff6600');
        // Eyes
        px(c, ex-6, y-2, 5, 5, '#fff'); px(c, ex+3, y-2, 5, 5, '#fff');
        px(c, ex-4, y, 3, 3, '#111'); px(c, ex+5, y, 3, 3, '#111');
        // Mouth
        px(c, ex-5, y+8, 12, 4, '#1a0000');
        px(c, ex-3, y+8, 3, 3, '#ff0'); px(c, ex+3, y+8, 3, 3, '#ff0');

    } else if (spriteType === 'snake') {
        // --- SNAKE: coiled body, forked tongue ---
        // Coils
        const sw = Math.sin(frame * 0.06) * 3;
        pxo(c, ex-10, y+6, 24, 10, elColor); px(c, ex-6, y+8, 16, 6, lt);
        pxo(c, ex-16, y-2+sw, 20, 10, dk); px(c, ex-12, y+sw, 14, 6, elColor);
        pxo(c, ex-6, y-10, 18, 10, elColor); px(c, ex-2, y-8, 12, 6, lt);
        // Head
        pxo(c, ex-18, y-20, 16, 14, elColor); px(c, ex-14, y-16, 10, 8, lt);
        // Eyes
        px(c, ex-14, y-16, 4, 3, '#fff'); px(c, ex-6, y-16, 4, 3, '#fff');
        px(c, ex-12, y-15, 2, 2, '#c02020'); px(c, ex-4, y-15, 2, 2, '#c02020');
        // Tongue
        const tFlick = Math.sin(frame * 0.2) > 0 ? 1 : 0;
        if (tFlick) { px(c, ex-22, y-14, 6, 1, '#c03030'); px(c, ex-24, y-15, 2, 1, '#c03030'); px(c, ex-24, y-13, 2, 1, '#c03030'); }
        // Tail
        pxo(c, ex+12, y+4+sw, 12, 5, dk); px(c, ex+22, y+2+sw, 4, 3, elColor);

    } else if (spriteType === 'ram') {
        // --- RAM: stocky body, big curled horns, hooves ---
        const headBob = Math.sin(frame * 0.08) * 2;
        // Body (thick, barrel-shaped)
        pxo(c, ex-16, y-4, 32, 22, elColor); px(c, ex-12, y, 24, 14, lt);
        // Woolly texture on body
        px(c, ex-10, y-2, 6, 4, dk); px(c, ex+4, y+2, 5, 4, dk); px(c, ex-4, y+6, 8, 3, dk);
        // Head (lower, forward-facing)
        pxo(c, ex-26, y-14+headBob, 18, 18, elColor); px(c, ex-22, y-10+headBob, 12, 10, lt);
        // Snout
        px(c, ex-30, y-6+headBob, 8, 8, lt);
        px(c, ex-32, y-2+headBob, 3, 3, '#222'); // nose
        // Eyes
        px(c, ex-22, y-10+headBob, 4, 3, '#fff'); px(c, ex-20, y-9+headBob, 2, 2, '#111');
        // Curled horns (big, distinctive)
        // Left horn (curls back and down)
        px(c, ex-24, y-24+headBob, 6, 4, '#8a7a58');
        px(c, ex-28, y-22+headBob, 6, 4, '#8a7a58');
        px(c, ex-30, y-18+headBob, 4, 6, '#8a7a58');
        px(c, ex-28, y-14+headBob, 4, 4, '#8a7a58');
        // Horn highlight
        px(c, ex-24, y-23+headBob, 4, 2, '#a89868');
        px(c, ex-29, y-20+headBob, 2, 4, '#a89868');
        // Right horn (curls other way)
        px(c, ex-14, y-24+headBob, 6, 4, '#8a7a58');
        px(c, ex-10, y-22+headBob, 6, 4, '#8a7a58');
        px(c, ex-8, y-18+headBob, 4, 6, '#8a7a58');
        px(c, ex-10, y-14+headBob, 4, 4, '#8a7a58');
        px(c, ex-14, y-23+headBob, 4, 2, '#a89868');
        px(c, ex-9, y-20+headBob, 2, 4, '#a89868');
        // Ears (small, between horns)
        px(c, ex-22, y-20+headBob, 3, 5, dk); px(c, ex-15, y-20+headBob, 3, 5, dk);
        // Legs (sturdy, with hooves)
        const la = Math.sin(frame * 0.1) * 2;
        pxo(c, ex-12, y+18+la, 8, 14, dk); pxo(c, ex-2, y+18-la, 8, 14, dk);
        pxo(c, ex+6, y+18+la, 8, 14, dk);
        // Hooves
        px(c, ex-13, y+30+la, 10, 4, '#333'); px(c, ex-3, y+30-la, 10, 4, '#333');
        px(c, ex+5, y+30+la, 10, 4, '#333');
        // Short tail
        px(c, ex+14, y-2, 6, 5, dk); px(c, ex+18, y-4, 4, 4, elColor);

    } else if (spriteType === 'jelly') {
        // --- JELLYFISH: dome top, trailing tentacles ---
        const pulse = Math.sin(frame * 0.1) * 3;
        // Dome
        c.globalAlpha = 0.8;
        pxo(c, ex-16, y-16+pulse, 32, 20, elColor);
        px(c, ex-12, y-12+pulse, 24, 12, lt);
        c.globalAlpha = 1;
        // Dome highlight
        px(c, ex-6, y-14+pulse, 8, 4, '#fff');
        // Eyes
        px(c, ex-6, y-6+pulse, 4, 4, '#fff'); px(c, ex+4, y-6+pulse, 4, 4, '#fff');
        px(c, ex-4, y-4+pulse, 2, 2, '#111'); px(c, ex+6, y-4+pulse, 2, 2, '#111');
        // Tentacles
        for (let i = 0; i < 6; i++) {
            const tx = ex - 14 + i * 6;
            const tw2 = Math.sin(frame * 0.08 + i * 0.8) * 4;
            c.fillStyle = `rgba(${parseInt(elColor.slice(1,3),16)},${parseInt(elColor.slice(3,5),16)},${parseInt(elColor.slice(5,7),16)},0.6)`;
            c.fillRect(tx + tw2, y + 4, 2, 20 + Math.sin(i) * 6);
        }

    } else { // wizard
        // --- WIZARD: robed, staff, magical aura ---
        const aura = Math.sin(frame * 0.06) * 0.15 + 0.2;
        c.fillStyle = `rgba(160,100,255,${aura})`; c.beginPath(); c.arc(ex, y, 40, 0, Math.PI * 2); c.fill();
        // Robe
        pxo(c, ex-16, y-6, 32, 30, '#2a1050');
        px(c, ex-12, y-2, 24, 22, '#3a2060');
        pxo(c, ex-18, y+18, 36, 8, '#1a0838');
        // Head
        pxo(c, ex-10, y-22, 20, 18, '#ffd5a3');
        px(c, ex-6, y-18, 12, 10, '#ffe0b0');
        // Hat (pointed wizard hat)
        pxo(c, ex-14, y-28, 28, 10, '#1a0838');
        pxo(c, ex-8, y-38, 16, 12, '#2a1050');
        pxo(c, ex-4, y-48, 8, 12, '#3a2060');
        px(c, ex-2, y-52, 4, 6, '#4a3080');
        // Hat star
        px(c, ex-1, y-50, 3, 3, '#f0e040');
        // Eyes (glowing purple)
        px(c, ex-6, y-16, 5, 4, '#fff'); px(c, ex+2, y-16, 5, 4, '#fff');
        px(c, ex-4, y-15, 3, 3, '#8040c0'); px(c, ex+4, y-15, 3, 3, '#8040c0');
        // Beard
        px(c, ex-4, y-6, 10, 8, '#ccc'); px(c, ex-2, y, 6, 6, '#ddd');
        // Staff
        px(c, ex+20, y-40, 3, 50, '#5a3010');
        // Staff orb
        c.fillStyle = '#c060ff'; c.beginPath(); c.arc(ex+21, y-44, 6, 0, Math.PI*2); c.fill();
        c.fillStyle = '#e0a0ff'; c.beginPath(); c.arc(ex+21, y-45, 3, 0, Math.PI*2); c.fill();
    }

    // Charging speed lines (all types)
    if (battle && battle.enemyCharging) {
        for (let i = 0; i < 4; i++) {
            c.fillStyle = 'rgba(255,50,50,0.3)';
            c.fillRect(ex + 30 + i * 8, ey - 10 + i * 6 + eBob, 20, 3);
        }
    }
}

function battleRender() {
    const b = battle;
    const c = battleCtx;

    // --- Environment Background ---
    drawBattleBackground(c);

    // --- Escape Door (arch flush with ground) ---
    if (!b.over) {
        const dx = b.escapeDoorX, dy = b.escapeDoorY; // dy = ground level
        const archW = 24, archH = 40;
        if (b.escapeDoorBlocked) {
            // Blocked arch - boarded up
            c.fillStyle = '#3a3030';
            c.fillRect(dx - archW/2, dy - archH, archW, archH);
            // Boards
            c.fillStyle = '#5a4020';
            c.fillRect(dx - archW/2 - 2, dy - archH * 0.7, archW + 4, 3);
            c.fillRect(dx - archW/2 - 2, dy - archH * 0.4, archW + 4, 3);
            c.fillRect(dx - archW/2 - 2, dy - archH * 0.15, archW + 4, 3);
            // X mark
            c.strokeStyle = '#a03030';
            c.lineWidth = 2;
            c.beginPath(); c.moveTo(dx - 8, dy - archH + 6); c.lineTo(dx + 8, dy - 4); c.stroke();
            c.beginPath(); c.moveTo(dx + 8, dy - archH + 6); c.lineTo(dx - 8, dy - 4); c.stroke();
        } else {
            // Open arch with glow
            const pulse = Math.sin(b.frame * 0.06) * 0.08 + 0.15;
            // Glow
            c.fillStyle = `rgba(100,200,100,${pulse})`;
            c.beginPath(); c.arc(dx, dy - archH/2, archW, 0, Math.PI * 2); c.fill();
            // Stone arch frame
            c.fillStyle = '#5a5a50';
            // Left pillar
            c.fillRect(dx - archW/2 - 3, dy - archH, 5, archH);
            // Right pillar
            c.fillRect(dx + archW/2 - 2, dy - archH, 5, archH);
            // Arch top (curved)
            c.beginPath();
            c.arc(dx, dy - archH, archW/2 + 1, Math.PI, 0, false);
            c.lineWidth = 5;
            c.strokeStyle = '#5a5a50';
            c.stroke();
            // Dark opening (the passage)
            c.fillStyle = '#0a0a08';
            c.fillRect(dx - archW/2 + 2, dy - archH + 2, archW - 4, archH - 2);
            // Arch top inner (dark)
            c.beginPath();
            c.arc(dx, dy - archH, archW/2 - 2, Math.PI, 0, false);
            c.fillStyle = '#0a0a08';
            c.fill();
            // EXIT text
            c.fillStyle = '#4ecca3';
            c.font = '6px "Press Start 2P", monospace';
            c.textAlign = 'center';
            c.fillText('EXIT', dx, dy - archH - 6);
        }
    }

    // Particles (behind characters)
    b.particles.forEach(p => {
        c.fillStyle = p.color;
        c.globalAlpha = p.life / 25;
        c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    c.globalAlpha = 1;

    // --- Draw Player (using detailed sprite) ---
    if (b.iframes > 0 && b.frame % 4 < 2) {
        // Flicker when hit
    } else {
        // Shadow
        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath();
        c.ellipse(b.px, b.py + 30, 16, 5, 0, 0, Math.PI * 2);
        c.fill();

        // Use the detailed character sprite (flipped based on facing)
        const f = b.pFacing;
        c.save();
        c.translate(b.px, b.py);
        c.scale(f, 1); // flip horizontally when facing left
        const bMoving = keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'] || keys['w'] || keys['a'] || keys['s'] || keys['d'];
        drawCharSprite(c, 0, 0, state.character, b.frame, 2, bMoving);
        c.restore();

        // Shield (on facing side)
        if (b.blocking) {
            c.fillStyle = 'rgba(93, 173, 226, 0.4)';
            c.beginPath();
            c.ellipse(b.px + 20 * f, b.py, 14, 30, 0, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = '#5dade2';
            c.lineWidth = 2;
            c.stroke();
        }

        // Weapon (direction-aware)
        if (b.swinging && b.weapon.type === 'melee') {
            c.save();
            c.translate(b.px + 16 * f, b.py);
            c.scale(f, 1);
            c.rotate((b.swingAngle - 60) * Math.PI / 180);
            c.fillStyle = b.weapon.color;
            c.fillRect(0, -4, b.weapon.range, 8);
            c.fillStyle = '#fff';
            c.fillRect(b.weapon.range - 5, -5, 5, 10);
            c.restore();
        } else {
            c.fillStyle = b.weapon.color;
            if (b.weapon.type === 'melee') {
                c.fillRect(b.px + 14 * f, b.py - 6, 24 * f, 5);
            } else {
                c.fillRect(b.px + 10 * f, b.py - 24, 5, 38);
                c.fillStyle = '#e879f9';
                c.beginPath();
                c.arc(b.px + 12 * f, b.py - 26, 7, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = '#fff';
                c.beginPath();
                c.arc(b.px + 12 * f, b.py - 27, 3, 0, Math.PI * 2);
                c.fill();
            }
        }
    }

    // --- Draw Enemy (large, detailed pixel creature) ---
    drawBattleEnemy(c, b.ex, b.ey, state.currentEnemy, b.frame);

    // --- Projectiles ---
    b.playerProjectiles.forEach(p => {
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        c.fill();
        // Inner glow
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        c.fill();
    });

    b.enemyProjectiles.forEach(p => {
        if (p.type === 'icebeam') {
            // Solid horizontal beam
            const len = p.beamLen || 30;
            c.fillStyle = p.color;
            c.fillRect(p.x - len, p.y - 2, len, 4);
            c.fillStyle = '#c0e8ff';
            c.fillRect(p.x - len + 2, p.y - 1, len - 4, 2);
            // Frost particles
            c.fillStyle = 'rgba(200,230,255,0.4)';
            c.fillRect(p.x - len * Math.random(), p.y - 4, 2, 2);
        } else if (p.type === 'shadow') {
            // Purple homing orb with trail
            c.fillStyle = 'rgba(80,30,120,0.3)';
            c.beginPath(); c.arc(p.x + 4, p.y, p.size + 4, 0, Math.PI * 2); c.fill();
            c.fillStyle = p.color;
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#c080ff';
            c.beginPath(); c.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2); c.fill();
        } else if (p.type === 'bomb') {
            // Dark arcing bomb
            c.fillStyle = '#333';
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            c.fillStyle = p.color;
            c.beginPath(); c.arc(p.x, p.y, p.size - 2, 0, Math.PI * 2); c.fill();
            // Fuse spark
            c.fillStyle = '#ff8';
            c.fillRect(p.x, p.y - p.size - 2, 2, 3);
        } else if (p.type === 'laser') {
            // Warning line then full beam
            if (p.laserWarning > 0) {
                // Warning: thin blinking red line
                c.strokeStyle = `rgba(255,50,50,${(b.frame % 6 < 3) ? 0.5 : 0.2})`;
                c.lineWidth = 1;
                c.setLineDash([4, 4]);
                c.beginPath(); c.moveTo(0, p.y); c.lineTo(BW, p.y); c.stroke();
                c.setLineDash([]);
            } else {
                // Full beam
                c.fillStyle = p.color;
                c.fillRect(0, p.y - 4, BW, 8);
                c.fillStyle = '#fff';
                c.fillRect(0, p.y - 1, BW, 2);
                c.fillStyle = `rgba(255,255,255,0.2)`;
                c.fillRect(0, p.y - 8, BW, 16);
            }
        } else {
            // Default fireball
            c.fillStyle = p.color;
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#fff';
            c.beginPath(); c.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2); c.fill();
            // Trail
            c.fillStyle = `${p.color}60`;
            c.beginPath(); c.arc(p.x + 6, p.y, p.size * 0.6, 0, Math.PI * 2); c.fill();
        }
    });

    // Electric charge warning (visual)
    if (b.electricCharging && b.electricTimer > 0) {
        const intensity = 1 - (b.electricTimer / 45);
        c.strokeStyle = `rgba(240,224,64,${intensity * 0.4})`;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(b.ex, b.ey, 40 + intensity * 60, 0, Math.PI * 2);
        c.stroke();
        // Spark particles
        for (let i = 0; i < 4; i++) {
            const angle = b.frame * 0.15 + i * Math.PI / 2;
            const sr = 30 + intensity * 50;
            c.fillStyle = '#f0e040';
            c.fillRect(b.ex + Math.cos(angle) * sr - 1, b.ey + Math.sin(angle) * sr - 1, 3, 3);
        }
    }

    // --- ZordCage in flight ---
    if (b.cageFlying) {
        c.font = '20px serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        const spin = Math.sin(b.frame * 0.3) * 0.3;
        c.save();
        c.translate(b.cageX, b.cageY);
        c.rotate(spin);
        c.fillText('\u{1F3C0}', 0, 0);  // cage-like sphere
        c.restore();
    }

    // --- Damage numbers ---
    b.damageNums.forEach(d => {
        c.fillStyle = d.color;
        c.globalAlpha = d.life / 40;
        c.font = '12px "Press Start 2P", monospace';
        c.textAlign = 'center';
        c.fillText(d.text, d.x, d.y);
    });
    c.globalAlpha = 1;
}

function endBattle(victory) {
    battle.over = true;
    const enemy = state.currentEnemy;
    const resultEl = document.getElementById('battle-result');
    const textEl = document.getElementById('battle-result-text');
    const btnEl = document.getElementById('battle-result-btn');

    if (victory) {
        const quizBonus = state.character.perk === 'scholar' ? state.quizCorrect * 2 : state.quizCorrect;
        const rubiesEarned = enemy.rubies + quizBonus;
        state.rubies += rubiesEarned;
        state.hp = battle.playerHp;
        if (!state.defeatedEnemies.includes(enemy.name)) state.defeatedEnemies.push(enemy.name);
        // Mark zone enemy as defeated only on victory
        if (state._pendingZoneKey && !state.defeatedZones.has(state._pendingZoneKey)) {
            state.defeatedZones.add(state._pendingZoneKey);
        }
        state._pendingZoneKey = null;
        trackEnemyDefeated();
        trackRubiesEarned(rubiesEarned);
        if (enemy.name === 'Arch-Logician Zephyr') stats.bossDefeated = true;

        textEl.innerHTML = `${enemy.name} defeated!<br><br>+${rubiesEarned} rubies<br><span style="font-size:9px;color:var(--text-dim)">(${enemy.rubies} base + ${state.quizCorrect} quiz bonus)</span>`;
        btnEl.textContent = 'Continue';
        playSound('victory');
    } else {
        state.hp = 1;
        state._pendingZoneKey = null;
        state._encounterCooldown = 90;
        trackDeath();
        textEl.innerHTML = `You were defeated...<br><br><span style="color:var(--accent)">You escape with 1 HP</span>`;
        btnEl.textContent = 'Return';
        playSound('defeat');
    }

    resultEl.style.display = 'flex';
    btnEl.onclick = () => {
        battle.running = false;
        battle = null;
        updateHUD();
        showScreen('game');
    };
}

// ============================================================
// RENDERING
// ============================================================
// Pseudo-random per-tile (deterministic based on position)
function tileRand(col, row, seed) {
    return ((col * 73 + row * 137 + seed * 31) % 256) / 256;
}

function drawTile(col, row, tileType) {
    const x = col * TILE;
    const y = row * TILE;
    const S = TILE; // tile size
    const r = (s) => tileRand(col, row, s);

    // === GRASS ===
    if (tileType === T.GRASS) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#3a8044' : '#378040';
        ctx.fillRect(x, y, S, S);
        // Cross-hatch texture
        for (let dy = 0; dy < S; dy += 4) for (let dx = 0; dx < S; dx += 4) {
            if ((dx + dy + col * 3) % 8 === 0) { ctx.fillStyle = '#329038'; ctx.fillRect(x+dx, y+dy, 3, 2); }
            if ((dx + dy + row * 5) % 12 === 0) { ctx.fillStyle = '#2d7035'; ctx.fillRect(x+dx, y+dy, 2, 3); }
        }
        // Random darker patches
        ctx.fillStyle = '#2c6a32'; ctx.fillRect(x+r(1)*30+4, y+r(2)*30+4, 8, 6);
        ctx.fillStyle = '#4a9a50'; ctx.fillRect(x+r(3)*35+2, y+r(4)*35+2, 5, 3);
        // Grass blades
        if (r(5) > 0.4) {
            ctx.fillStyle = '#256828';
            for (let i = 0; i < 3; i++) {
                const gx = x + r(6+i) * (S-8) + 4;
                const gh = 6 + r(9+i) * 6;
                ctx.fillRect(gx, y + S - gh, 2, gh);
            }
        }
        return;
    }

    // === WATER ===
    if (tileType === T.WATER) {
        ctx.fillStyle = '#165880';
        ctx.fillRect(x, y, S, S);
        for (let dy = 0; dy < S; dy += 5) {
            const w = Math.sin((state.animFrame*0.04) + col*0.7 + dy*0.15) * 5;
            ctx.fillStyle = '#1e6a98'; ctx.fillRect(x, y+dy+w, S, 3);
        }
        for (let dy = 2; dy < S; dy += 10) {
            const w = Math.sin((state.animFrame*0.06) + col + row + dy*0.25) * 4;
            ctx.fillStyle = '#3890b8'; ctx.fillRect(x+6+w, y+dy, 18, 2);
        }
        ctx.fillStyle = '#50a8d0';
        const sx = Math.sin(state.animFrame*0.03+col*2+row)*12+S/2;
        const sy2 = Math.cos(state.animFrame*0.04+row*2+col)*10+S/2;
        ctx.fillRect(x+sx-1, y+sy2-1, 3, 3);
        // Foam edge hint
        ctx.fillStyle = 'rgba(200,230,255,0.15)';
        ctx.fillRect(x, y, S, 3); ctx.fillRect(x, y+S-3, S, 3);
        return;
    }

    // === PATH ===
    if (tileType === T.PATH || tileType === T.BRIDGE) {
        ctx.fillStyle = tileType === T.BRIDGE ? '#9a7845' : '#b09858';
        ctx.fillRect(x, y, S, S);
        ctx.fillStyle = tileType === T.BRIDGE ? '#886838' : '#a08848';
        for (let dy = 0; dy < S; dy += 6) ctx.fillRect(x, y+dy, S, 2);
        for (let dx = 0; dx < S; dx += 8) ctx.fillRect(x+dx, y, 2, S);
        // Pebbles
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i%2===0 ? '#8a7848' : '#c0a868';
            ctx.fillRect(x+r(i)*36+4, y+r(i+4)*36+4, 4, 3);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x, y, S, 2); ctx.fillRect(x, y, 2, S);
        return;
    }

    // === TREE ===
    if (tileType === T.TREE) {
        ctx.fillStyle = (col+row)%2===0 ? '#3a8044' : '#378040';
        ctx.fillRect(x, y, S, S);
        // Trunk
        ctx.fillStyle = '#4a2a10'; ctx.fillRect(x+18, y+28, 12, 20);
        ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x+20, y+28, 8, 20);
        ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x+22, y+30, 4, 16);
        // Foliage (5 layers)
        ctx.fillStyle = '#154018'; ctx.fillRect(x+2, y+20, 44, 14);
        ctx.fillStyle = '#1a5020'; ctx.fillRect(x+4, y+14, 40, 14);
        ctx.fillStyle = '#206828'; ctx.fillRect(x+6, y+8, 36, 12);
        ctx.fillStyle = '#288030'; ctx.fillRect(x+10, y+4, 28, 10);
        ctx.fillStyle = '#30983a'; ctx.fillRect(x+14, y+1, 20, 8);
        // Leaf highlights
        ctx.fillStyle = '#40aa48';
        ctx.fillRect(x+10, y+6, 5, 4);
        ctx.fillRect(x+28, y+10, 6, 3);
        ctx.fillRect(x+16, y+16, 4, 3);
        // Shadow under tree
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x+6, y+S-8, 36, 8);
        return;
    }

    // === ROCK ===
    if (tileType === T.ROCK) {
        ctx.fillStyle = (col+row)%2===0 ? '#3a8044' : '#378040';
        ctx.fillRect(x, y, S, S);
        // Rock shape
        ctx.fillStyle = '#606060'; ctx.fillRect(x+6, y+10, 36, 30);
        ctx.fillRect(x+10, y+6, 28, 36);
        // 3D shading
        ctx.fillStyle = '#808080'; ctx.fillRect(x+10, y+8, 20, 14);
        ctx.fillStyle = '#909090'; ctx.fillRect(x+12, y+10, 12, 8);
        ctx.fillStyle = '#505050'; ctx.fillRect(x+10, y+30, 28, 8);
        // Cracks
        ctx.fillStyle = '#484848';
        ctx.fillRect(x+16, y+14, 1, 12);
        ctx.fillRect(x+26, y+18, 1, 8);
        ctx.fillRect(x+18, y+22, 8, 1);
        // Moss
        if (r(1) > 0.5) { ctx.fillStyle = '#406a30'; ctx.fillRect(x+8, y+8, 6, 3); }
        return;
    }

    // === CAVE FLOOR ===
    if (tileType === T.CAVE_FL) {
        ctx.fillStyle = (col+row)%2===0 ? '#3a3858' : '#383654';
        ctx.fillRect(x, y, S, S);
        // Stone texture
        for (let dy = 0; dy < S; dy += 8) for (let dx = 0; dx < S; dx += 8) {
            if ((dx+dy+col*5)%16===0) { ctx.fillStyle = '#343250'; ctx.fillRect(x+dx, y+dy, 6, 4); }
        }
        // Cracks
        ctx.fillStyle = '#2e2c48';
        ctx.fillRect(x+r(1)*30+4, y+r(2)*30+4, 1, 10);
        ctx.fillRect(x+r(3)*28+8, y+r(4)*28+8, 8, 1);
        // Pebbles
        ctx.fillStyle = '#46445e'; ctx.fillRect(x+r(5)*36+4, y+r(6)*36+4, 4, 3);
        ctx.fillStyle = '#4e4c68'; ctx.fillRect(x+r(7)*32+8, y+r(8)*32+8, 3, 3);
        return;
    }

    // === CAVE WALL ===
    if (tileType === T.CAVE_W) {
        ctx.fillStyle = '#28263c';
        ctx.fillRect(x, y, S, S);
        // Brick pattern
        const off = (row%2) * (S/2);
        ctx.fillStyle = '#222038';
        for (let bx = 0; bx < S; bx += S/2) ctx.fillRect(x+((bx+off)%S), y, 1, S);
        ctx.fillRect(x, y+S/2-1, S, 1);
        // Depth variation
        ctx.fillStyle = '#302e48'; ctx.fillRect(x+r(1)*28+4, y+r(2)*20+4, 12, 8);
        ctx.fillStyle = '#1e1c34'; ctx.fillRect(x+r(3)*24+8, y+r(4)*24+12, 8, 6);
        return;
    }

    // === BUILDINGS ===
    if (tileType === T.HOUSE || tileType === T.STORE || tileType === T.BUILD) {
        ctx.fillStyle = '#3a8044'; ctx.fillRect(x, y, S, S);
        const wc = tileType===T.STORE?'#c4a060':tileType===T.BUILD?'#6a8a50':'#b0885a';
        const rc = tileType===T.STORE?'#2060a0':tileType===T.BUILD?'#506838':'#a04030';
        // Wall
        ctx.fillStyle = wc; ctx.fillRect(x+3, y+16, S-6, S-18);
        // Wall detail
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let dy = 18; dy < S; dy += 6) ctx.fillRect(x+3, y+dy, S-6, 1);
        // Roof
        ctx.fillStyle = rc; ctx.fillRect(x-1, y+4, S+2, 16);
        ctx.fillStyle = rc.replace(/[0-9a-f]{2}/gi, m=>Math.min(255,parseInt(m,16)+25).toString(16).padStart(2,'0'));
        ctx.fillRect(x+1, y+4, S-2, 8);
        // Roof edge
        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x-1, y+18, S+2, 2);
        // Door
        ctx.fillStyle = '#3a2010'; ctx.fillRect(x+S/2-6, y+30, 12, 18);
        ctx.fillStyle = '#4a3020'; ctx.fillRect(x+S/2-5, y+31, 10, 16);
        ctx.fillStyle = '#f0c040'; ctx.fillRect(x+S/2+3, y+38, 2, 2);
        // Window
        ctx.fillStyle = '#80c0e0'; ctx.fillRect(x+8, y+22, 8, 8);
        ctx.fillRect(x+S-16, y+22, 8, 8);
        ctx.fillStyle = '#5a8aa0'; ctx.fillRect(x+11, y+22, 2, 8); ctx.fillRect(x+8, y+25, 8, 2);
        return;
    }

    // === DOOR (context-sensitive) ===
    if (tileType === T.DOOR) {
        // Check if this door leads to a cave or temple
        const trans = TRANSITIONS[state.location] || [];
        const doorTrans = trans.find(t => t.col === col && t.row === row);
        const leadsTo = doorTrans ? doorTrans.target : '';
        const inCave = state.location === 'cave' || leadsTo === 'cave';
        const inTemple = state.location.startsWith('temple_') || leadsTo.startsWith('temple_');

        if (inCave) {
            // Cave entrance - grey rocks with dark opening
            // Background (grass if in town, cave floor if in cave)
            if (state.location !== 'cave') {
                ctx.fillStyle = '#3a8044'; ctx.fillRect(x, y, S, S);
            } else {
                ctx.fillStyle = '#3a3858'; ctx.fillRect(x, y, S, S);
            }
            // Grey rock face
            ctx.fillStyle = '#686868';
            ctx.fillRect(x+2, y, S-4, S);
            ctx.fillStyle = '#787878';
            ctx.fillRect(x+4, y+2, S-8, S-4);
            // Rock shading
            ctx.fillStyle = '#585858';
            ctx.fillRect(x+2, y, S-4, 4);
            ctx.fillRect(x+2, y, 6, S);
            ctx.fillRect(x+S-8, y, 6, S);
            // Rock texture
            ctx.fillStyle = '#606060';
            ctx.fillRect(x+6, y+8, 8, 5);
            ctx.fillRect(x+S-14, y+12, 7, 4);
            ctx.fillStyle = '#707070';
            ctx.fillRect(x+10, y+S-12, 6, 4);
            // Dark cave opening (black)
            ctx.fillStyle = '#060608';
            ctx.fillRect(x+10, y+8, S-20, S-8);
            ctx.fillStyle = '#020204';
            ctx.fillRect(x+14, y+12, S-28, S-16);
            // Arch top
            ctx.fillStyle = '#585858';
            ctx.fillRect(x+8, y+4, S-16, 6);
            ctx.fillStyle = '#686868';
            ctx.fillRect(x+12, y+2, S-24, 4);
            // Glow from inside
            ctx.fillStyle = 'rgba(80,60,120,0.12)';
            ctx.fillRect(x+10, y+14, S-20, S-20);
        } else if (inTemple) {
            // Temple door - ornate stone
            ctx.fillStyle = '#4a3f6b'; ctx.fillRect(x, y, S, S);
            ctx.fillStyle = '#5a5080';
            ctx.fillRect(x+6, y+2, S-12, S-2);
            ctx.fillStyle = '#3a304a';
            ctx.fillRect(x+10, y+6, S-20, S-8);
            ctx.fillStyle = '#c4a040';
            ctx.fillRect(x+6, y, S-12, 3);
            ctx.fillRect(x+6, y+S-3, S-12, 3);
            ctx.fillRect(x+S/2-1, y+S/2-2, 3, 4);
        } else {
            // Normal wooden door (town/forest)
            // Background matches surroundings
            ctx.fillStyle = '#3a8044'; ctx.fillRect(x, y, S, S);
            // Door frame
            ctx.fillStyle = '#8a6a30';
            ctx.fillRect(x+6, y+2, S-12, S-2);
            // Door
            ctx.fillStyle = '#6a4a18';
            ctx.fillRect(x+10, y+6, S-20, S-8);
            ctx.fillStyle = '#7a5a28';
            ctx.fillRect(x+12, y+8, S-24, S-12);
            // Planks
            ctx.fillStyle = '#604010';
            ctx.fillRect(x+S/2-1, y+6, 2, S-8);
            // Handle
            ctx.fillStyle = '#f0c040';
            ctx.fillRect(x+S-18, y+S/2-1, 3, 3);
            // Arch
            ctx.fillStyle = '#7a5a28';
            ctx.fillRect(x+8, y, S-16, 5);
        }
        return;
    }

    // === FLOWER ===
    if (tileType === T.FLOWER) {
        const flBg = state.location === 'beach' ? ((col+row)%2===0?'#e0c888':'#d8c080') : state.location === 'mountains' ? ((col+row)%2===0?'#7a7868':'#746e60') : ((col+row)%2===0?'#3a8044':'#378040');
        ctx.fillStyle = flBg; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#2a6830'; ctx.fillRect(x+S/2-1, y+S/2, 2, S/2-2);
        ctx.fillStyle = '#1e5a24'; ctx.fillRect(x+S/2+4, y+S/2+6, 8, 2); // leaf
        const fc = ['#e84393','#ff6b6b','#ffd93d','#6c5ce7'][(col*3+row*7)%4];
        ctx.fillStyle = fc;
        ctx.fillRect(x+S/2-6, y+S/2-10, 12, 12);
        ctx.fillRect(x+S/2-10, y+S/2-6, 20, 4);
        ctx.fillRect(x+S/2-4, y+S/2-14, 8, 4);
        ctx.fillStyle = '#ffd93d'; ctx.fillRect(x+S/2-3, y+S/2-7, 6, 6);
        return;
    }

    // === FENCE ===
    if (tileType === T.FENCE) {
        ctx.fillStyle = state.location === 'beach' ? '#e0c888' : state.location === 'mountains' ? '#7a7868' : '#3a8044'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#5a3c1e';
        ctx.fillRect(x, y+14, S, 8); ctx.fillRect(x, y+32, S, 6);
        ctx.fillRect(x+6, y+6, 6, 36); ctx.fillRect(x+S-12, y+6, 6, 36);
        ctx.fillStyle = '#6a4c2e';
        ctx.fillRect(x+7, y+6, 3, 36); ctx.fillRect(x+S-11, y+6, 3, 36);
        // Post tops
        ctx.fillStyle = '#7a5c3e'; ctx.fillRect(x+5, y+4, 8, 4); ctx.fillRect(x+S-13, y+4, 8, 4);
        return;
    }

    // === SIGN ===
    if (tileType === T.SIGN) {
        const sgBg = state.location === 'beach' ? ((col+row)%2===0?'#e0c888':'#d8c080') : state.location === 'mountains' ? ((col+row)%2===0?'#7a7868':'#746e60') : ((col+row)%2===0?'#3a8044':'#378040');
        ctx.fillStyle = sgBg; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#5a3c1e'; ctx.fillRect(x+S/2-2, y+S/2, 4, S/2);
        ctx.fillStyle = '#c4a060'; ctx.fillRect(x+6, y+8, S-12, 18);
        ctx.fillStyle = '#a08040'; ctx.fillRect(x+8, y+10, S-16, 14);
        ctx.fillStyle = '#8a6a30'; ctx.fillRect(x+10, y+14, S-22, 2); ctx.fillRect(x+10, y+20, S-22, 2);
        return;
    }

    // === CRYSTAL ===
    if (tileType === T.CRYSTAL) {
        ctx.fillStyle = '#3a3858'; ctx.fillRect(x, y, S, S);
        // Crystal shape
        ctx.fillStyle = '#6a40a0'; ctx.fillRect(x+14, y+8, 20, 30);
        ctx.fillStyle = '#8060c0'; ctx.fillRect(x+16, y+6, 16, 26);
        ctx.fillStyle = '#a080e0'; ctx.fillRect(x+18, y+10, 10, 16);
        ctx.fillStyle = '#c0a0f0'; ctx.fillRect(x+20, y+12, 6, 10);
        // Sparkle
        if (Math.sin(state.animFrame*0.08+col+row)>0.4) { ctx.fillStyle='#fff'; ctx.fillRect(x+19, y+11, 3, 3); }
        return;
    }

    // === TEMPLE FLOOR ===
    if (tileType === T.TEMPLE_FL) {
        ctx.fillStyle = (col+row)%2===0?'#4a3f6b':'#443a62';
        ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#3e3560'; ctx.fillRect(x+r(1)*30+4, y+r(2)*30+4, 6, 5);
        ctx.fillStyle = '#524880'; ctx.fillRect(x+r(3)*28+8, y+r(4)*28+8, 4, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        if((col+row)%3===0) ctx.fillRect(x+4,y+4,S-8,S-8);
        return;
    }
    if (tileType === T.TEMPLE_W) {
        ctx.fillStyle = '#2a2540'; ctx.fillRect(x, y, S, S);
        const off = (row%2)*(S/2);
        ctx.fillStyle = '#24203a';
        for (let bx=0;bx<S;bx+=S/2) ctx.fillRect(x+((bx+off)%S), y, 2, S);
        ctx.fillRect(x, y+S/2-1, S, 2);
        ctx.fillStyle = '#302a4a'; ctx.fillRect(x+r(1)*26+6, y+r(2)*18+6, 14, 10);
        return;
    }
    if (tileType === T.CARPET) {
        ctx.fillStyle = '#8b1a1a'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#a02020'; ctx.fillRect(x+3, y+3, S-6, S-6);
        ctx.fillStyle = '#c4a050';
        ctx.fillRect(x+6, y, S-12, 3); ctx.fillRect(x+6, y+S-3, S-12, 3);
        ctx.fillRect(x, y+6, 3, S-12); ctx.fillRect(x+S-3, y+6, 3, S-12);
        // Diamond pattern
        ctx.fillStyle = '#b83030';
        for (let dy=8;dy<S-8;dy+=12) for(let dx=8;dx<S-8;dx+=12) ctx.fillRect(x+dx,y+dy,4,4);
        return;
    }
    if (tileType === T.PILLAR) {
        ctx.fillStyle = '#4a3f6b'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#6a60a0'; ctx.fillRect(x+12, y, 24, S);
        ctx.fillStyle = '#7a70b0'; ctx.fillRect(x+16, y, 16, S);
        ctx.fillStyle = '#8a80c0'; ctx.fillRect(x+20, y+2, 8, S-4);
        // Capital and base
        ctx.fillStyle = '#5a5090'; ctx.fillRect(x+8, y, 32, 8); ctx.fillRect(x+8, y+S-8, 32, 8);
        ctx.fillStyle = '#6a60a0'; ctx.fillRect(x+10, y+1, 28, 4); ctx.fillRect(x+10, y+S-5, 28, 4);
        return;
    }
    if (tileType === T.LAVA) {
        ctx.fillStyle = '#881800'; ctx.fillRect(x, y, S, S);
        const w = Math.sin((state.animFrame*0.04)+col*2+row)*4;
        ctx.fillStyle = '#bb3300'; ctx.fillRect(x+2, y+10+w, S-4, 14);
        ctx.fillStyle = '#dd5500'; ctx.fillRect(x+6, y+14+w, S-12, 8);
        ctx.fillStyle = '#ff8800'; ctx.fillRect(x+10, y+18+w, S-20, 4);
        ctx.fillStyle = '#ffcc44'; ctx.fillRect(x+16, y+20+w, 12, 2);
        // Bubbles
        if (Math.sin(state.animFrame*0.1+col*3+row*7)>0.7) {
            ctx.fillStyle='#ffaa00'; ctx.beginPath();
            ctx.arc(x+r(1)*30+8, y+12+w, 3, 0, Math.PI*2); ctx.fill();
        }
        return;
    }
    if (tileType === T.ICE) {
        ctx.fillStyle = '#88c0e0'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#98d0f0'; ctx.fillRect(x+4, y+4, S-8, S-8);
        ctx.fillStyle = '#b0e0f8'; ctx.fillRect(x+r(1)*24+6, y+r(2)*24+6, 10, 6);
        // Frost lines
        ctx.fillStyle = '#c8e8ff';
        ctx.fillRect(x+8, y+r(3)*30+6, 16, 1);
        ctx.fillRect(x+r(4)*20+10, y+8, 1, 14);
        if (Math.sin(state.animFrame*0.05+col+row)>0.5) { ctx.fillStyle='#fff'; ctx.fillRect(x+12, y+12, 3, 3); }
        return;
    }
    if (tileType === T.VOID) {
        ctx.fillStyle = '#04040c'; ctx.fillRect(x, y, S, S);
        const vp = Math.sin(state.animFrame*0.03+col*3+row*5)*0.15+0.1;
        ctx.fillStyle = `rgba(50,0,100,${vp})`; ctx.fillRect(x+6, y+6, S-12, S-12);
        // Particles
        ctx.fillStyle = `rgba(120,60,200,${vp*0.8})`;
        ctx.fillRect(x+Math.sin(state.animFrame*0.07+col)*12+S/2, y+Math.cos(state.animFrame*0.09+row)*10+S/2, 2, 2);
        return;
    }
    if (tileType === T.PORTAL) {
        ctx.fillStyle = '#2d1a4a'; ctx.fillRect(x, y, S, S);
        const p = Math.sin(state.animFrame*0.06+col)*0.2+0.5;
        for (let ring = 3; ring > 0; ring--) {
            ctx.fillStyle = `rgba(${120+ring*30}, ${60+ring*20}, ${180+ring*20}, ${p*0.4})`;
            ctx.beginPath(); ctx.arc(x+S/2, y+S/2, ring*6, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; ctx.fillRect(x+S/2-1, y+S/2-1, 3, 3);
        return;
    }
    if (tileType === T.STAIRS_UP || tileType === T.STAIRS_DN) {
        ctx.fillStyle = '#4a3f6b'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#c4a060';
        for (let s=0; s<5; s++) {
            const sy3 = tileType===T.STAIRS_UP ? y+s*9 : y+S-10-s*9;
            ctx.fillRect(x+4+s*3, sy3, S-8-s*6, 8);
            ctx.fillStyle = '#a88848'; ctx.fillRect(x+4+s*3, sy3+6, S-8-s*6, 2);
            ctx.fillStyle = '#c4a060';
        }
        return;
    }
    if (tileType === T.BOOKSHELF) {
        ctx.fillStyle = '#3a2510'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#4a3520'; ctx.fillRect(x+2, y+2, S-4, S-4);
        const bc = ['#b03030','#3050a0','#30a050','#a0a030','#7040a0','#a06020'];
        for (let by=4; by<S-4; by+=8) for (let bx=4; bx<S-6; bx+=7) {
            ctx.fillStyle = bc[(bx+by*3+col)%bc.length];
            ctx.fillRect(x+bx, y+by, 6, 7);
            ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x+bx, y+by+5, 6, 2);
        }
        return;
    }
    if (tileType === T.STATUE) {
        ctx.fillStyle = '#4a3f6b'; ctx.fillRect(x, y, S, S);
        // Base
        ctx.fillStyle = '#606060'; ctx.fillRect(x+10, y+S-12, 28, 12);
        // Body
        ctx.fillStyle = '#787878'; ctx.fillRect(x+16, y+14, 16, 24);
        // Head
        ctx.fillStyle = '#888'; ctx.fillRect(x+18, y+6, 12, 12);
        ctx.fillStyle = '#999'; ctx.fillRect(x+20, y+8, 8, 8);
        // Arms
        ctx.fillStyle = '#707070'; ctx.fillRect(x+10, y+18, 8, 4); ctx.fillRect(x+30, y+18, 8, 4);
        return;
    }

    // === MTN_GROUND ===
    if (tileType === T.MTN_GROUND) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#7a7868' : '#746e60';
        ctx.fillRect(x, y, S, S);
        // Rocky texture
        for (let dy = 0; dy < S; dy += 6) for (let dx = 0; dx < S; dx += 7) {
            if ((dx + dy + col * 5) % 12 === 0) { ctx.fillStyle = '#686858'; ctx.fillRect(x+dx, y+dy, 5, 4); }
            if ((dx + dy + row * 3) % 14 === 0) { ctx.fillStyle = '#8a8878'; ctx.fillRect(x+dx, y+dy, 3, 3); }
        }
        ctx.fillStyle = '#605e50'; ctx.fillRect(x+r(1)*30+4, y+r(2)*30+4, 6, 4);
        // Gravel
        if (r(5) > 0.5) {
            ctx.fillStyle = '#5a5848'; ctx.fillRect(x+r(6)*36+4, y+r(7)*36+4, 3, 3);
        }
        return;
    }

    // === MTN_WALL ===
    if (tileType === T.MTN_WALL) {
        ctx.fillStyle = '#4a4a42'; ctx.fillRect(x, y, S, S);
        // Layered rock face
        for (let dy = 0; dy < S; dy += 8) {
            const off = (row % 2) * 12;
            for (let dx = 0; dx < S; dx += 16) {
                ctx.fillStyle = '#3e3e38';
                ctx.fillRect(x + (dx + off) % S, y + dy, 14, 7);
                ctx.fillStyle = '#545448';
                ctx.fillRect(x + (dx + off) % S + 1, y + dy + 1, 12, 5);
            }
        }
        // Cracks
        ctx.fillStyle = '#2e2e28'; ctx.fillRect(x+r(1)*28+6, y+r(2)*28+6, 1, 12);
        ctx.fillRect(x+r(3)*20+10, y+r(4)*20+10, 8, 1);
        return;
    }

    // === SNOW ===
    if (tileType === T.SNOW) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#e4eaf0' : '#dce2e8';
        ctx.fillRect(x, y, S, S);
        // Snow sparkle texture
        for (let dy = 0; dy < S; dy += 6) for (let dx = 0; dx < S; dx += 6) {
            if ((dx + dy + col * 7) % 14 === 0) { ctx.fillStyle = '#f0f4f8'; ctx.fillRect(x+dx, y+dy, 4, 3); }
        }
        // Sparkle
        if (Math.sin(state.animFrame * 0.08 + col * 2 + row * 3) > 0.7) {
            ctx.fillStyle = '#fff'; ctx.fillRect(x + r(1) * 30 + 8, y + r(2) * 30 + 8, 2, 2);
        }
        // Subtle shadow
        ctx.fillStyle = '#c8d0d8'; ctx.fillRect(x+r(3)*28+8, y+r(4)*28+8, 8, 4);
        return;
    }

    // === PINE ===
    if (tileType === T.PINE) {
        // Mountain ground base
        ctx.fillStyle = '#7a7868'; ctx.fillRect(x, y, S, S);
        // Trunk
        ctx.fillStyle = '#4a3018'; ctx.fillRect(x + S/2 - 3, y + S * 0.6, 6, S * 0.4);
        ctx.fillStyle = '#5a4028'; ctx.fillRect(x + S/2 - 2, y + S * 0.62, 4, S * 0.38);
        // Triangular foliage layers
        ctx.fillStyle = '#1a4a20';
        ctx.fillRect(x + 4, y + S * 0.45, S - 8, 8);
        ctx.fillRect(x + 8, y + S * 0.3, S - 16, 8);
        ctx.fillRect(x + 12, y + S * 0.18, S - 24, 6);
        ctx.fillStyle = '#245828';
        ctx.fillRect(x + 6, y + S * 0.48, S - 12, 5);
        ctx.fillRect(x + 10, y + S * 0.33, S - 20, 5);
        ctx.fillRect(x + 14, y + S * 0.2, S - 28, 4);
        // Snow on top
        ctx.fillStyle = '#dce4ec';
        ctx.fillRect(x + 14, y + S * 0.16, S - 28, 3);
        ctx.fillRect(x + 10, y + S * 0.3, 4, 2);
        return;
    }

    // === SAND ===
    if (tileType === T.SAND) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#e0c888' : '#d8c080';
        ctx.fillRect(x, y, S, S);
        // Sandy texture
        for (let dy = 0; dy < S; dy += 5) for (let dx = 0; dx < S; dx += 6) {
            if ((dx + dy + col * 3) % 10 === 0) { ctx.fillStyle = '#d0b870'; ctx.fillRect(x+dx, y+dy, 4, 3); }
            if ((dx + dy + row * 7) % 14 === 0) { ctx.fillStyle = '#e8d898'; ctx.fillRect(x+dx, y+dy, 3, 2); }
        }
        // Occasional dark grain
        ctx.fillStyle = '#c8a860'; ctx.fillRect(x+r(1)*30+4, y+r(2)*30+4, 5, 3);
        return;
    }

    // === SEASHELL ===
    if (tileType === T.SEASHELL) {
        // Sand base
        ctx.fillStyle = (col + row) % 2 === 0 ? '#e0c888' : '#d8c080';
        ctx.fillRect(x, y, S, S);
        for (let dy = 0; dy < S; dy += 5) for (let dx = 0; dx < S; dx += 6) {
            if ((dx + dy + col * 3) % 10 === 0) { ctx.fillStyle = '#d0b870'; ctx.fillRect(x+dx, y+dy, 4, 3); }
        }
        // Shell
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath(); ctx.arc(x + S/2, y + S/2 + 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8b888';
        ctx.beginPath(); ctx.arc(x + S/2, y + S/2 + 4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f8d8c0';
        ctx.fillRect(x + S/2 - 1, y + S/2 + 2, 3, 3);
        return;
    }

    // === PALM ===
    if (tileType === T.PALM) {
        // Sand base
        ctx.fillStyle = '#e0c888'; ctx.fillRect(x, y, S, S);
        // Trunk
        ctx.fillStyle = '#6a4a28'; ctx.fillRect(x + S/2 - 3, y + 16, 6, S - 16);
        ctx.fillStyle = '#7a5a38'; ctx.fillRect(x + S/2 - 2, y + 18, 4, S - 18);
        // Trunk rings
        ctx.fillStyle = '#5a3a18';
        for (let ty = 20; ty < S - 4; ty += 6) ctx.fillRect(x + S/2 - 3, y + ty, 6, 2);
        // Fronds (leaf clusters)
        ctx.fillStyle = '#2a7030';
        ctx.fillRect(x + 2, y + 6, 18, 8);
        ctx.fillRect(x + S/2 + 2, y + 4, 18, 8);
        ctx.fillRect(x + 6, y + 2, 12, 6);
        ctx.fillStyle = '#3a8040';
        ctx.fillRect(x + 4, y + 8, 14, 5);
        ctx.fillRect(x + S/2, y + 6, 14, 5);
        // Coconuts
        ctx.fillStyle = '#5a3818'; ctx.fillRect(x + S/2 - 1, y + 13, 4, 4);
        ctx.fillStyle = '#6a4828'; ctx.fillRect(x + S/2 + 3, y + 14, 3, 3);
        return;
    }

    // === DOCK ===
    if (tileType === T.DOCK) {
        // Water underneath
        ctx.fillStyle = '#165880'; ctx.fillRect(x, y, S, S);
        for (let dy = 0; dy < S; dy += 5) {
            const w = Math.sin((state.animFrame*0.04) + col*0.7 + dy*0.15) * 5;
            ctx.fillStyle = '#1e6a98'; ctx.fillRect(x, y+dy+w, S, 3);
        }
        // Planks
        ctx.fillStyle = '#8b6e4e'; ctx.fillRect(x + 4, y, S - 8, S);
        ctx.fillStyle = '#7a5e3e';
        for (let dy = 0; dy < S; dy += 8) ctx.fillRect(x + 4, y + dy, S - 8, 2);
        // Side rails
        ctx.fillStyle = '#6a4e2e'; ctx.fillRect(x + 3, y, 2, S); ctx.fillRect(x + S - 5, y, 2, S);
        return;
    }

    // DEFAULT
    ctx.fillStyle = TILE_COLORS[tileType] || '#333';
    ctx.fillRect(x, y, S, S);
}

function drawPlayer() {
    const cx = state.playerCol * TILE + TILE / 2;
    const cy = state.playerRow * TILE + TILE / 2 + 4;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 22, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const isMoving = keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'] || keys['w'] || keys['a'] || keys['s'] || keys['d'];
    drawCharSprite(ctx, cx, cy, state.character, state.walkFrame, 1.5, isMoving);
}

function drawNPCs() {
    const npcs = MAP_NPCS[state.location];
    if (!npcs) return;

    // NPC robe colors
    const npcColors = ['#4060a0', '#a04060', '#40a060', '#a08040', '#8040a0'];
    const npcHair = ['#aaaaaa', '#4a2a1a', '#1a1a3a', '#6a4a2a', '#2a1a2a'];

    npcs.forEach(npcPlacement => {
        const npc = NPCS[npcPlacement.npcIndex];
        const cx = npcPlacement.col * TILE + TILE / 2;
        const cy = npcPlacement.row * TILE + TILE / 2 + 2;
        const ni = npcPlacement.npcIndex;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 16, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw NPC as pixel character
        const fakeChar = {
            color: npcColors[ni % npcColors.length],
            hair: npcHair[ni % npcHair.length]
        };
        // Use frame 0 for standing still (no leg animation)
        drawCharSprite(ctx, cx, cy, fakeChar, 0, 1.5);

        // Idle animations (subtle, per NPC)
        const P = 1.5; // sprite scale
        const af = state.animFrame;

        if (ni === 0) {
            // Elder Tautology: slowly looks left and right (eyes shift)
            const lookDir = Math.sin(af * 0.008) * 2;
            ctx.fillStyle = '#222';
            ctx.fillRect(cx - 3 * P + lookDir, cy - 6 * P, 2 * P, 2 * P);
            ctx.fillRect(cx + 2 * P + lookDir, cy - 6 * P, 2 * P, 2 * P);
        } else if (ni === 1) {
            // Merchant Mira: taps foot every ~10 seconds
            const cycle = af % 600; // 10 sec
            if (cycle > 540 && cycle < 570) {
                const tap = Math.sin((cycle - 540) * 0.3) * 2;
                ctx.fillStyle = '#3d2b1a';
                ctx.fillRect(cx + 1 * P, cy + 15 * P + tap, 4 * P, 2 * P);
            }
        } else if (ni === 2) {
            // Scout Axiom: scratches head every ~12 seconds
            const cycle = af % 720;
            if (cycle > 640 && cycle < 700) {
                const scratch = Math.sin((cycle - 640) * 0.4) * 2;
                ctx.fillStyle = fakeChar.color; // sleeve color
                ctx.fillRect(cx + 4 * P, cy - 10 * P + scratch, 3 * P, 3 * P);
                // Hand
                ctx.fillStyle = '#ffd5a3';
                ctx.fillRect(cx + 5 * P, cy - 11 * P + scratch, 2 * P, 2 * P);
            }
        } else if (ni === 3) {
            // Al-Muṣawwir: shifts weight side to side
            const lean = Math.sin(af * 0.005) * 1;
            ctx.save();
            ctx.translate(cx + lean, cy);
            ctx.translate(-cx, -cy);
            // Just a subtle body lean - redraw torso overlay
            ctx.fillStyle = fakeChar.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(cx - 6 * P + lean * 2, cy + 1 * P, 12 * P, 2 * P);
            ctx.globalAlpha = 1;
            ctx.restore();
        } else if (ni === 4) {
            // ZordTamer Kira: looks around nervously (head bobs + blinks)
            const lookCycle = af % 480;
            // Head bob
            const bob = lookCycle > 400 && lookCycle < 440 ? Math.sin((lookCycle - 400) * 0.2) * 1.5 : 0;
            // Blink every ~8 seconds
            const blinkCycle = af % 480;
            if (blinkCycle > 460 && blinkCycle < 468) {
                // Closed eyes (skin color over eyes)
                ctx.fillStyle = '#ffd5a3';
                ctx.fillRect(cx - 3 * P, cy - 6 * P + bob, 3 * P, 2 * P);
                ctx.fillRect(cx + 1 * P, cy - 6 * P + bob, 3 * P, 2 * P);
            }
            // Occasionally glance to the side
            if (lookCycle > 200 && lookCycle < 280) {
                const glance = 2;
                ctx.fillStyle = '#222';
                ctx.fillRect(cx - 3 * P + glance, cy - 6 * P, 1 * P, 2 * P);
                ctx.fillRect(cx + 2 * P + glance, cy - 6 * P, 1 * P, 2 * P);
            }
        }

        // Name tag
        ctx.font = '7px "Press Start 2P", monospace';
        const measured = ctx.measureText(npc.name);
        const nameWidth = measured.width + 12;
        const nx = cx - nameWidth / 2;
        const ny = npcPlacement.row * TILE - 12;
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(nx, ny, nameWidth, 14);
        ctx.strokeStyle = 'rgba(245, 200, 66, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(nx, ny, nameWidth, 14);
        ctx.fillStyle = '#f5c842';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.name, cx, ny + 7);
    });
}

// Pre-render battle sprites to small offscreen canvases for overworld use
const _overworldSpriteCache = {};
function buildOverworldSprites() {
    // Collect all unique enemy indices used in zones
    const indices = new Set();
    for (const loc of Object.keys(ENEMY_ZONES)) {
        ENEMY_ZONES[loc].forEach(z => indices.add(z.enemyIndex));
    }
    indices.forEach(idx => {
        const enemy = ENEMIES[idx];
        if (!enemy) return;
        const srcSize = 100; // render area for battle sprite
        const oc = document.createElement('canvas');
        oc.width = srcSize; oc.height = srcSize;
        const c = oc.getContext('2d');
        // Draw battle sprite centered, frame=0 (no animation)
        drawBattleEnemy(c, srcSize / 2, srcSize / 2 - 5, enemy, 0);
        _overworldSpriteCache[idx] = oc;
    });
}

function drawEnemies() {
    const zones = ENEMY_ZONES[state.location];
    const positions = enemyPos[state.location];
    if (!zones || !positions) return;

    // Lazy init: build sprites on first call
    if (Object.keys(_overworldSpriteCache).length === 0) buildOverworldSprites();

    zones.forEach((z, i) => {
        const key = `${state.location}_${i}`;
        if (state.defeatedZones.has(key)) return;

        const ep = positions[i];
        const bob = Math.sin(state.animFrame * 0.06 + i * 2) * 2;

        // Danger glow
        const pulse = Math.sin(state.animFrame * 0.08 + i) * 0.12 + 0.15;
        ctx.fillStyle = `rgba(233, 69, 96, ${pulse})`;
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y + bob, 18, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y + 18, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw cached sprite (100x100 source → 36x36 on screen)
        const sprite = _overworldSpriteCache[z.enemyIndex];
        if (sprite) {
            ctx.drawImage(sprite, 0, 0, 100, 100, ep.x - 18, ep.y - 18 + bob, 36, 36);
        }
    });
}

function render() {
    const map = MAPS[state.location];
    if (!map) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // --- Draw HUD bar at top ---
    drawCanvasHUD();

    // --- Offset everything below HUD ---
    ctx.save();
    ctx.translate(0, HUD_H);

    // Draw tiles
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawTile(c, r, map[r][c]);
        }
    }

    // Draw gems
    drawGems();

    // Draw enemies
    drawEnemies();

    // Draw NPCs
    drawNPCs();

    // Draw player
    drawPlayer();

    // Draw interaction prompt on canvas
    drawInteractPrompt();

    ctx.restore();
}

function drawCanvasHUD() {
    // Background bar
    ctx.fillStyle = '#08081a';
    ctx.fillRect(0, 0, CANVAS_W, HUD_H);
    ctx.fillStyle = '#2a2a5a';
    ctx.fillRect(0, HUD_H - 1, CANVAS_W, 1);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    const y = HUD_H / 2;

    // Name
    ctx.fillStyle = '#f5c842';
    ctx.textAlign = 'left';
    ctx.fillText(state.name, 8, y);

    // HP bar
    const hpBarX = 120, hpBarW = 80;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(hpBarX, y - 5, hpBarW, 10);
    const hpPct = state.hp / state.maxHp;
    ctx.fillStyle = hpPct > 0.3 ? '#4ecca3' : '#e94560';
    ctx.fillRect(hpBarX, y - 5, hpBarW * hpPct, 10);
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, y - 5, hpBarW, 10);
    ctx.fillStyle = '#ccc';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`${state.hp}/${state.maxHp}`, hpBarX + hpBarW + 4, y);

    // Location (center)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8888aa';
    ctx.font = '8px "Press Start 2P", monospace';
    const locNames = { cave: 'The Cave', town: 'Logic Land Town', forest: 'Enchanted Forest', beach: 'Coral Cove Beach', mountains: 'Iron Peak Mountains' };
    TEMPLE_FLOORS.forEach((f, i) => { locNames['temple_' + (i + 1)] = f.name; });
    ctx.fillText(locNames[state.location] || state.location, CANVAS_W / 2, y);

    // Rubies (right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e94560';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(`${state.rubies} Rubies`, CANVAS_W - 8, y);
}

function drawInteractPrompt() {
    const promptEl = document.getElementById('interact-prompt');
    if (promptEl.style.display === 'none') return;
    const text = document.getElementById('interact-text').textContent;
    if (!text) return;

    ctx.font = '8px "Press Start 2P", monospace';
    const tw = ctx.measureText(text).width + 16;
    const px = (COLS * TILE) / 2 - tw / 2;
    const py = ROWS * TILE - 40;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(px, py, tw, 20);
    ctx.strokeStyle = '#f5c842';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, tw, 20);
    ctx.fillStyle = '#f5c842';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, (COLS * TILE) / 2, py + 10);
}

// ============================================================
// TURN-BASED ZORD BATTLE
// ============================================================
let zordBattle = null;

function startZordBattle() {
    // Let player pick which bench Zord to deploy
    const benchZords = state.zordBench.map(i => state.zordList[i]).filter(z => z && z.currentHp > 0);
    if (benchZords.length === 0) {
        // No healthy Zords, go back to action battle
        battle.running = true;
        battleLoop();
        return;
    }

    // If only one, deploy automatically. Otherwise show picker.
    if (benchZords.length === 1) {
        deployZord(state.zordBench.find(i => state.zordList[i].currentHp > 0));
    } else {
        showZordPicker();
    }
}

function showZordPicker() {
    showScreen('zordbattle');
    const container = document.getElementById('zb-actions');
    container.innerHTML = '';
    document.getElementById('zb-log').innerHTML = '<div class="zb-log-line">Choose a Zord to deploy!</div>';
    document.getElementById('zb-player-zord').innerHTML = '<span style="font-size:14px;color:var(--text-dim)">Choose your Zord...</span>';
    document.getElementById('zb-enemy-zord').innerHTML = '';

    state.zordBench.forEach(idx => {
        const z = state.zordList[idx];
        if (!z || z.currentHp <= 0) return;
        const el = ELEMENTS[z.element];
        const btn = document.createElement('button');
        btn.className = 'btn btn-choice';
        btn.innerHTML = `${z.sprite} ${escapeHtml(z.nickname)} Lv.${z.level} <span style="color:${el.color}">${el.icon}${el.name}</span> HP:${z.currentHp}/${z.maxHp}`;
        btn.addEventListener('click', () => deployZord(idx));
        container.appendChild(btn);
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.textContent = 'Cancel (fight yourself)';
    backBtn.addEventListener('click', () => {
        showScreen('battle');
        battle.running = true;
        battleLoop();
    });
    container.appendChild(backBtn);
}

function deployZord(zordIdx) {
    showScreen('zordbattle');
    const playerZord = state.zordList[zordIdx];
    const enemy = state.currentEnemy;
    const enemyEl = ELEMENTS[enemy.element];

    // Create enemy Zord-like stats
    const enemyZord = {
        nickname: enemy.name,
        sprite: enemy.sprite,
        maxHp: battle ? battle.enemyHp : enemy.hp,  // use remaining HP from action battle
        currentHp: battle ? battle.enemyHp : enemy.hp,
        attack: enemy.attack,
        element: enemy.element,
        power: { ...enemy.power },
        level: Math.max(1, Math.floor(enemy.hp / 20))
    };

    zordBattle = {
        playerZord: playerZord,
        playerZordIdx: zordIdx,
        enemyZord: enemyZord,
        turn: 'player',
        log: [`${playerZord.nickname} was deployed against ${enemy.name}!`],
        over: false
    };

    renderZordBattle();
}

function renderZordBattle() {
    const zb = zordBattle;
    const pz = zb.playerZord;
    const ez = zb.enemyZord;
    const pEl = ELEMENTS[pz.element];
    const eEl = ELEMENTS[ez.element];

    // Player Zord
    const pHpPct = Math.max(0, (pz.currentHp / pz.maxHp) * 100);
    document.getElementById('zb-player-zord').innerHTML = `
        <span class="zord-sprite">${pz.sprite}</span>
        <span class="zord-name">${escapeHtml(pz.nickname)}</span>
        <span class="zord-info">Lv.${pz.level} ${pz.species || ''}</span>
        <span class="zord-element" style="color:${pEl.color}">${pEl.icon} ${pEl.name}</span>
        <div class="battle-hp-bar"><div class="battle-hp-fill ${pHpPct < 30 ? 'low' : ''}" style="width:${pHpPct}%"></div></div>
        <span class="zord-hp-text">${pz.currentHp}/${pz.maxHp}</span>`;

    // Enemy Zord
    const eHpPct = Math.max(0, (ez.currentHp / ez.maxHp) * 100);
    document.getElementById('zb-enemy-zord').innerHTML = `
        <span class="zord-sprite">${ez.sprite}</span>
        <span class="zord-name">${ez.nickname}</span>
        <span class="zord-info">Lv.${ez.level}</span>
        <span class="zord-element" style="color:${eEl.color}">${eEl.icon} ${eEl.name}</span>
        <div class="battle-hp-bar"><div class="battle-hp-fill ${eHpPct < 30 ? 'low' : ''}" style="width:${eHpPct}%"></div></div>
        <span class="zord-hp-text">${ez.currentHp}/${ez.maxHp}</span>`;

    // Log
    const logEl = document.getElementById('zb-log');
    logEl.innerHTML = zb.log.slice(-6).map(line => `<div class="zb-log-line">${line}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;

    // Actions
    const actionsEl = document.getElementById('zb-actions');
    actionsEl.innerHTML = '';

    if (zb.over) return;
    if (zb.turn !== 'player') return;

    // Basic Attack
    const atkBtn = document.createElement('button');
    atkBtn.className = 'btn btn-primary';
    atkBtn.textContent = `Attack (${pz.attack} dmg)`;
    atkBtn.addEventListener('click', () => zordDoTurn('attack'));
    actionsEl.appendChild(atkBtn);

    // Special Power
    const pwrBtn = document.createElement('button');
    pwrBtn.className = 'btn btn-primary';
    pwrBtn.style.borderColor = pEl.color;
    pwrBtn.textContent = `${pEl.icon} ${pz.power.name} (${pz.power.damage} dmg)`;
    pwrBtn.addEventListener('click', () => zordDoTurn('power'));
    actionsEl.appendChild(pwrBtn);

    // Switch Zord (if others on bench)
    const otherBench = state.zordBench.filter(i => i !== zb.playerZordIdx && state.zordList[i].currentHp > 0);
    if (otherBench.length > 0) {
        const switchBtn = document.createElement('button');
        switchBtn.className = 'btn btn-secondary';
        switchBtn.textContent = 'Switch Zord';
        switchBtn.addEventListener('click', () => {
            showZordPicker();
        });
        actionsEl.appendChild(switchBtn);
    }

    // Retreat (go back to action battle)
    const retreatBtn = document.createElement('button');
    retreatBtn.className = 'btn btn-secondary';
    retreatBtn.textContent = 'Retreat (fight yourself)';
    retreatBtn.addEventListener('click', () => {
        // Transfer enemy HP back
        if (battle) {
            battle.enemyHp = zb.enemyZord.currentHp;
            showScreen('battle');
            battle.running = true;
            battleLoop();
        }
        zordBattle = null;
    });
    actionsEl.appendChild(retreatBtn);
}

function zordDoTurn(action) {
    const zb = zordBattle;
    const pz = zb.playerZord;
    const ez = zb.enemyZord;
    const pEl = ELEMENTS[pz.element];
    const eEl = ELEMENTS[ez.element];

    // --- PLAYER TURN ---
    let playerDmg = 0;
    if (action === 'attack') {
        playerDmg = Math.max(1, pz.attack + Math.floor(Math.random() * 3) - 1);
        zb.log.push(`${escapeHtml(pz.nickname)} attacks for ${playerDmg} damage!`);
    } else if (action === 'power') {
        const mult = getElementMultiplier(pz.power.element, ez.element);
        playerDmg = Math.max(1, Math.floor(pz.power.damage * mult + Math.random() * 3));
        let effText = '';
        if (mult > 1) effText = ' Super effective!';
        else if (mult < 1) effText = ' Not very effective...';
        zb.log.push(`${escapeHtml(pz.nickname)} uses ${pz.power.name}! ${playerDmg} damage!${effText}`);
        if (mult > 1) playSound('hit');
    }

    ez.currentHp = Math.max(0, ez.currentHp - playerDmg);
    playSound('hit');

    if (ez.currentHp <= 0) {
        zb.log.push(`${ez.nickname} was defeated!`);
        zb.over = true;
        zordBattleEnd(true);
        return;
    }

    // --- ENEMY TURN ---
    zb.turn = 'enemy';
    renderZordBattle();

    setTimeout(() => {
        // Enemy picks attack or power (50/50)
        let enemyDmg = 0;
        if (Math.random() < 0.5) {
            enemyDmg = Math.max(1, ez.attack + Math.floor(Math.random() * 3) - 1);
            zb.log.push(`${ez.nickname} attacks for ${enemyDmg} damage!`);
        } else {
            const mult = getElementMultiplier(ez.power.element, pz.element);
            enemyDmg = Math.max(1, Math.floor(ez.power.damage * mult + Math.random() * 3));
            let effText = '';
            if (mult > 1) effText = ' Super effective!';
            else if (mult < 1) effText = ' Not very effective...';
            zb.log.push(`${ez.nickname} uses ${ez.power.name}! ${enemyDmg} damage!${effText}`);
        }

        pz.currentHp = Math.max(0, pz.currentHp - enemyDmg);
        playSound('hurt');

        if (pz.currentHp <= 0) {
            zb.log.push(`${escapeHtml(pz.nickname)} fainted!`);
            // Check if other bench Zords are alive
            const alive = state.zordBench.filter(i => state.zordList[i].currentHp > 0);
            if (alive.length > 0) {
                zb.log.push('Choose another Zord or retreat!');
                zb.turn = 'player';
                renderZordBattle();
                // Show picker
                setTimeout(() => showZordPicker(), 500);
            } else {
                zb.log.push('All your Zords fainted!');
                zb.over = true;
                zordBattleEnd(false);
            }
            return;
        }

        zb.turn = 'player';
        renderZordBattle();
    }, 800);
}

function zordBattleEnd(victory) {
    const zb = zordBattle;
    renderZordBattle();

    const actionsEl = document.getElementById('zb-actions');
    actionsEl.innerHTML = '';

    if (victory) {
        const enemy = state.currentEnemy;
        const rubiesEarned = enemy.rubies + (state.quizCorrect || 0);
        state.rubies += rubiesEarned;
        if (!state.defeatedEnemies.includes(enemy.name)) state.defeatedEnemies.push(enemy.name);
        if (state._pendingZoneKey && !state.defeatedZones.has(state._pendingZoneKey)) {
            state.defeatedZones.add(state._pendingZoneKey);
        }
        state._pendingZoneKey = null;

        // Grant XP to bench Zords
        const xpGain = 5 + Math.floor(enemy.hp / 10);
        grantBenchXp(xpGain);

        zb.log.push(`Victory! +${rubiesEarned} rubies! Bench Zords gained ${xpGain} XP!`);
        renderZordBattle();

        playSound('victory');
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Continue';
        btn.addEventListener('click', () => {
            zordBattle = null;
            if (battle) { battle.running = false; battle = null; }
            state.hp = Math.max(state.hp, 1);
            updateHUD();
            showScreen('game');
        });
        actionsEl.appendChild(btn);
    } else {
        state._pendingZoneKey = null;
        zb.log.push('Your Zords were defeated...');
        renderZordBattle();

        playSound('defeat');
        // Go back to action battle
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.textContent = 'Fight yourself';
        btn.addEventListener('click', () => {
            if (battle) {
                battle.enemyHp = zb.enemyZord.currentHp;
                showScreen('battle');
                battle.running = true;
                battleLoop();
            }
            zordBattle = null;
        });
        actionsEl.appendChild(btn);

        const runBtn = document.createElement('button');
        runBtn.className = 'btn btn-secondary';
        runBtn.textContent = 'Run away';
        runBtn.addEventListener('click', () => {
            zordBattle = null;
            if (battle) { battle.running = false; battle = null; }
            state.hp = Math.max(state.hp, 1);
            updateHUD();
            showScreen('game');
        });
        actionsEl.appendChild(runBtn);
    }
}

// Grant bench XP after regular (non-Zord) battle victories too
const _origEndBattle = endBattle;
endBattle = function(victory) {
    if (victory && state.zordBench.length > 0) {
        const enemy = state.currentEnemy;
        const xpGain = 3 + Math.floor(enemy.hp / 15);
        grantBenchXp(xpGain);
    }
    _origEndBattle(victory);
};

// ============================================================
// FISHING MINIGAME
// ============================================================
const FW = 500, FH = 350;
let fishCanvas, fishCtx;
let fishing = null;

function startFishing() {
    showScreen('fishing');
    fishCanvas = document.getElementById('fishing-canvas');
    fishCtx = fishCanvas.getContext('2d');
    scaleCanvasToFit(fishCanvas, FW, FH);
    // Clear all keys to prevent auto-cast from the interact key
    Object.keys(keys).forEach(k => keys[k] = false);

    fishing = {
        running: true,
        phase: 'aiming',   // aiming -> casting -> waiting -> hooked -> caught / missed
        frame: 0,
        // Ripple (target) - SLOWER movement
        rippleX: 100 + Math.random() * (FW - 200),
        rippleY: 60 + Math.random() * (FH - 180),
        rippleVx: (Math.random() < 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
        rippleVy: (Math.random() < 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.2),
        rippleVisible: true,
        rippleTimer: 0,
        // Aim cursor (player controls with arrows/WASD)
        aimX: FW / 2,
        aimY: FH / 2 - 40,
        // Cast line
        castX: FW / 2, castY: FH - 40,
        // Bobber
        bobberX: 0, bobberY: 0,
        bobberLanded: false,
        // Hook
        hookTimer: 0,
        reelProgress: 0,
        // Result
        caughtFish: null
    };

    document.getElementById('fishing-status').textContent = 'Aim with arrows/WASD, Space to cast!';
    document.getElementById('fishing-result').style.display = 'none';
    document.getElementById('fishing-fish-count').textContent = `Fish: ${Object.values(state.fish).reduce((a, b) => a + b, 0)}`;
    fishingLoop();
}

function fishingLoop() {
    if (!fishing || !fishing.running) return;
    fishing.frame++;
    fishingUpdate();
    fishingRender();
    requestAnimationFrame(fishingLoop);
}

function fishingUpdate() {
    const f = fishing;

    // Move ripple (SLOW)
    f.rippleX += f.rippleVx;
    f.rippleY += f.rippleVy;
    if (f.rippleX < 50 || f.rippleX > FW - 50) f.rippleVx *= -1;
    if (f.rippleY < 50 || f.rippleY > FH - 100) f.rippleVy *= -1;

    // Ripple always visible (just pulses)
    f.rippleVisible = true;

    // --- AIMING PHASE: move cursor with arrows/WASD ---
    if (f.phase === 'aiming') {
        const aimSpeed = 3;
        if (keys['arrowup'] || keys['w']) f.aimY = Math.max(30, f.aimY - aimSpeed);
        if (keys['arrowdown'] || keys['s']) f.aimY = Math.min(FH - 80, f.aimY + aimSpeed);
        if (keys['arrowleft'] || keys['a']) f.aimX = Math.max(30, f.aimX - aimSpeed);
        if (keys['arrowright'] || keys['d']) f.aimX = Math.min(FW - 30, f.aimX + aimSpeed);
    }

    // --- CASTING: bobber flies to aim position ---
    if (f.phase === 'casting') {
        f.castTimer = (f.castTimer || 0) + 1;
        const dx = f.aimX - f.bobberX;
        const dy = f.aimY - f.bobberY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10 || f.castTimer > 60) { // land if close OR timeout after 1 sec
            f.bobberLanded = true;
            f.bobberX = f.aimX;
            f.bobberY = f.aimY;
            f.phase = 'waiting';
            f.hookTimer = 0;
            // Check distance to ripple
            const rippleDist = Math.sqrt((f.bobberX - f.rippleX) ** 2 + (f.bobberY - f.rippleY) ** 2);
            if (rippleDist < 50) {
                f.hookTimer = 20 + Math.floor(Math.random() * 20);
            } else if (rippleDist < 100) {
                f.hookTimer = 50 + Math.floor(Math.random() * 40);
            } else {
                f.hookTimer = 150;
            }
            playSound('step');
            document.getElementById('fishing-status').textContent = 'Waiting for a bite...';
        } else {
            f.bobberX += (dx / dist) * 10;
            f.bobberY += (dy / dist) * 10;
        }
    }

    // --- WAITING: countdown to bite ---
    if (f.phase === 'waiting') {
        f.hookTimer--;
        if (f.hookTimer <= 0) {
            const rippleDist = Math.sqrt((f.bobberX - f.rippleX) ** 2 + (f.bobberY - f.rippleY) ** 2);
            if (rippleDist < 100) {
                f.phase = 'hooked';
                f.reelProgress = 20; // start with some progress
                f.frame = 0; // reset frame for timeout
                document.getElementById('fishing-status').textContent = 'FISH ON! Mash Space to reel in!';
                playSound('hit');
            } else {
                f.phase = 'missed';
                document.getElementById('fishing-status').textContent = 'No bite... too far from the ripple. Press Space to try again.';
            }
        } else if (f.hookTimer < 25) {
            document.getElementById('fishing-status').textContent = 'Something is nibbling...';
        }
    }

    // --- HOOKED: mash space to reel in (EASIER now) ---
    if (f.phase === 'hooked') {
        f.reelProgress -= 0.15; // much slower decay
        if (f.reelProgress < 0) f.reelProgress = 0;
        if (f.reelProgress >= 100) {
            // 50/50 chance the fish escapes at the last moment
            if (Math.random() < 0.5) {
                f.phase = 'caught';
                f.caughtFish = pickFish();
                if (!state.fish[f.caughtFish.id]) state.fish[f.caughtFish.id] = 0;
                state.fish[f.caughtFish.id]++;
                trackFishCaught();
                playSound('victory');
                showFishingResult(true, f.caughtFish);
            } else {
                f.phase = 'missed';
                document.getElementById('fishing-status').textContent = 'The fish broke free at the last moment! Press Space to try again.';
                playSound('hurt');
            }
        }
        // Longer timeout - 6 seconds
        if (f.frame > 360 && f.phase === 'hooked') {
            f.phase = 'missed';
            document.getElementById('fishing-status').textContent = 'The fish got away! Press Space to try again.';
            playSound('hurt');
        }
    }
}

function pickFish() {
    // Determine water type based on location
    const waterType = state.location === 'beach' ? 'ocean' : state.location === 'mountains' ? 'mountain' : 'pond';
    const localFish = FISH_TYPES.filter(ft => ft.water === waterType);

    // Experience: more fish caught = better odds for rare fish, less junk
    const exp = stats.fishCaught || 0;
    const expBonus = Math.min(exp * 0.01, 0.5); // caps at +0.5 shift after 50 catches

    // Build adjusted rarities: junk decreases, rare increases with experience
    const adjusted = localFish.map((ft, i) => {
        let r = ft.rarity;
        if (ft.sellPrice <= 2) r = Math.max(0.02, r - expBonus * 0.4); // junk gets rarer
        else if (i >= localFish.length - 2) r = r + expBonus * 0.15;   // rare gets more common
        else if (i >= localFish.length - 3) r = r + expBonus * 0.08;   // medium-rare boost
        return { ...ft, adjRarity: r };
    });

    // Normalize
    const total = adjusted.reduce((s, f) => s + f.adjRarity, 0);
    const roll = Math.random() * total;
    let cumulative = 0;
    for (const ft of adjusted) {
        cumulative += ft.adjRarity;
        if (roll <= cumulative) return ft;
    }
    return localFish[Math.floor(localFish.length / 2)]; // default to middle fish
}

function showFishingResult(caught, fish) {
    const resultEl = document.getElementById('fishing-result');
    const textEl = document.getElementById('fishing-result-text');
    const actionsEl = document.getElementById('fishing-result-actions');
    resultEl.style.display = 'flex';

    const isJunk = fish.hp < 0;
    textEl.innerHTML = `You caught a ${fish.icon} <span style="color:${isJunk ? 'var(--accent)' : 'var(--gold)'}">${fish.name}</span>!<br><span style="font-size:9px;color:var(--text-dim)">${fish.desc || ''}</span>`;
    actionsEl.innerHTML = '';

    const keepBtn = document.createElement('button');
    keepBtn.className = 'btn btn-primary';
    keepBtn.textContent = 'Keep Fishing';
    keepBtn.addEventListener('click', () => {
        resultEl.style.display = 'none';
        resetFishingCast();
    });
    actionsEl.appendChild(keepBtn);

    const eatBtn = document.createElement('button');
    eatBtn.className = 'btn btn-secondary';
    eatBtn.textContent = fish.hp < 0 ? `Eat (${fish.hp} HP!)` : `Eat (+${fish.hp} HP)`;
    if (fish.hp < 0) eatBtn.style.color = '#e94560';
    eatBtn.addEventListener('click', () => {
        state.fish[fish.id]--;
        if (fish.hp < 0) {
            state.hp = Math.max(1, state.hp + fish.hp);
            playSound('hurt');
        } else {
            state.hp = Math.min(state.maxHp, state.hp + fish.hp);
        }
        updateHUD();
        resultEl.style.display = 'none';
        resetFishingCast();
    });
    actionsEl.appendChild(eatBtn);

    if (fish.sellPrice > 0) {
    const sellBtn = document.createElement('button');
    sellBtn.className = 'btn btn-secondary';
    sellBtn.textContent = `Sell (${fish.sellPrice} rubies)`;
    sellBtn.addEventListener('click', () => {
        state.fish[fish.id]--;
        state.rubies += fish.sellPrice;
        updateHUD();
        resultEl.style.display = 'none';
        resetFishingCast();
    });
    actionsEl.appendChild(sellBtn);
    }

    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'btn btn-secondary';
    leaveBtn.textContent = 'Leave';
    leaveBtn.addEventListener('click', () => {
        fishing.running = false;
        fishing = null;
        showScreen('game');
        updateHUD();
    });
    actionsEl.appendChild(leaveBtn);
}

function resetFishingCast() {
    fishing.phase = 'aiming';
    fishing.bobberLanded = false;
    fishing.frame = 30; // skip cooldown since we're already in fishing
    fishing.castTimer = 0;
    fishing.aimX = FW / 2;
    fishing.aimY = FH / 2 - 40;
    fishing.rippleX = 100 + Math.random() * (FW - 200);
    fishing.rippleY = 60 + Math.random() * (FH - 180);
    fishing.rippleVx = (Math.random() < 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3);
    fishing.rippleVy = (Math.random() < 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.2);
    document.getElementById('fishing-status').textContent = 'Aim with arrows/WASD, Space to cast!';
    document.getElementById('fishing-fish-count').textContent = `Fish: ${Object.values(state.fish).reduce((a, b) => a + b, 0)}`;
}

// Fishing key input
document.addEventListener('keydown', (e) => {
    if (state.screen !== 'fishing' || !fishing) return;
    // Ignore inputs for first 30 frames (prevents auto-cast from interact key)
    if (fishing.frame < 30) return;

    if (e.key === 'Escape') {
        fishing.running = false;
        fishing = null;
        showScreen('game');
        updateHUD();
        e.preventDefault();
        return;
    }

    if (e.key === ' ') {
        e.preventDefault();
        if (fishing.phase === 'aiming') {
            // Cast toward aim cursor!
            fishing.phase = 'casting';
            fishing.castTimer = 0;
            fishing.bobberX = fishing.castX;
            fishing.bobberY = fishing.castY;
            document.getElementById('fishing-status').textContent = 'Casting...';
            playSound('swing');
        } else if (fishing.phase === 'casting') {
            // Cancel cast, reel back
            resetFishingCast();
        } else if (fishing.phase === 'waiting') {
            // Reel in and recast
            resetFishingCast();
            document.getElementById('fishing-status').textContent = 'Reeled in. Aim and cast again!';
        } else if (fishing.phase === 'hooked') {
            fishing.reelProgress += 8;
            playSound('step');
        } else if (fishing.phase === 'missed') {
            resetFishingCast();
        } else if (fishing.phase === 'caught') {
            // Do nothing, result screen handles it
        }
    }
});

function fishingRender() {
    const f = fishing;
    const c = fishCtx;
    const pw = FW / 2; // player X position
    const isOcean = state.location === 'beach';
    const isMtn = state.location === 'mountains';

    // === WATER ===
    if (isOcean) {
        // Ocean: sky at top, then deep ocean water
        for (let y = 0; y < 40; y++) {
            const t = y / 40;
            c.fillStyle = `rgb(${Math.floor(100 + t * 50)},${Math.floor(170 + t * 40)},${Math.floor(220 + t * 15)})`;
            c.fillRect(0, y, FW, 1);
        }
        // Horizon line
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(0, 38, FW, 3);
        // Ocean water
        for (let y = 40; y < FH - 50; y++) {
            const t = (y - 40) / (FH - 90);
            c.fillStyle = `rgb(${Math.floor(10 + t * 20)},${Math.floor(60 + t * 40)},${Math.floor(120 + t * 30)})`;
            c.fillRect(0, y, FW, 1);
        }
    } else if (isMtn) {
        // Mountain lake: darker, colder tones
        for (let y = 0; y < FH - 50; y++) {
            const t = y / (FH - 50);
            c.fillStyle = `rgb(${Math.floor(12 + t * 14)},${Math.floor(40 + t * 30)},${Math.floor(70 + t * 35)})`;
            c.fillRect(0, y, FW, 1);
        }
    } else {
        // Pond (default)
        for (let y = 0; y < FH - 50; y++) {
            const t = y / (FH - 50);
            c.fillStyle = `rgb(${Math.floor(14 + t * 16)},${Math.floor(50 + t * 30)},${Math.floor(90 + t * 30)})`;
            c.fillRect(0, y, FW, 1);
        }
    }

    // Wave texture
    for (let wy = isOcean ? 42 : 8; wy < FH - 55; wy += isOcean ? 8 : 12) {
        const wave = Math.sin(f.frame * 0.03 + wy * 0.08);
        const waveAmp = isOcean ? 8 : 5;
        c.strokeStyle = isOcean ? `rgba(60,140,200,${0.15 + wave * 0.05})` :
                        isMtn ? `rgba(60,130,180,${0.1 + wave * 0.03})` :
                        `rgba(80,160,210,${0.12 + wave * 0.04})`;
        c.lineWidth = 2;
        c.beginPath();
        for (let x = 0; x < FW; x += 4) {
            c.lineTo(x, wy + Math.sin(x * 0.015 + f.frame * 0.04 + wy * 0.1) * waveAmp);
        }
        c.stroke();
    }

    // Ocean-specific: white foam crests
    if (isOcean) {
        for (let i = 0; i < 6; i++) {
            const fy2 = 50 + i * 30 + Math.sin(f.frame * 0.015 + i * 2) * 4;
            const fx2 = (f.frame * 0.2 + i * 90) % (FW + 60) - 30;
            c.fillStyle = `rgba(200,230,255,${0.12 + Math.sin(f.frame * 0.04 + i) * 0.04})`;
            c.fillRect(fx2, fy2, 35, 2);
        }
    }

    // Deeper water patches
    c.fillStyle = 'rgba(10,30,60,0.15)';
    c.fillRect(60, isOcean ? 70 : 40, 80, 50);
    c.fillRect(300, isOcean ? 100 : 80, 100, 40);
    c.fillRect(150, 120, 70, 60);

    // Lily pads (pond only)
    if (!isOcean && !isMtn) {
        const lilies = [[80, 60], [340, 50], [420, 100], [100, 180], [380, 170]];
        lilies.forEach(([lx, ly]) => {
            const bob = Math.sin(f.frame * 0.02 + lx) * 2;
            c.fillStyle = '#2a7030';
            c.beginPath();
            c.ellipse(lx, ly + bob, 14, 8, 0, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#349038';
            c.beginPath();
            c.ellipse(lx - 2, ly - 1 + bob, 10, 5, 0, 0, Math.PI * 2);
            c.fill();
            if (lx > 200) {
                c.fillStyle = '#e880a0';
                c.fillRect(lx - 2, ly - 5 + bob, 4, 4);
                c.fillStyle = '#ffd040';
                c.fillRect(lx - 1, ly - 4 + bob, 2, 2);
            }
        });
    }

    // Fish shadows (swimming under water)
    const fishCount = isOcean ? 5 : 3;
    for (let i = 0; i < fishCount; i++) {
        const fx = (f.frame * (isOcean ? 0.5 : 0.3) + i * (isOcean ? 110 : 180)) % (FW + 40) - 20;
        const fy = (isOcean ? 70 : 60) + i * (isOcean ? 40 : 60) + Math.sin(f.frame * 0.02 + i * 3) * 15;
        const fSize = isOcean ? 14 + (i % 3) * 3 : 12;
        c.fillStyle = 'rgba(10,30,60,0.2)';
        c.beginPath();
        c.ellipse(fx, fy, fSize, fSize * 0.4, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(fx - fSize, fy);
        c.lineTo(fx - fSize - 6, fy - 4);
        c.lineTo(fx - fSize - 6, fy + 4);
        c.closePath();
        c.fill();
    }

    // === RIPPLE TARGET ===
    if (f.rippleVisible && f.phase !== 'caught') {
        const rSize = 14 + Math.sin(f.frame * 0.12) * 4;
        for (let i = 0; i < 4; i++) {
            const sx = f.rippleX + Math.sin(f.frame * 0.08 + i * 1.5) * rSize;
            const sy = f.rippleY + Math.cos(f.frame * 0.1 + i * 1.5) * rSize * 0.4;
            c.fillStyle = 'rgba(200,230,255,0.3)';
            c.fillRect(sx - 1, sy - 1, 3, 2);
        }
        c.strokeStyle = 'rgba(200,230,255,0.5)';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(f.rippleX, f.rippleY, rSize, rSize * 0.35, 0, 0, Math.PI * 2);
        c.stroke();
        c.strokeStyle = 'rgba(200,230,255,0.25)';
        c.beginPath();
        c.ellipse(f.rippleX, f.rippleY, rSize * 1.8, rSize * 0.65, 0, 0, Math.PI * 2);
        c.stroke();
    }

    // === SHORE ===
    if (isOcean) {
        // Sandy beach shore
        for (let y = FH - 50; y < FH; y++) {
            const t = (y - (FH - 50)) / 50;
            c.fillStyle = `rgb(${Math.floor(210 + t * 20)},${Math.floor(190 + t * 10)},${Math.floor(140 + t * 10)})`;
            c.fillRect(0, y, FW, 1);
        }
        // Foam at water edge
        for (let x = 0; x < FW; x += 5) {
            const fw = Math.sin(x * 0.15 + f.frame * 0.04) * 3;
            c.fillStyle = 'rgba(220,240,255,0.6)';
            c.fillRect(x, FH - 52 + fw, 4, 3);
        }
        // Shells on sand
        c.fillStyle = '#f0c8a0';
        for (let i = 0; i < 5; i++) {
            c.fillRect(60 + i * 100 + (i * 23) % 40, FH - 20 + (i * 7) % 10, 4, 3);
        }
    } else if (isMtn) {
        // Rocky mountain shore
        for (let y = FH - 50; y < FH; y++) {
            const t = (y - (FH - 50)) / 50;
            c.fillStyle = `rgb(${Math.floor(90 + t * 20)},${Math.floor(85 + t * 15)},${Math.floor(70 + t * 12)})`;
            c.fillRect(0, y, FW, 1);
        }
        // Rocky edge
        c.fillStyle = '#6a6858';
        for (let x = 0; x < FW; x += 8) {
            const rh = 2 + Math.sin(x * 0.3) * 2;
            c.fillRect(x, FH - 52 - rh, 6, rh + 2);
        }
        // Boulders
        c.fillStyle = '#5a5848';
        for (let i = 0; i < 4; i++) {
            c.fillRect(30 + i * 130, FH - 25 + (i * 5) % 8, 10, 7);
        }
    } else {
        // Pond shore (default)
        for (let y = FH - 50; y < FH; y++) {
            const t = (y - (FH - 50)) / 50;
            c.fillStyle = `rgb(${Math.floor(160 + t * 30)},${Math.floor(130 + t * 20)},${Math.floor(70 + t * 15)})`;
            c.fillRect(0, y, FW, 1);
        }
        c.fillStyle = '#6a9a60';
        for (let x = 0; x < FW; x += 6) {
            const gh = 3 + Math.sin(x * 0.2) * 2;
            c.fillRect(x, FH - 52 - gh, 4, gh + 2);
        }
        c.fillStyle = '#8a7a58';
        for (let i = 0; i < 8; i++) {
            c.fillRect(40 + i * 60 + (i * 17) % 30, FH - 20 + (i * 7) % 10, 5, 4);
        }
        // Reeds on sides
        for (let i = 0; i < 4; i++) {
            const rx = 20 + i * 15;
            const sway = Math.sin(f.frame * 0.02 + i) * 2;
            c.fillStyle = '#3a6a28';
            c.fillRect(rx + sway, FH - 75, 2, 30);
            c.fillRect(rx + 3 + sway, FH - 80, 2, 35);
        }
        for (let i = 0; i < 4; i++) {
            const rx = FW - 40 + i * 12;
            const sway = Math.sin(f.frame * 0.02 + i + 2) * 2;
            c.fillStyle = '#3a6a28';
            c.fillRect(rx + sway, FH - 70, 2, 25);
            c.fillRect(rx + 3 + sway, FH - 78, 2, 33);
        }
    }

    // === PLAYER (detailed sprite) ===
    drawCharSprite(c, pw, FH - 36, state.character, f.frame, 1.2);

    // === FISHING ROD & LINE ===
    const rodTipX = pw + 16, rodTipY = FH - 65;
    if (f.bobberLanded || f.phase === 'casting') {
        // Rod
        c.strokeStyle = '#5a3010';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(pw + 6, FH - 40);
        c.lineTo(rodTipX, rodTipY);
        c.stroke();
        c.strokeStyle = '#7a4a20';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(pw + 7, FH - 40);
        c.lineTo(rodTipX, rodTipY);
        c.stroke();
        // Line
        c.strokeStyle = 'rgba(220,220,220,0.6)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(rodTipX, rodTipY);
        c.quadraticCurveTo((rodTipX + f.bobberX) / 2, Math.min(rodTipY, f.bobberY) - 15, f.bobberX, f.bobberY);
        c.stroke();
    } else {
        // Held rod (angled up)
        c.strokeStyle = '#5a3010';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(pw + 6, FH - 40);
        c.lineTo(pw + 22, FH - 70);
        c.stroke();
    }

    // === BOBBER ===
    if (f.bobberLanded || f.phase === 'casting') {
        const bobY = f.bobberY + (f.bobberLanded ? Math.sin(f.frame * 0.08) * 3 : 0);
        // Water disturbance around bobber
        if (f.bobberLanded) {
            c.strokeStyle = 'rgba(200,230,255,0.2)';
            c.lineWidth = 1;
            c.beginPath();
            c.ellipse(f.bobberX, bobY + 2, 8, 3, 0, 0, Math.PI * 2);
            c.stroke();
        }
        // Bobber body
        c.fillStyle = '#e03030';
        c.fillRect(f.bobberX - 3, bobY - 6, 6, 8);
        c.fillStyle = '#fff';
        c.fillRect(f.bobberX - 3, bobY - 8, 6, 4);
        // Stick
        c.fillStyle = '#333';
        c.fillRect(f.bobberX - 1, bobY + 2, 2, 5);
    }

    // === AIM CURSOR ===
    if (f.phase === 'aiming') {
        const pulse = Math.sin(f.frame * 0.1) * 2;
        // Target circle
        c.strokeStyle = 'rgba(255, 240, 100, 0.9)';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(f.aimX, f.aimY, 14 + pulse, 0, Math.PI * 2);
        c.stroke();
        // Crosshair
        c.beginPath();
        c.moveTo(f.aimX - 20, f.aimY); c.lineTo(f.aimX - 8, f.aimY);
        c.moveTo(f.aimX + 8, f.aimY); c.lineTo(f.aimX + 20, f.aimY);
        c.moveTo(f.aimX, f.aimY - 20); c.lineTo(f.aimX, f.aimY - 8);
        c.moveTo(f.aimX, f.aimY + 8); c.lineTo(f.aimX, f.aimY + 20);
        c.stroke();
        // Center dot
        c.fillStyle = '#ff4';
        c.fillRect(f.aimX - 1, f.aimY - 1, 3, 3);
        // Trajectory line
        c.setLineDash([3, 3]);
        c.strokeStyle = 'rgba(255,255,200,0.3)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(pw + 18, FH - 65);
        c.lineTo(f.aimX, f.aimY);
        c.stroke();
        c.setLineDash([]);
    }

    // === REEL PROGRESS BAR ===
    if (f.phase === 'hooked') {
        // Bar background
        c.fillStyle = 'rgba(0,0,0,0.75)';
        c.fillRect(FW / 2 - 90, 12, 180, 24);
        c.strokeStyle = '#888';
        c.lineWidth = 1;
        c.strokeRect(FW / 2 - 90, 12, 180, 24);
        // Fill
        const barW = f.reelProgress * 1.76;
        c.fillStyle = barW > 120 ? '#4ecca3' : barW > 60 ? '#f5c842' : '#e94560';
        c.fillRect(FW / 2 - 88, 14, barW, 20);
        // Text
        c.fillStyle = '#fff';
        c.font = '8px "Press Start 2P", monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('REEL IT IN!', FW / 2, 8);
        // Exclamation at bobber
        c.fillStyle = '#f5c842';
        c.font = '16px "Press Start 2P", monospace';
        c.fillText('!', f.bobberX, f.bobberY - 18 + Math.sin(f.frame * 0.3) * 4);
        // Splashing
        for (let i = 0; i < 5; i++) {
            c.fillStyle = 'rgba(200,230,255,0.4)';
            const sx = f.bobberX + Math.sin(f.frame * 0.15 + i * 1.3) * 16;
            const sy = f.bobberY + Math.cos(f.frame * 0.12 + i * 1.7) * 8;
            c.fillRect(sx - 1, sy - 1, 3, 2);
        }
    }

    // === NIBBLE ===
    if (f.phase === 'waiting' && f.hookTimer < 25 && f.hookTimer > 0) {
        // Bobber twitching
        c.fillStyle = 'rgba(255,255,255,0.5)';
        c.fillRect(f.bobberX - 2, f.bobberY - 14 + Math.sin(f.frame * 0.5) * 2, 4, 3);
        c.fillRect(f.bobberX + 2, f.bobberY - 12, 3, 2);
    }

    // === DISTANCE INDICATOR (when aiming) ===
    if (f.phase === 'aiming') {
        const dist = Math.sqrt((f.aimX - f.rippleX) ** 2 + (f.aimY - f.rippleY) ** 2);
        const accuracy = dist < 30 ? 'PERFECT' : dist < 60 ? 'GOOD' : dist < 100 ? 'OK' : 'FAR';
        const accColor = dist < 30 ? '#4ecca3' : dist < 60 ? '#f5c842' : dist < 100 ? '#e0a030' : '#e94560';
        c.fillStyle = accColor;
        c.font = '7px "Press Start 2P", monospace';
        c.textAlign = 'center';
        c.fillText(accuracy, f.aimX, f.aimY + 24);
    }
}

// ============================================================
// BACKGROUND MUSIC (Web Audio API procedural melodies)
// ============================================================
let currentMusic = null;
let musicGain = null;

let musicId = 0; // unique ID to detect if music was replaced

function startMusic(theme) {
    stopMusic();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    musicGain = audioCtx.createGain();
    musicGain.gain.setValueAtTime(0.07, audioCtx.currentTime);
    musicGain.connect(audioCtx.destination);

    const notes = {
        title:  [261, 330, 392, 523, 392, 330, 261, 196, 261, 330, 392, 523, 659, 523, 392, 330],
        cave:   [196, 220, 196, 165, 196, 220, 247, 220, 196, 165, 147, 165, 196, 220, 196, 165],
        town:   [330, 392, 440, 392, 330, 294, 330, 392, 440, 523, 494, 440, 392, 330, 294, 330],
        forest: [220, 262, 330, 294, 262, 220, 196, 220, 262, 294, 330, 294, 262, 220, 196, 175],
        battle: [330, 415, 330, 415, 494, 415, 330, 262, 330, 415, 330, 494, 523, 494, 415, 330],
        fishing:[392, 440, 494, 523, 494, 440, 392, 330, 349, 392, 440, 494, 440, 392, 349, 330],
        temple: [196, 247, 294, 196, 175, 220, 262, 175, 196, 247, 294, 330, 294, 247, 196, 175],
        beach:  [392, 494, 523, 587, 523, 494, 392, 440, 494, 523, 587, 659, 587, 523, 494, 440],
        mountains: [196, 220, 262, 294, 262, 220, 196, 175, 165, 196, 220, 262, 294, 262, 220, 196],
        temple_boss: [165, 196, 247, 330, 294, 247, 196, 165, 147, 196, 247, 294, 330, 294, 247, 165]
    };

    const melody = notes[theme] || notes.town;
    const tempo = theme === 'battle' ? 0.2 : theme === 'title' ? 0.4 : 0.35;
    const myId = ++musicId; // capture this music session's ID

    function playNote(index) {
        // Stop if this music session was replaced
        if (myId !== musicId || !musicGain) return;

        try {
            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();
            osc.connect(noteGain);
            noteGain.connect(musicGain);

            osc.type = theme === 'cave' ? 'triangle' : theme === 'battle' ? 'sawtooth' : 'sine';
            osc.frequency.setValueAtTime(melody[index % melody.length], audioCtx.currentTime);
            noteGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + tempo * 0.9);

            osc.start();
            osc.stop(audioCtx.currentTime + tempo * 0.9);
        } catch (e) {}

        currentMusic = setTimeout(() => playNote(index + 1), tempo * 1000);
    }

    playNote(0);
}

function stopMusic() {
    if (currentMusic) {
        clearTimeout(currentMusic);
        currentMusic = null;
    }
    if (musicGain) {
        musicGain.disconnect();
        musicGain = null;
    }
}

// ============================================================
// GAME LOOP
// ============================================================
function gameLoop() {
    const now = performance.now();
    state.animFrame++;

    if (state.screen === 'game') {
        handleMovement(now);
        updateEnemyMovement();
        render();
    }

    requestAnimationFrame(gameLoop);
}

// Start title music as soon as audio context is unlocked
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const doStart = () => {
        const theme = (state.screen === 'title' || state.screen === 'character') ? 'title' :
                      state.screen === 'battle' ? 'battle' :
                      state.screen === 'fishing' ? 'fishing' :
                      state.screen === 'game' ? (state.location.startsWith('temple_') ?
                          (state.location === 'temple_7' ? 'temple_boss' : 'temple') : state.location) : 'title';
        startMusic(theme);
    };

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(doStart);
    } else {
        doStart();
    }
}

// Poll for audio context state - start music the instant it's unlocked
// This catches the case where the forceUnlockAudio handler resumes it
(function pollAudioReady() {
    if (audioCtx.state === 'running' && !audioUnlocked) {
        unlockAudio();
    } else {
        setTimeout(pollAudioReady, 100);
    }
})();

// Also trigger on any interaction as backup
['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, unlockAudio, { once: false });
});

// Hook music into screen changes
const _origShowScreen = showScreen;
showScreen = function(screenId) {
    _origShowScreen(screenId);
    if (screenId === 'game') {
        const musicTheme = state.location.startsWith('temple_')
            ? (state.location === 'temple_7' ? 'temple_boss' : 'temple')
            : state.location;
        startMusic(musicTheme);
    } else if (screenId === 'battle') {
        startMusic('battle');
    } else if (screenId === 'fishing') {
        startMusic('fishing');
    } else if (screenId === 'title' || screenId === 'character') {
        startMusic('title');
    } else {
        // Store, build, quiz - keep current music
    }
};

// Also change music on area transitions
const _origDoTransition = doTransition;
doTransition = function(t) {
    _origDoTransition(t);
    if (state.screen === 'game') {
        const musicTheme = state.location.startsWith('temple_')
            ? (state.location === 'temple_7' ? 'temple_boss' : 'temple')
            : state.location;
        startMusic(musicTheme);
    }
};

// ============================================================
// TOUCH CONTROLS (iPad/Mobile)
// ============================================================
(function initTouchControls() {
    // Detect touch device
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const touchEl = document.getElementById('touch-controls');
    const toggleEl = document.getElementById('touch-toggle');
    if (!touchEl) return;

    window._touchHidden = true;

    if (isTouch) {
        touchEl.style.display = 'none';
        if (toggleEl) toggleEl.style.display = 'block';
        // Prevent default touch behaviors (scrolling, zooming)
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }

    // Map touch events to key state
    function pressKey(key) {
        keys[key] = true;
        // Also fire a keydown for one-shot handlers (interact, inventory, etc.)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: key === ' ' ? ' ' : key, bubbles: true }));
    }

    function releaseKey(key) {
        keys[key] = false;
    }

    // D-pad buttons - hold for continuous movement
    document.querySelectorAll('.dpad-btn').forEach(btn => {
        const key = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            pressKey(key);
            // Also unlock audio on first touch
            if (!audioUnlocked) unlockAudio();
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            releaseKey(key);
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            btn.classList.remove('pressed');
            releaseKey(key);
        });
    });

    // Action buttons - single press
    document.querySelectorAll('.action-btn').forEach(btn => {
        const key = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            pressKey(key);
            if (!audioUnlocked) unlockAudio();
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            releaseKey(key);
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            btn.classList.remove('pressed');
            releaseKey(key);
        });
    });

    // Make the title screen "PUSH START" tappable
    const startBtn = document.getElementById('btn-new-game');
    if (startBtn) {
        startBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!audioUnlocked) unlockAudio();
            startBtn.click();
        }, { passive: false });
    }

    // Make character select canvas tappable (already has onclick, just need touch)
    const charCanvas = document.getElementById('charselect-canvas');
    if (charCanvas) {
        charCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!audioUnlocked) unlockAudio();
            const touch = e.touches[0];
            // Simulate click at touch position
            charCanvas.dispatchEvent(new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            }));
        }, { passive: false });
    }

    // Update button labels based on screen context
    function updateTouchLabels() {
        const aBtn = document.querySelector('.action-a');
        const bBtn = document.querySelector('.action-b');
        if (!aBtn || !bBtn) return;

        if (state.screen === 'battle') {
            aBtn.textContent = 'ATK';
            bBtn.dataset.key = 'p';
            bBtn.textContent = 'POT';
        } else if (state.screen === 'fishing') {
            aBtn.textContent = 'CAST';
            bBtn.dataset.key = 'escape';
            bBtn.textContent = 'ESC';
        } else {
            aBtn.textContent = 'A';
            bBtn.dataset.key = 'e';
            bBtn.textContent = 'B';
        }
    }

    // Toggle button
    if (toggleEl) {
        toggleEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window._touchHidden = !window._touchHidden;
            toggleEl.textContent = window._touchHidden ? 'SHOW' : 'CTRL';
        }, { passive: false });
    }

    // Virtual keyboard toggle
    const kbToggle = document.getElementById('keyboard-toggle');
    const kbInput = document.getElementById('virtual-kb-input');
    let kbVisible = false;

    if (kbToggle && kbInput) {
        kbToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            kbVisible = !kbVisible;
            if (kbVisible) {
                kbInput.style.bottom = '0px';
                kbInput.focus();
                kbToggle.textContent = 'KB X';
            } else {
                kbInput.blur();
                kbInput.style.bottom = '-100px';
                kbToggle.textContent = 'KB';
            }
        }, { passive: false });

        // Forward keyboard input from virtual KB to game
        kbInput.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, bubbles: true }));
        });
        kbInput.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });
        // Prevent the input from accumulating text
        kbInput.addEventListener('input', () => { kbInput.value = ''; });
    }

    // Poll for screen changes
    let lastScreen = '';
    setInterval(() => {
        if (state.screen !== lastScreen) {
            lastScreen = state.screen;
            updateTouchLabels();
        }
        // Show/hide controls
        const onGameScreen = state.screen !== 'title' && state.screen !== 'character';
        touchEl.style.display = (onGameScreen && !window._touchHidden) ? 'block' : 'none';
        if (toggleEl) toggleEl.style.display = (onGameScreen && isTouch) ? 'block' : 'none';
    }, 200);
})();

// ============================================================
// GAMEPAD SUPPORT (Bluetooth controllers on iPad/desktop)
// ============================================================
(function initGamepad() {
    let gamepadConnected = false;
    const prevButtons = {};

    window.addEventListener('gamepadconnected', (e) => {
        gamepadConnected = true;
        // Hide touch controls when controller is connected
        const touchEl = document.getElementById('touch-controls');
        if (touchEl) touchEl.style.display = 'none';
    });

    window.addEventListener('gamepaddisconnected', () => {
        gamepadConnected = false;
    });

    // Standard gamepad mapping:
    // Buttons: 0=A(south), 1=B(east), 2=X(west), 3=Y(north)
    //          4=LB, 5=RB, 6=LT, 7=RT
    //          8=Select, 9=Start, 12=DUp, 13=DDown, 14=DLeft, 15=DRight
    // Axes: 0=LeftStickX, 1=LeftStickY

    const buttonMap = {
        0: ' ',         // A = Space (attack/interact/confirm)
        1: 'e',         // B = E (interact/back)
        2: 'c',         // X = C (throw cage)
        3: 'p',         // Y = P (potion)
        4: 'z',         // LB = Z (zordlist)
        5: 'i',         // RB = I (inventory)
        8: 'm',         // Select = M (map)
        9: 'enter',     // Start = Enter
        12: 'arrowup',
        13: 'arrowdown',
        14: 'arrowleft',
        15: 'arrowright'
    };

    function pollGamepad() {
        if (!gamepadConnected) {
            requestAnimationFrame(pollGamepad);
            return;
        }

        const gamepads = navigator.getGamepads();
        const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
        if (!gp) {
            requestAnimationFrame(pollGamepad);
            return;
        }

        // Unlock audio on any button press
        if (!audioUnlocked) {
            for (let i = 0; i < gp.buttons.length; i++) {
                if (gp.buttons[i].pressed) { unlockAudio(); break; }
            }
        }

        // D-pad and face buttons
        for (const [btnIdx, key] of Object.entries(buttonMap)) {
            const idx = parseInt(btnIdx);
            if (idx >= gp.buttons.length) continue;
            const pressed = gp.buttons[idx].pressed;
            const wasPressed = prevButtons[idx] || false;

            if (pressed && !wasPressed) {
                // Button just pressed
                keys[key] = true;
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: key === 'enter' ? 'Enter' : key === ' ' ? ' ' : key,
                    bubbles: true
                }));
            } else if (!pressed && wasPressed) {
                // Button released
                keys[key] = false;
            } else if (pressed) {
                // Held (for continuous movement)
                keys[key] = true;
            }

            prevButtons[idx] = pressed;
        }

        // Left stick for movement (with deadzone)
        const deadzone = 0.3;
        const lx = gp.axes[0] || 0;
        const ly = gp.axes[1] || 0;

        keys['arrowleft'] = lx < -deadzone || keys['arrowleft'];
        keys['arrowright'] = lx > deadzone || keys['arrowright'];
        keys['arrowup'] = ly < -deadzone || keys['arrowup'];
        keys['arrowdown'] = ly > deadzone || keys['arrowdown'];

        // Clear stick keys when centered (only if not held by d-pad)
        if (Math.abs(lx) < deadzone) {
            if (!gp.buttons[14]?.pressed) keys['arrowleft'] = false;
            if (!gp.buttons[15]?.pressed) keys['arrowright'] = false;
        }
        if (Math.abs(ly) < deadzone) {
            if (!gp.buttons[12]?.pressed) keys['arrowup'] = false;
            if (!gp.buttons[13]?.pressed) keys['arrowdown'] = false;
        }

        requestAnimationFrame(pollGamepad);
    }

    pollGamepad();
})();
