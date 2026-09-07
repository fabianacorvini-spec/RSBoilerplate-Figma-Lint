// ============================================================================
// Component lint v2.8 — base property lint + FOREIGN-BINDING ADOPTION LINT
// Run via the MCP Bridge plugin — ask Claude to fetch this raw file and run it.
// Report mode is read-only; fix mode rebinds only value-identical foreign
// bindings.
//
// File: NEW [Client Name] / [Platform] UI + DS (2026)   key Vk0disHgUAm5Z7iNQiA4V6
//   ⚠️ v2.2 and earlier named key Pb8ZHU7RUJcLmobwZ6wfKm in this header. That
//   key is DEAD, as is TcBQLQQCBO3RzDduDnYfUN. Verify figma.fileKey before use.
//
// ---------------------------------------------------------------------------
// v2.8 changes vs v2.7 (2026-09-07) — one allowlist entry, no logic changes
//   (A) SANCTIONED_VAR_KEYS += ad1ad5639b2a3cec8fd6b481a6f259cf0df1035b
//       (`Colors/tertiary/green`). Closed the only finding in the first full
//       9-page gate run: 28 flagged bindings, every one the same remote
//       variable on a frame named `Figma` five levels inside the `Header`
//       doc-chrome instance. PROVISIONAL — see the entry for why.
//   (B) DOCUMENTED-EXCEPTIONS header block trimmed. This was made in a
//       working copy on 2026-09-07 and never reached the public repo, so
//       public v2.7 and this file disagreed on paper. Folded in here so one
//       version is canonical. NOTE: that block is a TRIAGE COMMENT, not
//       logic — there is no code-level colour allowlist. Base check 1 is
//       `if (semIds.has(b.id) || compIds.has(b.id)) continue;` and every
//       off-tier binding is reported. Trimming it changes what a human
//       waves through, nothing the script does.
//
// v2.7 changes vs v2.6 (2026-09-07) — one bug fix, no new checks
//   (B) DOCUMENTED-EXCEPTIONS LIST TRIMMED to color/overlay/* + color/shadow/*
//       and the flag illustrations. primary/200, /300, /400 and neutral/900
//       are REVOKED — verified absent from all masters 2026-09-07.
//   (A) COMPOSE_COLOR resolution in resolveVal() + valKey() hardening. Figma's
//       composed-color variables (alias + alpha) were unresolvable, hashed to
//       NaN, and collided in localIndex — the table fix mode reads to decide
//       "value-identical". FIX MODE WAS UNSAFE for any file using them.
//       Report mode was unaffected, so prior clean runs remain valid.
//       Live case: color/overlay/10|50|80 -> color/neutral/900 @ 10/50/80%.
//
// v2.6 changes vs v2.5 (2026-08-14) — one new check section, no bug fixes
//   (C) PROPERTY BINDING PARITY + DEFAULTS TRAP. See section C for the full
//       rationale. Motivated by three live defects the file carried through a
//       clean v2.5 run: Textarea had every property dead on its hover and focus
//       variants, Select had Has Flag / Country dead on nine, and Field and
//       Textarea both had a Footer subtree that could never render on a fresh
//       instance. None of these touch a paint, a spacing value or a foreign
//       binding, so nothing in A or B could see them.
//
// v2.5 changes vs v2.2 (2026-08-14) — four bug fixes, no new checks
// ---------------------------------------------------------------------------
//  (a) itemSpacing inertness now counts NON-ABSOLUTE children only.
//      Adding a `Ring` (layoutPositioning ABSOLUTE) made itemSpacing look
//      active on 15 Pagination variants — a false positive of the same class
//      as the v2.3 root-inheritance patch. Absolutely-positioned children do
//      not participate in auto-layout, so they cannot make a gap meaningful.
//
//  (b) SPACING_EXCEPTIONS reduced to ONE entry. Stepper paddingRight 92/296
//      and Progress (then named Progress__bar) paddingRight 206 were RETIRED
//      2026-07-31: each was a
//      hardcoded progress percentage, fixed by pinning Fill.width and zeroing
//      the padding. Keeping them allowlisted would hide a regression.
//      → If any of the three reappear, PIN THE WIDTH. Do not re-allowlist.
//
//  (c) Base check 1 now accepts `3. Component` as a legitimate tier.
//      The old test was `!semIds.has(id)`, written when the Component
//      collection was empty by design. It is no longer empty (6 tokens:
//      4× bubble/*, 2× device/*), so every component token was being
//      reported as a rogue primitive binding.
//
//  (d) Sanctioned doc-chrome INSTANCE ROOTS no longer flag.
//      SANCTIONED_VAR_KEYS was only honoured when the node was INSIDE an
//      instance. The root of a sanctioned remote instance is not inside one,
//      so its own inherited binding always flagged — e.g. the doc-chrome
//      `Header` on 🧱 Foundations binding a remote `Surface/color/secondary`.
//      Now also honoured when the node IS an instance of a sanctioned
//      component.
//
//  (e) The RADIUS check now skips COMPONENT_SET roots.
//      A set root is the purple-dashed variant container. It never ships, and
//      the spacing check has always skipped it — the radius check did not, so
//      every set with a rounded container reported phantom findings. On the
//      three Device UI sets alone that was 12 (3 sets x 4 corners at r=5),
//      mis-read as "iOS sub-pixel artwork" for weeks. Variant roots
//      (COMPONENT) are still checked — their radii are real.
//
// ---------------------------------------------------------------------------
// HOW TO RUN IT — split passes, not one full-file sweep
// ---------------------------------------------------------------------------
// A single whole-file adoption sweep (findAll + getMainComponentAsync across
// every page) exceeds the bridge's patience and drops the connection. Run:
//   CONFIG.SCOPE = 'masters'                    → base lint + ❖ Components
//   CONFIG.SCOPE = 'file', CONFIG.ONLY_PAGE=... → adoption, one page at a time
// The file is ~20,300 nodes across 8 real pages; ❖ Components alone is 16,500.
// Always raise the execution timeout to 30s.
//
// ---------------------------------------------------------------------------
// WHAT IT CHECKS
//  A. Base lint (component masters on ❖ Components — ALL masters):
//     1. Bindings outside the Semantic + Component tiers (documented
//        exceptions only)
//     2. Raw solid paints (unbound hex) — master-root canvas fills excluded
//     3. Hardcoded corner radii (unbound, > 0)
//     4. Text nodes without a text style (or mixed)
//     5. Effects without an effect style
//     6. Hardcoded padding/gap (unbound, > 0) outside documented exceptions
//  B. Adoption lint (whole file, or one page at a time):
//     7. Variable bindings that don't resolve to this file's collections
//        → REMOTE (subscribed library var) or DANGLING (deleted local var)
//     8. Style refs (text/fill/stroke/effect/grid) that aren't local styles
//     9. Non-nested instances of remote components
//     Findings are SANCTIONED (allowlisted scaffolding) or FLAGGED (foreign).
//
// KNOWN BLIND SPOT — BY DESIGN, DO NOT "FIX" WITHOUT THINKING
//   insideInstance() skips everything inside instances, so check 2 cannot see
//   in-instance raw paints. Today that hides 820 of them — ALL Flag
//   illustration artwork in Select (792) and Select / Item (28), a documented
//   exception. "Raw paints: 0" therefore means "0 REACHABLE", not "0 in file".
//   Before calling any raw paint a defect, read paint.visible — every `Icon`
//   instance carries a DISABLED white paint inherited from the remote icon
//   library, which renders nothing.
//
// FIX MODE (CONFIG.MODE = 'fix')
//   For FLAGGED variable bindings on nodes NOT inside instances: if a local
//   variable resolves to the IDENTICAL value (semantic preferred, then
//   primitive), rebind. Ambiguous / value-different bindings are reported with
//   candidates, never auto-fixed. Remote styles/components never touched.
//   Fix mode does NOT touch spacing.
//
// DOCUMENTED EXCEPTIONS — COLOR/RADIUS (do not "fix"):
//   v2.7 TRIMMED THE LIST. An unfiltered scan of every ❖ Components master
//   (6,851 nodes, 2026-09-07) found exactly ONE primitive colour binding in
//   the whole file: color/overlay/50 on Scrim. Every other entry below had
//   already been cleared and was sitting here as a hole — a stale allowlist
//   silently ACCEPTS a binding a designer reintroduces. Re-verify before
//   adding anything back.
//   - color/overlay/* + color/shadow/* primitives (no semantic equivalent —
//     shadcn has no overlay variable; settled 2026-09-07, do not reopen
//     without a mode-dependent scrim requirement). Live: overlay/50 on Scrim.
//   - Flags + Select flag illustration (literal colors)
//   REVOKED — these are now REAL findings if they reappear:
//   - primary/200 (was Pagination Item) — cleared
//   - primary/300 (was Avatar) — cleared by the 2026-07-30 de-primitivisation;
//     primary/300 now has exactly one consumer, the primary-muted-active
//     token (Light), added 2026-09-07
//   - primary/400 (was Stepper, Dialog placeholder, Button__circle focus
//     ring) — cleared
//   - neutral/900 (was Tooltip surface + Avatar, "always-dark chip") — cleared
//   - 📱 Device UI masters (Status Bar, Home Indicator, Cursor). Two PERMANENT
//     exceptions, both decided 2026-08-14 — these will never be "fixed":
//       (i)  Status Bar's sub-pixel battery artwork radii 4.3 / 3.25 / 2.5 / 1.5
//       (ii) 3 unstyled text nodes — Status Bar Time / Date / Battery
//            Percentage. They render OS system type (SF Pro / Roboto), not the
//            kit type scale. Binding them would make a client rebrand render
//            the phone clock in the brand font. These are the ONLY unstyled
//            text nodes in the file; a 4th is a real finding. Home Indicator's Bar r=100 is a
//     PILL and is deliberately NOT bound to radius/full — binding it would
//     let a brand that flattens radius/full un-round the iOS home indicator.
//     Device chrome is OS-faithful, not brand-faithful. Cursor has no radii.
//     NOTE: their COLOUR exception is GONE as of 2026-08-14 — all three now
//     bind device/foreground + device/background in the Component tier.
//     A primitive colour binding on device chrome is now a real finding.
//
// DOCUMENTED EXCEPTIONS — SPACING (keyed to component + property + value):
//   - Three-Dots · itemSpacing · 6   (dot gap, visual tuning — not rhythm)
//   That is the whole list. See (b) above.
// ============================================================================

