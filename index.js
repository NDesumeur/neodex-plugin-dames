// Dames : les dames internationales (10 × 10) contre l'ordinateur, sept niveaux.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels, damier et pions en relief). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Dames</span><span class="hint" id="dmInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="dmCv" width="236" height="260"></canvas></div>
    <div class="gSide">
      <div class="row"><button class="btn main" id="dmNew">NOUVELLE PARTIE</button><button class="btn" id="dmUndo">ANNULER</button></div>
      <div class="row"><select class="f gSel" id="dmLevel"><option value="0">Débutant</option><option value="1">Facile</option><option value="2" selected>Moyen</option><option value="3">Difficile</option><option value="4">Expert</option><option value="5">Maître</option><option value="6">Grand maître</option></select><select class="f gSel" id="dmColor"><option value="w" selected>Je joue les blancs</option><option value="b">Je joue les noirs</option><option value="r">Couleur au hasard</option></select></div>
      <div class="row"><select class="f gSel" id="dmMode"><option value="ia">Contre l'ordinateur</option><option value="net">À distance (par un code)</option></select></div>
      <div id="dmNet" style="display:none"><div class="row"><button class="btn" id="dmHost">CRÉER UNE PARTIE</button></div><div class="row"><input class="f" id="dmCode" placeholder="CODE" maxlength="8" autocomplete="off" spellcheck="false" style="max-width:110px;text-transform:uppercase"><button class="btn" id="dmJoin">REJOINDRE</button></div><div class="hint" id="dmNetInfo"></div></div>
      <div class="sysCard"><b>COMBINAISONS</b><div class="row"><button class="btn" id="dmPuz">UNE COMBINAISON</button><button class="btn" id="dmPuzHint">INDICE</button></div><div class="hint" id="dmPuzInfo"></div></div>
      <div class="sysCard"><b>PARTIE</b><div class="gStats" id="dmCount"></div></div>
      <div class="sysCard"><b>COUPS</b><div id="dmMoves" class="chMoves"></div></div>
      <div class="hint">Prise obligatoire : les pions qui doivent prendre clignotent en orange, les pièces qu'ils vont prendre en rouge.</div>
      <div class="hint">Règles internationales (10 × 10) : la prise est obligatoire, en avant comme en arrière, et il faut prendre le plus de pièces possible. La dame se déplace de plusieurs cases. Pour une rafle, clique la case d'arrivée (ou les cases de passage).</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:0 1 auto;min-width:min(100%,340px);position:relative}
.gameBox canvas{image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none;width:min(calc(100vw - 80px),max(300px,calc((100vh - 190px) * 236 / 260)));height:auto;aspect-ratio:236/260}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:auto 1fr;gap:4px 14px}
.gStats b{text-align:right}
.chMoves{overflow-y:auto;max-height:max(120px,calc(100vh - 560px))}
.chMv{display:grid;grid-template-columns:40px 1fr 1fr;padding:2px 0}
.chMv .n{opacity:.6}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "DAMES", T: {"k": "#07020f", "k2": "#120828", "fill": "#1c1038", "fillOn": "#2a1850", "hl": "#382066", "line": "#5a3a8a", "acc": "#ff6ad5", "accL": "#ffd0f2", "accS": "#c03a9a", "accD": "#4a1040", "rivet": "#ffd0f2", "btn": "#382066", "btnHi": "#6a4aa0", "btnLo": "#120828", "btnHov": "#4a2a80", "btnHovHi": "#8a6ac0", "text": "#f8f0ff", "muted": "#b8a8d8", "acc2": "#7ac8f0", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#0a0418", "bgDot": "#1c1038", "bgDot2": "#120828", "spark": "#5a3a8a", "spark2": "#ff6ad5", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["............", "....kkkk....", "..kkwwwwkk..", ".kwwwwwwwwk.", ".kwmmmmmmwk.", ".kwmwwwwmwk.", ".kwmmmmmmwk.", ".kkwwwwwwkk.", ".kmkkkkkkmk.", "..kkmmmmkk..", "....kkkk....", "............"],
  icons: [[/^NOUVELLE/, "play"], [/^PARTIE/, "crown"], [/^COUPS/, "note"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const LEGACY_GAMES = {"top":["dames"],"best":"^$"};
  let games = await doc('games');
  if (games == null) {  // première ouverture : tu retrouves tes records et tes parties d'avant
    const old = legacy.api ? await legacy.api('games').catch(() => null) : null; games = { best: {} };
    if (old) { const re = new RegExp(LEGACY_GAMES.best); for (const [k, v] of Object.entries(old.best || {})) if (re.test(k)) games.best[k] = v; for (const k of LEGACY_GAMES.top) if (old[k] !== undefined) games[k] = old[k]; await folder.write('games', games); }
  }
  games = { best: {}, ...games };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const gstore = (k, init) => (games[k] ??= init);
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.8)'; g.fillRect(0, y0 - 18, w, lines.length * 16 + 16);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 16 + (size > 8 ? 4 : 0), color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
let actx = null, dmMute = false;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .06, at = 0) => { if (dmMute) return; try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
// les sons : le pion posé (un « toc » de bois), la prise (un « clac » qui monte à chaque pièce d'une rafle), la dame couronnée
const dmToc = () => { beep(190, .07, 'triangle', 110, .14); beep(900, .02, 'square', 0, .02); };
const dmClac = k => { beep(420 + k * 90, .06, 'square', 200 + k * 40, .07); beep(150, .09, 'triangle', 70, .12); };
const dmCrown = () => [660, 880, 1100, 1320].forEach((f, i) => beep(f, .1, 'square', 0, .05, i * .08));
  // ---- les règles et l'ordinateur ----
/* ---------- international draughts (10 x 10) rules and engine: board = 100 chars, w/b men, W/B kings, '.' empty ---------- */
function damesCore() {
  const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]], on = (r, c) => r >= 0 && r < 10 && c >= 0 && c < 10;
  const mine = (x, w) => w ? x === 'w' || x === 'W' : x === 'b' || x === 'B';
  const start = () => ({b: Array.from({length: 100}, (_, i) => { const r = Math.floor(i / 10), c = i % 10; return (r + c) % 2 ? r < 4 ? 'b' : r > 5 ? 'w' : '.' : '.'; }), w: true, k: 0});
  function moves(s) {  // legal moves {path: [from, ...landings], caps: [...]}: capturing is compulsory, and the longest capture must be played
    const b = s.b, w = s.w, caps = [];
    for (let sq = 0; sq < 100; sq++) {
      if (!mine(b[sq], w)) continue;
      const king = b[sq] === 'W' || b[sq] === 'B', free = i => b[i] === '.' || i === sq;  // the moving piece has left its square
      const dfs = (pos, path, taken) => {
        let more = false; const r = Math.floor(pos / 10), c = pos % 10;
        for (const [dr, dc] of DIRS) {
          let y = r + dr, x = c + dc;
          if (king) while (on(y, x) && free(y * 10 + x)) { y += dr; x += dc; }
          if (!on(y, x)) continue;
          const mid = y * 10 + x;
          if (!mine(b[mid], !w) || taken.includes(mid)) continue;  // pieces already jumped stay on the board until the end and cannot be jumped twice
          for (let ly = y + dr, lx = x + dc; on(ly, lx) && free(ly * 10 + lx); ly += dr, lx += dc) {
            more = true; dfs(ly * 10 + lx, [...path, ly * 10 + lx], [...taken, mid]);
            if (!king) break;
          }
        }
        if (!more && taken.length) caps.push({path, caps: taken});
      };
      dfs(sq, [sq], []);
    }
    if (caps.length) { const mx = Math.max(...caps.map(m => m.caps.length)); return caps.filter(m => m.caps.length === mx); }
    const out = [];
    for (let sq = 0; sq < 100; sq++) {
      if (!mine(b[sq], w)) continue;
      const king = b[sq] === 'W' || b[sq] === 'B', r = Math.floor(sq / 10), c = sq % 10;
      for (const [dr, dc] of DIRS) {
        if (!king && dr !== (w ? -1 : 1)) continue;
        for (let y = r + dr, x = c + dc; on(y, x) && b[y * 10 + x] === '.'; y += dr, x += dc) { out.push({path: [sq, y * 10 + x], caps: []}); if (!king) break; }
      }
    }
    return out;
  }
  function make(s, m) {
    const b = s.b.slice(), from = m.path[0], to = m.path.at(-1), pc = b[from];
    b[from] = '.'; for (const c of m.caps) b[c] = '.';
    const row = Math.floor(to / 10);
    b[to] = pc === 'w' && row === 0 ? 'W' : pc === 'b' && row === 9 ? 'B' : pc;  // a man becomes a king when its move ends on the far row
    return {b, w: !s.w, k: (pc === 'W' || pc === 'B') && !m.caps.length ? s.k + 1 : 0};
  }
  const key = s => s.b.join('') + (s.w ? 'w' : 'b');
  function evaluate(s) {
    let v = 0;
    for (let i = 0; i < 100; i++) {
      const x = s.b[i]; if (x === '.') continue;
      const r = Math.floor(i / 10), c = i % 10, centre = c >= 3 && c <= 6 ? 4 : 0;
      if (x === 'w') v += 100 + (9 - r) * 3 + centre + (r === 9 ? 6 : 0);
      else if (x === 'b') v -= 100 + r * 3 + centre + (r === 0 ? 6 : 0);
      else if (x === 'W') v += 330; else v -= 330;
    }
    return s.w ? v : -v;
  }
  let nodes = 0, deadline = 0, stop = false;
  function search(s, depth, alpha, beta, ply, hist) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) stop = true;
    if (stop) return 0;
    if (s.k >= 50 || hist.includes(key(s))) return 0;
    const ms = moves(s);
    if (!ms.length) return -100000 + ply;
    if (depth <= 0 && (!ms[0].caps.length || ply > 24)) return evaluate(s);  // keep going while captures are forced
    let bestV = -Infinity;
    hist.push(key(s));
    for (const m of ms.sort((a, b) => b.caps.length - a.caps.length)) {
      const v = -search(make(s, m), depth - 1, -beta, -alpha, ply + 1, hist);
      if (v > bestV) bestV = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    hist.pop();
    return bestV;
  }
  const LEVELS = [{d: 1, noise: 70, ms: 4000}, {d: 2, noise: 25, ms: 4000}, {d: 4, noise: 0, ms: 3000}, {d: 40, noise: 0, ms: 1500}, {d: 40, noise: 0, ms: 4000}, {d: 40, noise: 0, ms: 8000}, {d: 40, noise: 0, ms: 15000}];
  function think({s, hist, level}) {
    const lv = LEVELS[level], root = moves(s);
    if (!root.length) return null;
    nodes = 0; stop = false; deadline = Date.now() + lv.ms;
    let best = root[0];
    if (root.length === 1) return best;
    for (let d = 1; d <= lv.d; d++) {
      let alpha = -Infinity, cur = null;
      for (const m of [best, ...root.filter(x => x !== best)]) {
        let v = -search(make(s, m), d - 1, -Infinity, lv.noise ? Infinity : -alpha, 1, hist.slice());
        if (stop) break;
        v += (Math.random() * 2 - 1) * lv.noise;
        if (v > alpha) { alpha = v; cur = m; }
      }
      if (stop) break;
      best = cur;
      if (alpha > 99000) break;
    }
    return best;
  }
  return {start, moves, make, key, think};
}

