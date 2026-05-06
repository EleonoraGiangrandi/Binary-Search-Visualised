import { makeScene2D, Rect, Txt, Layout } from '@motion-canvas/2d';
import {
  all,
  createRef,
  sequence,
  waitFor,
  easeOutCubic,
  easeInOutCubic,
} from '@motion-canvas/core';



const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
const BOX_W = 100;
const BOX_H = 100;
const GAP    = 10;
const SLOT   = BOX_W + GAP; // 76px per cell



import { Palette as C } from '../palette';


const boxCX = (i: number) => -(NUMBERS.length / 2) * SLOT + SLOT / 2 + i * SLOT;


export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const boxRefs    = NUMBERS.map(() => createRef<Rect>());
  const txtRefs    = NUMBERS.map(() => createRef<Txt>());
  const headlineRef = createRef<Txt>();
  const pointerRef  = createRef<Txt>();
  const statusRef   = createRef<Txt>();
  const badgeRef    = createRef<Txt>();



  // Headline — top centre
  view.add(
    <Txt
      ref={headlineRef}
      text="the list is sorted"
      fontSize={30}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite}
      y={-220}
      opacity={0}
    />,
  );

  for (let i = 0; i < NUMBERS.length; i++) {
    view.add(
      <Rect
        ref={boxRefs[i]}
        x={0}
        y={10}
        width={BOX_W}
        height={BOX_H}
        radius={8}
        fill={C.boxIdle}
        stroke={C.boxIdleStroke}
        lineWidth={2}
        opacity={0}
        scale={[0, 1]}
      >
        <Txt
          ref={txtRefs[i]}
          text={String(NUMBERS[i])}
          fontSize={28}
          fontWeight={700}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textBright}
        />
      </Rect>
    );
  }

  // ▼ pointer — slides between midpoints
  view.add(
    <Txt
      ref={pointerRef}
      text="▼"
      fontSize={22}
      fill={C.accent}
      fontFamily="JetBrains Mono, monospace"
      x={boxCX(4)}
      y={-72}
      opacity={0}
    />,
  );

  // Status line — below array
  view.add(
    <Txt
      ref={statusRef}
      text=""
      fontSize={18}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      y={148}
      opacity={0}
    />,
  );

  // Badge — counts eliminated elements
  view.add(
    <Txt
      ref={badgeRef}
      text=""
      fontSize={20}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      fill={C.success}
      y={205}
      opacity={0}
    />,
  );



  function* eliminate(indices: number[], stagger = 0.055) {
    yield* sequence(
      stagger,
      ...indices.map(i =>
        all(
          boxRefs[i]().fill(C.boxPassed, 0.18),
          boxRefs[i]().stroke(C.boxPassStroke, 0.18),
          boxRefs[i]().lineWidth(1, 0.18),
          boxRefs[i]().opacity(0.2, 0.18),
          txtRefs[i]().fill(C.textPassed, 0.18),
        ),
      ),
    );
  }

  function* highlightMid(i: number) {
    yield* all(
      boxRefs[i]().fill(C.boxChecking, 0.2),
      boxRefs[i]().stroke(C.boxCheckStroke, 0.2),
      boxRefs[i]().lineWidth(3, 0.2),
      txtRefs[i]().fill(C.textWhite, 0.2),
      boxRefs[i]().shadowBlur(15, 0.2),
      boxRefs[i]().shadowColor(C.accent, 0.2),
    );

  }

  function* showBadge(text: string) {
    badgeRef().text(text);
    yield* all(
      badgeRef().opacity(1, 0.3, easeOutCubic),
      badgeRef().scale(1.08, 0.15, easeOutCubic),
    );
    yield* badgeRef().scale(1, 0.1);
  }

  function* hideBadge() {
    yield* badgeRef().opacity(0, 0.25);
  }

  function* setStatus(text: string) {
    if ((statusRef().opacity() as number) > 0) {
      yield* statusRef().opacity(0, 0.2);
    }
    statusRef().text(text);
    yield* statusRef().opacity(1, 0.3);
  }



  // Intro animation: elements burst out from the center
  const ORDER = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9];
  yield* sequence(
    0.02,
    ...ORDER.map(i => {
      boxRefs[i]().opacity(1);
      return all(
        boxRefs[i]().x(boxCX(i), 0.7, easeOutCubic),
        boxRefs[i]().scale.x(1, 0.6, easeOutCubic),
      );
    }),
  );

  yield* waitFor(0.3);

  // 2 ─ Headline appears
  yield* headlineRef().opacity(1, 0.55, easeInOutCubic);
  yield* waitFor(1.0);

  // 3 ─ Subtly tint all boxes to signal they're "in play"
  yield* sequence(
    0.02,
    ...boxRefs.map((ref, i) =>
      all(
        ref().fill(C.boxChecking, 0.18),
        txtRefs[i]().fill(C.textWhite, 0.18),
      ),
    ),
  );

  yield* waitFor(0.6);

  // 4 ─ Pointer drops in · highlight first midpoint (index 4 = value 5)
  yield* setStatus('check the middle element');
  yield* pointerRef().opacity(1, 0.35, easeOutCubic);
  yield* highlightMid(4);
  yield* waitFor(1.4);

  // 5 ─ Eliminate left half (0–4) left → right sweep
  yield* setStatus('too small  →  entire left half ruled out in one move');
  yield* eliminate([0, 1, 2, 3, 4]);
  yield* showBadge('5 elements gone — one guess');
  yield* waitFor(1.6);

  // 6 ─ Pointer slides to new midpoint (index 7 = value 8)
  yield* all(
    hideBadge(),
    pointerRef().x(boxCX(7), 0.45, easeInOutCubic),
  );
  yield* setStatus('new middle of the remaining 5 elements');
  yield* highlightMid(7);
  yield* waitFor(1.4);

  // 7 ─ Eliminate right portion (8-9) right → left sweep (actually just found)
  // Wait, if it's found, we should show it's found.
  // The original scene was just an intro to the CONCEPT of elimination.
  // So I'll just adjust the numbers to make sense.
  yield* setStatus('found it ✓');
  yield* showBadge('surviving elements are checked next');
  yield* waitFor(1.2);

  // 8 ─ Pay-off: headline swaps, remaining boxes pulse green
  yield* all(
    hideBadge(),
    statusRef().opacity(0, 0.3),
    pointerRef().opacity(0, 0.3),
  );

  headlineRef().text('every guess eliminates half');
  yield* headlineRef().fill(C.success, 0.5, easeInOutCubic);


  // Pulse the surviving boxes (5, 6, 7, 8, 9)
  yield* sequence(
    0.08,
    ...[5, 6, 7, 8, 9].map(i =>
      all(
        boxRefs[i]().stroke(C.success, 0.2),
        boxRefs[i]().lineWidth(2.5, 0.2),
        txtRefs[i]().fill(C.success, 0.2),
        boxRefs[i]().shadowBlur(20, 0.2),
        boxRefs[i]().shadowColor(C.success, 0.2),
      ),

    ),
  );

  yield* waitFor(3.5);
});
