import { makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import {
  all,
  createRef,
  sequence,
  waitFor,
  easeOutCubic,
  easeInOutCubic,
  Vector2,
} from '@motion-canvas/core';

// ─── Config ───────────────────────────────────────────────────────────────────

const N     = 10;
const BOX_W = 100;
const BOX_H = 100;
const GAP   = 10;
const SLOT  = BOX_W + GAP;

// Center the row at x = 0
const ROW_W  = N * BOX_W + (N - 1) * GAP;
const FIRST  = -ROW_W / 2 + BOX_W / 2;
const finalX = (i: number) => FIRST + i * SLOT;

const C = {
  bg:        '#05070a',
  boxFill:   '#0d1117',
  boxStroke: '#444c56',
  textDim:   '#c9d1d9',
  textWhite: '#ffffff',
  accent:    '#79c0ff',
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export default makeScene2D(function* (view) {
  view.fill(C.bg);

  const boxRefs = Array.from({ length: N }, () => createRef<Rect>());
  const txtRefs = Array.from({ length: N }, () => createRef<Txt>());

  // All boxes start stacked at x = 0
  for (let i = 0; i < N; i++) {
    view.add(
      <Rect
        ref={boxRefs[i]}
        x={0}
        y={0}
        width={BOX_W}
        height={BOX_H}
        radius={8}
        fill={C.boxFill}
        stroke={C.boxStroke}
        lineWidth={2}
        opacity={0}
        scale={new Vector2(0, 1)} // Start with 0 width
      >
        <Txt
          ref={txtRefs[i]}
          text={String(i + 1)}
          fontSize={28}
          fontWeight={700}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textWhite}
          opacity={0}
        />
      </Rect>,
    );
  }

  // ── Phase 1: Single square appears at centre ──────────────────────────────────

  yield* all(
    boxRefs[0]().opacity(1, 0.4, easeOutCubic),
    boxRefs[0]().scale.x(1, 0.4, easeOutCubic),
  );

  yield* waitFor(0.6);

  // ── Phase 2: All 10 burst outward ───────────────────────────────────────────
  
  // Stagger order from center outward
  const ORDER = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9];

  yield* sequence(
    0.02,
    ...ORDER.map(i => {
      // Make sure it's visible before moving/scaling
      boxRefs[i]().opacity(1);
      return all(
        boxRefs[i]().x(finalX(i), 0.7, easeOutCubic),
        boxRefs[i]().scale.x(1, 0.6, easeOutCubic),
      );
    }),
  );

  // ── Phase 3: Numbers fade in ────────────────────────────────────────────────

  yield* sequence(
    0.06,
    ...txtRefs.map(ref => ref().opacity(1, 0.4, easeInOutCubic)),
  );

  yield* waitFor(3.0);
});
