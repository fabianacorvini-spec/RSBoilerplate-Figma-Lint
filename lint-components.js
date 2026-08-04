// ============================================================================
// Component lint v2.4 — base property lint + FOREIGN-BINDING ADOPTION LINT
// Run via the MCP Bridge plugin (Cloud Mode) — ask Claude to fetch this raw
// file and run it. Report mode is read-only; fix mode rebinds only value-
// identical foreign bindings.
//
// File: NEW [Client Name] / [Platform] UI + DS (2026)  key Vk0disHgUAm5Z7iNQiA4V6
//
// v2.4 change vs v2.3: the colour / radius exceptions documented since v2 are
//   now ENFORCED IN CODE, not discounted by hand. Checks 1–5 previously had no
//   allowlist mechanism, so every run re-reported known-good material. New:
//   PRIM_COLOR_EXCEPTIONS (component + variable keyed). DEVICE_RE now applies
//   to checks 2–5, not only check 6. Exception hits are counted and returned
//   under exceptionsApplied so suppression stays visible. Added a baseVerdict
//   line so base findings gate as explicitly as spacing does.
//
//   THREE AMENDMENTS to the drafted v2.4 patch, made 2026-08-03 with evidence:
//
//   (a) ARTWORK_EXCEPTIONS was DROPPED, not implemented. The draft assumed
//       Input__dropdown reports 44 raw paints from its flag illustration. It
//       reports zero. There are 396 raw paints under Input__dropdown and every
//       one sits inside a `.🔒master / Flag / …` INSTANCE, so the base loop's
//       `if (insideInstance(n)) continue;` drops them before check 2 runs.
//       There are also ZERO local Flag masters in the file — the flags are
//       remote instances, already sanctioned by check 9. An ancestry-keyed
//       artwork allowlist therefore has no reachable input, and its counter
//       would be pinned at 0 forever: the same "suppresses nothing, reads as a
//       pass" hazard the patch exists to remove. Revisit only if flag artwork
//       is ever localised into a master on ❖ Components.
//
//   (b) Check 1 now excludes TIER 3 (3. Component) as well as Tier 2. The
//       original test was `!semIds.has(b.id)` — "anything not Semantic" — which
//       swept up Component-tier tokens and flagged `bubble/background-tinted`
//       and `bubble/foreground-tinted` on Bubble as primitive-colour
//       violations. Binding Tier 3 in a component is exactly what the tier
//       contract requires. Only Tier 1 should flag.
//
//   (c) Check 1 now honours the Device UI exception, via a KEYED entry in
//       PRIM_COLOR_EXCEPTIONS rather than a blanket DEVICE_RE skip — same
//       component+variable discipline as the rest of the list. This covers 95
//       `color/neutral/0` / `color/neutral/1000` bindings on Home Indicator and
//       Status Bar. The draft applied DEVICE_RE to checks 2–5 and overlooked 1.
//
//   Post-amendment baseline: 1,386 semantic / 96 primitive / 4 component colour
//   bindings on masters. All 96 primitive bindings are accounted for — 1 Scrim
//   `overlay/50` plus the 95 Device UI neutrals — so baseVerdict reads clean
//   with nothing discounted by hand.
// v2.3 change vs v2.2 (2026-07-30): check 7 sanctions a foreign binding
//   INHERITED by the ROOT of a sanctioned remote instance. insideInstance()
//   walks ancestors only, so an instance root always reports inInst === false
//   and escaped the SANCTIONED_VAR_KEYS path. Sanctioned ONLY when the
//   sanctioned main component carries the identical binding — a local override
//   still flags. Fixes the "🧱 Foundations | Layout | Surface/color/secondary"
//   false positive. Also corrected the dead file key on line 7.
// v2.2 change vs v2.1 (2026-07-18): added base check 6 — HARDCODED SPACING
//   (padding/gap). After the spacing-binding pass, every component-internal,
//   non-set-root padding/gap that matches the spacing scale is bound; this
//   check catches regressions (someone adding a component with raw gap-16) and
//   is what makes the handoff gate's "spacing bound" line enforceable rather
//   than attested. Scope MIRRORS the binding pass exactly:
//     - component-internal only (inside a master on ❖ Components)
//     - non-instance, non-COMPONENT_SET-root (set-root gaps are variant-
//       arrangement chrome — they never ship, so they are NOT checked)
//     - auto-layout nodes only (padding/gap is inert otherwise)
//     - inert itemSpacing skipped (SPACE_BETWEEN, or < 2 children)
//     - Device UI masters skipped (iOS chrome — raw values on purpose)
//     - the keyed spacing exceptions below are allowlisted
//   Any OTHER unbound, non-zero padding/gap is flagged. No behavioural change
//   to the color/radius/adoption checks.
// v2.1 change vs v2 (2026-07-05): remote-variable resolution CACHE so a full-
//   file adoption scan (~12k nodes) completes inside the execution timeout.
//   Still run with a raised (30s) timeout.
//
// WHAT IT CHECKS
//  A. Base lint (component masters on ❖ Components — ALL masters):
//     1. Primitive color bindings (outside PRIM_COLOR_EXCEPTIONS)
//     2. Raw solid paints (unbound hex) — master-root canvas fills, artwork
//        and Device UI excluded
//     3. Hardcoded corner radii (unbound, > 0) — artwork / Device UI excluded
//     4. Text nodes without a text style (or mixed) — Device UI excluded
//     5. Effects without an effect style — Device UI excluded
//     6. Hardcoded padding/gap (unbound, > 0) outside documented exceptions
//  B. Adoption lint (whole file):
//     7. Variable bindings that don't resolve to this file's collections
//        → REMOTE (subscribed library var) or DANGLING (deleted local var)
//     8. Style refs (text/fill/stroke/effect/grid) that aren't local styles
//     9. Non-nested instances of remote components
//     Findings are SANCTIONED (allowlisted scaffolding) or FLAGGED (foreign).
//
// FIX MODE (CONFIG.MODE = 'fix')
//     For FLAGGED variable bindings on nodes NOT inside instances: if a local
//     variable resolves to the IDENTICAL value (semantic preferred, then
//     primitive), rebind. Ambiguous / value-different bindings are reported
//     with candidates, never auto-fixed. Remote styles/components never touched.
//     Fix mode does NOT touch spacing — the spacing check is report-only.
//
// DOCUMENTED EXCEPTIONS — SPACING (kept raw by decision, 2026-07-18; keyed to
//   component + property + value so the allowlist means "this value on this
//   component is intentional", NOT "this number is always fine"):
//   - Three-Dots   · itemSpacing · 6    (dot gap, visual tuning — not rhythm)
//   - Stepper      · paddingRight · 92   (structural offset in a fixed track)
//   - Stepper      · paddingRight · 296  (structural offset)
//   - Progress__bar · paddingRight · 206 (structural offset)
//   OUT OF SCOPE — handled by the set-root / instance skips, deliberately NOT
//   allowlisted (allowlisting them would hide real drift on those components):
//   - Avatar 54/79 and Spinner 64 sit on their COMPONENT_SET roots — variant-
//     arrangement chrome (purple-dashed container), never ships.
//   - The Spinner "6px" is a nested Three-Dots INSTANCE — covered by the
//     instance skip + the Three-Dots rule above.
//   - The Input__dropdown 10px item gap was NOT kept — snapped to spacing/2.
// ============================================================================

