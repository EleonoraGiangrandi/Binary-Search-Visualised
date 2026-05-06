import { makeScene2D, Rect, Txt, Layout } from '@motion-canvas/2d';
import {
  all,
  createRef,
  createSignal,
  sequence,
  waitFor,
  easeOutCubic,
  easeInOutCubic,
} from '@motion-canvas/core';



const NUMBERS      = Array.from({ length: 10 }, (_, i) => i + 1);
const TARGET_INDEX = 7; // value 8
const BOX_W = 100;
const BOX_H = 100;
const GAP   = 10;
const SLOT  = BOX_W + GAP;

const boxCX = (i: number) =>
  -(NUMBERS.length / 2) * SLOT + SLOT / 2 + i * SLOT;

import { Palette as C } from '../palette';


// Binary search steps for target index 13 (value 700)
// Step 1: mid=7  (400) < 700 → eliminate 0..7
// Step 2: mid=11 (600) < 700 → eliminate 8..11
// Step 3: mid=13 (700) = 700 → found ✓
const STEPS = [
  { mid: 4,  status: 'mid = 5   →   too small',  isFound: false, elimFrom: 0,  elimTo: 4  },
  { mid: 7,  status: 'mid = 8   →   found ✓',   isFound: true,  elimFrom: -1, elimTo: -1 },
] as const;



