// ============================================================================
// figma-lint v3.10 — COMPONENTS + UI DESIGNS + FOREIGN-MATERIAL ADOPTION
//
// Renamed 2026-08-06 from lint-components.js. It was never component-only after
// v3.0, and 'ds-lint' would have told a designer working on screens that it was not
// for them, which is the adoption problem the design lint exists to solve. The
// figma- prefix marks which SIDE of the pipeline this belongs to: Figma-side checks
// here, repo-side checks in `npm run tokens`. No version in the filename, or the raw
// URL changes every release and breaks the Docs card.
//
// ⚠️ PROVENANCE: lines below are v2.2 (knowledge copy) + lint-v2_3-patch.md
//    applied mechanically + the v3.0 additions. DIFF THIS AGAINST THE LIVE v2.3
//    COPY BEFORE USE — if anything else was edited live on 2026-07-31, this
//    file silently reverts it.
//
// v3.10 change vs v3.9 (2026-08-06): the first real run's own output exposed a
//   fourth bug — instance ROOTS were being judged on properties inherited from their
//   master, producing 8 unfixable findings. See the comment at the instance guard.
//   After the fix: 3 screens, 0 findings. STILL UNEXERCISED by any real run:
//   detached, handBuilt, lockedTheme, noTextStyle, handRadius, paletteColor,
//   handSpacing, handShadow, hiddenLayer, namedLikeComp. The 🎨 UI Design scaffold
//   is nearly empty (9 non-instance nodes), so it only exercised handColor,
//   spacingGap, targeting, the scaffolding census and override classification.
//
// v3.9 change vs v3.8 (2026-08-06): FIRST REAL RUN against 🎨 UI Design. Three fixes,
//   every one from live evidence rather than reasoning:
//     - CRASH: a CONNECTOR has no findAll, and the SECTION expansion targeted it, so
//       the walk died with 'TypeError: not a function' before any check ran. Targets
//       must be containers; instances are honoured only when named explicitly.
//     - layoutPositioning / counterAxisSizingMode / primaryAxisSizingMode moved into
//       OVERRIDE_ALLOW. Every Device UI instance overrides them to pin itself to the
//       screen edge and stretch to the breakpoint width. Layout intent, not drift.
//     - 'boundVariables' no longer flags as one blunt field.
//   Also corrected a TWICE-WRONG prediction: Annotation instances neither flag as
//   unstyled text (they sit inside instances) NOR carry any overrides at all.
//
// v3.8 change vs v3.7 (2026-08-06): three fixes found by reading 🎨 UI Design, which
//   turned out NOT to be empty (139 nodes of template scaffolding):
//     - Template scaffolding is skipped by SANCTIONED_COMPONENT_KEYS membership,
//       not by layer name. Annotation / Group Marker / Status Bar / '_ 🔒' furniture
//       is meant to be filled in by hand. Unrecognised kinds are listed in the
//       report so the allowlist grows from evidence.
//     - SECTION targets expand to their child frames. A section is chrome; the
//       screens are inside it, and treating the section as the screen broke the
//       screen-root rule in check 12.
//     - CONNECTOR / STICKY / WIDGET nodes skipped as board furniture.
//
// v3.7 change vs v3.6 (2026-08-06): page classification corrected against the LIVE
//   page list — icons / navigation / how-to-use were being treated as design
//   surfaces, and dash-divider pages were counted. Exclusion stays the default so
//   pages a designer adds later are checked, not skipped. Playground and other
//   exploration pages are now linted but NON-GATING; 🎨 UI Design is gated.
//
// v3.6 change vs v3.5 (2026-08-06): SPACING_SCALE extended to 56/64/80/96 to match
//   the four new spacing rungs created in 1. Primitives.
//
// v3.5 change vs v3.3 (2026-08-06): removed the maintainer's name from a
//   designer-facing message — client-file designers have no idea who that is.
//   Unbound spacing of 0 was added in v3.4 and REVERTED here; see the comment at
//   the design spacing check for why, so it does not get re-litigated.
//
// v3.3 change vs v3.2 (2026-08-06): added `designReport`, a plain-text designer
//   report — grouped by screen, one short sentence per issue naming the FIX not the
//   rule, a Figma deep link per row, capped at 6 examples per issue. The
//   count-keyed maps were written for the maintainer and are gone; structured rows
//   live in design.perScreen[screen].rows.
//
// v3.2 change vs v3.1 (2026-08-06): check 11 (detachment) now FAILS a screen, per
//   Fabi. Name matching alone could not carry that, so it is now two detectors —
//   name match plus a structural control fingerprint that survives a rename — and
//   the generic-name matches were split into a report-only bucket.
//   ⚠️ REQUIRES A NAMING RULE IN THE FILE: a wrapper frame must not be named
//   exactly after a component. Without it, DETACH_IGNORE has to grow per screen,
//   which is the allowlist antipattern this project already paid for once.
//
// v3.1 change vs v3.0 (2026-08-06): the design lint takes an explicit TARGET
//   (selection / node ids / pages / auto) and reports PER SCREEN, because designers
//   lint the screens they own, not the file. Also fixes a v3.0 bug: check 12
//   compared against the walk's starting node, so a mid-screen target made its own
//   pinned semantic mode look legal.
//
// v3.0 change vs v2.3 (2026-08-06): the base lint was hardcoded to ❖ Components,
//   so raw hex / unbound radius / unstyled text / unbound spacing were invisible
//   on every other page. v3.0 splits the file into SYSTEM and DESIGN surfaces and
//   runs a per-surface rule profile, plus three new design-only checks:
//     10. Instance override drift (non-allowlisted overriddenFields)
//     11. Detached / hand-built primitives (name matches a master)
//     12. Semantic mode pinned below a screen root
//   Also folds in the owed itemSpacing refinement (ABSOLUTE children).
//   FIX MODE IS NEVER APPLIED TO DESIGN SURFACES — rebinding inside a screen is
//   a design act, not a value-identical repair.
//
// (v2.2 header retained below for the check numbering and exception rationale.)
// ----------------------------------------------------------------------------
// (Historical header, from when this was lint-components.js v2.2/v2.3.)
// Component lint v2.3 — base property lint + FOREIGN-BINDING ADOPTION LINT
// Run via the MCP Bridge plugin (Cloud Mode) — ask Claude to fetch this raw
// file and run it. Report mode is read-only; fix mode rebinds only value-
// identical foreign bindings.
//
// File: [Client Name] — [Platform] UI + DS (2026 Tailwind)  key Vk0disHgUAm5Z7iNQiA4V6
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
//     1. Primitive color bindings (should match documented exceptions only)
//     2. Raw solid paints (unbound hex) — master-root canvas fills excluded
//     3. Hardcoded corner radii (unbound, > 0)
//     4. Text nodes without a text style (or mixed)
//     5. Effects without an effect style
//     6. Hardcoded padding/gap (unbound, > 0) outside documented exceptions   [NEW v2.2]
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
//     Fix mode does NOT touch spacing — the spacing check is report-only;
//     value-identical spacing binds are done in the spacing-binding session,
//     and off-scale spacing is a human decision (see the exceptions below).
//
// DOCUMENTED EXCEPTIONS — COLOR/RADIUS (do not "fix"):
//   - primary/300, primary/400 mid-ramp tints (Stepper, Modal placeholder,
//     Avatar, Button__circle focus ring); primary/200 on Pagination Item
//   - neutral/900 on Tooltip surface + Avatar (always-dark chip pattern)
//   - Flags + Input__dropdown flag illustration (literal colors)
//   - color/overlay/* + color/shadow/* primitives (no semantic equivalent)
//   - 📱 Device UI masters (Status Bar, Home Indicator, Cursor): iOS chrome
//     artwork — raw paints, sub-pixel radii, unstyled Time/Date/100% text.
//
// DOCUMENTED EXCEPTIONS — SPACING (kept raw by decision, 2026-07-18; keyed to
//   component + property + value so the allowlist means "this value on this
//   component is intentional", NOT "this number is always fine"). These are the
//   ONLY genuine component-internal off-scale spacings — each a structural
//   offset or visual-tuning value, not rebrandable rhythm:
//   - Three-Dots   · itemSpacing · 6    (dot gap, visual tuning — not rhythm)
//   - Stepper      · paddingRight · 92   (structural offset in a fixed track)
//   - Stepper      · paddingRight · 296  (structural offset)
//   - Progress__bar · paddingRight · 206 (structural offset)
//   OUT OF SCOPE — handled by the set-root / instance skips, deliberately NOT
//   allowlisted (allowlisting them would hide real drift on those components):
//   - Avatar 54/79 and Spinner 64 sit on their COMPONENT_SET roots — variant-
//     arrangement chrome (purple-dashed container), never ships. Same class as
//     the Alert 31px wrap gap. The set-root skip excludes them.
//   - The Spinner "6px" is a nested Three-Dots INSTANCE (inherits the Three-Dots
//     master gap) — covered by the instance skip + the Three-Dots rule above.
//   - The Input__dropdown 10px item gap was NOT kept — snapped to spacing/2 (8px).
// ============================================================================