/* ---------- Dames : l'interface ---------- */
const DM = damesCore();
const damesWorker = new Worker(URL.createObjectURL(new Blob([`const D = (${damesCore})(); onmessage = e => postMessage({id: e.data.id, m: D.think(e.data)});`], {type: 'text/javascript'})));
const dmNum = i => Math.floor(i / 10) * 5 + Math.floor(i % 10 / 2) + 1;  // numéros officiels des cases, 1 à 50
// le damier : 10 cases de 22 pixels dans un cadre de 8, sous une bande de texte
const W = 236, H = 260, SQ = 22, BX = 8, BY = 32, SEG = 140;  // SEG : la durée d'un bond, en millisecondes
const cv = $('dmCv'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
// les cases, avec un grain de bois et un biseau
const DM_SQ = [false, true].map(dark => cnv(SQ, SQ, q => {
  const [base, spot, hi, lo] = dark ? ['#4a2a78', '#55348a', '#5e3e94', '#38205e'] : ['#dccdf2', '#cfbfe8', '#ece2fa', '#c4b2e0'];
  px(q, base, 0, 0, SQ, SQ); let s = dark ? 7 : 3;
  for (let k = 0; k < 9; k++) { s = (s * 37 + 11) % 97; px(q, spot, 2 + s % 18, 2 + (s * 7) % 18, (s % 3) + 1, 1); }
  px(q, hi, 0, 0, SQ, 1); px(q, hi, 0, 0, 1, SQ); px(q, lo, 0, SQ - 1, SQ, 1); px(q, lo, SQ - 1, 0, 1, SQ);
}));
// un pion vu de trois quarts : le dessus (une bague creusée, un reflet), la tranche en dessous ; la dame est un pion double avec une couronne
function dmPiece(P, king) {
  const top = king ? 4.5 : 6.5, side = king ? 6 : 3.5, inT = (x, y, cy) => ((x - 8.5) / 8) ** 2 + ((y - cy) / 6) ** 2 <= 1;
  return cnv(18, 18, q => {
    const fill = (x, y) => inT(x + .5, y + .5, top) || (y + .5 >= top && y + .5 <= top + side && Math.abs(x + .5 - 8.5) <= 8) || inT(x + .5, y + .5, top + side);
    for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) {
      if (!fill(x, y)) { if (fill(x - 1, y) || fill(x + 1, y) || fill(x, y - 1) || fill(x, y + 1)) px(q, P.k, x, y); continue; }
      if (inT(x + .5, y + .5, top)) { const d = Math.hypot((x + .5 - 8.5) / 8, (y + .5 - top) / 6);
        px(q, d > .82 ? P.rim : d > .62 && d < .78 ? P.groove : (x < 7 && y < top - 1) ? P.hi : P.face, x, y); }
      else px(q, (x < 4 ? P.edgeL : x > 13 ? P.edgeD : P.edge), x, y);
    }
    if (king) { for (let x = 1; x < 17; x++) if (fill(x, Math.round(top + side / 2 + 5))) px(q, P.k, x, Math.round(top + side / 2 + 5));  // la ligne entre les deux pions
      const C = ['#ffd84a', '#fff4b0', '#b08a10']; px(q, '#07020f', 4, top - 3, 11, 5); px(q, C[0], 5, top - 1, 9, 2); for (const x of [5, 9, 13]) { px(q, C[0], x, top - 3, 1, 2); px(q, C[1], x, top - 3, 1, 1); } px(q, C[2], 5, top, 9, 1); px(q, '#ff4a5a', 9, top - 1, 1, 1); }
  });
}
const DM_PAL = {w: {k: '#07020f', face: '#f4ecdc', hi: '#ffffff', rim: '#d8c8b0', groove: '#c0ac90', edge: '#b89c7a', edgeL: '#d0b894', edgeD: '#8a6e50'},
  b: {k: '#07020f', face: '#6a1e4a', hi: '#c0588a', rim: '#9a3a6e', groove: '#3a0a28', edge: '#4a1234', edgeL: '#6a2050', edgeD: '#2a0618'}};
