import { makeScene2D, Rect, Txt, Line, Layout } from '@motion-canvas/2d';
import {
  all,
  createRef,
  sequence,
  waitFor,
  easeOutCubic,
  easeInOutCubic,
  easeInCubic,
  Vector2,
} from '@motion-canvas/core';



import { Palette as C } from '../palette';


// Configuration: Halving bars visualization


const BARS = [
  { value: '16', width: 280 },
  { value: '8',  width: 140 },
  { value: '4',  width: 70  },
  { value: '2',  width: 35  },
  { value: '1',  width: 18  },
];
const BAR_H      = 42;
const BAR_STEP   = 58;
const BAR_CX     = -380; // all bars share same horizontal centre
const BAR_TOP_Y  = -130;
const barCY      = (i: number) => BAR_TOP_Y + i * BAR_STEP;

// Configuration: Chart dimensions and scaling


const CHART_OX = -370;   // screen-x of data origin
const CHART_OY =  140;   // screen-y of data origin
const CHART_W  =  740;
const CHART_H  =  270;
const X_MAX    = 1024;
const Y_MAX    =   30;
const SX       = CHART_W / X_MAX;         // px per data-x unit
const SY       = CHART_H / Y_MAX;         // px per data-y unit

// data coords → screen coords
const pt = (dx: number, dy: number): Vector2 =>
  new Vector2(CHART_OX + dx * SX, CHART_OY - dy * SY);

// Precompute log₂ curve (sampled every 6 data-x units)
const LOG_PTS: Vector2[] = [];
for (let x = 1; x <= X_MAX; x += 6) LOG_PTS.push(pt(x, Math.log2(x)));

// Linear search with less slope — reach Y_MAX at x=100 instead of x=30
const LIN_X_END = 100;
const LIN_END   = pt(LIN_X_END, Y_MAX);
const LIN_PTS   = [pt(0, 0), LIN_END];

// n log n (Sorting cost)
const NLOGN_PTS: Vector2[] = [];
for (let x = 1; x <= 20; x += 1) {
  const y = x * Math.log2(x);
  if (y <= Y_MAX + 10) NLOGN_PTS.push(pt(x, y));
}