const CONFIG = {
  MODE: 'report',       // 'report' | 'fix'  (fix never touches design surfaces)
  SCOPE: 'file',        // 'file' (adoption lint everywhere) | 'masters' (❖ Components only)
  SURFACES: 'all',      // 'all' | 'system' | 'designs'   — which base lint to run
  SECTION_RHYTHM: 'gap',// 'gap'    : unbound design spacing with NO token at that
                        //            value is reported as a TOKEN GAP, not a failure
                        // 'strict' : it fails the design verdict too
  TARGET: {             // WHICH SCREENS. See the A2 header.
    mode: 'auto',       // 'auto' | 'selection' | 'ids' | 'pages'
    ids: [],            // ['915:102', '915-102'] — both separators accepted
    pages: [],          // exact page names
    profile: 'auto',    // 'auto' (by page) | 'design' (force) | 'system' (skip)
  },
};

// --- Surface classification --------------------------------------------------
// By EXCLUSION, so it survives client files where designers name pages freely.
// Substring match, emoji-insensitive. If a client page is misclassified, add it
// to FORCE_DESIGN / FORCE_SYSTEM rather than loosening the regex.
// Exclusion, NOT an allowlist: designers add pages freely in client files, and any
// page this does not recognise must default to 'design' so new work gets checked
// rather than silently skipped. Verified against the live page list 2026-08-06 —
// icons / navigation / how-to-use were being misread as design surfaces.
const SYSTEM_PAGE_RE = /components|foundations|stickersheet|cover|docs|archive|variables|rebrand|icons|navigation|how to use/i;
// Design pages that are NOT gated. Playground is for explorations, so drift there
// is reported but never fails — an exploration is rough on purpose. 🎨 UI Design is
// final work ready for handoff, so it IS gated. (Fabi, 2026-08-06.)
const UNGATED_PAGE_RE = /playground|exploration|scratch|wip|sandbox/i;
const FORCE_DESIGN = [];   // page names to treat as design regardless
const FORCE_SYSTEM = [];   // page names to treat as system regardless
function surfaceOf(pageName) {
  if (FORCE_DESIGN.some(x => x === pageName)) return 'design';
  if (FORCE_SYSTEM.some(x => x === pageName)) return 'system';
  // Divider pages ('-----') and any other empty page: nothing to lint either way.
  if (/^[\s\-_=~.]+$/.test(pageName)) return 'system';
  return SYSTEM_PAGE_RE.test(pageName) ? 'system' : 'design';
}
const isGated = pageName => !UNGATED_PAGE_RE.test(pageName);