const DM_IMG = {w: dmPiece(DM_PAL.w, false), W: dmPiece(DM_PAL.w, true), b: dmPiece(DM_PAL.b, false), B: dmPiece(DM_PAL.b, true)};
// de petits chiffres de 3 × 5 pour les numéros des cases dans le cadre
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
const tiny = (q, n, x, y, col) => { for (const ch of String(n)) { const b = DIG[+ch]; for (let k = 0; k < 15; k++) if (b[k] === '1') px(q, col, x + k % 3, y + Math.floor(k / 3)); x += 4; } };
let dm = null, dmId = 0, dmHover = -1;
// à distance : deux PC, une partie par un code (ctx.room, serveur NeoDex). L'hôte a les blancs (qui commencent) à la première partie, puis les couleurs
// s'échangent à chaque revanche ; chaque coup part à l'autre ({t:'coup', p: cases de passage, n}) et n'est joué que s'il est permis et à son tour
const net = {on: false, code: '', host: false, opp: '', oppId: '', next: 'w', pending: null};
const netOn = () => net.on && !!net.opp;
const netSay = t => { $('dmNetInfo').textContent = t; };
// les combinaisons (« coups de dames ») : un sacrifice qui force chaque réponse adverse et rapporte au moins deux pièces, trouvées par le moteur du jeu
// et vérifiées (aucun autre premier coup ne fait aussi bien) ; [damier, blancs au trait ?, les coups (cases de passage), pièces gagnées], des plus courtes aux plus longues
const DM_PUZ = [["---b-b-b-bb---b----------b---b-------------b-----b------b----w-------w--------w--w-------ww-w-w-B-w-",1,"78.67 56.78 69.87",2],["---W---b-bb-b-----b--b----------------------------------w----b------------w-w----w-w---w--w-w---w---",0,"21.30 3.21 10.32",2],["-b-b-b-W-bb-b---b------b-b------b---B------b-----wb-b-----------------w---w--------w------w-w-------",0,"16.27 7.34 23.45",2],["-b-b-b---bb-b----------b-b-b----b----------------wb-b----------B-w----w------------w------w-w-------",1,"83.72 63.81 90.72",2],["-b-b-b-b-bb-b-b-b-b--------b-b--b-b---b-----------------w----------w-bw-----w-w--w-w-w-w-ww-w-w-w-w-",1,"56.47 38.56 67.45.23.41",2],["-----b---bb-b-----b--b-b-b-b-b--b--------b---b----w----------w-----w--w-w---w-w--w---w-w-ww---w-----",1,"61.52 41.63 72.54.36.14",2],["------------b----------------bb---w------b-w-----wb---w---------------w----------w-------ww---------",0,"50.61 70.52 41.63.45.23",2],["---b--------------b--b-b-b----b---b---w-----------w-B-----------------w--------------w----w---------",1,"38.29 52.96 29.7",2],["-b-b-b-b-bb-b-b------b---b-b--b-b---b-b-----------w---w-w-------------w---w------w-w-w-w-ww-w---w-w-",0,"32.41 50.32 21.43.65.47",2],["-b-----W---------------------------------b-b-b----b--------------w-w-w--w---w-w----w-w---ww-w-------",0,"45.56 7.52.30 56.74.96",2],["-b-b-b-b-bb-b---b-b--b---b-b-bb----------b---b----------b----w-----w-ww-w---w-w--w-w-w---ww-w-w-w-w-",1,"61.52 41.63 72.54.36.14",2],["-------b--b------------------b------b-b-------------w---w-w-------------------w--w---w----w-w-w-----",0,"38.47 56.38 29.47.69.87",2],["-------b--b-------------------w-----b--------------------------B-----------------w--------w-w-w-----",1,"81.72 63.81 90.72",2],["-b-b-b-b-b--b-b-b-b--b-b---b---------------b---b-b-------------w-w----w-----w-w--w-w-w-w-ww-w-w---w-",1,"65.56 47.65 76.54.32.10",2],["-b-b-b---bb-----b-b--b-b-b-b-bb---b---b-----------b-w-w-w-w------w------w-w-w----w-w-----ww-w-w-w-w-",0,"34.43 54.32.14.36 27.45.67.85.63.41",2],["------------b--------b-b---b-w--b-b-----------------w-w-w---------------w---w-w--------w--w-w-------",0,"34.43 52.34 23.45.67.85",2],["---------b--b--------b--------------------------------------------------b-----w--w---b-w--w---------",0,"85.96 81.63 96.52",2],["-b-b-b-b-bb---b----------b---b----b-b-b---------------w--------w-----ww-------w----w-----wB-w-w-----",1,"92.81 90.72 63.81",2],["-b-b-b-b-bb---b----------b---b----b-b-b------B------w----------------ww-------w----w-----w--w-w-----",1,"78.67 45.78 69.87",2],["---------b--------b--b-------------------w---W---b----w-w----------w-ww---w---w------w----w-w-w-w---",0,"18.27 45.18 9.27",2],["-b-b---b-b---------------b---bb------------b-------------------------ww------------------w--w---B-w-",1,"98.87 96.78 69.87",2],["-b-b-b-b-bb---b-b-b----b---b-bb---b-b----------b--w-----b------w-w---ww---w-w-w----w-w-w-ww-w-w---w-",1,"69.58 47.69 65.47.25.43",2],["-----b------------b----b--------b-----W--b---w----w----------w-------w--w-w-w-----------------------",0,"18.27 38.16 5.27",2],["---b-b-b-b--b-b-b-b--b---b---bb-b-b-b-------------b-w----------w-----ww---w---w----w-w-w-ww---w-w-w-",1,"52.41 30.52 63.41.23.45.27",2],["---b---b--------B----b--------b-------b-------------------w----w------w-----------------------------",1,"63.52 16.61 70.52",2],["-b-W-b-b-bb-----b-b----------bb-------b-------------------w------w-w-w--------w----w-w---ww-w---w-w-",0,"1.12 3.21 10.32",2],["-b-b-b-b-bb-b---b-b----b-b---bb---b-b-b-----------w-w---w-w----------w--------w--w-w-w-w-ww-w-w-w-w-",0,"34.43 52.34 23.45.67.49",2],["---------bb-------b--------b------b-b----------b----w-----b------w---ww---w------w-w--------------w-",1,"65.56 47.65 69.47.25.43",2],["-b-b-b-b-bb-b-b-b-b--b---b----b---b-b-b-----------w-w-b--------------ww-w-----w--w-w-w-w-ww-w-w-w-w-",1,"52.41 30.52 72.63",2],["----------b---b--------------b----b-b------b-b---bb---b-w----------w--w---w-w-----------------------",0,"49.58 67.49 45.67.85.63",2],["-b-b-b-b-bb-b-b-b-b--b-------bb-b-w---b--------b---------------w-w---ww-w--------w-w-w-w-ww-w-w-w-w-",0,"47.58 69.47 38.56.74.52",2],["---b--------b---W------b-----bb-----b-------------w---w---w-----------w----------w--------w-w-----w-",0,"30.41 50.32.14 3.25.7",2],["---b--------b-----------------b---b-b------------Ww---w---w-----------w----------w--------w-w-----w-",1,"58.47 36.58 49.67.23.1",2],["---b-b----b-b-b-b------b-b----b--------------W---bb-w-w------------w--------w----w-w-w-w-ww-w-w---w-",0,"23.32 45.1 14.23",2],["---b-b------b-b-b----b-b-b----b--------------W---bb-w-w------------w------w-w----w-w---w-ww-w-w---w-",0,"23.32 45.1 14.23",2],["---b---b-bb-b-b-b-b--b-b---b-bb---b-b------------bw----------w--------w-w-w-w-w----w-w-w--w-w-w-w-w-",1,"50.41 30.52 61.43.25.47",2],["-b-b-b-b-bb-b-b-b-b----b-b-b-b--b---b----------b----w--------w-w---w-ww-----w-w--w-----w-ww-w-w-w-w-",0,"47.56 67.45 36.54.72.50",2],["-b-b-b-b-bb---b---b------b----b------------b-b-w-b-------------w----------w-w-w--w-w-w-w-ww-w-w---w-",1,"47.38 49.27 63.54",2],["-b-b-----bb---b-b----b--------b-b---w------b-----b-----------w---w-w------w------w-w------w-w-w---w-",0,"43.52 61.43 32.54.76.58",2],["------------w---b----------b----------b------w---w-------------w-w---ww-------w----w---w-ww---w---w-",1,"45.36 27.45 49.27.5",3],["---------b------b-w----b-b-b--------b----w-b------w----------w-w-w-w--w--------------w------w-----w-",0,"23.32 41.23 43.54",3],["-b---b--------b-b-b--b-b---------------------b-b----------w----w-w---w--w-----w----w----------------",0,"45.56 58.36 56.74.92",3],["---b-----b----b-b------b-b------b---b-b-------------w-w---w--w-------w------w-w----B------w-----w---",1,"58.49 83.50 49.27.5",3],["-b-b-b----b---b---b--b-b---b--b------------w---w-----------------w-w-ww------------------w--w---w---",0,"23.34 43.25 14.36.58.76.54",3],["---------b--------b----b-b---------------b---b-b--b------------w-w-w-ww-w-w---w--w---w---w----w-----",1,"63.52 41.63 72.54.36.14.32",3],["-b-------bb-b-b--------b---w-bw-b-b--------------wb---w------w-------ww-w---w-w--w-w---w------w-w---",0,"32.41 30.52 34.43",3],["---------bw-----b--------b-----------------------w------b-w-----------w---w-w------------wB---w-----",1,"58.47 56.38 49.27.5",3],["-------b-b------b------b----------b-b-w--b-b------b-b---b------w------w-w-w--------w-w--------------",0,"56.65 74.56 52.74.92",3],["---------b--b-b------b---b-b----b-b---b-----------------w----------w----------w-----------B-w-----w-",1,"56.47 38.56 67.45.23.1",4],["-b-b-b-b-bb---b-b-b--b-----b-bb-b-b-----------------w-w-w------w-----w--w-w-w-w--w---w-w--w-w-w-w-w-",0,"32.43 54.32 21.43.61.83.65.47",4],["-b---b-b-bb---b------b--------b-b-b----------b---bb-w---w-w--w-w---w-ww-w-w---w----w------w---w-w-w-",1,"52.41 30.52 61.43.25.3",4],["-b---b-b--b-b-----b----------bb---b-b------------b---------------w-w----------w------B-w-ww---------",1,"78.69 85.58 69.47.25.43",4],["---------b--b----------b---b-b----b-b------b-b-b----------w------w-w-ww-------w--w-w---w--w---w-----",0,"45.56 67.45 34.56.74.92",4],["---b------------b------b-b-b-bw-b-b-b-b----b------w------------w-w-w-ww-------w----w---w-ww---w---w-",0,"43.54 65.43.21 23.32 21.43 34.52.74.92",2],["-b-b---b--w-----b-b--------b-b--b-----b------w-b-w-------------w-w----w-------w----w---w-ww---w-w-w-",1,"65.56 47.65 45.36 27.45 49.27.5",2],["-b-----b--w---b-b-b--------b-b--b-----b------w-b-w--w------------w----w-------w----w---w-ww---w-w-w-",1,"65.56 47.65 45.36 27.45 49.27.5.23.41",2],["---b-b-b-bb-b-b----------b---b--w-b--------------b-----------w---w---w--------w--w-------ww-w-w-B-w-",0,"34.43 32.54 49.58 69.47 96.69.36.72.50",2],["-b-b---b-b--b-b------b-b-b-b--b---b------b---b---bb-w---w-w--w-w---w--w-w-w-w------w-w-w-ww---w-----",1,"52.43 34.52 56.34.16.38 49.27 61.43",2],["-b-------bb---b-b------b-----bb-b-b-b-b-------------w-----w----w-w--------w-w-w------w---ww-w-w---w-",1,"52.43 32.54.72 74.63 72.54 65.43.25.3",2],["---b-W---b----b--------b-b------b---b-------------B-w-w--------------w------w-w-----------w-----w---",0,"32.41 52.30 23.32 5.23.41 50.32.65.87",2],["-b-b-b-b--------b----b-b-b-b-bb-------b----b-b---w--------w--w---w-w--w-w---w----w---w----w-w-w-w-w-",1,"67.56 45.67 85.74 67.85.63 72.54.32.14.36.18",2],["-----b-b-bb-------b----b------b---b---b----b--------w--------w-w---w----w----------w-w-w-ww-w-w-----",0,"43.54 63.45 34.56.78.96.74 83.65 5.14",2],["-----b---bb----------b-------b-----------b-------b-----------w-b---w-w-----------------w--w---w-w---",1,"67.58 49.67 87.76 67.85 96.74.52.30.12",2],["-b-b-b-b-bb-b----------b-b---bb------------b---w-------------w---w------w---w-w--------w-ww-w-w-w-w-",1,"47.38 29.47 65.56 47.65 76.54.32.14.36",2],["-b-b---b-bb-b---b------b-b---bb------------b---w-------------w---w------w---w-w----w---w-ww-w---w-w-",1,"47.38 29.47 65.56 47.65 76.54.32.14.36",2],["---b---b-bb-----b-b--b-------bb-b-----------------w---b-w-w--w--------w-w-w-w-w------w-w--w---------",0,"54.65 76.54 32.41 50.32 21.43.65.47.69",2],["-b-------W-----------b---b----b-b-b---------------w-w-w--------------w--w-----------------w---w-----",1,"52.41 30.52 54.43 32.54 9.63.30.12.45",2],["-b-------bb-b---b------b------w-b-b--------------wb-w-w---w----w------w-----w-w--w-w----------w-w---",1,"54.45 34.56 58.47 56.38 49.27.5",2],["-----b----b------------b-----b--b---b--------b---bb---b----------w-w--------w----w---w--------------",0,"32.41 65.43 41.52 43.61 50.72.90",2],["-b---b---bb-----b------b-b-b-bb---b-b--------b--------w-b-w--b-w---w-ww---w-w-w--------w-ww-w-w-----",0,"61.72 63.81 45.63.85 67.45 85.67.49",2],["-----b---b-------------b-w------------b----b-b----b--------------w-w--w----------w-w-----w------w---",0,"5.16 25.7 43.52 7.61 50.72.90",2],["-----b---b---------------w------b-----b----b-b----b--------------w-w--w-------w--w-w------------w---",0,"5.16 25.7 43.52 7.61 50.72.90",2],["-b-b-b-b-bb---b-b----b-b------b-b-b-b-b--------b----w-w-b----w--------w---w-w------w-w-w-ww-w-w-w-w-",1,"54.43 32.54 74.65 56.74 85.63.45.27.49",2],["-b-b-b---bb-b-b-b-b--b---b-b-bb-b-b------------w-bw-w-b---w--------w----w-w-w-w--w-w-w-w-ww-w---w-w-",1,"52.41 30.52 74.63 52.74 85.63.45.23.41",2],["-b-b-b----b-----b-b--------b-b------w------------ww-w-b-b------------ww-w---w------w-----w----w---w-",1,"69.58 27.45 58.47 56.38 49.27.9",2],["-b-b-b----b-----b-b--------b-b--b---w------------ww-----b------------ww-w---w------w-----w----w---w-",1,"69.58 27.45 58.47 56.38 49.27.9",2],["-b-b-b----b-----b-b--------b-b------w------------wb-----b------------ww-w---w------w-----w----w---w-",1,"69.58 27.45 58.47 56.38 49.27.9",2],["---------b------w---------------b---w------------------------w-w------w---b----------w---ww-w-------",1,"85.76 74.52 61.43.21 9.18 16.5",3],["---b---b--b-b-b-b-b--b-b-----b------b----w---b-b-b--w--------w---w---ww-------w--w-w-w---ww-----w-w-",0,"45.54 65.43 21.32 43.21 10.32.50.72.94.76",3],["-b---b-b-bb---b-b----------b-b----b-b-b------b-b--b-------w------w-w-ww-w-w-w-w--------w-w--w-w-w-w-",1,"72.61 50.72 74.63 72.54 65.43.25.3",3],["-b-b-b---bb---b-b------b---b-bb-b-b-b----------b----w-w---w--w-----w-ww----------w-w-w---w--w-w-w-w-",1,"54.43 32.54 52.41 30.52 61.43.25.7",3],["-b-b------------b-b--b-b-b-b----------b----------wb---b------b-------w----w---w--w--------------w---",1,"74.65 54.76 78.67 76.58 69.47.29.7",3],["---------b----b--------b---W-bb-b-b--------b------w------------w--------w-w----------w--------w-----",0,"34.45 27.54 43.65.83.61 50.72 9.18",3],["----------------b----b-b-b---bb-b---b--------b----w---w------w-w-w----w-w-w------w----------------w-",1,"65.56 45.67 54.43 32.54 63.45.27.5",3],["-b-b-b-b--b-----b-b------b-b-bb-----b----------b-b--------w----b---w-w--------w--w---w-w----w---w-w-",0,"63.74 85.63 47.56 67.45 36.54.72.90",3],["---b---b--b-b-b-b----b-b---b-b------b----w---b-b-b--w--------w---w---ww---w---w--w-w-----ww-----w-w-",0,"45.54 65.43 21.32 43.21 10.32.50.72.94",4],["-b-b---b-bb-b---b-b--b-b-b-b-b--b--------b---w--------w------w-----w--w-w-w------w-w-w-w-ww-w-w---w-",0,"41.52 61.43 25.34 43.25 16.34.56.78.96",4],["-b-b-----bb-b-b-b-b--b-----b--b-b-b-----------------w-b------------w--w-w-w-w-w--w-w-w----w-w-w-w-w-",1,"52.43 34.52 72.63 54.72 81.63.41.23.5",4],["---------b--------b--b-----b-b------b-b------b-b----w-----w------w-w-w----w---w------w-w-ww---------",0,"45.56 67.45 36.54.76.94 58.36 27.45",4],["-------W------b---------------b-b-----------------b-w----------w----------w-w------w---w--w-------w-",1,"52.41 30.52 63.41.23.5 50.61 7.70",4],["-------b-bb---b------b-b---b-wb-b-b--------b-b-w-b--w--------w-w-w-w--w-w-w-w-w--w-w---w-w----------",1,"65.54 43.65 76.54.36.18 9.27 52.41",5]];
const dmPs = () => gstore('dames', {}).puz ??= {done: {}, ok: 0, ko: 0, streak: 0, best: 0};
const dmLater = (fn, ms) => dmMute ? fn() : setTimeout(fn, ms);
const dmPuzMv = (s, p) => DM.moves(s).find(m => m.path.join('.') === p);
function dmPuzSet(n) {  // la position de la combinaison après ses n premiers coups
  const pz = dm.puz, s0 = {b: [...DM_PUZ[pz.i][0].replace(/-/g, '.')], w: !!DM_PUZ[pz.i][1], k: 0};
  Object.assign(dm, {s: s0, hist: [DM.key(s0)], moves: [], path: [], over: null, anim: null, thinking: false});
  for (const p of pz.sol.slice(0, n)) dmApply(dmPuzMv(dm.s, p), true);
  pz.k = n;
}
function dmPuzStart(i) {
  const ps = dmPs(); if (i == null) { i = DM_PUZ.findIndex((_, k) => !ps.done[k]); if (i < 0) i = Math.floor(Math.random() * DM_PUZ.length); }
  dmId++; dm = {s: null, hist: [], moves: [], level: dm?.level ?? +$('dmLevel').value, human: DM_PUZ[i][1] ? 'w' : 'b', path: [], over: null, anim: null, puz: {i, sol: DM_PUZ[i][2].split(' '), k: 0, fail: false, scored: false}};
  dmPuzSet(0); dmRender();
}
function dmPuzScore(win) {
  const pz = dm.puz, p = dmPs(); if (pz.scored) return; pz.scored = true;
  if (win) { p.ok++; p.streak++; p.best = Math.max(p.best, p.streak); } else { p.ko++; p.streak = 0; }
  saveGames();
}
function dmPuzMove(m) {  // ton coup : celui de la solution (ou la même rafle par un autre chemin), sinon on revient en arrière
  const pz = dm.puz, want = pz.sol[pz.k].split('.').map(Number);
  const good = m.path.join('.') === pz.sol[pz.k] || (m.path[0] === want[0] && m.path.at(-1) === want.at(-1) && m.caps.length > 0);
  const wait = (m.path.length - 1) * SEG + 150;
  if (!good) { pz.fail = true; dmPuzScore(false); toast('Pas ce coup-là : cherche encore', true);
    const k = pz.k, i = pz.i; dmLater(() => { if (dm.puz?.i === i) { dmPuzSet(k); dmRender(); } }, wait + 500); return; }
  pz.k++;
  if (pz.k >= pz.sol.length) { dmPs().done[pz.i] = 1; if (!pz.fail) dmPuzScore(true); dm.over = {result: dm.human, why: 'combinaison réussie : ' + DM_PUZ[pz.i][3] + ' pièces de plus'}; saveGames(); dmLater(() => sfx('launch'), wait); return; }
  const i = pz.i; dmLater(() => { if (dm.puz?.i === i && !dm.over) { const r = dmPuzMv(dm.s, pz.sol[pz.k]); pz.k++; dmApply(r); } }, Math.max(450, wait));
}
function dmReplay(save) {
  dm = {s: DM.start(), hist: [], moves: [], level: save.level, human: save.human, path: [], over: null, anim: null, net: !!save.net};
  dm.hist.push(DM.key(dm.s));
  for (const p of save.moves) { const m = DM.moves(dm.s).find(x => x.path.join() === p.join()); if (!m) break; dmApply(m, true); }
}
function dmStatus() {
  const s = dm.s;
  if (!DM.moves(s).length) return {result: s.w ? 'b' : 'w', why: s.b.some(x => x !== '.' && (x.toLowerCase() === (s.w ? 'w' : 'b'))) ? 'plus aucun coup possible' : 'plus aucune pièce'};
  if (s.k >= 50) return {result: 'd', why: '25 coups de dames sans prise'};
  if (dm.hist.filter(k => k === DM.key(s)).length >= 3) return {result: 'd', why: 'triple répétition'};
  return null;
}
function dmApply(m, quiet) {
  const prev = dm.s.b, pc = prev[m.path[0]];
  dm.moves.push({path: m.path, caps: m.caps, txt: dmNum(m.path[0]) + (m.caps.length ? 'x' : '-') + dmNum(m.path.at(-1))});
  dm.s = DM.make(dm.s, m); dm.hist.push(DM.key(dm.s)); dm.path = [];
  dm.over = dmStatus();
  if (quiet) return;
  // le pion glisse case par case ; les pièces prises disparaissent quand il passe dessus (les sons partent avec, dans dmDraw)
  dm.anim = {path: m.path, caps: m.caps, prev, pc, t0: performance.now(), played: 0, crown: pc !== dm.s.b[m.path.at(-1)]};
  if (dm.net) {  // à distance : mon coup part à l'ami ; rien n'est gardé, les scores à part
    if ((dm.s.w ? 'b' : 'w') === dm.human) ctx.room.send({t: 'coup', p: m.path, n: dm.moves.length - 1}).catch(e => toast(e.message, true));
    if (dm.over) { const r = (gstore('dames', {}).net ??= {w: 0, l: 0, d: 0}), k = dm.over.result === 'd' ? 'd' : dm.over.result === dm.human ? 'w' : 'l'; r[k]++; setTimeout(() => sfx(k === 'w' ? 'launch' : k === 'l' ? 'error' : 'notify'), (m.path.length - 1) * SEG + 100); }
    saveGames(); dmRender(); setTimeout(netTry, 0); return;
  }
  if (dm.puz) { if ((dm.s.w ? 'b' : 'w') === dm.human) dmPuzMove(m); dmRender(); return; }
  const st = gstore('dames', {});
  st.save = dm.over ? null : {level: dm.level, human: dm.human, moves: dm.moves.map(x => x.path)};
  if (dm.over) { const r = (st['lvl' + dm.level] ??= {w: 0, l: 0, d: 0}), k = dm.over.result === 'd' ? 'd' : dm.over.result === dm.human ? 'w' : 'l'; r[k]++; setTimeout(() => sfx(k === 'w' ? 'launch' : k === 'l' ? 'error' : 'notify'), (m.path.length - 1) * SEG + 100); }
  saveGames(); dmRender();
  if (!dm.over && (dm.s.w ? 'w' : 'b') !== dm.human) dmThink(Math.max(300, (m.path.length - 1) * SEG + 150));
}
function dmThink(wait = 300) {
  dm.thinking = true; dmRender();
  const id = ++dmId;
  setTimeout(() => damesWorker.postMessage({id, s: dm.s, hist: dm.hist.slice(0, -1), level: dm.level}), wait);
}
damesWorker.onmessage = e => {
  if (e.data.id !== dmId || !dm || dm.over) return;
  dm.thinking = false;
  const m = e.data.m && DM.moves(dm.s).find(x => x.path.join() === e.data.m.path.join());
  if (m) dmApply(m);
};
function dmNew() {
  if (net.on) { if (netOn()) netAgain(); return; }
  const c = $('dmColor').value, human = c === 'r' ? (Math.random() < .5 ? 'w' : 'b') : c;
  dmId++; dmReplay({level: +$('dmLevel').value, human, moves: []});
  gstore('dames', {}).save = {level: dm.level, human, moves: []}; saveGames();
  dmRender();
  if (human === 'b') dmThink();
}
function dmOpen() {
  if (dm) return dmRender();
  const save = games.dames?.save;
  if (!save) return dmNew();
  dmReplay(save); $('dmLevel').value = save.level; dmRender();
  if (!dm.over && (dm.s.w ? 'w' : 'b') !== dm.human) dmThink();
}
const dmCandidates = () => DM.moves(dm.s).filter(m => dm.path.every((p, k) => m.path[k] === p));
// les prises obligatoires : les pièces qui doivent prendre (must) et celles qu'elles prendront (prey) ; une fois une pièce choisie, seulement les siennes
function dmMarks() {
  const all = DM.moves(dm.s), mine = (dm.s.w ? 'w' : 'b') === dm.human && !dm.over;
  if (!mine || !all[0]?.caps.length) return {must: new Set(), prey: new Set()};
  const cand = dm.path.length ? dmCandidates() : all;
  return {must: new Set(all.map(m => m.path[0])), prey: new Set(cand.flatMap(m => m.caps))};
}
function dmClick(i) {
  if (!dm || dm.over || dm.thinking || dm.anim || (dm.s.w ? 'w' : 'b') !== dm.human || dm.net && !netOn()) return;
  const all = DM.moves(dm.s);
  if (!dm.path.length || all.some(m => m.path[0] === i) && !dmCandidates().some(m => m.path[dm.path.length] === i)) {  // choisir une pièce
    dm.path = all.some(m => m.path[0] === i) ? [i] : [];
    if (dm.path.length) dmToc();
    if (!dm.path.length && dm.s.b[i] !== '.' && all[0]?.caps.length) toast('La prise est obligatoire (et la plus longue) : les pions en orange');
    return dmRender();
  }
  const ends = dmCandidates().filter(m => m.path.at(-1) === i);
  if (ends.length === 1) return dmApply(ends[0]);  // la case d'arrivée suffit quand une seule prise finit là
  if (ends.length > 1 && !dmCandidates().some(m => m.path[dm.path.length] === i)) return toast('Plusieurs prises finissent ici : clique les cases de passage une par une');
  const next = dmCandidates().filter(m => m.path[dm.path.length] === i);
  if (!next.length) { dm.path = []; return dmRender(); }
  dm.path.push(i);
  const done = next.filter(m => m.path.length === dm.path.length);
  if (done.length === 1) return dmApply(done[0]);
  dmRender();
}
const dmXY = i => { const k = dm.human === 'b' ? 99 - i : i; return [BX + (k % 10) * SQ, BY + Math.floor(k / 10) * SQ]; };
const dmState = () => { const o = dm.over, you = dm.human;
  if (o) return o.result === 'd' ? 'Nulle' : o.result === you ? 'Tu as gagné !' : dm.net ? 'Ton ami gagne' : 'L\'ordinateur gagne';
  if (dm.puz && (dm.s.w ? 'w' : 'b') !== you) return 'L\'adversaire est forcé';
  if (dm.net && !net.opp) return 'En attente de ton ami';
  if (dm.net && (dm.s.w ? 'w' : 'b') !== you) return 'Ton ami joue';
  if ((dm.s.w ? 'w' : 'b') !== you) return 'L\'ordinateur réfléchit';
  if (dm.puz && !(DM.moves(dm.s)[0]?.caps.length)) return 'Trouve le coup de dames';
  const c = DM.moves(dm.s)[0]?.caps.length || 0; return c ? 'Prise obligatoire : ' + c + (c > 1 ? ' pièces' : ' pièce') : 'À toi de jouer'; };