const CONFIG = {
  MODE: 'report',   // 'report' | 'fix'
  SCOPE: 'file',    // 'file' (adoption lint everywhere) | 'masters' (❖ Components only)
};

// --- Device chrome + spacing exceptions -------------------------------------
const DEVICE_RE = /status bar|home indicator|cursor|device ui/i;

// Keyed spacing exceptions. comp/prop are regexes tested against the master
// name and the property name; val is the exact px value. All three must match.
const SPACING_EXCEPTIONS = [
  { comp: /Three-Dots/,    prop: /^itemSpacing$/,  val: 6,   note: 'dot gap (visual tuning)' },
  { comp: /Stepper/,       prop: /^paddingRight$/, val: 92,  note: 'structural offset' },
  { comp: /Stepper/,       prop: /^paddingRight$/, val: 296, note: 'structural offset' },
  { comp: /Progress__bar/, prop: /^paddingRight$/, val: 206, note: 'structural offset' },
];
function isSpacingException(compName, prop, val) {
  return SPACING_EXCEPTIONS.some(e => e.comp.test(compName) && e.prop.test(prop) && e.val === val);
}

// --- Colour / radius exceptions (v2.4) ---------------------------------------
// NOTE: an ARTWORK_EXCEPTIONS block was drafted for v2.4 and deliberately NOT
// shipped — see amendment (a) in the header. Flag artwork lives inside remote
// INSTANCE nodes, which the base loop skips before check 2, so the allowlist
// had no reachable input. Do not re-add it without first confirming that a
// local Flag master exists on ❖ Components.
//
// Primitive colour bindings that are sanctioned by decision. comp and vari are
// regexes; BOTH must match. Keyed to component + variable so the allowlist means
// "this primitive on this component is intentional", never "this primitive is
// always fine" — same discipline as SPACING_EXCEPTIONS.
//
// !! READ THIS BEFORE ASSUMING CHECK 1 IS STALE (2026-08-03) !!
// All 62 colour primitives are now `ALL_SCOPES` — every ramp step is pickable in
// the colour picker. That is a deliberate maintainer decision that REVERSES the
// 2026-07-31 restriction (which had taken pickable primitives 16 → 3), and it
// does NOT loosen this check. The rule is now split by surface:
//   • Screen / product work — designers may pick any primitive. Scopes are open.
//   • Kit components on ❖ Components — semantic-only, still gated here.
// So open scopes and a strict check 1 are consistent, not contradictory. Do not
// "reconcile" them by deleting this list or by re-closing the scopes.
const PRIM_COLOR_EXCEPTIONS = [
  { comp: /Stepper|Modal|Avatar|Button__circle/, vari: /^color\/primary\/(300|400)$/, note: 'mid-ramp tint' },
  { comp: /Pagination \/ Item/,                  vari: /^color\/primary\/200$/,       note: 'mid-ramp tint' },
  { comp: /Tooltip|Avatar/,                      vari: /^color\/neutral\/900$/,       note: 'always-dark chip pattern' },
  { comp: /.*/,                                  vari: /^color\/overlay\//,           note: 'no semantic equivalent' },
  { comp: /.*/,                                  vari: /^color\/shadow\//,            note: 'no semantic equivalent' },
  // v2.4 amendment (c): Device UI chrome. iOS artwork, not rebrandable. The
  // draft applied DEVICE_RE to checks 2–5 and overlooked check 1.
  { comp: DEVICE_RE,                             vari: /^color\/neutral\/(0|1000)$/,  note: 'iOS device chrome' },
];

function isPrimColorException(compName, varName) {
  return PRIM_COLOR_EXCEPTIONS.some(e => e.comp.test(compName) && e.vari.test(varName));
}

// --- Allowlists (baseline captured 2026-07-05, post-cleanup) ----------------
const SANCTIONED_VAR_KEYS = new Set([
  '4e8c89a152c3f2091b8cbe0ffa95787945271caf','d80c36858abdb025cd3c0bb57a0157a718a3bd12',
  '4271ed716dc153c381bf056af63702f464fd66d0','4606e8853c6bdde4c5c521d7b27a1d53723b7eeb',
  '3af8f81e8beb34810df4ff6036905cba7a621561','7a0931bc838a394c7ee745124b927cb7f83d46cd',
  'c4b1869da45cfd4804b20c802fc11eeed1bf34e0','140e3af435c5b73b81647f40704d086076158a90',
  '628ba26c9509e8e25e18b0b538414b198dfd932b','aff3e26f6d29d5ae9c3ec59ef92de1160811a13a',
  'd07aac5c89037c01400a8422600617f31a593174','148b018f178d2d217792f04fc0e019acea9cca15',
  '470072d21c83799dbd30213755c9717e3274c0ea','b458237beb395d327f1f7c69b8fab3e87ad9025c',
  '7146e0bb778c3fc3d64ae2d4c78d637409cd0bb1','7a215cafb6e799145374206a11379d14d45c7704',
  'b3e1ddf26cc8107d79a6d48a0ad4c5b1f22ff098','854fe07a6ec8fde9d13a031a9c6c4fc1505512ec',
  '3eb94391d7f6550eb5860d0949026c667f99a16d','2b2adefe84ef7215c79a0633a2ff20024a3fb89e',
  '779e5cfb0e864beaeb1ae2cc276f89e18ef5a835','a5c0cad8248ccd34c9b63b8833a01ad1bd8546a7',
  'c06671c0782d488840f029285cb9c948faeadecc','d6ebb11ba71f5860812d30d97f85611cf68e7b96',
  '21d7e1609cd4e1b98799de89a494a396979e1503','174e9b34518018762dfa5ec0910bbf328afbb3cb',
  '8515c63a076fa4f34f7ae4a28d5c317703178c6c','98b48b8ebb38f4bc7503b03eed07c2ff28a504eb',
  '938f1e885afcc034935a21110313339a4df729fc',
]);
const SANCTIONED_STYLE_KEYS = new Set([
  '82af684391a0320c9bde008fda40f5a509190300','3dafa63fa46fa9bf1f2fa2d4f4346419b7e0e259',
  'f19cd860df0a9b92c9ba17ed979fc38b5ecb2d86','f6ffc039ec4de67bd57395ff5549e0285707fb3c',
  '418c4aa81a0a2c9f80f1e16f36a6bc03342da2c0','c47a1ef845b6e4bf1f281aa51a5087cf796e7d75',
  '45c5f60187939bbcd1a969bafefd9c58c39992d2','426e27a7191d0f3af32f2e94b9b8ce55592509d4',
  '83c566049118be415406e48b3b03c22ac4221c0f','29e628b418e25929072190b0b1335bbf8d75b1d9',
  'e019a23dc2bb9faba062b42667afb4b76e0ca775','c6146c6556f8bff6236c1cb686d651ecc3a591b9',
  '42c21a9f24a6edc294edb4b9958498fc8a41492b','ba56f4052e76386826485707caf40d4b01650126',
  '7dc0b55e019be8c5698d55c5855304a2f386ebaa','69dfa828b60eda7a7e14ad7f56e683aae7fb92c7',
  'ca3b2208e5c702c7e3433ffa1200a2fa2f1e032a','40795be3ffcdd7ddbe9df37595e94515c1c06fd6',
  '0fcf17c449ca24ef91e5c48d0fdb053c9750226a','5ea814c700102675849188dc29fbad87c395d702',
  '36f0e02b3b088299380861caa643f5cac7edf90e','d075c48b767422fd34deb75dc1404152dc1b528f',
  'dc0ac6f0966e9a49bb218c287ed58953b52c96a8','8b118e07f459ca70e7b527c4df23d3e2b2c7001c',
  'cc0a0ad91162bc500e5efa303b0242bafdb6bb18','c57072d8846e3a6026f77a2c7e7f40a10d87b4a9',
  '4eebd5e5d39929dde55924e49c359044c1c75999','ac7c1d9219ca6296722e55058fe4bba1269daae6',
  '8bc0a930ad982457956e606c23861c9a53ccacd1','e4f6fbb953451d7597922ae26782baec1f2e97fc',
]);
const SANCTIONED_COMPONENT_KEYS = new Set([
  'deb4ff8db2be202e4326c5534bd4a667a79e1ec5','03b9ebb27572e2222544924ac6bc6c0080d4d02c',
  '38d3ae42224898580dece26c814b05589a5b3cf7','76367cb2896ed09c604840a448af06fc00f34daf',
  '91518f590450155d58517e9abed90849c97559c5','de22a0efad94057dec448dc8824362985f2abb71',
  '5d248a8c197a44d8b2a3ee040e6263d3692d6566','cb9979013a012a596cbb38f45aaa5ddee65a8182',
  '2d907ea32936caa31c6d91f74402512553391c72','4bc674efb256019184b7225f7188a4e5f96ad195',
  '58d49c9ca2bcac9b9f60cc6bcaa004777782e13d','9bd5f52cd95a22cc953a1193bf0e2ffea0a8cd6a',
  'f7bfdcaf440e144ae35124055135e0dbfdf60abc','0fa95e0d30e2c25a545aa8f083d4b2cd2e94e79b',
  'e957056e3fb7c51a290d78ba684cd66e492b8174','d0029717c3c199c6a763cda382a18d02881a39c2',
  'f5539d779cdf491b539e59aa953d0ac539725f54','62af7a7e3bf4b6e0fe785865acf1307304ab2fe4',
  '2056ee316c03f1c86928ed6943674a210ab50b65','39bf1c95fd992eb1c962d56d9f32b6b3882925a3',
  // NOTE: 'List/Type=bullet' deliberately NOT sanctioned — localized in G.
]);

// --- Shared lookups ----------------------------------------------------------
const allVars = await figma.variables.getLocalVariablesAsync();
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const semColl = collections.find(c => c.name === '2. Semantic');
const primColl = collections.find(c => c.name === '1. Primitives');
if (!semColl || !primColl) {
  return { verdict: '⚠️ CONFIG ERROR — expected collections "1. Primitives" and "2. Semantic" not found. Check collection names before running.' };
}
const lightId = (semColl.modes.find(m => m.name === 'Light') || semColl.modes[0]).modeId;
const primModeId = primColl.modes[0].modeId;
const localVarIds = new Set(allVars.map(v => v.id));
// v2.4 amendment (b): Tier 3 is tracked separately so check 1 can exclude it.
// Component-tier bindings in a component are contract-correct, not violations.
const compColl = collections.find(c => c.name === '3. Component');
const vname = {}; const semIds = new Set(); const compIds = new Set();
for (const v of allVars) {
  vname[v.id] = v.name;
  if (v.variableCollectionId === semColl.id) semIds.add(v.id);
  if (compColl && v.variableCollectionId === compColl.id) compIds.add(v.id);
}
const localStyleIds = new Set();
for (const s of [...await figma.getLocalTextStylesAsync(), ...await figma.getLocalPaintStylesAsync(),
                 ...await figma.getLocalEffectStylesAsync(), ...await figma.getLocalGridStylesAsync()]) localStyleIds.add(s.id);

// v2.1: cache remote/foreign variable fetches — the single biggest perf win.
const remoteVarCache = new Map();
async function getVarCached(id) {
  if (remoteVarCache.has(id)) return remoteVarCache.get(id);
  let v = null; try { v = await figma.variables.getVariableByIdAsync(id); } catch (e) {}
  remoteVarCache.set(id, v); return v;
}

function insideInstance(n) { let a = n.parent; while (a && a.type !== 'PAGE') { if (a.type === 'INSTANCE') return true; a = a.parent; } return false; }
function container(n) { let a = n, comp = null, top = null; while (a && a.type !== 'PAGE') { if (a.type === 'COMPONENT' || a.type === 'COMPONENT_SET') comp = a.name; if (a.parent && a.parent.type === 'PAGE') top = a.name; a = a.parent; } return comp ? 'MASTER:' + comp : (top || '?'); }
function aliasEntries(bv) {
  const out = [];
  for (const k of Object.keys(bv || {})) {
    const val = bv[k];
    if (Array.isArray(val)) { for (const a of val) if (a && a.id) out.push({ prop: k, id: a.id, paint: true }); }
    else if (val && val.id) out.push({ prop: k, id: val.id, paint: false });
    else if (val && typeof val === 'object') { for (const kk of Object.keys(val)) { const a = val[kk]; if (a && a.id) out.push({ prop: k + '.' + kk, id: a.id, paint: false }); } }
  }
  return out;
}
async function resolveVal(v, modeId) {
  let val = v.valuesByMode[modeId] !== undefined ? v.valuesByMode[modeId] : v.valuesByMode[Object.keys(v.valuesByMode)[0]];
  let g = 0;
  while (val && val.type === 'VARIABLE_ALIAS' && g++ < 10) {
    const t = await getVarCached(val.id);
    if (!t) return null;
    const mk = t.valuesByMode[modeId] !== undefined ? modeId : Object.keys(t.valuesByMode)[0];
    val = t.valuesByMode[mk];
  }
  return val;
}
function valKey(val, type) {
  if (val === null || val === undefined) return null;
  if (type === 'COLOR') return [val.r, val.g, val.b, val.a === undefined ? 1 : val.a].map(x => Math.round(x * 1000)).join(',');
  return String(val);
}

// Index local variables by resolved value for fix-mode matching
const localIndex = {};
for (const v of allVars) {
  const isSem = v.variableCollectionId === semColl.id;
  const isPrim = v.variableCollectionId === primColl.id;
  if (!isSem && !isPrim) continue;
  const val = await resolveVal(v, isSem ? lightId : primModeId);
  const k = v.resolvedType + '|' + valKey(val, v.resolvedType);
  (localIndex[k] = localIndex[k] || []).push({ v, tier: isSem ? 'semantic' : 'primitive' });
}

// =============================== A. BASE LINT ================================
const base = { primColorBindings: {}, rawPaints: {}, hardRadius: {}, unstyledText: [], rawEffects: [],
               hardSpacing: {}, spacingExceptions: 0,
               primColorExceptions: 0, deviceNodesSkipped: 0 };
const comps = figma.root.children.find(p => p.name === '❖ Components');
await comps.loadAsync();
for (const m of comps.findAll(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.parent.type !== 'COMPONENT_SET')) {
  for (const n of [m, ...m.findAll(() => true)]) {
    if (insideInstance(n)) continue;
    const bv = n.boundVariables || {};
    // 1. primitive colour bindings — Tier 1 only. Tier 2 (Semantic) is the
    //    design-with surface and Tier 3 (Component) is contract-correct inside
    //    a component, so both are excluded. See v2.4 amendment (b).
    for (const b of [...(bv.fills || []), ...(bv.strokes || [])]) {
      if (!semIds.has(b.id) && !compIds.has(b.id) && vname[b.id]) {
        const k = vname[b.id];
        if (isPrimColorException(m.name, k)) { base.primColorExceptions++; continue; }
        base.primColorBindings[k] = base.primColorBindings[k] || new Set();
        base.primColorBindings[k].add(m.name);
      }
    }
    // 2. raw paints
    const isMasterRoot = (n === m) || (n.parent && n.parent.type === 'COMPONENT_SET');
    if (!isMasterRoot) {
      const skipDevice = DEVICE_RE.test(m.name);
      for (const kind of ['fills', 'strokes']) {
        if (!Array.isArray(n[kind])) continue;
        for (const p of n[kind]) if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) {
          if (skipDevice) { base.deviceNodesSkipped++; continue; }
          base.rawPaints[m.name] = (base.rawPaints[m.name] || 0) + 1;
        }
      }
    }
    // 3. hardcoded radii
    if ('topLeftRadius' in n && n.type !== 'INSTANCE' && !DEVICE_RE.test(m.name)) {
      for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
        if (typeof n[c] === 'number' && n[c] > 0 && !bv[c]) {
          const k = m.name + ' (' + n[c] + 'px)';
          base.hardRadius[k] = (base.hardRadius[k] || 0) + 1;
        }
      }
    }
    // 6. Hardcoded padding/gap (spacing) — scope mirrors the binding pass.
    //    Set-root (COMPONENT_SET) gaps are variant-arrangement chrome and are
    //    intentionally NOT checked; instances inherit and aren't checked here.
    if (n.type !== 'COMPONENT_SET' && n.type !== 'INSTANCE' &&
        'layoutMode' in n && n.layoutMode !== 'NONE' && !DEVICE_RE.test(m.name)) {
      const checkSpace = (val, prop) => {
        if (typeof val !== 'number' || val <= 0) return;
        if (bv[prop]) return;                                   // already bound
        if (isSpacingException(m.name, prop, val)) { base.spacingExceptions++; return; }
        const key = m.name + ' · ' + prop + ' ' + val + 'px';
        base.hardSpacing[key] = (base.hardSpacing[key] || 0) + 1;
      };
      for (const p of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) if (p in n) checkSpace(n[p], p);
      if ('itemSpacing' in n && typeof n.itemSpacing === 'number') {
        // v2.4 amendment (d): count only children that participate in layout FLOW.
        // An ABSOLUTE child (e.g. a focus `Ring` overlay) consumes no gap, so a
        // frame with one flow child plus one absolute child still has an inert
        // itemSpacing. Counting raw children made every Focus variant built on
        // 2026-08-03 report a false unbound-spacing finding — 15 of them. This
        // is a pre-existing bug in check 6, not a consequence of the rings.
        const flow = (n.children || []).filter(c => c.layoutPositioning !== 'ABSOLUTE');
        const inert = n.primaryAxisAlignItems === 'SPACE_BETWEEN' || flow.length < 2;
        if (!inert) checkSpace(n.itemSpacing, 'itemSpacing');
      }
      if (n.layoutWrap === 'WRAP' && 'counterAxisSpacing' in n) checkSpace(n.counterAxisSpacing, 'counterAxisSpacing');
    }
    // 4. text without a text style
    if (n.type === 'TEXT' && !DEVICE_RE.test(m.name) &&
        !(n.textStyleId && n.textStyleId !== '' && n.textStyleId !== figma.mixed)) {
      base.unstyledText.push(m.name + ' > ' + n.name);
    }
    // 5. effects without an effect style
    if ('effects' in n && n.effects && n.effects.length > 0 && !DEVICE_RE.test(m.name) &&
        !(n.effectStyleId && n.effectStyleId !== '')) {
      base.rawEffects.push(m.name + ' > ' + n.name);
    }
  }
}
for (const k of Object.keys(base.primColorBindings)) base.primColorBindings[k] = [...base.primColorBindings[k]].join(', ');
base.unstyledText = [...new Set(base.unstyledText)];
base.rawEffects = [...new Set(base.rawEffects)];
base.hardSpacingTotal = Object.values(base.hardSpacing).reduce((a, b) => a + b, 0);