// --- Instance override classification (check 10) ------------------------------
// ALLOWED = design intent. These are why instances exist; flagging them flags
// every legitimate instance in the file.
const OVERRIDE_ALLOW = new Set([
  'characters', 'componentProperties', 'mainComponent', 'name',
  'width', 'height', 'layoutSizingHorizontal', 'layoutSizingVertical',
  'layoutGrow', 'layoutAlign', 'x', 'y', 'relativeTransform', 'constraints',
  // Added 2026-08-06 from evidence: every Status Bar and Home Indicator on
  // 🎨 UI Design overrides these to pin itself to the screen edge and stretch to the
  // breakpoint width. Same family as x/y/width/height, not a design change.
  'layoutPositioning', 'counterAxisSizingMode', 'primaryAxisSizingMode',
]);
// REVIEW = reported, does NOT fail the verdict. This kit expresses optional
// elements as BOOLEAN properties, so a raw `visible` override usually means a
// property was bypassed — but that is a hypothesis, not evidence yet.
const OVERRIDE_REVIEW = new Set([
  'visible', 'locked', 'expanded', 'isMask', 'explicitVariableModes',
]);
// Everything else FLAGS, including unrecognized field names (fail open, same
// principle as the v2.3 patch). Note: a `fills` override flags EVEN IF it is
// bound to a semantic token — recolouring a Button instance instead of picking
// Style=Error is the actual failure mode, and an "is it bound?" test passes it.

// --- Annotation skip (design surfaces only) ----------------------------------
// Spec notes on a screen would flag as unstyled text forever. Constraint lives
// in the file, not the docs: name the layer `// ...` or put it in a `Notes` frame.
const ANNOTATION_RE = /^\s*\/\//;
function isAnnotation(n) {
  let a = n;
  while (a && a.type !== 'PAGE') {
    if (ANNOTATION_RE.test(a.name) || /^notes$/i.test(a.name)) return true;
    a = a.parent;
  }
  return false;
}

// --- The spacing scale, for the design-surface spacing check ------------------
// EXTENDED 2026-08-06: spacing/14=56, /16=64, /20=80, /24=96 added to 1. Primitives
// for screen-level rhythm (spacing/12=48 used to be the ceiling). Those are
// Tailwind's next four rungs, which is what keeps the zero-translation contract.
// Bindings to Responsive grid/margin + grid/gutter also count as bound. Unbound
// values with no token at all land in the TOKEN GAP bucket (CONFIG.SECTION_RHYTHM).
// KEEP IN SYNC with 1. Primitives. If a rung is added in Figma, add it here.
const SPACING_SCALE = new Set([0,4,8,12,16,20,24,28,32,36,40,44,48,56,64,80,96]);

// --- Device chrome + spacing exceptions -------------------------------------
const DEVICE_RE = /status bar|home indicator|cursor|device ui/i;