function dmDraw() {
  if (!dm) return;
  const now = performance.now(), s = dm.s, flip = dm.human === 'b', pulse = (Math.sin(now / 160) + 1) / 2;
  px(g, '#0a0418', 0, 0, W, H);
  // l'animation en cours : quel bond, quelles pièces déjà prises, et les sons au bon moment
  let A = dm.anim, seg = 0, t = 0;
  if (A) { const k = (now - A.t0) / SEG; seg = Math.floor(k); t = k - seg;
    while (A.played < Math.min(seg, A.path.length - 1)) { if (A.caps.length) dmClac(A.played); else dmToc(); A.played++; }
    if (seg >= A.path.length - 1) { if (A.crown) dmCrown(); dm.anim = A = null; } }
  // la bande du haut : à qui le tour, en gros
  const st = dmState(), mine = (s.w ? 'w' : 'b') === dm.human && !dm.over, forced = mine && DM.moves(s)[0]?.caps.length;
  g.drawImage(DM_IMG[s.w ? 'w' : 'b'], 4, 3);
  const dots = dm.thinking ? '.'.repeat(1 + Math.floor(now / 300) % 3) : '';
  pxFont(g, st + dots, 26, 17, dm.over ? '#ffd84a' : forced ? (pulse > .5 ? '#ffa030' : '#ffd0a0') : mine ? '#7ee07a' : '#b8a8d8', 8);
  // le cadre, les numéros des cases au bord
  px(g, '#07020f', 0, 24, W, 236); px(g, '#2a1640', 1, 25, W - 2, 234); px(g, '#4a2a78', 1, 25, W - 2, 1); px(g, '#4a2a78', 1, 25, 1, 234);
  for (const [x, y] of [[1, 25], [W - 4, 25], [1, H - 4], [W - 4, H - 4]]) px(g, '#ff6ad5', x, y, 3, 3);
  for (let R = 0; R < 10; R++) {
    const row = flip ? 9 - R : R, first = row * 5 + 1, last = row * 5 + 5, y = BY + R * SQ + 9;
    const l = flip ? last : first, r = flip ? first : last;
    tiny(g, l, l > 9 ? 0 : 2, y, '#8a74b8'); tiny(g, r, r > 9 ? W - 8 : W - 6, y, '#8a74b8');
  }
  // les cases et leurs marques
  const marks = A ? {must: new Set(), prey: new Set()} : dmMarks(), cand = dm.path.length ? dmCandidates() : [], last = A ? null : dm.moves.at(-1);
  const steps = new Set(cand.map(m => m.path[dm.path.length]).filter(x => x != null)), ends = new Set(cand.map(m => m.path.at(-1)));
  const movable = new Set(mine && !A && !forced && !dm.path.length ? DM.moves(s).map(m => m.path[0]) : []);
  const board = A ? A.prev.map((x, i) => i === A.path[0] || A.caps.slice(0, seg).includes(i) ? '.' : x) : s.b;
  for (let i = 0; i < 100; i++) {
    const [x, y] = dmXY(i), dark = (Math.floor(i / 10) + i % 10) % 2 === 1;
    g.drawImage(DM_SQ[+dark], x, y);
    if (!dark) continue;
    if (last?.path.includes(i)) { g.globalAlpha = .3; px(g, '#ffd07a', x, y, SQ, SQ); g.globalAlpha = 1; }
    if (board[i] !== '.') { g.drawImage(DM_IMG[board[i]], x + 2, y + 2); }
    else if (last?.caps.includes(i)) { g.globalAlpha = .6; for (let k = 0; k < 7; k++) { px(g, '#ff4a6d', x + 7 + k, y + 7 + k, 2, 1); px(g, '#ff4a6d', x + 14 - k, y + 7 + k, 2, 1); } g.globalAlpha = 1; }
    const box = (col, w) => { px(g, col, x, y, SQ, w); px(g, col, x, y + SQ - w, SQ, w); px(g, col, x, y, w, SQ); px(g, col, x + SQ - w, y, w, SQ); };
    if (movable.has(i)) for (const [cx, cy] of [[0, 0], [SQ - 4, 0], [0, SQ - 4], [SQ - 4, SQ - 4]]) { px(g, '#ffd07a', x + cx, y + cy + (cy ? 3 : 0), 4, 1); px(g, '#ffd07a', x + cx + (cx ? 3 : 0), y + cy, 1, 4); }
    if (marks.must.has(i) && !dm.path.includes(i)) box(pulse > .5 ? '#ffa030' : '#ffd0a0', 2);
    if (marks.prey.has(i)) { box(pulse > .5 ? '#ff4a5a' : '#a01a2a', 2); px(g, '#ff4a5a', x + SQ - 7, y + 1, 6, 6); px(g, '#ffffff', x + SQ - 5, y + 2, 2, 4); }  // un petit « ! » rouge
    if (dm.path.includes(i)) box('#ff6ad5', 2);
    if (steps.has(i) || ends.has(i)) { const c = cand.some(m => m.caps.length) ? '#ffa030' : '#07020f'; px(g, '#07020f', x + 7, y + 7, 8, 8); px(g, c === '#07020f' ? '#ffd0f2' : c, x + 8, y + 8, 6, 6); }
    if (i === dmHover && mine && !A) box('rgba(255,255,255,.7)', 1);
  }
  // la pièce qui bondit, au-dessus de tout
  if (A) { const [x0, y0] = dmXY(A.path[seg]), [x1, y1] = dmXY(A.path[seg + 1]), hop = A.caps.length ? Math.sin(Math.PI * t) * 7 : Math.sin(Math.PI * t) * 2;
    g.globalAlpha = .35; px(g, '#07020f', x0 + (x1 - x0) * t + 4, y0 + (y1 - y0) * t + 17, 14, 3); g.globalAlpha = 1;
    g.drawImage(DM_IMG[A.pc], Math.round(x0 + (x1 - x0) * t + 2), Math.round(y0 + (y1 - y0) * t + 2 - hop)); }
  // la fin de partie
  if (dm.over && !A) { const o = dm.over, win = o.result === dm.human;
    gameText(g, W, [[o.result === 'd' ? 'NULLE' : win ? 'GAGNÉ !' : 'PERDU', o.result === 'd' ? '#c8e8ff' : win ? '#7ee07a' : '#ff4a5a', 16], [o.why, '#ffffff'], [dm.net ? (net.host ? 'Nouvelle partie : la revanche' : 'Nouvelle partie : demander une revanche') : 'Nouvelle partie à droite', '#b8a8d8']], 120); }
  if (Math.floor(now / 500) !== dmDraw.lab) { dmDraw.lab = Math.floor(now / 500); cv.setAttribute('aria-label', 'Dames : ' + st + (dm.over ? ', ' + dm.over.why : '')); }
}
function dmRender() {
  const s = dm.s, you = dm.human, ai = you === 'w' ? 'b' : 'w', count = x => s.b.filter(v => v === x).length;
  const row = (a, b) => [el('span', '', a), el('b', '', b)];
  $('dmCount').replaceChildren(...row('Toi (' + (you === 'w' ? 'blancs' : 'noirs') + ')', count(you) + ' pions, ' + count(you.toUpperCase()) + ' dames'), ...row('Ordinateur', count(ai) + ' pions, ' + count(ai.toUpperCase()) + ' dames'));
  const ml = $('dmMoves'); ml.replaceChildren();
  for (let i = 0; i < dm.moves.length; i += 2) { const r = el('div', 'chMv'); r.append(el('span', 'n', (i / 2 + 1) + '.'), el('span', '', dm.moves[i].txt), el('span', '', dm.moves[i + 1]?.txt || '')); ml.append(r); }
  ml.scrollTop = ml.scrollHeight;
  const ps = dmPs(), nd = Object.keys(ps.done).length;
  $('dmPuzInfo').textContent = nd + (nd > 1 ? ' résolues' : ' résolue') + ' sur ' + DM_PUZ.length + ' · série ' + ps.streak + ' (record ' + ps.best + '). On sacrifie un pion pour forcer l’adversaire à prendre, puis on rafle.';
  $('dmPuzHint').disabled = !dm.puz || !!dm.over;
  $('dmMode').value = net.on ? 'net' : 'ia'; $('dmNet').style.display = net.on ? '' : 'none';
  if (dm.net) { const r = games.dames?.net || {w: 0, l: 0, d: 0}; $('dmInfo').textContent = 'À distance · ' + (dm.human === 'w' ? 'tu as les blancs' : 'tu as les noirs') + ' · ' + r.w + ' victoires, ' + r.d + ' nulles, ' + r.l + ' défaites'; $('dmUndo').disabled = true; return; }
  if (dm.puz) { const P = DM_PUZ[dm.puz.i], n = (P[2].split(' ').length + 1) / 2; $('dmInfo').textContent = 'Combinaison ' + (dm.puz.i + 1) + ' / ' + DM_PUZ.length + ' · en ' + n + ' coups · ' + (dm.human === 'w' ? 'les blancs' : 'les noirs') + ' jouent'; $('dmUndo').disabled = true; return; }
  const st = games.dames?.['lvl' + dm.level] || {w: 0, l: 0, d: 0};
  $('dmInfo').textContent = 'Niveau ' + $('dmLevel').options[dm.level].text + ' · ' + st.w + ' victoires, ' + st.d + ' nulles, ' + st.l + ' défaites';
  $('dmUndo').disabled = dm.moves.length < (dm.human === 'w' ? 1 : 2) || dm.thinking;
}
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
const dmAt = e => { const [x, y] = cpos(e), C = Math.floor((x - BX) / SQ), R = Math.floor((y - BY) / SQ); if (C < 0 || C > 9 || R < 0 || R > 9) return -1; const k = R * 10 + C; return dm?.human === 'b' ? 99 - k : k; };
cv.onclick = e => { const i = dmAt(e); if (i >= 0) dmClick(i); };
cv.onpointermove = e => { dmHover = dmAt(e); };
cv.onpointerleave = () => { dmHover = -1; };
$('dmNew').onclick = () => { $('dmNew').blur(); dmNew(); };
$('dmPuz').onclick = () => { $('dmPuz').blur(); if (net.on) { netLeave(); net.on = false; } dmPuzStart(); };
const netLeave = () => { if (net.code) try { ctx.room.leave().catch(() => {}); } catch {} Object.assign(net, {code: '', host: false, opp: '', oppId: '', next: 'w', pending: null}); };
function netTry() { const m = net.pending; if (!m || !dm?.net || dm.over || dm.anim || (dm.s.w ? 'w' : 'b') === dm.human) return; net.pending = null; if (m.n !== dm.moves.length) return; const mv = DM.moves(dm.s).find(x => x.path.join() === m.p.join()); if (mv) dmApply(mv); }
function netStart(me) { dmId++; net.pending = null; dmReplay({level: 0, human: me, moves: [], net: true}); dmRender(); netSay('Contre ' + net.opp + ' · ' + (me === 'w' ? 'tu as les blancs, tu commences' : 'tu as les noirs') + ' · code ' + net.code); }
function netWait() { dmId++; dmReplay({level: 0, human: 'w', moves: [], net: true}); dmRender(); }
function netAgain() { if (!netOn()) return; if (net.host) { const me = net.next; net.next = me === 'w' ? 'b' : 'w'; ctx.room.send({t: 'start', you: me === 'w' ? 'b' : 'w'}).catch(() => {}); netStart(me); } else ctx.room.send({t: 'rejouer'}).catch(() => {}); }
setInterval(() => { if (net.pending) netTry(); }, 200);  // le coup de l'ami arrivé pendant que mon pion glissait encore
ctx.room?.on(ev => {
  if (!net.on || !net.code) return;
  if (ev.t === 'arrive') {
    if (!net.host) return;
    if (net.opp) return void ctx.room.send({t: 'pleine'}, ev.id).catch(() => {});
    net.opp = ev.name || 'ton ami'; net.oppId = ev.id; sfx?.('notify'); netAgain();
  } else if (ev.t === 'part' && ev.id === net.oppId || ev.t === 'fin') {
    netSay(ev.t === 'fin' ? 'Connexion perdue avec le serveur de parties.' : 'Ton ami a quitté la partie.' + (net.host ? ' Le code reste valable : il peut revenir.' : ''));
    net.opp = ''; net.oppId = ''; if (ev.t === 'fin') net.code = ''; netWait();
  } else if (ev.t === 'msg' && ev.from === net.oppId) {
    const m = ev.data || {};
    if (m.t === 'start' && !net.host) netStart(m.you === 'b' ? 'b' : 'w');
    else if (m.t === 'rejouer' && net.host && dm.over) netAgain();
    else if (m.t === 'pleine') { netSay('Cette partie a déjà deux joueurs.'); netLeave(); }
    else if (m.t === 'coup' && Array.isArray(m.p) && m.p.length >= 2 && m.p.length <= 30 && m.p.every(Number.isInteger) && Number.isInteger(m.n)) { net.pending = m; netTry(); }
  }
});
$('dmMode').onchange = () => { $('dmMode').blur(); netLeave(); net.on = $('dmMode').value === 'net';
  if (net.on) { netWait(); netSay('Crée une partie et donne son code à ton ami, ou tape le sien.'); } else { dm = null; dmOpen(); } };
