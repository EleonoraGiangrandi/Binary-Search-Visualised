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



const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
const TARGET_INDEX = 7; // the number 8
const BOX_W = 100;
const BOX_H = 100;
const GAP = 10;
const SLOT = BOX_W + GAP;
const boxCX = (i: number) => -(NUMBERS.length / 2) * SLOT + SLOT / 2 + i * SLOT;

import { Palette as C } from '../palette';



export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const boxRefs  = NUMBERS.map(() => createRef<Rect>());
  const txtRefs  = NUMBERS.map(() => createRef<Txt>());
  const counterRef      = createRef<Txt>();
  const counterLabelRef = createRef<Txt>();
  const statusRef       = createRef<Txt>();
  const searchTypeRef   = createRef<Txt>();
  const targetLabelRef  = createRef<Txt>();

  // Guesses signal for dynamic UI updates
  const guesses = createSignal(0);



  view.add(
    <Txt
      ref={searchTypeRef}
      text="LINEAR SEARCH"
      fontSize={48}
      fontWeight={800}
      letterSpacing={4}
      fontFamily="JetBrains Mono, monospace"
      fill={C.accent}
      shadowBlur={30}
      shadowColor={C.accent}
      y={-300}
      opacity={0}
    />
  );

  view.add(
    <Txt
      ref={targetLabelRef}
      text={`TARGET: ${NUMBERS[TARGET_INDEX]}`}
      fontSize={22}
      letterSpacing={6}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite}
      y={-230}
      opacity={0}
    />
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

  // Guesses counter — top right
  view.add(
    <Layout direction="column" alignItems="end" position={[500, -265]}>
      <Txt
        ref={counterLabelRef}
        text="GUESSES"
        fontSize={14}
        letterSpacing={4}
        fill={C.counterLabel}
        fontFamily="JetBrains Mono, monospace"
        opacity={0}
      />
      <Txt
        ref={counterRef}
        // Reactively synced to the guesses signal
        text={() => String(guesses())}
        fontSize={80}
        fontWeight={700}
        fill={C.textWhite}
        fontFamily="JetBrains Mono, monospace"
        opacity={0}
      />
    </Layout>,
  );

  // Status line — below the array
  view.add(
    <Txt
      ref={statusRef}
      text=""
      fontSize={20}
      fontFamily="JetBrains Mono, monospace"
      fill={C.textChecking}
      y={140}
      opacity={0}
    />,
  );



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
    searchTypeRef().opacity(1, 0.5),
    targetLabelRef().opacity(1, 0.5),
    all(
      counterLabelRef().opacity(1, 0.4),
      counterRef().opacity(1, 0.4),
    ),
  );

  yield* waitFor(0.6);

  // Status appears
  statusRef().text('checking each element...');
  yield* statusRef().opacity(1, 0.35);

  yield* waitFor(0.4);

  // LINEAR SEARCH EXECUTION

  for (let i = 0; i <= TARGET_INDEX; i++) {
    const found = i === TARGET_INDEX;

    // 1. Highlight the box being checked
    yield* all(
      boxRefs[i]().fill  (found ? C.boxFound      : C.boxChecking,    0.15),
      boxRefs[i]().stroke(found ? C.boxFoundStroke : C.boxCheckStroke, 0.15),
      boxRefs[i]().lineWidth(3, 0.15),
      txtRefs[i]().fill  (found ? C.textFound      : C.textChecking,   0.15),
    );

    // Update counter immediately for punchy feedback
    guesses(i + 1);

    if (found) {
      // Search target found
      statusRef().text(`found ✓  —  ${TARGET_INDEX + 1} guesses`);

      yield* all(
        statusRef().fill(C.textFound, 0.2),
        boxRefs[i]().scale(1.18, 0.2, easeOutCubic),
        counterRef().fill(C.textFound, 0.3),
      );
      yield* boxRefs[i]().scale(1, 0.15, easeOutCubic);
      break;
    }

    // Slightly slower start for clarity, then steady rhythm
    yield* waitFor(i < 2 ? 0.55 : 0.32);

    // 4. Dim the box — it's been checked and discarded
    yield* all(
      boxRefs[i]().fill  (C.boxPassed,    0.12),
      boxRefs[i]().stroke(C.boxPassStroke, 0.12),
      boxRefs[i]().lineWidth(1.5, 0.12),
      txtRefs[i]().fill  (C.textPassed,   0.12),
    );
  }

  // Voiceover hold
  yield* waitFor(3.5);
});