const CONFIG = {
  MODE: 'report',    // 'report' | 'fix'
  SCOPE: 'file',     // 'file' (adoption everywhere) | 'masters' (❖ Components only)
  ONLY_PAGE: null,   // string OR array of page names — scope the adoption pass. Use this to avoid a full-file sweep, which drops the bridge.
  RUN_BASE: true,    // base lint (always ❖ Components masters)
  RUN_ADOPTION: true,
};

// --- Device chrome + spacing exceptions -------------------------------------
const DEVICE_RE = /status bar|home indicator|cursor|device ui/i;

const SPACING_EXCEPTIONS = [
  { comp: /Three-Dots/, prop: /^itemSpacing$/, val: 6, note: 'dot gap (visual tuning)' },
];
function isSpacingException(compName, prop, val) {
  return SPACING_EXCEPTIONS.some(e => e.comp.test(compName) && e.prop.test(prop) && e.val === val);
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
  // added v2.5 — doc-chrome Header surface, previously flagged only because the
  // instance ROOT is not "inside an instance". Fix (d) also covers this, but the
  // key is listed so a root-level binding is sanctioned on its own merits.
  '9e953ab4f73edfb659c6b5f74adc04b76ae46bfe',
  // added v2.8 (2026-09-07) — `Colors/tertiary/green`, a foreign-library
  // colour on a 94x23 frame named `Figma` (an ELLIPSE + a TEXT `Headline`)
  // nested five levels inside the remote `Header` doc-chrome component,
  // whose own key 03b9ebb2757… is already sanctioned below. 28 occurrences,
  // one per section-header banner on ❖ Components. Not designer drift: no
  // instance overrides the node (`isLocalOverride: false`), and the main
  // component does not carry the binding either, so all three existing
  // sanction paths miss it — the component is allowlisted, the variable was
  // not, and the binding sits on a descendant rather than the instance root.
  //
  // ⚠️ PROVISIONAL. This suppresses a report; it does not fix the file. A
  // foreign brand mark still renders in the doc chrome of a template headed
  // for client projects and possibly public release. Every duplicate carries
  // 28 Figma-green badges. The real fix is replacing `Header` with a LOCAL
  // component — which also removes the recurring source that produced the
  // 2026-07-30 root-inheritance false positive on this same component.
  // Deferred until after the pilots on Fabi's call, 2026-09-07. Delete this
  // entry when Header is localised.
  'ad1ad5639b2a3cec8fd6b481a6f259cf0df1035b',
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
]);