// ============================ B. ADOPTION LINT ================================
const adoption = {
  flaggedVars: {}, danglingVars: {}, flaggedStyles: {}, flaggedRemoteInstances: {},
  sanctionedCounts: { varBindings: 0, styleRefs: 0, instances: 0 },
  fixes: [], needsDecision: [],
};
const pages = CONFIG.SCOPE === 'masters' ? [comps] : figma.root.children;
let nodesScanned = 0;
for (const page of pages) {
  await page.loadAsync();
  for (const n of page.findAll(() => true)) {
    nodesScanned++;
    const inInst = insideInstance(n);
    // 7. foreign variable bindings
    for (const e of aliasEntries(n.boundVariables)) {
      if (localVarIds.has(e.id)) continue;
      const v = await getVarCached(e.id);
      const loc = page.name + ' | ' + container(n);
      if (!v) { adoption.danglingVars[loc + ' | <unresolvable> @' + e.prop] = (adoption.danglingVars[loc + ' | <unresolvable> @' + e.prop] || 0) + 1; continue; }
      if (!v.remote) { adoption.danglingVars[loc + ' | ' + v.name + ' (deleted local) @' + e.prop] = (adoption.danglingVars[loc + ' | ' + v.name + ' (deleted local) @' + e.prop] || 0) + 1; continue; }
      if (SANCTIONED_VAR_KEYS.has(v.key) && inInst) { adoption.sanctionedCounts.varBindings++; continue; }

      // v2.3: a binding INHERITED by the ROOT of a sanctioned remote instance is
      // scaffolding, whatever the variable's own key. insideInstance() walks
      // ancestors only, so an instance root always reports inInst === false and
      // escapes the check above. Sanction ONLY when the sanctioned main component
      // carries the identical binding — a local override still gets flagged.
      if (!inInst && n.type === 'INSTANCE') {
        try {
          const mc = await n.getMainComponentAsync();
          if (mc && mc.remote && SANCTIONED_COMPONENT_KEYS.has(mc.key)) {
            const mbv = mc.boundVariables && mc.boundVariables[e.prop];
            const inherited = Array.isArray(mbv)
              ? mbv.some(x => x && x.id === e.id)
              : !!(mbv && mbv.id === e.id);
            if (inherited) { adoption.sanctionedCounts.varBindings++; continue; }
          }
        } catch (err) { /* fall through to flag */ }
      }

      const key = loc + ' | ' + v.name + ' @' + e.prop + (inInst ? ' [in-instance]' : '');
      adoption.flaggedVars[key] = (adoption.flaggedVars[key] || 0) + 1;
      if (CONFIG.MODE === 'fix' && !inInst) {
        const val = await resolveVal(v, Object.keys(v.valuesByMode)[0]);
        const matches = localIndex[v.resolvedType + '|' + valKey(val, v.resolvedType)] || [];
        const sem = matches.filter(x => x.tier === 'semantic');
        const prim = matches.filter(x => x.tier === 'primitive');
        let target = null;
        if (sem.length === 1) target = sem[0].v;
        else if (sem.length === 0 && prim.length === 1) target = prim[0].v;
        if (target) {
          try {
            if (e.paint) {
              const kind = e.prop;
              n[kind] = n[kind].map(p => (p.boundVariables && p.boundVariables.color && p.boundVariables.color.id === e.id)
                ? figma.variables.setBoundVariableForPaint(p, 'color', target) : p);
            } else {
              n.setBoundVariable(e.prop.split('.')[0], target);
            }
            adoption.fixes.push(key + ' → ' + target.name);
          } catch (err) { adoption.needsDecision.push(key + ' (fix failed: ' + err.message.slice(0, 60) + ')'); }
        } else {
          adoption.needsDecision.push(key + ' (candidates: ' + (matches.map(x => x.v.name).join(', ') || 'none — value has no local equivalent') + ')');
        }
      }
    }
    // 8. foreign style refs
    for (const prop of ['textStyleId', 'fillStyleId', 'strokeStyleId', 'effectStyleId', 'gridStyleId']) {
      const sid = n[prop];
      if (typeof sid !== 'string' || sid === '' || localStyleIds.has(sid)) continue;
      let s = null; try { s = await figma.getStyleByIdAsync(sid); } catch (err) {}
      if (s && SANCTIONED_STYLE_KEYS.has(s.key) && (inInst || page.name !== '❖ Components')) { adoption.sanctionedCounts.styleRefs++; continue; }
      const key = page.name + ' | ' + container(n) + ' | ' + (s ? s.name : '<unresolvable>') + ' @' + prop + (inInst ? ' [in-instance]' : '');
      adoption.flaggedStyles[key] = (adoption.flaggedStyles[key] || 0) + 1;
    }
    // 9. remote component instances (non-nested only)
    if (n.type === 'INSTANCE' && !inInst) {
      try {
        const mc = await n.getMainComponentAsync();
        if (mc && mc.remote) {
          if (SANCTIONED_COMPONENT_KEYS.has(mc.key)) { adoption.sanctionedCounts.instances++; }
          else {
            const nm = (mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent.name + '/' : '') + mc.name;
            const kk = page.name + ' | ' + container(n) + ' | ' + nm + ' (key ' + mc.key.slice(0, 8) + '…)';
            adoption.flaggedRemoteInstances[kk] = (adoption.flaggedRemoteInstances[kk] || 0) + 1;
          }
        }
      } catch (err) {}
    }
  }
}

