import { makeScene2D, Rect, Txt, Layout, Line } from '@motion-canvas/2d';
import {
  all,
  createRef,
  sequence,
  waitFor,
  easeOutCubic,
  easeInOutCubic,
  Vector2,
} from '@motion-canvas/core';



// Sorted array — binary search will succeed
const SORTED   = [1, 2, 3, 4];
// Same values, shuffled — binary search will fail
const UNSORTED = [2, 4, 1, 3];

const TARGET       = 3;
const TARGET_IDX_S = 2; // index of 3 in SORTED
const TARGET_IDX_U = 3; // index of 3 in UNSORTED

const BOX_W  = 100;
const BOX_H  = 100;
const GAP    = 10;
const SLOT   = BOX_W + GAP;
const HALF_W = (SORTED.length / 2) * SLOT - GAP / 2; // half-width of one array

// Binary search steps on the SORTED array targeting value 3
// mid=1 (2) < 3 → elim 0..1
// mid=2 (3) → found
const BINARY_STEPS = [
  { mid: 1,  elimFrom: 0,  elimTo: 1  },
  { mid: 2,  elimFrom: -1, elimTo: -1 },
] as const;

import { Palette as C } from '../palette';




export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const titleRef   = createRef<Txt>();

  // Left panel — sorted
  const leftLabel  = createRef<Txt>();
  const leftStatus = createRef<Txt>();
  const leftPtr    = createRef<Txt>();
  const leftBoxes  = SORTED.map(()   => createRef<Rect>());
  const leftTxts   = SORTED.map(()   => createRef<Txt>());

  // Right panel — unsorted
  const rightLabel  = createRef<Txt>();
  const rightStatus = createRef<Txt>();
  const rightBoxes  = UNSORTED.map(() => createRef<Rect>());
  const rightTxts   = UNSORTED.map(() => createRef<Txt>());

  // Vertical divider
  const dividerRef  = createRef<Line>();

  // Bottom rule-of-thumb card
  const ruleCard    = createRef<Rect>();
  const ruleLine1   = createRef<Txt>();
  const ruleLine2   = createRef<Txt>();



  const PANEL_X = 350;   // horizontal offset of each panel centre from screen centre
  const ARRAY_Y = 30;    // vertical centre of the array rows
  const LABEL_Y = -195;  // panel label
  const STATUS_Y = 120;  // status text below array
  const PTR_Y    = -80;  // ▼ pointer above array

  // X centre of box i within a panel whose leftmost box starts at panelX - HALF_W
  const boxCX = (panelX: number, i: number) =>
    panelX - HALF_W + SLOT / 2 + i * SLOT;



  // Main title
  view.add(
    <Txt
      ref={titleRef}
      text="there's one catch"
      fontSize={30}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite}
      y={-255}
      opacity={0}
    />,
  );

  // Vertical divider
  view.add(
    <Line
      ref={dividerRef}
      points={[new Vector2(0, -220), new Vector2(0, 220)]}
      stroke={C.divider}
      lineWidth={1}
      opacity={0}
    />,
  );

  // LEFT PANEL: Sorted Array


  view.add(
    <Txt
      ref={leftLabel}
      text="sorted ✓"
      fontSize={18}
      letterSpacing={2}
      fontFamily="JetBrains Mono, monospace"
      fill={C.success}
      x={-PANEL_X}
      y={LABEL_Y}
      opacity={0}
    />,
  );

  for (let i = 0; i < SORTED.length; i++) {
    view.add(
      <Rect
        ref={leftBoxes[i]}
        x={-PANEL_X}
        y={ARRAY_Y}
        width={BOX_W}
        height={BOX_H}
        radius={6}
        fill={C.boxIdle}
        stroke={C.boxIdleStroke}
        lineWidth={2}
        opacity={0}
        scale={[0, 1]}
      >
        <Txt
          ref={leftTxts[i]}
          text={String(SORTED[i])}
          fontSize={28}
          fontWeight={700}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textBright}
        />
      </Rect>
    );
  }

  view.add(
    <Txt
      ref={leftPtr}
      text="▼"
      fontSize={20}
      fill={C.accent}
      fontFamily="JetBrains Mono, monospace"
      x={boxCX(-PANEL_X, BINARY_STEPS[0].mid)}
      y={ARRAY_Y + PTR_Y}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={leftStatus}
      text=""
      fontSize={15}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      x={-PANEL_X}
      y={STATUS_Y}
      opacity={0}
    />,
  );

  // RIGHT PANEL: Unsorted Array


  view.add(
    <Txt
      ref={rightLabel}
      text="unsorted ✗"
      fontSize={18}
      letterSpacing={2}
      fontFamily="JetBrains Mono, monospace"
      fill={C.error}
      x={PANEL_X}
      y={LABEL_Y}
      opacity={0}
    />,
  );

  for (let i = 0; i < UNSORTED.length; i++) {
    view.add(
      <Rect
        ref={rightBoxes[i]}
        x={PANEL_X}
        y={ARRAY_Y}
        width={BOX_W}
        height={BOX_H}
        radius={6}
        fill={C.boxIdle}
        stroke={C.boxIdleStroke}
        lineWidth={2}
        opacity={0}
        scale={[0, 1]}
      >
        <Txt
          ref={rightTxts[i]}
          text={String(UNSORTED[i])}
          fontSize={28}
          fontWeight={700}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textBright}
        />
      </Rect>
    );
  }

  view.add(
    <Txt
      ref={rightStatus}
      text=""
      fontSize={15}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      x={PANEL_X}
      y={STATUS_Y}
      opacity={0}
    />,
  );

  // SUMMARY CARD


  view.add(
    <Rect
      ref={ruleCard}
      width={820}
      height={90}
      radius={10}
      fill={C.surface}
      stroke={C.border}
      lineWidth={1.5}
      y={195}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={ruleLine1}
      text="searching once?  →  linear is fine"
      fontSize={16}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      y={183}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={ruleLine2}
      text="searching repeatedly?  →  sort first, then binary search"
      fontSize={16}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite}
      y={210}
      opacity={0}
    />,
  );



  function* setStatus(ref: ReturnType<typeof createRef<Txt>>, text: string, color = C.textDim) {
    if ((ref().opacity() as number) > 0.1) yield* ref().opacity(0, 0.15);
    ref().text(text);
    ref().fill(color);
    yield* ref().opacity(1, 0.25);
  }

  function* elimLeft(from: number, to: number) {
    const idxs = Array.from({ length: to - from + 1 }, (_, k) => from + k);
    yield* sequence(
      0.04,
      ...idxs.map(i =>
        all(
          leftBoxes[i]().fill(C.boxPassed, 0.12),
          leftBoxes[i]().stroke(C.boxPassStroke, 0.12),
          leftBoxes[i]().lineWidth(1, 0.12),
          leftBoxes[i]().opacity(0.15, 0.12),
          leftTxts[i]().fill(C.textPassed, 0.12),
        ),
      ),
    );
  }

  // PHASE 1: Introduction & Layout


  yield* titleRef().opacity(1, 0.5, easeInOutCubic);
  yield* waitFor(0.5);

  // Both arrays burst in simultaneously from their respective centers
  const ORDER = [1, 2, 0, 3];
  yield* sequence(
    0.02,
    ...ORDER.map(i => all(
      // Left array
      leftBoxes[i]().opacity(1),
      leftBoxes[i]().x(boxCX(-PANEL_X, i), 0.7, easeOutCubic),
      leftBoxes[i]().scale.x(1, 0.6, easeOutCubic),
      // Right array
      rightBoxes[i]().opacity(1),
      rightBoxes[i]().x(boxCX(PANEL_X, i), 0.7, easeOutCubic),
      rightBoxes[i]().scale.x(1, 0.6, easeOutCubic),
    ))
  );

  yield* all(
    dividerRef().opacity(1,  0.4),
    leftLabel().opacity(1,   0.4),
    rightLabel().opacity(1,  0.4),
  );

  yield* waitFor(0.6);

  // PHASE 2: Binary Search on Sorted Array


  yield* leftPtr().opacity(1, 0.3, easeOutCubic);

  for (let s = 0; s < BINARY_STEPS.length; s++) {
    const step    = BINARY_STEPS[s];
    const isFound = step.elimFrom === -1;

    // Slide pointer
    yield* leftPtr().x(boxCX(-PANEL_X, step.mid), s === 0 ? 0.01 : 0.38, easeInOutCubic);

    // Highlight mid box
    yield* all(
      leftBoxes[step.mid]().fill  (isFound ? C.boxFound      : C.boxChecking,       0.18),
      leftBoxes[step.mid]().stroke(isFound ? C.boxFoundStroke : C.boxCheckStroke, 0.18),
      leftBoxes[step.mid]().lineWidth(3, 0.18),
      leftTxts[step.mid]().fill  (isFound ? C.textFound     : C.textWhite,      0.18),
      leftBoxes[step.mid]().shadowBlur(isFound ? 20 : 10, 0.18),
      leftBoxes[step.mid]().shadowColor(isFound ? C.success : C.accent, 0.18),
    );

    if (isFound) {
      yield* setStatus(leftStatus, `found ${TARGET} ✓  —  2 guesses`, C.success);
      yield* all(
        leftBoxes[step.mid]().scale(1.16, 0.18, easeOutCubic),
        leftPtr().opacity(0, 0.3),
      );
      yield* leftBoxes[step.mid]().scale(1, 0.13, easeOutCubic);
      break;
    }

    yield* setStatus(leftStatus, `mid = ${SORTED[step.mid]}  →  too small`);
    yield* waitFor(0.5);
    yield* elimLeft(step.elimFrom, step.elimTo);
    yield* waitFor(0.35);
  }

  yield* waitFor(0.8);

  // PHASE 3: Why Binary Search Fails on Unsorted Data


  yield* setStatus(rightStatus, 'trying binary search...');

  // Step 1 — mid = index 1 (value 4) — binary search "thinks" 4 > 3
  //          and eliminates right half — but 3 IS in that half → wrong
  const wrongMid = 1;

  yield* all(
    rightBoxes[wrongMid]().fill(C.boxChecking, 0.2),
    rightBoxes[wrongMid]().stroke(C.boxCheckStroke, 0.2),
    rightBoxes[wrongMid]().lineWidth(3, 0.2),
    rightTxts[wrongMid]().fill(C.textWhite, 0.2),
    rightBoxes[wrongMid]().shadowBlur(10, 0.2),
    rightBoxes[wrongMid]().shadowColor(C.accent, 0.2),
  );

  yield* waitFor(0.5);
  yield* setStatus(rightStatus, `mid = ${UNSORTED[wrongMid]}  →  eliminate right half?`);
  yield* waitFor(0.9);

  // Eliminate the right half — but 3 is at index 3 (in the eliminated range!)
  const wrongElim = [1, 2, 3];
  yield* sequence(
    0.04,
    ...wrongElim.map(i =>
      all(
        rightBoxes[i]().fill(C.boxPassed, 0.12),
        rightBoxes[i]().stroke(C.boxPassStroke, 0.12),
        rightBoxes[i]().lineWidth(1, 0.12),
        rightBoxes[i]().opacity(0.15, 0.12),
        rightTxts[i]().fill(C.textPassed, 0.12),
      ),
    ),
  );

  yield* waitFor(0.5);

  // Flash TARGET box red — it was just eliminated incorrectly
  yield* all(
    rightBoxes[TARGET_IDX_U]().fill(C.error, 0.22),
    rightBoxes[TARGET_IDX_U]().stroke(C.error, 0.22),
    rightBoxes[TARGET_IDX_U]().lineWidth(3, 0.22),
    rightTxts[TARGET_IDX_U]().fill(C.error, 0.22),
    rightBoxes[TARGET_IDX_U]().opacity(1, 0.22),
    rightBoxes[TARGET_IDX_U]().shadowBlur(20, 0.22),
    rightBoxes[TARGET_IDX_U]().shadowColor(C.error, 0.22),
  );

  // Shake the target box to sell the error
  for (let t = 0; t < 3; t++) {
    yield* rightBoxes[TARGET_IDX_U]().x(rightBoxes[TARGET_IDX_U]().x() + 6, 0.06);
    yield* rightBoxes[TARGET_IDX_U]().x(rightBoxes[TARGET_IDX_U]().x() - 12, 0.06);
    yield* rightBoxes[TARGET_IDX_U]().x(rightBoxes[TARGET_IDX_U]().x() + 6, 0.06);
  }

  yield* setStatus(rightStatus, `${TARGET} was just eliminated — wrong answer`, C.error);

  // Big ✗ badge fades in over the right panel
  const xBadge = createRef<Txt>();
  view.add(
    <Txt
      ref={xBadge}
      text="✗"
      fontSize={90}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      fill={C.error}
      x={PANEL_X}
      y={ARRAY_Y}
      opacity={0}
    />,
  );

  yield* all(
    xBadge().opacity(0.18, 0.45, easeOutCubic),
    xBadge().scale(1.1, 0.3, easeOutCubic),
  );
  yield* xBadge().scale(1, 0.15);

  yield* waitFor(1.2);

  // PHASE 4: Rule of Thumb


  yield* all(
    ruleCard().opacity(1, 0.45, easeInOutCubic),
    ruleLine1().opacity(1, 0.45),
  );
  yield* waitFor(0.2);
  yield* ruleLine2().opacity(1, 0.4, easeInOutCubic);

  // Hold for voiceover
  yield* waitFor(4.0);
});