$('dmHost').onclick = async () => { $('dmHost').blur();
  try { netLeave(); const r = await ctx.room.create('hôte'); Object.assign(net, {code: r.code, host: true}); netWait(); netSay('Code de la partie : ' + r.code + ' · donne-le à ton ami. En attente…'); }
  catch (e) { netSay('Impossible de créer la partie : ' + e.message); } };
$('dmJoin').onclick = async () => { $('dmJoin').blur();
  try { netLeave(); const r = await ctx.room.join($('dmCode').value, 'invité'), host = r.joueurs.find(j => j.host);
    if (!host || r.joueurs.length > 1) { await ctx.room.leave(); return netSay(host ? 'Cette partie a déjà deux joueurs.' : 'Aucune partie avec ce code.'); }
    Object.assign(net, {code: r.code, host: false, opp: host.name || 'ton ami', oppId: host.id}); netSay('Connecté · la partie commence…'); }
  catch (e) { netSay('Impossible de rejoindre : ' + e.message); } };
$('dmCode').onkeydown = e => { if (e.key === 'Enter') $('dmJoin').click(); };
$('dmPuzHint').onclick = () => { $('dmPuzHint').blur(); const pz = dm.puz; if (!pz || dm.over || dm.anim || (dm.s.w ? 'w' : 'b') !== dm.human) return; pz.fail = true; dmPuzScore(false); dm.path = [+pz.sol[pz.k].split('.')[0]]; dmToc(); dmRender(); };  // l’indice choisit le pion à jouer, mais la combinaison compte comme ratée
$('dmColor').onchange = dmNew;
$('dmLevel').onchange = () => { if (!dm || dm.moves.length < 2 || dm.over) return dmNew(); dm.level = +$('dmLevel').value; games.dames.save.level = dm.level; saveGames(); dmRender(); };
$('dmUndo').onclick = () => {
  if (dm.thinking) return;
  const keep = dm.moves.slice(0, -((dm.s.w ? 'w' : 'b') === dm.human ? 2 : 1)).map(x => x.path);
  dmId++; dmReplay({level: dm.level, human: dm.human, moves: keep}); games.dames.save = {level: dm.level, human: dm.human, moves: keep}; saveGames(); dmRender();
};
// vérification : les règles (9 coups au départ, la rafle la plus longue obligatoire), les marques de prise, le dessin
function dmCheck() {
  const keep = dm, bad = []; dmMute = true;
  try {
    if (DM.moves(DM.start()).length !== 9) bad.push('9 coups au départ');
    const b = Array(100).fill('.'); b[65] = 'w'; b[69] = 'w'; b[54] = 'b'; b[34] = 'b'; b[58] = 'b'; b[3] = 'b';
    dm = {s: {b, w: true, k: 0}, hist: [], moves: [], level: 0, human: 'w', path: [], over: null, anim: null};
    const ms = DM.moves(dm.s);
    if (!(ms.length === 1 && ms[0].path.join() === '65,43,25' && ms[0].caps.join() === '54,34')) bad.push('rafle la plus longue : ' + JSON.stringify(ms));
    const mk = dmMarks(); if ([...mk.must].join() !== '65' || [...mk.prey].sort().join() !== '34,54') bad.push('marques ' + [...mk.must] + ' / ' + [...mk.prey]);
    dm.path = [65]; if ([...dmMarks().prey].length !== 2) bad.push('marques après le choix');
    dm.path = []; dmDraw();
    const m = DM.make(dm.s, ms[0]); if (m.b[54] !== '.' || m.b[34] !== '.' || m.b[25] !== 'w' || m.b[65] !== '.') bad.push('la rafle jouée');
    DM_PUZ.forEach(([b, w, sol], i) => { let st = {b: [...b.replace(/-/g, '.')], w: !!w, k: 0}; sol.split(' ').forEach((p, k) => { const m = dmPuzMv(st, p); if (!m || (k % 2 && DM.moves(st).length !== 1) || (!k && m.caps.length)) bad.push('combinaison ' + (i + 1) + ' coup ' + k); else st = DM.make(st, m); }); });
    if (DM_PUZ.length < 60) bad.push('liste des combinaisons');
    const kp = JSON.stringify(games.dames?.puz ?? null), ks = JSON.stringify(games.dames?.save ?? null);
    const pi = DM_PUZ.findIndex(x => x[2].split(' ').length >= 5); dmPuzStart(pi); const pz = dm.puz;
    const wrong = DM.moves(dm.s).find(m => m.path.join('.') !== pz.sol[0]); dmApply(wrong); if (pz.k !== 0 || dm.moves.length || !pz.fail) bad.push('combinaison : faux coup');
    while (!dm.over && pz.k < pz.sol.length) dmApply(dmPuzMv(dm.s, pz.sol[pz.k]));
    if (!/^combinaison réussie/.test(dm.over?.why || '')) bad.push('combinaison : fin ' + pz.k + '/' + pz.sol.length + ' ' + JSON.stringify(dm.over));
    if (JSON.stringify(games.dames?.save ?? null) !== ks) bad.push('combinaison : partie gardée touchée');
    if (games.dames) { if (kp === 'null') delete games.dames.puz; else games.dames.puz = JSON.parse(kp); }
    const p = Array(100).fill('.'); p[12] = 'w'; const k = DM.make({b: p, w: true, k: 0}, DM.moves({b: p, w: true, k: 0})[0]); if (!k.b.includes('W')) bad.push('dame au dernier rang');
  } catch (e) { bad.push('erreur ' + e.message); }
  dm = keep; dmMute = false;
  return bad.length ? bad.join(', ') : 'ok';
}
{ const c = dmCheck(); console.assert(c === 'ok', 'dames', c); }
cv.__dm = {st: () => dm, check: dmCheck, net: () => net, puz: i => dmPuzStart(i), P: DM_PUZ, moves: () => DM.moves(dm.s), xy: dmXY, SQ, W, H, marks: dmMarks,
  setPos: (b, w) => { dmId++; dm.s = {b, w, k: 0}; dm.hist = [DM.key(dm.s)]; dm.path = []; dm.over = null; dm.anim = null; dm.thinking = false; dmRender(); }};
const loop = () => { if (!view.classList.contains('on')) { loop.raf = 0; return; } loop.raf = requestAnimationFrame(loop); dmDraw(); };
  ctx.onOpen(() => { dmOpen(); if (!loop.raf) loop.raf = requestAnimationFrame(loop); });
}