// ========================== C. STRUCTURAL CHECKS (v2.4) =======================
// Five cheap checks added 2026-08-03. Each is countable and independent of the
// base/adoption machinery above.

// --- 10. State coverage -------------------------------------------------------
// CONTRACT, amended 2026-08-03: there is no mandatory five-state set. Required
// states are per component and depend on whether it is interactive. Focus is
// mandatory for anything focusable — WCAG 2.4.7 Level AA — and is therefore the
// only state this check GATES on. Hover, Active and Disabled are design
// decisions with no criterion behind them; they are counted under `tracked` so
// the number stays visible without blocking a release. A non-interactive
// component carries no states at all and belongs in NO_INTERACTION below.
//
// The handoff frames on ❖ Components were updated to match this: the old
// "five states — default / hover / active / focus / disabled" gate language
// claimed a bar the kit did not meet on 9 sets and was ticked as passing.
const EXPECTED_STATES = ['Default', 'Hover', 'Active', 'Focus', 'Disabled'];

// Sets that legitimately have no interaction states. Matched against the name
// with any `.🔒master / ` style prefix stripped. Anchored so that `Pagination`
// does NOT match `Pagination / Item` and `Breadcrumb` does NOT match
// `Breadcrumb / Item` — the wrappers are static, the Items are interactive.
const NO_INTERACTION = [
  /^Avatar$/, /^Badge$/, /^Separator$/, /^Spinner$/, /^Spinner-Gradient$/,
  /^Three-Dots$/, /^Squares$/, /^Alert$/, /^Toast$/, /^Modal$/, /^Tooltip$/,
  /^List$/, /^List Item$/, /^Breadcrumb$/, /^Stepper$/, /^Stepper Item$/,
  /^Pagination$/, /^Form$/, /^Bubble$/, /^Message$/, /^Standard Icon$/,
  /^Cursor$/, /^Status Bar$/, /^Home Indicator$/, /^Organization \/ Status Badge$/,
  // Tabs is a wrapper like Pagination and Breadcrumb: every interaction state
  // lives on `.🔒master / Tabs / Item`, which is checked on its own and has all
  // five. Anchored so it does NOT match `Tabs / Item`. Added 2026-08-03.
  /^Tabs$/,
];

