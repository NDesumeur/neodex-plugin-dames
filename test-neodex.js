// lancé par le test « local » de NeoDex : la vérification interne (règles, rafle la plus longue, marques de prise), un coup joué à la souris
// et la réponse de l'ordinateur, une prise obligatoire en surbrillance puis jouée, annuler, la fin de partie et la place prise (avec NEO_SHOTS : des images du jeu)
module.exports = async ({ pj, js, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('dmCv').__dm, dm = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('dmCv').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'dames-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  // un clic au milieu d'une case du damier, en coordonnées de l'écran
  const click = i => pj(`(() => { const T = document.getElementById('dmCv').__dm, c = document.getElementById('dmCv'), r = c.getBoundingClientRect(), [x, y] = T.xy(${i});
    c.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: r.left + (x + T.SQ / 2) / T.W * r.width, clientY: r.top + (y + T.SQ / 2) / T.H * r.height})); return 0; })()`);
  const pick = (id, v) => pj(`(() => { const s = document.getElementById('${id}'); s.value = '${v}'; s.dispatchEvent(new Event('change')); return 0; })()`);
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  const keep = await C('return JSON.stringify(dm.level) + "|" + document.getElementById("dmColor").value;');
  await pick('dmLevel', '0'); await pick('dmColor', 'w'); await sleep(150); await shot('0-depart');
  // un coup à la souris : la pièce puis sa case d'arrivée ; l'ordinateur répond
  const mv = await C('return T.moves()[4].path;');
  await click(mv[0]); await sleep(100);
  if (await C('return dm.path.join();') !== String(mv[0])) throw new Error('le clic ne choisit pas la pièce');
  await shot('1-choix'); await click(mv[1]); await sleep(70); await shot('2-glisse');
  for (let i = 0; i < 40 && await C('return dm.moves.length < 2 || !!dm.anim;'); i++) await sleep(150);
  if (await C('return dm.moves.length;') !== 2) throw new Error('l\'ordinateur n\'a pas répondu');
  // une prise obligatoire : les pions qui doivent prendre et leurs proies sont marqués, puis la rafle se joue en cliquant l'arrivée
  await C(`const b = Array(100).fill('.'); b[65] = 'w'; b[69] = 'w'; b[81] = 'w'; b[54] = 'b'; b[34] = 'b'; b[58] = 'b'; b[3] = 'b'; b[7] = 'b'; T.setPos(b, true); return 0;`);
  await sleep(200); await shot('3-prise-obligatoire');
  const mk = await C('const m = T.marks(); return [...m.must].join() + "|" + [...m.prey].sort().join();'); if (mk !== '65|34,54') throw new Error('marques de prise : ' + mk);
  await click(81); await sleep(100); if (await C('return dm.path.length;') !== 0) throw new Error('un pion qui ne peut pas prendre ne doit pas être choisi');
  await click(65); await sleep(100); await click(25); await sleep(150); await shot('4-rafle');
  await sleep(500);
  const af = await C('return dm.s.b[25] + dm.s.b[54] + dm.s.b[34] + "|" + dm.moves.at(-1).txt;'); if (!/^w\.\.\|/.test(af)) throw new Error('la rafle : ' + af);
  // annuler revient avant la rafle (l'ordinateur répond peut-être déjà : on attend qu'il ait fini)
  for (let i = 0; i < 40 && await C('return dm.thinking || !!dm.anim;'); i++) await sleep(150);
  // la fin de partie : il reste un pion noir à prendre
  await C(`const b = Array(100).fill('.'); b[65] = 'w'; b[54] = 'b'; T.setPos(b, true); return 0;`);
  await click(65); await sleep(80); await click(43); await sleep(700);
  if (await C('return dm.over && dm.over.result;') !== 'w') throw new Error('la partie devait être gagnée');
  await shot('5-gagne');
  await pj(`document.getElementById('dmNew').click(), 0`); await sleep(150);
  await click(await C('return T.moves()[0].path[0];')); await sleep(80); await click(await C('return T.moves()[0].path[1];')); await sleep(400);
  for (let i = 0; i < 40 && await C('return dm.thinking || !!dm.anim;'); i++) await sleep(150);
  await pj(`document.getElementById('dmUndo').click(), 0`); await sleep(150);
  if (await C('return dm.moves.length;') !== 0) throw new Error('annuler devait revenir au début');
  // une combinaison en trois coups : un faux coup est refusé, puis la solution jouée au clic, l'adversaire forcé répond tout seul
  await C('T.puz(T.P.findIndex(x => x[2].split(" ").length >= 5)); return 0;'); await sleep(200); await shot('6-combinaison');
  const wrongMv = await C('return T.moves().find(m => m.path.join(".") !== dm.puz.sol[0]).path;');
  await click(wrongMv[0]); await sleep(80); await click(wrongMv[1]); await sleep(1200);
  if (await C('return dm.puz.k + "|" + dm.moves.length + "|" + dm.puz.fail;') !== '0|0|true') throw new Error('combinaison : faux coup ' + await C('return dm.puz.k + "|" + dm.moves.length;'));
  await C('dm.puz.fail = false; dm.puz.scored = false; return 0;');
  for (let n = 0; n < 4 && !(await C('return !!dm.over;')); n++) {
    for (let i = 0; i < 40 && await C('return !!dm.anim || (dm.s.w ? "w" : "b") !== dm.human;'); i++) await sleep(150);
    if (await C('return !!dm.over;')) break;
    const p = await C('return dm.puz.sol[dm.puz.k].split(".").map(Number);');
    for (const q of p) { await click(q); await sleep(80); }
    await sleep(300);
  }
  for (let i = 0; i < 30 && await C('return !!dm.anim;'); i++) await sleep(150);
  const cb = await C('return (dm.over && dm.over.why) + "|" + dm.puz.fail;'); if (!/^combinaison réussie.*\|false$/.test(cb)) throw new Error('combinaison : ' + cb);
  await shot('7-combinaison-reussie');
  if (!/^1 résolue/.test(await pj(`document.getElementById('dmPuzInfo').textContent`))) throw new Error('combinaison : compte ' + await pj(`document.getElementById('dmPuzInfo').textContent`));
  await pj(`document.getElementById('dmNew').click(), 0`); await sleep(200);
  const [lv, col] = keep.split('|'); await pick('dmLevel', lv); await pick('dmColor', col);
  // à distance : un faux serveur de parties dans la page de NeoDex ; l'hôte a les blancs, son coup part, celui de l'ami est joué à son tour
  await js(`(() => { window.__RealWS ??= WebSocket; window.WebSocket = class { constructor(u) { this.url = u; this.sent = []; this.readyState = 1; window.__fakeWs = this;
    setTimeout(() => this.onmessage?.({data: JSON.stringify({t: 'bienvenue', id: 'moi', host: true, joueurs: []})}), 50); }
    send(d) { this.sent.push(d); } close() { this.readyState = 3; } }; return 0; })()`);
  const sent = () => js(`__fakeWs.sent.map(s => JSON.parse(s).data)`), from = d => js(`__fakeWs.onmessage({data: JSON.stringify({t: 'msg', from: 'ami', data: ${JSON.stringify(d)}})}), 0`);
  await pick('dmMode', 'net'); await pj(`document.getElementById('dmHost').click(), 0`); await sleep(600);
  if (!/^[A-Z0-9]{6}$/.test(await C('return T.net().code;'))) throw new Error('création de partie : ' + await pj(`document.getElementById('dmNetInfo').textContent`));
  const early = await C('return T.moves()[0].path;'); await click(early[0]); await click(early[1]); await sleep(200);
  if (await C('return dm.moves.length;') !== 0) throw new Error('un coup joué avant l’arrivée de l’ami');
  await js(`__fakeWs.onmessage({data: JSON.stringify({t: 'arrive', id: 'ami', name: 'invité'})}), 0`); await sleep(600);
  if (!(await sent()).some(m => m?.t === 'start' && m.you === 'b')) throw new Error('annonce du début : ' + JSON.stringify(await sent()));
  const w1 = await C('return T.moves()[2].path;'); await click(w1[0]); await sleep(80); await click(w1[1]); await sleep(500);
  const nmv = (await sent()).filter(m => m?.t === 'coup'); if (nmv.length !== 1 || nmv[0].n !== 0 || nmv[0].p.join() !== w1.join()) throw new Error('mon coup envoyé : ' + JSON.stringify(nmv));
  const b1 = await C('return T.moves()[0].path;'); await from({t: 'coup', p: [1, 2], n: 7}); await sleep(200);
  if (await C('return dm.moves.length;') !== 1) throw new Error('un faux coup de l’ami accepté');
  await from({t: 'coup', p: b1, n: 1}); await sleep(600);
  if (await C('return dm.moves.length + "|" + (dm.s.w ? "w" : "b");') !== '2|w') throw new Error("coup de l'ami : " + await C('return dm.moves.length;'));
  await shot('8-a-distance');
  await js(`__fakeWs.onmessage({data: JSON.stringify({t: 'part', id: 'ami'})}), 0`); await sleep(200);
  if (!/a quitté/.test(await pj(`document.getElementById('dmNetInfo').textContent`))) throw new Error("départ de l'ami");
  await pick('dmMode', 'ia'); await js(`window.WebSocket = window.__RealWS, 0`); await sleep(200);
  if (await C('return !!dm.net + "|" + T.net().on;') !== 'false|false') throw new Error('retour contre l’ordinateur');
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // la zone de jeu tient dans la fenêtre
  const L = await pj(`(() => { const r = document.getElementById('dmCv').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('dmCv').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 320) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'vérification ok · coup à la souris et réponse · prise obligatoire marquée · rafle · gagné · annuler · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