// --- Shared lookups ----------------------------------------------------------
const allVars = await figma.variables.getLocalVariablesAsync();
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const semColl  = collections.find(c => c.name === '2. Semantic');
const primColl = collections.find(c => c.name === '1. Primitives');
const compColl = collections.find(c => c.name === '3. Component');   // v2.5 (c)
if (!semColl || !primColl) {
  return { verdict: '⚠️ CONFIG ERROR — expected "1. Primitives" and "2. Semantic" not found. Found: ' + collections.map(c => c.name).join(', ') };
}
const lightId    = (semColl.modes.find(m => m.name === 'Light') || semColl.modes[0]).modeId;
const primModeId = primColl.modes[0].modeId;
const localVarIds = new Set(allVars.map(v => v.id));
const vname = {};
const semIds  = new Set();
const compIds = new Set();                                            // v2.5 (c)
for (const v of allVars) {
  vname[v.id] = v.name;
  if (v.variableCollectionId === semColl.id) semIds.add(v.id);
  if (compColl && v.variableCollectionId === compColl.id) compIds.add(v.id);
}
const localStyleIds = new Set();
for (const s of [...await figma.getLocalTextStylesAsync(), ...await figma.getLocalPaintStylesAsync(),
                 ...await figma.getLocalEffectStylesAsync(), ...await figma.getLocalGridStylesAsync()]) localStyleIds.add(s.id);

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
// NOTE: this resolver matches the mode BY NAME at every alias hop. Taking
// Object.keys(valuesByMode)[0] instead — as an earlier ad-hoc check did —
// silently reports EVERY mode-flipping token as mode-invariant.
// v2.7 — COMPOSE_COLOR. Figma's composed-color feature stores an alias-plus-
// alpha as { type:'VARIABLE_EXPRESSION', expressionFunction:'COMPOSE_COLOR',
// expressionArguments:[ alias, alphaPercent ] }. v2.6 fell through to `return
// val` here, so valKey() read .r/.g/.b off the expression object and every
// composed token hashed to 'COLOR|NaN,NaN,NaN,1000'. They collided into one
// localIndex bucket, which is what fix mode uses to judge "value-identical" —
// so fix mode could rebind a node to the WRONG composed token and call it a
// safe match. Live case: color/overlay/10|50|80.
// alphaMul carries accumulated alpha down the alias chain, so a composed token
// aliasing another composed token multiplies correctly.
async function resolveVal(v, modeName) {
  let cur = v;
  let alphaMul = 1;
  for (let g = 0; g < 10; g++) {
    const c = await figma.variables.getVariableCollectionByIdAsync(cur.variableCollectionId);
    const m = (c && (c.modes.find(x => x.name === modeName) || c.modes[0]));
    const val = cur.valuesByMode[m ? m.modeId : Object.keys(cur.valuesByMode)[0]];
    if (val && val.type === 'VARIABLE_ALIAS') { const t = await getVarCached(val.id); if (!t) return null; cur = t; continue; }
    if (val && val.type === 'VARIABLE_EXPRESSION' && val.expressionFunction === 'COMPOSE_COLOR') {
      const args = val.expressionArguments || [];
      const base = args[0];
      const pct  = args[1];
      // alpha arg is a percentage (10 = 10%). Guard against a future variable-
      // valued alpha: if it isn't a plain number, we cannot resolve it, and
      // returning null is correct — an unresolvable value must never match.
      if (typeof pct !== 'number') return null;
      alphaMul = alphaMul * (pct / 100);
      if (base && base.type === 'VARIABLE_ALIAS') {
        const t = await getVarCached(base.id); if (!t) return null; cur = t; continue;
      }
      if (base && 'r' in base) {
        return { r: base.r, g: base.g, b: base.b, a: (base.a === undefined ? 1 : base.a) * alphaMul };
      }
      return null;
    }
    if (val && typeof val === 'object' && 'r' in val && alphaMul !== 1) {
      return { r: val.r, g: val.g, b: val.b, a: (val.a === undefined ? 1 : val.a) * alphaMul };
    }
    // Unknown expression function — do not guess. null never matches, so fix
    // mode reports rather than rebinds. Add the function here when it appears.
    if (val && val.type === 'VARIABLE_EXPRESSION') return null;
    return val;
  }
  return null;
}
function valKey(val, type) {
  if (val === null || val === undefined) return null;
  // v2.7 — alpha was already in the key, but was always 1 for composed tokens
  // because resolveVal never produced one. It is load-bearing now: overlay/10
  // and overlay/80 share r,g,b and differ ONLY in alpha.
  if (type === 'COLOR') {
    if (typeof val !== 'object' || !('r' in val)) return null;   // never key off a non-color
    return [val.r, val.g, val.b, val.a === undefined ? 1 : val.a].map(x => Math.round(x * 1000)).join(',');
  }
  return String(val);
}