// Sets whose Focus lives on a PARENT control rather than on themselves.
// Recorded here rather than in a doc so the check cannot drift from the call.
const FOCUS_DELEGATED = [
  { set: /^Input__dropdown \/ Item$/, to: 'Input__dropdown',
    note: 'Decision 2026-08-03. The trigger is the tabbable element and carries the ring. ' +
          'A list row\'s focus treatment is a background change identical to its existing ' +
          'Hover (shadcn SelectItem uses focus:bg-accent, not a ring), so an Item Focus ' +
          'variant would duplicate Hover without adding information.' },
  { set: /^Input__number$/, to: 'Button__circle',
    note: 'Decision 2026-08-03. The composite has NO focusable host: it is ' +
          '[Button__circle, TEXT, Button__circle] and the middle element is a static TEXT ' +
          'node, not an editable field. The only focusable targets are the two ' +
          'Button__circle instances, which already ship State=Focus. A container ring was ' +
          'built and then removed — it implied a focusable container that does not exist, ' +
          'and any composite-level Focus variant would force an arbitrary choice about ' +
          'which of the two buttons is focused.' },
];
const shortName = n => n.replace(/^\.[^/]*\/\s*/, '').trim();

const stateCoverage = { focusGaps: [], otherGaps: [], noStateProperty: [], delegated: [], skipped: 0, checked: 0 };
for (const s of comps.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
  const sn = shortName(s.name);
  if (NO_INTERACTION.some(r => r.test(sn))) { stateCoverage.skipped++; continue; }
  const del = FOCUS_DELEGATED.find(x => x.set.test(sn));
  const defs = s.componentPropertyDefinitions || {};
  const key = Object.keys(defs).find(k => /^(State|Status)$/i.test(k.split('#')[0]));
  if (!key) { stateCoverage.noStateProperty.push(s.name); continue; }
  stateCoverage.checked++;
  const have = defs[key].variantOptions || [];
  const missing = EXPECTED_STATES.filter(e => !have.some(h => h.toLowerCase() === e.toLowerCase()));
  if (missing.indexOf('Focus') !== -1) {
    if (del) stateCoverage.delegated.push(s.name + ' → Focus on ' + del.to);
    else stateCoverage.focusGaps.push(s.name + ' [' + key + ': ' + have.join('|') + ']');
  }
  const others = missing.filter(x => x !== 'Focus');
  if (others.length) stateCoverage.otherGaps.push(s.name + ' missing ' + others.join(', '));
  // casing drift: a value that matches an expected state case-insensitively but not exactly
  const caseOdd = have.filter(h => EXPECTED_STATES.some(e => e.toLowerCase() === h.toLowerCase() && e !== h));
  if (caseOdd.length) stateCoverage.otherGaps.push(s.name + ' CASING: ' + caseOdd.join(', '));
}

