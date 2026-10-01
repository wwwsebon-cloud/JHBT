window.__simSetup = function () {
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  physSyncDom = () => {};
  updateUnitBars = () => {};
  drawMinimap = () => {};
  spawnDamageNumber = () => {};
  v41HudTick = () => {};
  v41Kill = () => {};
  v41Callout = () => {};
  beginFinalMoment = w => { state.phase = 'roundEnd'; window.__res = { w, t: state.combatTime }; };
  endRoundCombat = (w, timed) => { state.phase = 'roundEnd'; window.__res = { w, t: state.combatTime, timed: !!timed }; };
  window.__ids = playableIds();
};
window.__fight = function (allyIds, enemyIds) {
  cancelRuntimeTasks();
  window.__res = null;
  Object.assign(state, { mode: 'ranked', round: 1, placements: [], matchStats: [], reaperGrudges: {}, castles: null, allyLives: 3, enemyLives: 3, maxUnits: 10, maxUnitsBonus: { ally: 0, enemy: 0 }, botSkill: 1, poolSize: 3, deployRounds: 0, pendingPick: false });
  state.myDeckIds = allyIds.slice(); state.enemyDeckIds = enemyIds.slice();
  state.allyBench = []; state.enemyBench = [];
  state.units = []; clearArenaUnits();
  state.oddsSamples = []; state.lastDeathPoint = null; state.smokeZones = []; (state.dustZones || []).forEach(z => z.el && z.el.remove()); state.dustZones = []; state.fireTrails = []; state.pendingExplosions = []; state.pendingMeteors = [];
  state.deadThisRound = { ally: [], enemy: [] };
  resetNew38State();
  applyMapLayout();
  state.phase = 'deploy';
  const spawned = { ally: [], enemy: [] };
  for (const [side, ids] of [['ally', allyIds], ['enemy', enemyIds]]) {
    for (const id of ids) {
      const tile = v42PickTile(side, id, v42RoleRow(id));
      const u = tile == null ? null : v42Spawn(side, tile, id);
      if (u) spawned[side].push(u.charId);
    }
  }
  beginCombatPhase();
  let ts = state.combatStartTs, guard = 0;
  while (state.phase === 'combat' && guard++ < 4000) { ts += 100; combatTick(ts); }
  const res = window.__res || { w: 'draw', t: state.combatTime, stuck: true };
  const alive = s => state.units.filter(u => u.side === s && u.alive && !u.isCastle && !u.skipCount).length;
  res.aliveA = alive('ally'); res.aliveE = alive('enemy');
  res.spawnA = spawned.ally.length; res.spawnE = spawned.enemy.length;
  res.rows = state.units.filter(u => !u.isCastle && !u.ownerUid && !u.isClone && !u.skipCount).map(u => ({ id: u.charId, side: u.side, dealt: Math.round(u.dmgDealt || 0), taken: Math.round(u.dmgTaken || 0), kills: u._kills || 0, alive: !!u.alive }));
  cancelRuntimeTasks();
  return res;
};
