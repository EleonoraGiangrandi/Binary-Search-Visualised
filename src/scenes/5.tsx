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



interface Row {
  size:    string;
  guesses: string;
  note:    string;
}

const ROWS: Row[] = [
  { size: '16',            guesses: '4',  note: '← our demo array'      },
  { size: '1,000',        guesses: '10', note: '← a small database'     },
  { size: '1,000,000',    guesses: '20', note: '← one million records'  },
  { size: '1,000,000,000',guesses: '30', note: '← one billion records'  },
];

const COL_SIZE    = 300;
const COL_GUESSES = 140;
const COL_NOTE    = 310;
const ROW_H       = 72;
const TABLE_W     = COL_SIZE + COL_GUESSES + COL_NOTE;
const TABLE_X     = -TABLE_W / 2 + 30;

import { Palette as C } from '../palette';




/** Horizontal divider line */
function makeDivider(ref: ReturnType<typeof createRef<Line>>, y: number) {
  return (
    <Line
      ref={ref}
      points={[
        new Vector2(TABLE_X - 20, y),
        new Vector2(TABLE_X + TABLE_W + 20, y),
      ]}
      stroke={C.divider}
      lineWidth={1}
      opacity={0}
    />
  );
}



export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const titleRef    = createRef<Txt>();
  const subtitleRef = createRef<Txt>();
  const formulaRef  = createRef<Txt>();
  const captionRef  = createRef<Txt>();

  // Per-row refs
  const rowRects   = ROWS.map(() => createRef<Rect>());
  const sizeRefs   = ROWS.map(() => createRef<Txt>());
  const guessRefs  = ROWS.map(() => createRef<Txt>());
  const noteRefs   = ROWS.map(() => createRef<Txt>());

  // Header refs
  const headerRect    = createRef<Rect>();
  const headerSizeTxt = createRef<Txt>();
  const headerGuessTxt= createRef<Txt>();

  // Divider lines — one below header + one below each row
  const dividerRefs = [
    createRef<Line>(),
    ...ROWS.map(() => createRef<Line>()),
  ];



  // Title block
  view.add(
    <Layout direction="column" alignItems="center" gap={10} y={-255}>
      <Txt
        ref={titleRef}
        text="how fast does it scale?"
        fontSize={28}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
        fill={C.textWhite}
        y={-70}
        opacity={0}
      />
      <Txt
        ref={subtitleRef}
        text="max guesses  =  log₂(n)"
        fontSize={18}
        letterSpacing={1}
        fontFamily="JetBrains Mono, monospace"
        fill={C.accent}
        opacity={0}
      />
    </Layout>,
  );

  const tableTopY = -165;

  // TABLE HEADER


  view.add(
    <Rect
      ref={headerRect}
      x={TABLE_X + TABLE_W / 2 - 30}
      y={tableTopY}
      width={TABLE_W + 20}
      height={ROW_H - 14}
      radius={8}
      fill={C.surfaceLight}
      stroke={C.borderLight}
      lineWidth={1}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={headerSizeTxt}
      text="LIST SIZE"
      fontSize={13}
      letterSpacing={3}
      fontFamily="JetBrains Mono, monospace"
      fill={C.accent}
      x={TABLE_X + COL_SIZE / 2 - 10}
      y={tableTopY}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={headerGuessTxt}
      text="MAX GUESSES"
      fontSize={13}
      letterSpacing={3}
      fontFamily="JetBrains Mono, monospace"
      fill={C.accent}
      x={TABLE_X + COL_SIZE + COL_GUESSES / 2}
      y={tableTopY}
      opacity={0}
    />,
  );

  // Divider below header
  view.add(makeDivider(dividerRefs[0], tableTopY + ROW_H / 2 - 7));

  // DATA ROWS


  for (let i = 0; i < ROWS.length; i++) {
    const y    = tableTopY + ROW_H / 2 - 3 + (i + 1) * ROW_H;
    const fill = i % 2 === 0 ? C.bg : C.surface;

    view.add(
      <Rect
        ref={rowRects[i]}
        x={TABLE_X + TABLE_W / 2 - 30}
        y={y}
        width={TABLE_W + 20}
        height={ROW_H - 6}
        radius={6}
        fill={fill}
        stroke={C.border}
        lineWidth={1}
        opacity={0}
        scale={0.96}
      />,
    );

    view.add(
      <Txt
        ref={sizeRefs[i]}
        text={ROWS[i].size}
        fontSize={20}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
        fill={C.textWhite}
        x={TABLE_X + COL_SIZE / 2 - 10}
        y={y}
        opacity={0}
      />,
    );

    view.add(
      <Txt
        ref={guessRefs[i]}
        text={ROWS[i].guesses}
        fontSize={20}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
        fill={C.warning}
        x={TABLE_X + COL_SIZE + COL_GUESSES / 2}
        y={y}
        opacity={0}
      />,
    );

    view.add(
      <Txt
        ref={noteRefs[i]}
        text={ROWS[i].note}
        fontSize={14}
        fontFamily="JetBrains Mono, monospace"
        fill={C.textDim}
        x={TABLE_X + COL_SIZE + COL_GUESSES + COL_NOTE / 2 - 10}
        y={y}
        opacity={0}
      />,
    );

    // Divider below each row
    view.add(makeDivider(dividerRefs[i + 1], y + ROW_H / 2 - 6));
  }

  // FOOTER (Formula & Caption)


  const footerY = tableTopY + (ROWS.length + 1) * ROW_H + 40;

  view.add(
    <Txt
      ref={formulaRef}
      text="doubling the list adds exactly 1 guess"
      fontSize={18}
      fontFamily="JetBrains Mono, monospace"
      fill={C.success}
      y={footerY}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={captionRef}
      text="this is what O(log n) means"
      fontSize={15}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      y={footerY + 38}
      opacity={0}
    />,
  );



  // 1 — Title block
  yield* titleRef().opacity(1, 0.5, easeInOutCubic);
  yield* waitFor(0.2);
  yield* subtitleRef().opacity(1, 0.45, easeInOutCubic);
  yield* waitFor(0.7);

  // 2 — Header
  yield* all(
    headerRect().opacity(1, 0.35, easeOutCubic),
    headerSizeTxt().opacity(1, 0.35),
    headerGuessTxt().opacity(1, 0.35),
  );
  yield* dividerRefs[0]().opacity(1, 0.3);
  yield* waitFor(0.3);

  // 3 — Rows appear one by one with a satisfying pop
  for (let i = 0; i < ROWS.length; i++) {
    yield* all(
      rowRects[i]().opacity(1, 0.28, easeOutCubic),
      rowRects[i]().scale(1, 0.28, easeOutCubic),
      sizeRefs[i]().opacity(1, 0.28),
    );

    // Guesses number punches in slightly after the size
    yield* waitFor(0.1);
    yield* all(
      guessRefs[i]().opacity(1, 0.22, easeOutCubic),
      guessRefs[i]().scale(1.15, 0.18, easeOutCubic),
    );
    yield* guessRefs[i]().scale(1, 0.12);

    // Note fades in quietly
    yield* noteRefs[i]().opacity(1, 0.3);

    // Divider below this row
    yield* dividerRefs[i + 1]().opacity(1, 0.25);

    // Pause — longer on row 3 and 4 to let the numbers land
    yield* waitFor(i < 2 ? 0.65 : 1.1);
  }

  // 4 — After the billion row: pulse the entire guesses column blue→white→blue
  //     to draw the eye to just how small those numbers are
  yield* sequence(
    0.06,
    ...guessRefs.map(ref =>
      all(
        ref().fill(C.textWhite, 0.2),
        ref().scale(1.1, 0.15, easeOutCubic),
      ),
    ),
  );
  yield* waitFor(0.15);
  yield* sequence(
    0.06,
    ...guessRefs.map(ref =>
      all(
        ref().fill(C.warning, 0.25),
        ref().scale(1, 0.15),
      ),
    ),
  );

  yield* waitFor(0.5);

  // 5 — Highlight the billion row to drive the point home
  yield* all(
    rowRects[3]().fill(C.boxChecking, 0.35, easeInOutCubic),
    rowRects[3]().stroke(C.accent, 0.35),
    rowRects[3]().lineWidth(2, 0.35),
    rowRects[3]().shadowBlur(20, 0.35),
    rowRects[3]().shadowColor(C.accent, 0.35),
    sizeRefs[3]().fill(C.accent, 0.35),

  );
  yield* waitFor(1.2);

  // Reset the highlight
  yield* all(
    rowRects[3]().fill(C.surface, 0.3),
    rowRects[3]().stroke(C.border, 0.3),
    rowRects[3]().lineWidth(1, 0.3),
    rowRects[3]().shadowBlur(0, 0.3),
    sizeRefs[3]().fill(C.textWhite, 0.3),

  );

  yield* waitFor(0.4);

  // 6 — Footer lines appear
  yield* formulaRef().opacity(1, 0.5, easeInOutCubic);
  yield* waitFor(0.25);
  yield* captionRef().opacity(1, 0.45, easeInOutCubic);

  // Hold for voiceover
  yield* waitFor(4.0);
});