// --- 11. Description completeness --------------------------------------------
// Report-only. Make the number countable; fixing the descriptions is separate work.
const descriptions = { total: 0, filled: 0, empty: [] };
for (const s of comps.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
  if (/^\.util\//.test(s.name)) continue;
  descriptions.total++;
  if ((s.description || '').trim() === '') descriptions.empty.push(s.name);
  else descriptions.filled++;
}
descriptions.emptyCount = descriptions.empty.length;

// --- 12. Token export readiness ----------------------------------------------
// Every Semantic variable needs codeSyntax.WEB, and it must equal
// `var(--<variable name>)`. Asserting the exact string catches typos, not just
// absence — three tokens shipped with no codeSyntax at all on 2026-07-31.
const exportReadiness = { missing: [], wrong: [], ok: 0 };
for (const v of allVars.filter(x => x.variableCollectionId === semColl.id)) {
  const cs = (v.codeSyntax || {}).WEB;
  const want = 'var(--' + v.name + ')';
  if (!cs) exportReadiness.missing.push(v.name);
  else if (cs !== want) exportReadiness.wrong.push(v.name + ' → "' + cs + '" (want "' + want + '")');
  else exportReadiness.ok++;
}

// --- 13. Published-surface sanity --------------------------------------------
// No variable a consumer needs may be hiddenFromPublishing. Per collection,
// either everything publishes or the exception is on this list.
const EXPECTED_HIDDEN = [/^font\/vertical-rhythm$/, /^font\/family\/base$/, /^font\/size\/base$/, /^grid\/columns$/];
const publishedSurface = { unexpectedHidden: [], expectedHiddenPresent: [], byCollection: {} };
for (const c of collections) {
  const vs = allVars.filter(v => v.variableCollectionId === c.id);
  const hidden = vs.filter(v => v.hiddenFromPublishing);
  publishedSurface.byCollection[c.name] = { total: vs.length, hidden: hidden.length };
  for (const v of hidden) {
    if (EXPECTED_HIDDEN.some(r => r.test(v.name))) publishedSurface.expectedHiddenPresent.push(v.name);
    else publishedSurface.unexpectedHidden.push(c.name + ' | ' + v.name);
  }
}

// --- 14. Frame mode-pin -------------------------------------------------------
// Any frame meant to display a fixed mode must pin BOTH `2. Semantic` and
// `3. Component`. Pinning one and not the other is the failure: it is
// value-identical today, because every Component token resolves the same in
// both modes, but the first mode-specific component token would silently fail
// to switch. Collection IDs are looked up by name, never hardcoded.
const modePins = { halfPinned: [], bothPinned: 0, scanned: 0 };
if (compColl) {
  for (const pg of figma.root.children) {
    await pg.loadAsync();
    for (const n of pg.findAllWithCriteria({ types: ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'] })) {
      const em = n.explicitVariableModes; if (!em) continue;
      const hasSem = Object.prototype.hasOwnProperty.call(em, semColl.id);
      const hasComp = Object.prototype.hasOwnProperty.call(em, compColl.id);
      if (!hasSem && !hasComp) continue;
      modePins.scanned++;
      if (hasSem && hasComp) modePins.bothPinned++;
      else modePins.halfPinned.push(pg.name + ' | ' + n.name + ' | pins ' + (hasSem ? 'Semantic only' : 'Component only'));
    }
  }
}

const structuralClean =
  stateCoverage.focusGaps.length === 0 &&
  stateCoverage.noStateProperty.length === 0 &&
  exportReadiness.missing.length === 0 &&
  exportReadiness.wrong.length === 0 &&
  publishedSurface.unexpectedHidden.length === 0 &&
  modePins.halfPinned.length === 0;

const clean = Object.keys(adoption.flaggedVars).length === 0 &&
              Object.keys(adoption.danglingVars).length === 0 &&
              Object.keys(adoption.flaggedStyles).length === 0 &&
              Object.keys(adoption.flaggedRemoteInstances).length === 0;
const spacingClean = Object.keys(base.hardSpacing).length === 0;
const baseClean = Object.keys(base.primColorBindings).length === 0 &&
                  Object.keys(base.rawPaints).length === 0 &&
                  Object.keys(base.hardRadius).length === 0 &&
                  base.unstyledText.length === 0 &&
                  base.rawEffects.length === 0;
return {
  verdict: clean ? '✅ ADOPTION CLEAN — no unsanctioned foreign material' : '⚠️ FOREIGN MATERIAL FLAGGED',
  baseVerdict: baseClean
    ? '✅ BASE CLEAN — no unbound colour, radius, text style or effect outside documented exceptions'
    : '⚠️ BASE FINDINGS — see base.*',
  spacingVerdict: spacingClean
    ? '✅ SPACING BOUND — no unbound spacing outside documented exceptions'
    : '⚠️ UNBOUND SPACING FOUND — ' + base.hardSpacingTotal + ' node-props',
  structuralVerdict: structuralClean
    ? '✅ STRUCTURE CLEAN — no Focus gaps, export ready, publish surface sane, mode pins complete'
    : '⚠️ STRUCTURAL FINDINGS — ' + stateCoverage.focusGaps.length + ' Focus gap(s), '
      + (exportReadiness.missing.length + exportReadiness.wrong.length) + ' export issue(s), '
      + publishedSurface.unexpectedHidden.length + ' unexpected hidden, '
      + modePins.halfPinned.length + ' half-pinned frame(s)',
  exceptionsApplied: {
    spacing: base.spacingExceptions,
    primitiveColour: base.primColorExceptions,
    deviceChrome: base.deviceNodesSkipped,
  },
  // Tracked, NOT gated: Hover/Active coverage and empty descriptions are
  // countable numbers for F1/F2 planning, not v1.0 blockers.
  tracked: {
    hoverActiveGaps: stateCoverage.otherGaps.length,
    emptyDescriptions: descriptions.emptyCount + ' of ' + descriptions.total,
  },
  nodesScanned,
  base,
  adoption,
  structural: { stateCoverage, descriptions, exportReadiness, publishedSurface, modePins },
};