// Keyed spacing exceptions. comp/prop are regexes tested against the master
// name and the property name; val is the exact px value. All three must match.
// RETIRED 2026-07-31: Stepper paddingRight 92 & 296 and Progress__bar 206. They
// were never structural offsets — each was a hardcoded progress percentage,
// because `Fill` was FILL-sized so paddingRight on the parent Bar set its length.
// Fixed by pinning Fill.width and zeroing the padding. If any reappear, pin the
// width — do NOT re-allowlist.
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
const vname = {}; const semIds = new Set(); const respIds = new Set();
const respColl = collections.find(c => c.name === 'Responsive');
for (const v of allVars) {
  vname[v.id] = v.name;
  if (v.variableCollectionId === semColl.id) semIds.add(v.id);
  if (respColl && v.variableCollectionId === respColl.id) respIds.add(v.id);
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

// v3.0: itemSpacing is inert when SPACE_BETWEEN, or when fewer than 2 children
// participate in auto-layout. ABSOLUTE children (focus `Ring`) do not consume it.
function isInertSpacing(n) {
  if (n.primaryAxisAlignItems === 'SPACE_BETWEEN') return true;
  const autoKids = (n.children || []).filter(c => c.layoutPositioning !== 'ABSOLUTE').length;
  return autoKids < 2;
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
               hardSpacing: {}, spacingExceptions: 0 };
const comps = figma.root.children.find(p => /components/i.test(p.name));
if (!comps) return { verdict: '⚠️ CONFIG ERROR — no page matching /components/i found.' };
await comps.loadAsync();
for (const m of (CONFIG.SURFACES === 'designs' ? [] : comps.findAll(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.parent.type !== 'COMPONENT_SET'))) {
  for (const n of [m, ...m.findAll(() => true)]) {
    if (insideInstance(n)) continue;
    const bv = n.boundVariables || {};
    for (const b of [...(bv.fills || []), ...(bv.strokes || [])]) {
      if (!semIds.has(b.id) && vname[b.id]) {
        const k = vname[b.id];
        base.primColorBindings[k] = base.primColorBindings[k] || new Set();
        base.primColorBindings[k].add(m.name);
      }
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
    if ('topLeftRadius' in n && n.type !== 'INSTANCE') {
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
        // v3.0: count AUTO-LAYOUT children only. ABSOLUTE children (e.g. the
        // focus `Ring`) don't consume itemSpacing, so counting them made
        // itemSpacing look active on 15 Pagination variants — same false-positive
        // class as the v2.3 root-inheritance patch.
        if (!isInertSpacing(n)) checkSpace(n.itemSpacing, 'itemSpacing');
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
for (const k of Object.keys(base.primColorBindings)) base.primColorBindings[k] = [...base.primColorBindings[k]].join(', ');
base.unstyledText = [...new Set(base.unstyledText)];
base.rawEffects = [...new Set(base.rawEffects)];
base.hardSpacingTotal = Object.values(base.hardSpacing).reduce((a, b) => a + b, 0);

// ======================= A2. DESIGN-SURFACE LINT (v3.10) =======================
// TARGETING. Designers lint the screens they own, not the file. Four ways in:
//   auto      — every top-level frame on every design page (the file-wide run)
//   selection — whatever is selected in Figma (the designer's own path)
//   ids       — node ids, '915:102' or '915-102' (paste a Figma URL's node-id)
//   pages     — top-level frames on the named pages
// A SCOPED RUN IS NOT A FILE RUN. The verdict echoes what was targeted, and every
// screen gets its own result. Clean on 2 of 9 screens must never read as clean.
//
// PROFILE. 'auto' picks by page classification. Explicit 'design' overrides it,
// which is how a fixture frame on the Stickersheet (a SYSTEM page) gets linted.
//
// NO PER-SCREEN EXCEPTION LIST, deliberately. If a screen needs an exception it is
// a token gap or a component gap. Fix it there.
//
// OUTPUT. `report` is the designer-facing text: plain language, grouped by screen,
// with a Figma link per issue. The structured data stays in `design.perScreen` for
// tooling. Every message names the fix, not the rule.

// One row per issue. `sev` decides the verdict:
//   fail — counts against the screen
//   gap  — counts only when CONFIG.SECTION_RHYTHM === 'strict' (needs a new token)
//   note — never counts
const CHECKS = {
  detached:       { sev: 'fail', order: 1, msg: 'Not a library component. Swap it for the one from the library.' },
  handBuilt:      { sev: 'fail', order: 2, msg: 'Looks like a control built by hand. Use the library component.' },
  changedByHand:  { sev: 'fail', order: 3, msg: 'Component was changed by hand. Pick a variant or property instead.' },
  lockedTheme:    { sev: 'fail', order: 4, msg: 'Locked to one theme. This will not switch to dark mode.' },
  handColor:      { sev: 'fail', order: 5, msg: 'Color picked by hand. Use a theme color.' },
  paletteColor:   { sev: 'fail', order: 6, msg: 'Uses a raw palette color. Use a theme color so it rebrands.' },
  noTextStyle:    { sev: 'fail', order: 7, msg: 'Text has no text style applied.' },
  handShadow:     { sev: 'fail', order: 8, msg: 'Shadow set by hand. Apply a shadow style.' },
  handRadius:     { sev: 'fail', order: 9, msg: 'Corner radius typed by hand. Use a radius variable.' },
  handSpacing:    { sev: 'fail', order: 10, msg: 'Spacing typed by hand. A variable already exists for this size.' },
  spacingGap:     { sev: 'gap',  order: 11, msg: 'Spacing typed by hand, and no variable covers this size yet. Report it instead of fixing it.' },
  hiddenLayer:    { sev: 'note', order: 12, msg: 'A layer inside a component was hidden. Use the component toggle instead.' },
  namedLikeComp:  { sev: 'note', order: 13, msg: 'Frame is named after a component. Rename it, or make it an instance.' },
};
// Figma property names are jargon. Say what the designer sees.
const FIELD_WORDS = {
  fills: 'color', strokes: 'border color', strokeWeight: 'border width', strokeAlign: 'border position',
  cornerRadius: 'corners', topLeftRadius: 'corners', topRightRadius: 'corners',
  bottomLeftRadius: 'corners', bottomRightRadius: 'corners',
  effects: 'shadow', opacity: 'opacity', blendMode: 'blend mode', rotation: 'rotation',
  textStyleId: 'text style', fillStyleId: 'color style', effectStyleId: 'shadow style',
  strokeStyleId: 'border style', fontName: 'font', fontSize: 'text size', fontWeight: 'font weight',
  letterSpacing: 'letter spacing', lineHeight: 'line height', textCase: 'letter case',
  textDecoration: 'underline', textAlignHorizontal: 'text alignment', paragraphSpacing: 'paragraph spacing',
  itemSpacing: 'spacing', counterAxisSpacing: 'row spacing', layoutMode: 'layout direction',
  paddingLeft: 'padding', paddingRight: 'padding', paddingTop: 'padding', paddingBottom: 'padding',
  boundVariables: 'variable', clipsContent: 'clipping',
};
const fieldWord = f => FIELD_WORDS[f] || f;

const design = { target: null, targetErrors: [], perScreen: {}, scaffoldSeen: {}, screensScanned: 0, nodesScanned: 0, instancesScanned: 0 };

// Master-name index for check 11. Set names and member names.
const masterNames = new Set();
for (const m of comps.findAll(n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')) masterNames.add(m.name.trim().toLowerCase());
// Names too generic to accuse on their own. A match here becomes namedLikeComp
// (report-only); handBuilt still catches these structurally. SHRINK this list as
// the wrapper-naming rule lands. Do not grow it to silence findings.
const DETACH_IGNORE = new Set(['card','header','footer','content','container','row','column',
  'item','label','icon','group','frame','wrapper','section','list','text','image','divider']);

// A semantic mode may be pinned on a TRUE screen root only. v3.0 compared against
// the walk's starting node, so a mid-screen target made its own pinned mode look
// legal. Page/section parentage is the only reliable test.
function isTrueScreenRoot(n) { return !!(n.parent && (n.parent.type === 'PAGE' || n.parent.type === 'SECTION')); }
function pageOf(n) { let a = n; while (a && a.type !== 'PAGE') a = a.parent; return a; }

const FILE_KEY = (typeof figma.fileKey === 'string' && figma.fileKey) || 'Vk0disHgUAm5Z7iNQiA4V6';
const linkTo = id => 'https://www.figma.com/design/' + FILE_KEY + '/?node-id=' + String(id).replace(':', '-');

const designPages = figma.root.children.filter(p => surfaceOf(p.name) === 'design');

// --- resolve targets ---------------------------------------------------------
async function resolveTargets() {
  const T = CONFIG.TARGET, out = [];
  const push = (n, explicit) => {
    if (!n) return;
    if (n.type === 'PAGE') { design.targetErrors.push('That is a whole page (' + n.name + '). Use TARGET.mode "pages".'); return; }
    // A SECTION is organisational chrome, not a screen. The screens are inside it.
    // Without this, 'pages' mode made the section itself the screen and every frame
    // in it a mid-screen node, which breaks the screen-root rules (see check 12).
    if (n.type === 'SECTION') { for (const c of n.children) push(c, false); return; }
    // A CONNECTOR has no findAll, so making it a target crashed the walk before it
    // started (v3.8 skipped connectors INSIDE the walk but still targeted them).
    if (typeof n.findAll !== 'function') { design.targetErrors.push('Skipped ' + n.type + ' "' + n.name + '" — not a container, so it cannot be a screen.'); return; }
    // An instance is a component usage, not a screen. Only honour one if it was
    // named explicitly (selection / ids); never when auto-discovered from a page.
    if (n.type === 'INSTANCE' && !explicit) { design.targetErrors.push('Skipped "' + n.name + '" — that is a component placed on the page, not a screen.'); return; }
    if (insideInstance(n)) {
      // Hand-changes are recorded on the outermost component, outside this subtree,
      // so a target inside a component can only under-report. Refuse it.
      design.targetErrors.push('Skipped "' + n.name + '" — it sits inside a component. Select the component itself, or the whole screen.');
      return;
    }
    const pg = pageOf(n);
    if (!pg) { design.targetErrors.push('Skipped "' + n.name + '" — could not find its page.'); return; }
    const profile = T.profile === 'auto' ? surfaceOf(pg.name) : T.profile;
    if (profile !== 'design') { design.targetErrors.push('Skipped "' + n.name + '" on ' + pg.name + ' — that is a system page, not a design screen. Set TARGET.profile "design" to check it anyway.'); return; }
    out.push({ node: n, pageName: pg.name });
  };
  if (T.mode === 'selection') {
    const sel = figma.currentPage.selection;
    if (!sel.length) design.targetErrors.push('Nothing is selected. Select the screens to check, then run again.');
    for (const n of sel) push(n, true);
  } else if (T.mode === 'ids') {
    if (!T.ids.length) design.targetErrors.push('No node ids given in TARGET.ids.');
    for (const raw of T.ids) {
      const id = String(raw).replace('-', ':');
      let n = null; try { n = await figma.getNodeByIdAsync(id); } catch (err) {}
      if (!n) { design.targetErrors.push('Could not find ' + raw + ' in this file.'); continue; }
      await pageOf(n).loadAsync();
      push(n, true);
    }
  } else if (T.mode === 'pages') {
    if (!T.pages.length) design.targetErrors.push('No page names given in TARGET.pages.');
    for (const nm of T.pages) {
      const pg = figma.root.children.find(p => p.name === nm);
      if (!pg) { design.targetErrors.push('No page named exactly "' + nm + '".'); continue; }
      await pg.loadAsync();
      for (const c of pg.children) push(c, false);
    }
  } else {
    for (const pg of designPages) { await pg.loadAsync(); for (const c of pg.children) push(c, false); }
  }
  return out;
}

// --- per-screen lint ---------------------------------------------------------
async function lintScreen(root, pageName) {
  const items = [];
  const add = (check, node, where, detail) => items.push({
    check, layer: where || node.name, nodeId: node.id, link: linkTo(node.id), detail: detail || '',
  });

  for (const n of [root, ...root.findAll(() => true)]) {
    if (isAnnotation(n)) continue;
    if (n.type === 'CONNECTOR' || n.type === 'WIDGET' || n.type === 'STICKY') continue;  // board furniture

    // ---- 10. hand-changes on a component. Top-level components only: the
    //      override list reports nested layer ids, so one read covers all depths.
    if (n.type === 'INSTANCE' && !insideInstance(n)) {
      design.instancesScanned++;
      let mcName = n.name, mcKey = null, setKey = null;
      try {
        const mc = await n.getMainComponentAsync();
        if (mc) {
          const inSet = mc.parent && mc.parent.type === 'COMPONENT_SET';
          mcName = (inSet ? mc.parent.name + ' / ' : '') + mc.name;
          mcKey = mc.key; setKey = inSet ? mc.parent.key : null;
        }
      } catch (err) {}
      // SCAFFOLDING SKIP, by component KEY not by layer name. Annotation blocks,
      // Group Marker, Status Bar and the '_ 🔒' template furniture are MEANT to be
      // filled in by hand, so their overrides are intent, not drift. Keys cannot be
      // renamed by a designer; names can, which is why the earlier name-prefix idea
      // was wrong. Unrecognised kinds are logged to design.scaffoldSeen so the list
      // grows from evidence instead of guesswork.
      const sanctioned = (mcKey && SANCTIONED_COMPONENT_KEYS.has(mcKey)) || (setKey && SANCTIONED_COMPONENT_KEYS.has(setKey));
      design.scaffoldSeen[mcName] = design.scaffoldSeen[mcName] ||
        { count: 0, sanctioned, memberKey: mcKey, setKey };
      design.scaffoldSeen[mcName].count++;
      if (sanctioned) continue;
      for (const o of (n.overrides || [])) {
        let tgt = null;
        try { tgt = await figma.getNodeByIdAsync(o.id); } catch (err) {}
        const onName = tgt ? tgt.name : '';
        const where = mcName + (onName && onName !== mcName ? ' › ' + onName : '');
        for (const fld of (o.overriddenFields || [])) {
          if (OVERRIDE_ALLOW.has(fld)) continue;
          // 'boundVariables' as one flag is useless: it fires whether someone rebound
          // a fill (drift) or bound `visible` to a Responsive breakpoint variable —
          // the template's own show/hide mechanism, present on all six Device UI
          // instances on 🎨 UI Design. Resolve which property actually changed.
          if (fld === 'boundVariables') {
            const ib = (tgt && tgt.boundVariables) || {};
            for (const prop of Object.keys(ib)) {
              const arr = Array.isArray(ib[prop]) ? ib[prop] : [ib[prop]];
              const ids = arr.filter(x => x && x.id).map(x => x.id);
              if (!ids.length) continue;
              if (prop === 'visible' && ids.every(id => respIds.has(id))) continue;
              add('changedByHand', n, where, fieldWord(prop) + ' rebound to a variable');
            }
            continue;
          }
          // A color change flags even when it points at a theme color. Recolouring
          // a Button instead of choosing Style=Error is the failure being caught.
          add(OVERRIDE_REVIEW.has(fld) ? 'hiddenLayer' : 'changedByHand', n, where, fieldWord(fld) + ' changed');
        }
      }
    }
    // v3.10, found by the first real run: `insideInstance` only inspects ANCESTORS,
    // so an instance ROOT fell through to checks 1-6 and was judged on properties it
    // INHERITS from its master. On 🎨 UI Design that produced 8 findings for Status
    // Bar / Home Indicator padding (2px, 6px, 10px, 26px, 574px) which live in the
    // Device UI masters, are deliberately exempt there, and cannot be fixed from a
    // screen. An instance is judged ONLY by check 10, on what was actually changed.
    // Nothing is lost: a real fill override still surfaces as 'color changed'.
    if (n.type === 'INSTANCE' || insideInstance(n)) continue;
    design.nodesScanned++;
    const bv = n.boundVariables || {};

    // ---- 12. theme locked below the screen root ----
    if ((n.explicitVariableModes || {})[semColl.id] && !isTrueScreenRoot(n)) add('lockedTheme', n);

    // ---- 11. detached / hand-built control. FAILS the screen (2026-08-06).
    //      Name matching alone cannot carry a failing verdict: it accuses wrapper
    //      frames named after components, and misses any detachment that was
    //      renamed. So two detectors plus a report-only bucket.
    if ((n.type === 'FRAME' || n.type === 'GROUP') && n !== root) {
      const nm = n.name.trim().toLowerCase().split(/\s+(?=[a-z-]+=)/)[0];
      const nameHit = masterNames.has(nm);
      if (nameHit && !DETACH_IGNORE.has(nm)) add('detached', n);
      else if (nameHit) add('namedLikeComp', n);
      else {
        // Structural fingerprint, survives a rename. Cheap gates FIRST — findAll
        // inside the walk is O(n^2) and must run on very few nodes.
        const paintBound = (bv.fills && bv.fills.length) || (bv.strokes && bv.strokes.length);
        const radiusBound = bv.cornerRadius || bv.topLeftRadius || bv.topRightRadius || bv.bottomLeftRadius || bv.bottomRightRadius;
        if (paintBound && radiusBound && typeof n.height === 'number' && n.height <= 200) {
          const kids = n.findAll(() => true);
          if (kids.some(k => k.type === 'TEXT' || k.type === 'VECTOR' || k.type === 'BOOLEAN_OPERATION') && !kids.some(k => k.type === 'INSTANCE')) add('handBuilt', n);
        }
      }
    }
    // ---- 1. palette colors where a theme color belongs ----
    for (const b of [...(bv.fills || []), ...(bv.strokes || [])]) {
      if (!semIds.has(b.id) && vname[b.id]) add('paletteColor', n, null, vname[b.id]);
    }
    // ---- 2. hand-picked colors. NO root exemption on a screen: a screen's own
    //      fill is the page background and must use the theme background color.
    for (const kind of ['fills', 'strokes']) {
      if (!Array.isArray(n[kind])) continue;
      for (const pt of n[kind]) {
        if (pt.type === 'SOLID' && pt.visible !== false && !(pt.boundVariables && pt.boundVariables.color)) add('handColor', n, null, kind === 'fills' ? 'fill' : 'border');
      }
    }
    // ---- 3. hand-typed corners ----
    if ('topLeftRadius' in n) {
      const seen = new Set();
      for (const c of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
        if (typeof n[c] === 'number' && n[c] > 0 && !bv[c] && !seen.has(n[c])) { seen.add(n[c]); add('handRadius', n, null, n[c] + 'px'); }
      }
    }
    // ---- 4 / 5. text style, shadow style ----
    if (n.type === 'TEXT' && !(n.textStyleId && n.textStyleId !== '' && n.textStyleId !== figma.mixed)) add('noTextStyle', n);
    if ('effects' in n && n.effects && n.effects.length > 0 && !(n.effectStyleId && n.effectStyleId !== '')) add('handShadow', n);
    // ---- 6. spacing. Screen spacing must use a variable, same as components.
    //      Split by whether a variable exists at that size, so the output is a fix
    //      list plus a short list of sizes the system does not cover yet.
    //      Responsive grid/margin + grid/gutter count as covered.
    if ('layoutMode' in n && n.layoutMode !== 'NONE') {
      const checkD = (val, prop) => {
        // 0 is NOT checked. Considered and reverted 2026-08-06: spacing/0 exists,
        // but 0 stays 0 under every brand, so binding it buys nothing, and a screen
        // carries a 0 on most padding sides — 14 findings to 3 real ones in a test
        // render. Do not re-enable without new evidence.
        if (typeof val !== 'number' || val <= 0 || bv[prop]) return;
        add(SPACING_SCALE.has(val) ? 'handSpacing' : 'spacingGap', n, null, fieldWord(prop) + ' ' + val + 'px');
      };
      for (const pr of ['paddingLeft','paddingRight','paddingTop','paddingBottom']) if (pr in n) checkD(n[pr], pr);
      if ('itemSpacing' in n && typeof n.itemSpacing === 'number' && !isInertSpacing(n)) checkD(n.itemSpacing, 'itemSpacing');
      if (n.layoutWrap === 'WRAP' && 'counterAxisSpacing' in n) checkD(n.counterAxisSpacing, 'counterAxisSpacing');
    }
  }

  // dedupe identical layer+check+detail rows
  const seenRow = new Set();
  const rows = items.filter(r => { const k = r.check + '|' + r.nodeId + '|' + r.detail; if (seenRow.has(k)) return false; seenRow.add(k); return true; });
  const counts = {};
  for (const r of rows) counts[r.check] = (counts[r.check] || 0) + 1;
  const strict = CONFIG.SECTION_RHYTHM === 'strict';
  const fails = rows.filter(r => CHECKS[r.check].sev === 'fail' || (strict && CHECKS[r.check].sev === 'gap')).length;
  const notes = rows.length - fails;
  return { rows, counts, fails, notes, gated: isGated(pageName),
           verdict: fails === 0 ? 'no issues' : fails + (isGated(pageName) ? ' to fix' : ' to look at (exploration, not gating)') };
}

const targets = CONFIG.SURFACES === 'system' ? [] : await resolveTargets();
design.target = { mode: CONFIG.TARGET.mode, profile: CONFIG.TARGET.profile, resolved: targets.map(t => t.pageName + ' | ' + t.node.name) };
for (const t of targets) { design.screensScanned++; design.perScreen[t.pageName + ' | ' + t.node.name] = await lintScreen(t.node, t.pageName); }

// --- designer-facing report ---------------------------------------------------
// Grouped by screen, then by issue. Max 6 examples per issue so one bad screen
// cannot bury the rest; the count still shows the real total.
function buildReport() {
  const keys = Object.keys(design.perScreen);
  const L = [];
  const nFail = keys.filter(k => design.perScreen[k].fails > 0).length;
  L.push('DESIGN CHECK');
  if (!keys.length) {
    L.push('');
    L.push('No screens were checked. This is not a pass.');
    for (const e of design.targetErrors) L.push('  - ' + e);
    return L.join('\n');
  }
  L.push(nFail === 0 ? 'All ' + keys.length + ' screen(s) look good.' : nFail + ' of ' + keys.length + ' screen(s) need fixes.');
  const untargeted = designPages.map(p => p.name).filter(nm => !keys.some(k => k.indexOf(nm + ' | ') === 0));
  if (untargeted.length) L.push('Only the screens listed below were checked. Not checked: ' + untargeted.join(', ') + '.');

  for (const k of keys) {
    const s = design.perScreen[k];
    const screenName = k.split(' | ').slice(1).join(' | ');
    L.push('');
    L.push('--------------------------------------------------');
    const flag = s.fails === 0 ? 'OK   ' : (s.gated ? 'FIX  ' : 'NOTE ');
    L.push(flag + screenName + '   (' + s.verdict + ')');
    const byCheck = {};
    for (const r of s.rows) (byCheck[r.check] = byCheck[r.check] || []).push(r);
    const order = Object.keys(byCheck).sort((a, b) => CHECKS[a].order - CHECKS[b].order);
    for (const c of order) {
      const rs = byCheck[c];
      const tag = CHECKS[c].sev === 'fail' ? '' : (CHECKS[c].sev === 'gap' ? '  [needs a new variable]' : '  [just so you know]');
      L.push('');
      L.push('  ' + CHECKS[c].msg + '  (' + rs.length + ')' + tag);
      for (const r of rs.slice(0, 6)) L.push('    - ' + r.layer + (r.detail ? '  -  ' + r.detail : '') + '\n        ' + r.link);
      if (rs.length > 6) L.push('    - and ' + (rs.length - 6) + ' more of the same');
    }
  }
  const unknown = Object.keys(design.scaffoldSeen).filter(k => !design.scaffoldSeen[k].sanctioned);
  if (unknown.length) {
    L.push('');
    L.push('--------------------------------------------------');
    L.push('Components checked for hand-changes (not template scaffolding):');
    for (const k of unknown) L.push('  - ' + k + '  x' + design.scaffoldSeen[k].count);
  }
  if (design.targetErrors.length) {
    L.push('');
    L.push('--------------------------------------------------');
    L.push('Could not check:');
    for (const e of design.targetErrors) L.push('  - ' + e);
  }
  return L.join('\n');
}


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
      // v3.0: fix mode is SYSTEM-SURFACE ONLY. Rebinding inside a screen is a
      // design act, not a value-identical repair.
      if (CONFIG.MODE === 'fix' && !inInst && surfaceOf(page.name) === 'system') {
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

const clean = Object.keys(adoption.flaggedVars).length === 0 &&
              Object.keys(adoption.danglingVars).length === 0 &&
              Object.keys(adoption.flaggedStyles).length === 0 &&
              Object.keys(adoption.flaggedRemoteInstances).length === 0;
const spacingClean = Object.keys(base.hardSpacing).length === 0;

// v3.0: THREE verdicts, deliberately not folded into one. The publish gate reads
// the adoption + spacing verdicts; a red DESIGN verdict must not be able to dirty
// the clean-file baseline those two represent.
const screenKeys = Object.keys(design.perScreen);
// Only GATED screens can fail the run. Ungated pages (Playground / explorations)
// still get a full report so drift is visible early; they just do not block.
const failed = screenKeys.filter(k => design.perScreen[k].gated && design.perScreen[k].fails > 0);
const designFails = screenKeys.filter(k => design.perScreen[k].gated).reduce((a, k) => a + design.perScreen[k].fails, 0);
// A scoped run is not a file run. The verdict states the scope every time, and
// names the pages that exist but were NOT targeted, so a partial pass cannot be
// read as a file pass.
const notTargeted = designPages.map(p => p.name).filter(nm => !screenKeys.some(k => k.indexOf(nm + ' | ') === 0));
const designVerdict = design.screensScanned === 0
  ? '➖ NO SCREENS CHECKED (target mode "' + CONFIG.TARGET.mode + '") — this is NOT a pass. ' +
    (design.targetErrors.length ? design.targetErrors.length + ' target error(s), see designReport.' : designPages.length + ' design page(s) hold 0 top-level frames.')
  : (designFails === 0
      ? '✅ ' + design.screensScanned + '/' + design.screensScanned + ' TARGETED SCREEN(S) PASS' + (notTargeted.length ? ' — SCOPED RUN, untargeted design pages: ' + notTargeted.join(', ') : '')
      : '⚠️ ' + failed.length + '/' + design.screensScanned + ' TARGETED SCREEN(S) FAIL — ' + designFails + ' finding(s)');
const designReport = buildReport();

return {
  verdict: clean ? '✅ ADOPTION CLEAN — no unsanctioned foreign material' : '⚠️ FOREIGN MATERIAL FLAGGED',
  spacingVerdict: spacingClean
    ? '✅ SPACING BOUND — no unbound spacing outside documented exceptions'
    : '⚠️ UNBOUND SPACING FOUND — ' + base.hardSpacingTotal + ' node-props',
  designVerdict,
  designReport,        // <- give THIS to the designer. Plain text, plain language.
  designScreens: Object.fromEntries(screenKeys.map(k => [k, design.perScreen[k].verdict])),
  designTargetErrors: design.targetErrors,
  designPages: designPages.map(p => p.name),
  nodesScanned,
  base,
  design,
  adoption,
};