// Index local variables by resolved value for fix-mode matching
const localIndex = {};
for (const v of allVars) {
  const isSem = v.variableCollectionId === semColl.id;
  const isPrim = v.variableCollectionId === primColl.id;
  if (!isSem && !isPrim) continue;
  const val = await resolveVal(v, 'Light');
  const k = v.resolvedType + '|' + valKey(val, v.resolvedType);
  (localIndex[k] = localIndex[k] || []).push({ v, tier: isSem ? 'semantic' : 'primitive' });
}

// =============================== A. BASE LINT ================================
const base = { offTierBindings: {}, rawPaints: {}, hardRadius: {}, unstyledText: [], rawEffects: [],
               hardSpacing: {}, spacingExceptions: 0 };
const comps = figma.root.children.find(p => p.name === '❖ Components');
if (!comps) return { verdict: '⚠️ CONFIG ERROR — page "❖ Components" not found.' };
await comps.loadAsync();

if (CONFIG.RUN_BASE) {
for (const m of comps.findAll(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.parent.type !== 'COMPONENT_SET')) {
  for (const n of [m, ...m.findAll(() => true)]) {
    if (insideInstance(n)) continue;
    const bv = n.boundVariables || {};
    // 1. bindings outside the Semantic + Component tiers          [v2.5 (c)]
    for (const b of [...(bv.fills || []), ...(bv.strokes || [])]) {
      if (semIds.has(b.id) || compIds.has(b.id)) continue;
      if (!vname[b.id]) continue;
      const k = vname[b.id];
      base.offTierBindings[k] = base.offTierBindings[k] || new Set();
      base.offTierBindings[k].add(m.name);
    }
    const isMasterRoot = (n === m) || (n.parent && n.parent.type === 'COMPONENT_SET');
    if (!isMasterRoot) {
      for (const kind of ['fills', 'strokes']) {
        if (!Array.isArray(n[kind])) continue;
        for (const p of n[kind]) if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) {
          base.rawPaints[m.name] = (base.rawPaints[m.name] || 0) + 1;
        }
      }
    }
    // v2.5 (e) — COMPONENT_SET roots are the purple-dashed variant container.
    // They never ship; the spacing check has always skipped them.
    if ('topLeftRadius' in n && n.type !== 'INSTANCE' && n.type !== 'COMPONENT_SET') {
      for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
        if (typeof n[c] === 'number' && n[c] > 0 && !bv[c]) {
          const k = m.name + ' (' + n[c] + 'px)';
          base.hardRadius[k] = (base.hardRadius[k] || 0) + 1;
        }
      }
    }
    // 6. Hardcoded padding/gap
    if (n.type !== 'COMPONENT_SET' && n.type !== 'INSTANCE' &&
        'layoutMode' in n && n.layoutMode !== 'NONE' && !DEVICE_RE.test(m.name)) {
      const checkSpace = (val, prop) => {
        if (typeof val !== 'number' || val <= 0) return;
        if (bv[prop]) return;
        if (isSpacingException(m.name, prop, val)) { base.spacingExceptions++; return; }
        const key = m.name + ' · ' + prop + ' ' + val + 'px';
        base.hardSpacing[key] = (base.hardSpacing[key] || 0) + 1;
      };
      for (const p of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) if (p in n) checkSpace(n[p], p);
      if ('itemSpacing' in n && typeof n.itemSpacing === 'number') {
        // v2.5 (a) — ABSOLUTE children don't participate in auto-layout, so
        // they can't make a gap meaningful. Count only auto-layout children.
        const autoKids = (n.children || []).filter(c => c.layoutPositioning !== 'ABSOLUTE').length;
        const inert = n.primaryAxisAlignItems === 'SPACE_BETWEEN' || autoKids < 2;
        if (!inert) checkSpace(n.itemSpacing, 'itemSpacing');
      }
      if (n.layoutWrap === 'WRAP' && 'counterAxisSpacing' in n) checkSpace(n.counterAxisSpacing, 'counterAxisSpacing');
    }
    if (n.type === 'TEXT' && !(n.textStyleId && n.textStyleId !== '' && n.textStyleId !== figma.mixed)) {
      base.unstyledText.push(m.name + ' > ' + n.name);
    }
    if ('effects' in n && n.effects && n.effects.length > 0 && !(n.effectStyleId && n.effectStyleId !== '')) {
      base.rawEffects.push(m.name + ' > ' + n.name);
    }
  }
}
}
for (const k of Object.keys(base.offTierBindings)) base.offTierBindings[k] = [...base.offTierBindings[k]].join(', ');
base.unstyledText = [...new Set(base.unstyledText)];
base.rawEffects = [...new Set(base.rawEffects)];
base.hardSpacingTotal = Object.values(base.hardSpacing).reduce((a, b) => a + b, 0);

