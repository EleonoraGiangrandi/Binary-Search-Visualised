import { makeScene2D, Rect, Txt, Layout } from '@motion-canvas/2d';
import { all, createRef, createSignal, sequence, waitFor, easeOutCubic, easeInOutCubic } from '@motion-canvas/core';



const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
const TARGET_VALUE = 7;
const TARGET_INDEX = 6; 
const BOX_W = 100; // Slightly larger
const BOX_H = 100;
const GAP = 10; // Small gap
const SLOT = BOX_W + GAP;

const ROW_W  = NUMBERS.length * BOX_W + (NUMBERS.length - 1) * GAP;
const FIRST  = -ROW_W / 2 + BOX_W / 2;
const finalX = (i: number) => FIRST + i * SLOT;

import { Palette as C } from '../palette';


export default makeScene2D(function* (view) {
  view.fill(C.bg);

  const boxRefs = NUMBERS.map(() => createRef<Rect>());
  const txtRefs = NUMBERS.map(() => createRef<Txt>());
  const pointerRef = createRef<Txt>();
  const messageRef = createRef<Txt>();
  const searchTypeRef = createRef<Txt>();
  const targetLabelRef = createRef<Txt>();
  const counterRef      = createRef<Txt>();
  const counterLabelRef = createRef<Txt>();

  // Reactive signal to drive the guesses counter UI automatically
  const guesses = createSignal(0);

  const boxCX = (i: number) => -(NUMBERS.length / 2) * SLOT + SLOT / 2 + i * SLOT;



  view.add(
    <Txt
      ref={searchTypeRef}
      text="RANDOM SEARCH"
      fontSize={48}
      fontWeight={800}
      letterSpacing={4}
      fontFamily="JetBrains Mono, monospace"
      fill={C.accent}
      y={-300}
      shadowBlur={30}
      shadowColor={C.accent}
      opacity={0}
    />
  );

  view.add(
    <Txt
      ref={targetLabelRef}
      text={`TARGET: ${TARGET_VALUE}`}
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
          text={String(NUMBERS[i])}
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
      ref={pointerRef}
      text="▼"
      fontSize={40}
      fill={C.accent}
      y={-100}
      opacity={0}
    />
  );

  view.add(
    <Txt
      ref={messageRef}
      text=""
      fontSize={60}
      fontWeight={800}
      fontFamily="JetBrains Mono, monospace"
      y={220}
      opacity={0}
    />
  );

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
        // The text content is derived from the 'guesses' signal
        text={() => String(guesses())}
        fontSize={80}
        fontWeight={700}
        fill={C.textWhite}
        fontFamily="JetBrains Mono, monospace"
        opacity={0}
      />
    </Layout>,
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

  yield* waitFor(0.5);

  // PHASE 1: Inefficient Random Search
  
  const randomIndices = [3, 0, 8, 2, 5, 9]; 
  yield* pointerRef().opacity(1, 0.3);

  let count = 0;
  for (const idx of randomIndices) {
    count++;
    guesses(count);
    yield* pointerRef().x(boxCX(idx), 0.3, easeInOutCubic);
    yield* all(
      boxRefs[idx]().fill(C.error, 0.1).to(C.boxPassed, 0.2),
      boxRefs[idx]().stroke(C.boxPassStroke, 0.2),
      boxRefs[idx]().opacity(0.2, 0.3),
      txtRefs[idx]().fill(C.textPassed, 0.3)
    );
    yield* waitFor(0.1);
  }


  // Finally find it
  count++;
  guesses(count);
  yield* pointerRef().x(boxCX(TARGET_INDEX), 0.4, easeInOutCubic);
  yield* all(
    boxRefs[TARGET_INDEX]().fill(C.boxFound, 0.3),
    boxRefs[TARGET_INDEX]().stroke(C.boxFoundStroke, 0.3),
    txtRefs[TARGET_INDEX]().fill(C.success, 0.3),
    boxRefs[TARGET_INDEX]().scale(1.2, 0.3).to(1, 0.2),
    boxRefs[TARGET_INDEX]().shadowBlur(20, 0.3).to(0, 0.2),
    boxRefs[TARGET_INDEX]().shadowColor(C.success, 0.3)
  );

  yield* messageRef().text('inefficient', 0);
  yield* all(
    messageRef().opacity(1, 0.5),
    messageRef().scale(1.2, 0.5).to(1, 0.2),
    messageRef().fill(C.error, 0.5)
  );

  yield* waitFor(1.5);

  // Reset state for the next phase
  
  yield* all(
    messageRef().opacity(0, 0.3),
    pointerRef().opacity(0, 0.3),
    searchTypeRef().opacity(0, 0.2),
    ...boxRefs.map((ref, i) => all(
      ref().opacity(1, 0.3),
      ref().fill(C.boxIdle, 0.3),
      ref().stroke(C.boxIdleStroke, 0.3),
      txtRefs[i]().fill(C.textBright, 0.3)
    ))
  );

  searchTypeRef().text('BINARY SEARCH');
  guesses(0);
  yield* searchTypeRef().opacity(1, 0.3);

  yield* waitFor(0.5);

  // PHASE 2: Efficient Binary Search
  
  yield* pointerRef().opacity(1, 0.3);
  
  const steps = [
    { mid: 4, elim: [0, 1, 2, 3, 4] },
    { mid: 7, elim: [7, 8, 9] },
    { mid: 5, elim: [5] },
    { mid: 6, found: true }
  ];



  let binCount = 0;
  for (const step of steps) {
    binCount++;
    guesses(binCount);
    yield* pointerRef().x(boxCX(step.mid), 0.5, easeInOutCubic);
    
    if (step.found) {
      yield* all(
        boxRefs[step.mid]().fill(C.boxFound, 0.3),
        boxRefs[step.mid]().stroke(C.boxFoundStroke, 0.3),
        txtRefs[step.mid]().fill(C.success, 0.3),
        boxRefs[step.mid]().scale(1.2, 0.3).to(1, 0.2),
        boxRefs[step.mid]().shadowBlur(25, 0.3).to(0, 0.2),
        boxRefs[step.mid]().shadowColor(C.success, 0.3)
      );
    } else {
      yield* all(
        boxRefs[step.mid]().fill(C.boxChecking, 0.2).to(C.boxIdle, 0.4),
      );
      yield* sequence(
        0.05,
        ...step.elim!.map(i => all(
          boxRefs[i]().opacity(0.15, 0.3),
          txtRefs[i]().fill(C.textDisabled, 0.3),
          boxRefs[i]().stroke(C.boxPassStroke, 0.3)
        ))
      );
    }
    yield* waitFor(0.4);
  }

  yield* messageRef().text('much better', 0);
  yield* all(
    messageRef().opacity(1, 0.5),
    messageRef().scale(1.2, 0.5).to(1, 0.2),
    messageRef().fill(C.success, 0.5)
  );

  yield* waitFor(3);
});