export default makeScene2D(function* (view) {
  view.fill(C.bg);



  const titleRef    = createRef<Txt>();
  const dividerRef  = createRef<Line>();
  const barRefs     = BARS.map(() => createRef<Rect>());
  const barTxtRefs  = BARS.map(() => createRef<Txt>());
  const divLblRefs  = Array.from({ length: 4 }, () => createRef<Txt>());
  const summaryRef  = createRef<Txt>();
  const mathRefs    = Array.from({ length: 7 }, () => createRef<Txt>());

  // Chart
  const chartBgRef    = createRef<Rect>();
  const chartTitleRef = createRef<Txt>();
  const xAxisRef      = createRef<Line>();
  const yAxisRef      = createRef<Line>();
  const gridRefs      = [0, 1, 2].map(() => createRef<Line>());
  const logLineRef    = createRef<Line>();
  const linLineRef    = createRef<Line>();
  const arrowRef      = createRef<Line>();
  const logLblRef     = createRef<Txt>();
  const linLblRef     = createRef<Txt>();
  const nlogLineRef   = createRef<Line>();
  const nlogLblRef    = createRef<Txt>();
  const xTickRefs     = [0, 1, 2, 3].map(() => createRef<Txt>());
  const yTickRefs     = [0, 1, 2].map(() => createRef<Txt>());
  const xAxisLblRef   = createRef<Txt>();
  const yAxisLblRef   = createRef<Txt>();
  const insightRef    = createRef<Txt>();



  view.add(
    <Txt ref={titleRef} text="why does halving scale so well?"
      fontSize={28} fontWeight={700} fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite} y={-255} opacity={0} />,
  );

  view.add(
    <Line ref={dividerRef}
      points={[new Vector2(0, -215), new Vector2(0, 175)]}
      stroke={C.divider} lineWidth={1} opacity={0} />,
  );

  // Halving bars (left column — all centred at BAR_CX)
  for (let i = 0; i < BARS.length; i++) {
    view.add(
      <Rect ref={barRefs[i]}
        x={BAR_CX} y={barCY(i)}
        width={BARS[i].width} height={BAR_H}
        radius={6} fill={C.barFill} stroke={C.barStroke} lineWidth={2}
        opacity={0} scale={0.88} />,
    );
    view.add(
      <Txt ref={barTxtRefs[i]} text={BARS[i].value}
        fontSize={28} fontWeight={700} fontFamily="JetBrains Mono, monospace"
        fill={C.accent} x={BAR_CX} y={barCY(i)} opacity={0} />,
    );
  }

  // ÷ 2 labels between bars, aligned with bar centres
  for (let i = 0; i < 4; i++) {
    view.add(
      <Txt ref={divLblRefs[i]} text="÷ 2"
        fontSize={18} fontFamily="JetBrains Mono, monospace"
        fill={C.textDim}
        x={BAR_CX} y={(barCY(i) + barCY(i + 1)) / 2}
        opacity={0} />,
    );
  }

  // Summary line below last bar
  view.add(
    <Txt ref={summaryRef} text="4 halvings  →  log₂(16)  =  4"
      fontSize={26} fontFamily="JetBrains Mono, monospace"
      fill={C.accent} x={BAR_CX} y={BAR_TOP_Y + 5.5 * BAR_STEP} opacity={0} />,
  );

  // Math derivation (right column)
  const MATH = [
    { text: 'each guess halves the search space', color: C.textDim,  size: 19 },
    { text: '',                                   color: C.textDim, size: 19 },
    { text: 'after k guesses:',                   color: C.textMid,  size: 21 },
    { text: '  n / 2ᵏ  elements remain',          color: C.accent,   size: 24 },
    { text: '',                                   color: C.textDim, size: 19 },
    { text: 'search ends when  n / 2ᵏ  =  1',    color: C.textMid,  size: 19 },
    { text: '  ⟹  k  =  log₂(n)  ✓',            color: C.success,    size: 32 },
  ];
  const MX = 250, MY0 = -155, MS = 46;
  for (let i = 0; i < MATH.length; i++) {
    view.add(
      <Txt ref={mathRefs[i]} text={MATH[i].text}
        fontSize={MATH[i].size}
        fontWeight={MATH[i].color === C.success ? 700 : 400}
        fontFamily="JetBrains Mono, monospace"
        fill={MATH[i].color}
        x={MX} y={MY0 + i * MS} opacity={0} />,
    );
  }



  view.add(
    <Rect ref={chartBgRef}
      x={CHART_OX + CHART_W / 2} y={CHART_OY - CHART_H / 2}
      width={CHART_W + 70} height={CHART_H + 70}
      radius={12} fill={'#0a0e14'} stroke={C.divider} lineWidth={1}
      opacity={0} />,
  );

  view.add(
    <Txt ref={chartTitleRef} text="number of guesses vs list size"
      fontSize={22} fontWeight={700} fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite} y={-255} opacity={0} />,
  );

  // Grid lines (y = 10, 20, 30)
  const Y_TICKS = [10, 20, 30];
  for (let i = 0; i < 3; i++) {
    view.add(
      <Line ref={gridRefs[i]}
        points={[pt(0, Y_TICKS[i]), pt(X_MAX, Y_TICKS[i])]}
        stroke={C.chartGrid} lineWidth={1} opacity={0} />,
    );
  }

  view.add(<Line ref={xAxisRef} points={[pt(0, 0), pt(X_MAX, 0)]} stroke={C.chartAxis} lineWidth={2} opacity={0} end={0} />);
  view.add(<Line ref={yAxisRef} points={[pt(0, 0), pt(0, Y_MAX)]} stroke={C.chartAxis} lineWidth={2} opacity={0} end={0} />);

  // X-axis ticks
  const X_TICKS = [256, 512, 768, 1024];
  for (let i = 0; i < 4; i++) {
    const p = pt(X_TICKS[i], 0);
    view.add(
      <Txt ref={xTickRefs[i]} text={X_TICKS[i].toLocaleString()}
        fontSize={13} fontFamily="JetBrains Mono, monospace"
        fill={C.textDim} x={p.x} y={p.y + 22} opacity={0} />,
    );
  }

  // Y-axis ticks
  for (let i = 0; i < 3; i++) {
    const p = pt(0, Y_TICKS[i]);
    view.add(
      <Txt ref={yTickRefs[i]} text={String(Y_TICKS[i])}
        fontSize={13} fontFamily="JetBrains Mono, monospace"
        fill={C.textDim} x={p.x - 28} y={p.y} opacity={0} />,
    );
  }

  // Axis labels
  view.add(
    <Txt ref={xAxisLblRef} text="number of elements"
      fontSize={16} letterSpacing={1} fontFamily="JetBrains Mono, monospace"
      fill={C.textDim} x={CHART_OX + CHART_W / 2} y={CHART_OY + 48} opacity={0} />,
  );
  view.add(
    <Txt ref={yAxisLblRef} text="search time"
      fontSize={16} letterSpacing={1} fontFamily="JetBrains Mono, monospace"
      fill={C.textDim} rotation={-90}
      x={CHART_OX - 52} y={CHART_OY - CHART_H / 2} opacity={0} />,
  );

  // Log₂ curve — drawn with animated `end`
  view.add(
    <Line ref={logLineRef}
      points={LOG_PTS}
      stroke={C.success} lineWidth={3.5}
      smoothness={0.4} end={0} opacity={0} />,
  );

  // Linear line — short, stops at chart top
  view.add(
    <Line ref={linLineRef}
      points={LIN_PTS}
      stroke={C.error} lineWidth={3}
      end={0} opacity={0} />,
  );

  // Curve labels
  const logEnd = LOG_PTS[LOG_PTS.length - 1];
  view.add(
    <Txt ref={logLblRef} text="binary search log(n)"
      fontSize={19} fontWeight={700} fontFamily="JetBrains Mono, monospace"
      fill={C.success} x={logEnd.x - 100} y={logEnd.y - 30} opacity={0} />,
  );
  view.add(
    <Txt ref={linLblRef} text="linear search n"
      fontSize={19} fontWeight={700} fontFamily="JetBrains Mono, monospace"
      fill={C.error} x={LIN_END.x + 60} y={LIN_END.y - 20} opacity={0} />,
  );

  // (Legend removed)

  // Bottom insight
  view.add(
    <Txt ref={insightRef}
      text="every time n doubles, you only need 1 more guess"
      fontSize={19} fontWeight={700} fontFamily="JetBrains Mono, monospace"
      fill={C.textWhite} y={CHART_OY + 75} opacity={0} />,
  );



  // 1 — Title
  yield* titleRef().opacity(1, 0.5, easeInOutCubic);
  yield* waitFor(0.4);

  // 2 — Divider + first bar pop in together
  yield* all(
    dividerRef().opacity(1, 0.4),
    barRefs[0]().opacity(1, 0.28, easeOutCubic),
    barRefs[0]().scale(1,  0.28, easeOutCubic),
    barTxtRefs[0]().opacity(1, 0.28),
  );

  // 3 — Each subsequent bar with its ÷ 2 label above it
  for (let i = 1; i < BARS.length; i++) {
    yield* waitFor(0.14);
    yield* all(
      divLblRefs[i - 1]().opacity(1, 0.22),
      barRefs[i]().opacity(1,   0.26, easeOutCubic),
      barRefs[i]().scale(1,     0.26, easeOutCubic),
      barTxtRefs[i]().opacity(1, 0.26),
    );
  }

  yield* waitFor(0.4);

  // 4 — Summary below bars
  yield* summaryRef().opacity(1, 0.4, easeInOutCubic);
  yield* waitFor(0.7);

  // 5 — Math derivation, line by line (skip empty spacers)
  for (let i = 0; i < MATH.length; i++) {
    if (!MATH[i].text) continue;
    const isLast = i === MATH.length - 1;
    yield* mathRefs[i]().opacity(1, isLast ? 0.45 : 0.32, easeInOutCubic);
    yield* waitFor(isLast ? 1.3 : 0.55);
  }

  yield* waitFor(0.9);

  // Phase Transition


  yield* all(
    titleRef().opacity(0,   0.38),
    dividerRef().opacity(0, 0.38),
    summaryRef().opacity(0, 0.32),
    ...barRefs.map(r    => r().opacity(0, 0.28)),
    ...barTxtRefs.map(r => r().opacity(0, 0.28)),
    ...divLblRefs.map(r => r().opacity(0, 0.28)),
    ...mathRefs.map(r   => r().opacity(0, 0.28)),
  );

  yield* waitFor(0.22);



  // 1 — Chart background + title
  yield* all(
    chartBgRef().opacity(1,    0.4, easeInOutCubic),
    chartTitleRef().opacity(1, 0.4, easeInOutCubic),
  );

  yield* waitFor(0.15);

  // 2 — Axes draw in
  yield* all(
    xAxisRef().opacity(1, 0.2),
    yAxisRef().opacity(1, 0.2),
    xAxisRef().end(1, 0.8, easeOutCubic),
    yAxisRef().end(1, 0.8, easeOutCubic),
  );

  // 3 — Grid + ticks
  yield* all(
    ...gridRefs.map(r  => r().opacity(0.5, 0.3)),
    ...xTickRefs.map(r => r().opacity(1,   0.3)),
    ...yTickRefs.map(r => r().opacity(1,   0.3)),
    xAxisLblRef().opacity(1, 0.3),
    yAxisLblRef().opacity(1, 0.3),
  );

  yield* waitFor(0.35);

  // 4 — Linear line (Red) appears first
  linLineRef().stroke(C.error);
  linLineRef().opacity(1);
  yield* linLineRef().end(1, 0.6, easeInCubic);
  yield* linLblRef().opacity(1, 0.4, easeOutCubic);

  yield* waitFor(0.5);

  // 5 — Binary Search curve (Green) follows
  logLineRef().stroke(C.success);
  logLineRef().opacity(1);
  yield* logLineRef().end(1, 1.9, easeInOutCubic);
  yield* logLblRef().opacity(1, 0.4, easeOutCubic);

  yield* waitFor(1.5);

  // 6 — Final insight
  yield* insightRef().opacity(1, 0.5, easeInOutCubic);

  // Hold for voiceover
  yield* waitFor(4.0);
});