// ====================== C. PROPERTY BINDING PARITY + DEFAULTS TRAP ==========
// Added v2.6 (2026-08-14). Catches two defect classes the base + adoption passes
// are structurally blind to, because both are about component PROPERTIES rather
// than paints, spacing or foreign material.
//
//   C1. BINDING PARITY — a non-variant property (BOOLEAN / TEXT / INSTANCE_SWAP
//       / SLOT) that is bound in some variants of a set but not others. On the
//       unbound variants the control still appears in the properties panel and
//       does nothing. This is how Textarea shipped with all six of its props
//       dead on every hover and focus variant, including the Placeholder text.
//       Root cause is almost always variants duplicated before the property
//       existed, then never re-linked.
//
//   C2. DEFAULTS TRAP — a property whose defaultValue is TRUE controlling a
//       layer that sits inside a container hidden by default. The toggle reads
//       "on" on a fresh instance and renders nothing. Field and Textarea both
//       shipped this on their Footer subtree.
//
// A property missing from EVERY variant is not reported — that is an orphaned
// property, not a parity break, and it is loud enough to spot by hand.
const PARITY_EXCEPTIONS = [
  // Legitimate: a numbered pagination item has a digit, not a label. The prop
  // only applies to the previous / next items.
  { set: /Pagination \/ Item/, prop: /^Show Label$/ },
  // Legitimate: a disabled chip is not removable, so the close affordance is
  // deleted rather than hidden on the six disabled variants.
  { set: /^Chip$/,            prop: /^Close Icon$/ },
  // Legitimate: a bullet list item has no number to set.
  { set: /List Item/,         prop: /^Number$/ },
];
function isParityException(setName, propName) {
  return PARITY_EXCEPTIONS.some(e => e.set.test(setName) && e.prop.test(propName));
}