export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const arrayWrap       = createRef<Layout>();
  const boxRefs         = NUMBERS.map(() => createRef<Rect>());
  const txtRefs         = NUMBERS.map(() => createRef<Txt>());
  const pointerRef      = createRef<Txt>();
  const titleRef        = createRef<Txt>();
  const statusRef       = createRef<Txt>();
  const counterLabelRef = createRef<Txt>();
  const counterRef      = createRef<Txt>();
  const guesses         = createSignal(0);

  // Comparison panel
  const compRef       = createRef<Layout>();
  const linearNumRef  = createRef<Txt>();
  const binaryNumRef  = createRef<Txt>();
  const captionRef    = createRef<Txt>();



  view.add(
    <Txt
      ref={titleRef}
      text="binary search"
      fontSize={20}
      letterSpacing={3}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      y={-230}
      opacity={0}
    />,
  );

  view.add(
    <Layout ref={arrayWrap} y={10}>
      {NUMBERS.map((n, i) => (
        <Rect
          ref={boxRefs[i]}
          x={0}
          y={0}
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
            text={String(n)}
            fontSize={28}
            fontWeight={700}
            fontFamily="JetBrains Mono, monospace"
            fill={C.textBright}
          />
        </Rect>
      ))}
    </Layout>,
  );

  // ▼ pointer — lives outside arrayWrap so it doesn't shift with it
  view.add(
    <Txt
      ref={pointerRef}
      text="▼"
      fontSize={22}
      fill={C.accent}
      fontFamily="JetBrains Mono, monospace"
      x={boxCX(STEPS[0].mid)}
      y={-68}
      opacity={0}
    />,
  );

  // Status line
  view.add(
    <Txt
      ref={statusRef}
      text=""
      fontSize={18}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textDim}
      y={150}
      opacity={0}
    />,
  );

  // Guess counter — top right
  view.add(
    <Layout direction="column" alignItems="end" position={[500, -265]}>
      <Txt
        ref={counterLabelRef}
        text="GUESSES"
        fontSize={14}
        letterSpacing={4}
        fill={C.textDim}
        fontFamily="JetBrains Mono, monospace"
        opacity={0}
      />
      <Txt
        ref={counterRef}
        text={() => String(guesses())}
        fontSize={80}
        fontWeight={700}
        fill={C.textWhite}
        fontFamily="JetBrains Mono, monospace"
        opacity={0}
      />
    </Layout>,
  );

  // COMPARISON PANEL (hidden until Phase 2)


  view.add(
    <Layout
      ref={compRef}
      layout
      direction="column"
      alignItems="center"
      gap={40}
      y={140}
      opacity={0}
    >
      {/* Two stat blocks */}
      <Layout layout direction="row" gap={220} alignItems="center">

        {/* Linear */}
        <Layout layout direction="column" alignItems="center" gap={10}>
          <Txt
            text="linear search"
            fontSize={15}
            letterSpacing={2}
            fontFamily="JetBrains Mono, monospace"
            fill={C.textDim}
          />
          <Txt
            ref={linearNumRef}
            text="8"
            fontSize={110}
            fontWeight={700}
            fontFamily="JetBrains Mono, monospace"
            fill={C.error}
          />
          <Txt
            text="guesses"
            fontSize={15}
            fontFamily="JetBrains Mono, monospace"
            fill={C.textDim}
          />
        </Layout>

        {/* vs */}
        <Txt
          text="vs"
          fontSize={26}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textDim}
        />

        {/* Binary */}
        <Layout layout direction="column" alignItems="center" gap={10}>
          <Txt
            text="binary search"
            fontSize={15}
            letterSpacing={2}
            fontFamily="JetBrains Mono, monospace"
            fill={C.textDim}
          />
          <Txt
            ref={binaryNumRef}
            text="2"
            fontSize={110}
            fontWeight={700}
            fontFamily="JetBrains Mono, monospace"
            fill={C.success}
          />
          <Txt
            text="guesses"
            fontSize={15}
            fontFamily="JetBrains Mono, monospace"
            fill={C.textDim}
          />
        </Layout>
      </Layout>

      {/* Caption below the numbers */}
      <Txt
        ref={captionRef}
        text="and the gap widens dramatically as the list grows"
        fontSize={16}
        fontFamily="JetBrains Mono, monospace"
        fill={C.textDim}
        opacity={0}
      />
    </Layout>,
  );



  function* setStatus(text: string, color = C.textDim) {
    if ((statusRef().opacity() as number) > 0.1) {
      yield* statusRef().opacity(0, 0.18);
    }
    statusRef().text(text);
    statusRef().fill(color);
    yield* statusRef().opacity(1, 0.28);
  }

  function* eliminateRange(from: number, to: number) {
    const indices = Array.from({ length: to - from + 1 }, (_, k) => from + k);
    yield* sequence(
      0.05,
      ...indices.map(i =>
        all(
          boxRefs[i]().fill(C.boxPassed, 0.14),
          boxRefs[i]().stroke(C.boxPassStroke, 0.14),
          boxRefs[i]().lineWidth(1, 0.14),
          boxRefs[i]().opacity(0.15, 0.14),
          txtRefs[i]().fill(C.textPassed, 0.14),
        ),
      ),
    );
  }

  // PHASE 1: Binary Search Visualization


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

  yield* all(
    titleRef().opacity(1, 0.45, easeInOutCubic),
    counterLabelRef().opacity(1, 0.45),
    counterRef().opacity(1, 0.45),
  );

  yield* waitFor(0.5);

  // Run each binary search step
  for (let s = 0; s < STEPS.length; s++) {
    const step    = STEPS[s];
    const isFound = step.isFound;

    // 1. Slide / fade-in the pointer
    yield* all(
      pointerRef().opacity(1, 0.28),
      pointerRef().x(boxCX(step.mid), s === 0 ? 0.01 : 0.42, easeInOutCubic),
    );

    // 2. Highlight the midpoint box
    yield* all(
      boxRefs[step.mid]().fill  (isFound ? C.boxFound      : C.boxChecking,       0.2),
      boxRefs[step.mid]().stroke(isFound ? C.boxFoundStroke : C.boxCheckStroke, 0.2),
      boxRefs[step.mid]().lineWidth(3, 0.2),
      txtRefs[step.mid]().fill  (isFound ? C.textFound     : C.textWhite,      0.2),
      boxRefs[step.mid]().shadowBlur(isFound ? 20 : 10, 0.2),
      boxRefs[step.mid]().shadowColor(isFound ? C.success : C.accent, 0.2),
    );

    // 3. Status + counter
    yield* setStatus(step.status, isFound ? C.success : C.accent);
    guesses(s + 1);

    if (isFound) {
      // Pulse the found box and turn counter green
      yield* all(
        counterRef().fill(C.success, 0.35),
        boxRefs[step.mid]().scale(1.18, 0.18, easeOutCubic),
      );
      yield* boxRefs[step.mid]().scale(1, 0.14, easeOutCubic);
      yield* waitFor(0.8);
      break;
    }

    yield* waitFor(1.1);

    // 4. Eliminate the ruled-out range
    yield* eliminateRange(step.elimFrom, step.elimTo);
    yield* waitFor(0.55);
  }

  // PHASE 2: Performance Comparison


  // Move array up and shrink it to make room
  yield* all(
    arrayWrap().y(-160, 0.55, easeInOutCubic),
    pointerRef().opacity(0, 0.3),
    statusRef().opacity(0, 0.3),
    counterRef().opacity(0, 0.3),
    counterLabelRef().opacity(0, 0.3),
    titleRef().opacity(0, 0.3),
    ...boxRefs.map(ref => ref().scale(0.7, 0.45, easeInOutCubic)),
  );

  yield* waitFor(0.15);

  // Comparison panel fades in
  yield* compRef().opacity(1, 0.5, easeInOutCubic);
  yield* waitFor(0.5);

  // Punch the two numbers for emphasis — staggered
  yield* linearNumRef().scale(1.12, 0.18, easeOutCubic);
  yield* linearNumRef().scale(1,    0.12);
  yield* waitFor(0.1);
  yield* binaryNumRef().scale(1.18, 0.2, easeOutCubic);
  yield* binaryNumRef().scale(1,    0.14);

  yield* waitFor(0.6);

  // Caption appears
  yield* captionRef().opacity(1, 0.5, easeInOutCubic);

  // Hold for voiceover
  yield* waitFor(3.5);
});