const props = { bindingGaps: {}, defaultsTraps: [], parityExceptionsAccepted: 0, setsChecked: 0 };

if (CONFIG.RUN_BASE) {
for (const s of comps.findAll(n => n.type === 'COMPONENT_SET')) {
  props.setsChecked++;
  const defs = s.componentPropertyDefinitions || {};
  const nonVariant = Object.keys(defs).filter(k => defs[k].type !== 'VARIANT');

  // ---- C1 -----------------------------------------------------------------
  if (nonVariant.length) {
    const boundPerVariant = {};
    for (const v of s.children) {
      const bound = new Set();
      (function walk(n) {
        const r = n.componentPropertyReferences;
        if (r) for (const field in r) bound.add(r[field]);
        if ('children' in n) for (const c of n.children) walk(c);
      })(v);
      boundPerVariant[v.name] = bound;
    }
    for (const k of nonVariant) {
      const missing = Object.keys(boundPerVariant).filter(vn => !boundPerVariant[vn].has(k));
      if (!missing.length) continue;
      if (missing.length === s.children.length) continue;   // orphaned, not a parity break
      const propName = k.split('#')[0];
      if (isParityException(s.name, propName)) { props.parityExceptionsAccepted++; continue; }
      (props.bindingGaps[s.name] = props.bindingGaps[s.name] || []).push(
        propName + ' (' + defs[k].type + ') dead in ' + missing.length + '/' + s.children.length +
        ' — e.g. ' + missing.slice(0, 3).join(' | '));
    }
  }

  // ---- C2 -----------------------------------------------------------------
  for (const v of s.children) {
    (function walk(n, path, hiddenAncestor) {
      const ref = n.componentPropertyReferences && n.componentPropertyReferences.visible;
      let effHidden = hiddenAncestor;
      if (ref && defs[ref]) {
        if (defs[ref].defaultValue === true && hiddenAncestor) {
          props.defaultsTraps.push(s.name + ' / ' + v.name + path + '/' + n.name +
                                   ' [' + ref.split('#')[0] + ' defaults true, ancestor hidden]');
        }
        if (defs[ref].defaultValue === false) effHidden = true;
      } else if (n.visible === false) {
        effHidden = true;
      }
      if ('children' in n) for (const c of n.children) walk(c, path + '/' + n.name, effHidden);
    })(v, '', false);
  }
}
}
props.defaultsTraps = [...new Set(props.defaultsTraps)];
const propsClean = Object.keys(props.bindingGaps).length === 0 && props.defaultsTraps.length === 0;


// ============================ B. ADOPTION LINT ================================
const adoption = {
  flaggedVars: {}, danglingVars: {}, flaggedStyles: {}, flaggedRemoteInstances: {},
  sanctionedCounts: { varBindings: 0, styleRefs: 0, instances: 0 },
  fixes: [], needsDecision: [], pagesScanned: [],
};
let pages = CONFIG.SCOPE === 'masters' ? [comps] : figma.root.children.filter(p => p.name.indexOf('---') !== 0);
if (CONFIG.ONLY_PAGE) { const only = Array.isArray(CONFIG.ONLY_PAGE) ? CONFIG.ONLY_PAGE : [CONFIG.ONLY_PAGE]; pages = pages.filter(p => only.indexOf(p.name) > -1); }
let nodesScanned = 0;

if (CONFIG.RUN_ADOPTION) {
for (const page of pages) {
  await page.loadAsync();
  adoption.pagesScanned.push(page.name);
  for (const n of page.findAll(() => true)) {
    nodesScanned++;
    const inInst = insideInstance(n);
    // v2.5 (d) — is this node itself an instance of a sanctioned component?
    let selfSanctioned = false;
    if (n.type === 'INSTANCE') {
      try { const mc = await n.getMainComponentAsync(); if (mc && SANCTIONED_COMPONENT_KEYS.has(mc.key)) selfSanctioned = true; } catch (e) {}
    }
    const chromeOK = inInst || selfSanctioned;

    // 7. foreign variable bindings
    for (const e of aliasEntries(n.boundVariables)) {
      if (localVarIds.has(e.id)) continue;
      const v = await getVarCached(e.id);
      const loc = page.name + ' | ' + container(n);
      if (!v) { const k = loc + ' | <unresolvable> @' + e.prop; adoption.danglingVars[k] = (adoption.danglingVars[k] || 0) + 1; continue; }
      if (!v.remote) { const k = loc + ' | ' + v.name + ' (deleted local) @' + e.prop; adoption.danglingVars[k] = (adoption.danglingVars[k] || 0) + 1; continue; }
      if (SANCTIONED_VAR_KEYS.has(v.key) && chromeOK) { adoption.sanctionedCounts.varBindings++; continue; }
      const key = loc + ' | ' + v.name + ' @' + e.prop + (inInst ? ' [in-instance]' : (selfSanctioned ? ' [sanctioned-instance-root]' : ''));
      adoption.flaggedVars[key] = (adoption.flaggedVars[key] || 0) + 1;
      if (CONFIG.MODE === 'fix' && !inInst) {
        const val = await resolveVal(v, 'Light');
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
      if (s && SANCTIONED_STYLE_KEYS.has(s.key) && (chromeOK || page.name !== '❖ Components')) { adoption.sanctionedCounts.styleRefs++; continue; }
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
}

const clean = Object.keys(adoption.flaggedVars).length === 0 &&
              Object.keys(adoption.danglingVars).length === 0 &&
              Object.keys(adoption.flaggedStyles).length === 0 &&
              Object.keys(adoption.flaggedRemoteInstances).length === 0;
const spacingClean = Object.keys(base.hardSpacing).length === 0;
return {
  version: 'v2.8',
  verdict: !CONFIG.RUN_ADOPTION ? 'ℹ️ adoption pass skipped'
         : (clean ? '✅ ADOPTION CLEAN — no unsanctioned foreign material' : '⚠️ FOREIGN MATERIAL FLAGGED'),
  spacingVerdict: !CONFIG.RUN_BASE ? 'ℹ️ base pass skipped'
         : (spacingClean ? '✅ SPACING BOUND — no unbound spacing outside documented exceptions'
                         : '⚠️ UNBOUND SPACING FOUND — ' + base.hardSpacingTotal + ' node-props'),
  propsVerdict: !CONFIG.RUN_BASE ? 'ℹ️ base pass skipped'
         : (propsClean ? '✅ PROPERTIES SOUND — every property bound in every variant, no defaults traps'
                       : '⚠️ PROPERTY DEFECTS — ' + Object.keys(props.bindingGaps).length + ' set(s) with dead props, '
                         + props.defaultsTraps.length + ' defaults trap(s)'),
  nodesScanned,
  base,
  props,
  adoption,
};
