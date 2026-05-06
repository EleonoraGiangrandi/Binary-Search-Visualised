import { makeScene2D, Txt, Rect, Layout, Line, Circle } from '@motion-canvas/2d';
import { all, createRef, sequence, waitFor, easeOutCubic, easeInOutCubic, Vector2 } from '@motion-canvas/core';
import { Palette as C } from '../palette';

export default makeScene2D(function* (view) {
  view.fill(C.bg);

  const titleRef = createRef<Txt>();
  const taglineRef = createRef<Txt>();
  const itemRefs = [createRef<Layout>(), createRef<Layout>(), createRef<Layout>()];
  const thanksRef = createRef<Txt>();
  
  // Animation specific refs
  const sortedBars = Array.from({ length: 10 }, () => createRef<Rect>());
  const splitParent = createRef<Layout>();
  const splitBars = [createRef<Rect>(), createRef<Rect>()];
  const logCurve = createRef<Line>();

  view.add(
    <Circle width={1200} height={1200} fill={C.surface} opacity={0.05} x={600} y={300} />
  );

  view.add(
    <Layout layout direction="column" alignItems="center" gap={80}>
      
      {/* Title Section */}
      <Layout direction="column" alignItems="center" gap={10}>
        <Txt
          ref={titleRef}
          text="BINARY SEARCH"
          fontSize={100}
          fontWeight={900}
          letterSpacing={12}
          fontFamily="JetBrains Mono, monospace"
          fill={C.accent}
          shadowBlur={30}
          shadowColor={C.accent}
          opacity={0}
          y={40}
        />
        <Txt
          ref={taglineRef}
          text="DIVIDE AND CONQUER"
          fontSize={24}
          letterSpacing={8}
          fontFamily="JetBrains Mono, monospace"
          fill={C.textDim}
          opacity={0}
        />
      </Layout>

      {/* Takeaways Section */}
      <Layout direction="row" gap={60} alignItems="center">
        
        {/* 1. SORTED DATA */}
        <Layout ref={itemRefs[0]} direction="column" alignItems="center" gap={20} opacity={0} y={20}>
          <Rect
            layout
            alignItems="center"
            justifyContent="center"
            width={180} height={180} radius={24}
            fill={C.surface} stroke={C.success} lineWidth={2}
            shadowBlur={10} shadowColor={C.success}
            clip
          >
            <Layout direction="row" alignItems="end" gap={6} y={15}>
              {sortedBars.map((ref, i) => (
                <Rect
                  ref={ref}
                  width={10}
                  height={20 + i * 14}
                  radius={2}
                  fill={C.success}
                  opacity={0}
                  scaleY={0}
                />
              ))}
            </Layout>
          </Rect>
          <Txt text="SORTED DATA" fontSize={18} fontWeight={700} letterSpacing={2} fill={C.textBright} fontFamily="JetBrains Mono, monospace" />
        </Layout>

        {/* 2. SPLIT & REDUCE */}
        <Layout ref={itemRefs[1]} direction="column" alignItems="center" gap={20} opacity={0} y={20}>
          <Rect
            layout
            alignItems="center"
            justifyContent="center"
            width={180} height={180} radius={24}
            fill={C.surface} stroke={C.info} lineWidth={2}
            shadowBlur={10} shadowColor={C.info}
            clip
          >
            <Layout ref={splitParent} direction="row" gap={12} alignItems="center">
              <Rect ref={splitBars[0]} width={55} height={110} radius={8} fill={C.info} opacity={0} />
              <Rect ref={splitBars[1]} width={55} height={110} radius={8} fill={C.info} opacity={0} />
            </Layout>
          </Rect>
          <Txt text="SPLIT & REDUCE" fontSize={18} fontWeight={700} letterSpacing={2} fill={C.textBright} fontFamily="JetBrains Mono, monospace" />
        </Layout>

        {/* 3. LOGARITHMIC */}
        <Layout ref={itemRefs[2]} direction="column" alignItems="center" gap={20} opacity={0} y={200}>
          <Rect
            width={180} height={180} radius={24}
            fill={C.surface} stroke={C.accent} lineWidth={2}
            shadowBlur={10} shadowColor={C.accent}
          >
            <Line
              ref={logCurve}
              points={Array.from({ length: 30 }, (_, i) => {
                const x = (i / 29) * 140 - 70;
                const y = -Math.log2((i / 29) * 15 + 1) * 35 + 50;
                return [x, y];
              })}
              stroke={C.accent}
              lineWidth={5}
              lineCap="round"
              smoothness={0.4}
              end={0}
            />
          </Rect>
          <Txt text="O(log n)" fontSize={18} fontWeight={700} letterSpacing={2} fill={C.textBright} fontFamily="JetBrains Mono, monospace" />
        </Layout>

      </Layout>

      <Txt
        ref={thanksRef}
        text="thanks for watching!"
        fontSize={32}
        fontFamily="JetBrains Mono, monospace"
        fill={C.textDim}
        opacity={0}
        y={20}
      />
    </Layout>
  );

  // OUTRO ANIMATION SEQUENCE


  // Title entrance

  yield* all(
    titleRef().opacity(1, 1, easeOutCubic),
    titleRef().y(0, 1, easeOutCubic),
  );
  yield* taglineRef().opacity(1, 0.8);

  yield* waitFor(0.5);

  // Takeaways entrance with internal animations

  yield* sequence(
    0.5,
    // Box 1 Animation: Sorted bars grow to fill
    all(
      itemRefs[0]().opacity(1, 0.6, easeOutCubic),
      itemRefs[0]().y(0, 0.6, easeOutCubic),
      sequence(0.06, ...sortedBars.map(bar => all(
        bar().opacity(1, 0.3), 
        bar().scale.y(1, 0.6, easeOutCubic),
        bar().height(140, 1.2, easeInOutCubic)
      )))
    ),
    // Box 2 Animation: Split and shrink
    all(
      itemRefs[1]().opacity(1, 0.6, easeOutCubic),
      itemRefs[1]().y(0, 0.6, easeOutCubic),
      sequence(0.3,
        all(splitBars[0]().opacity(1, 0.4), splitBars[1]().opacity(1, 0.4)),
        all(
          splitBars[0]().width(35, 0.6, easeInOutCubic),
          splitBars[1]().width(35, 0.6, easeInOutCubic),
          splitParent().gap(50, 0.6, easeInOutCubic)
        )
      )
    ),
    // Box 3 Animation: Miniature log graph
    all(
      itemRefs[2]().opacity(1, 0.6, easeOutCubic),
      itemRefs[2]().y(0, 0.6, easeOutCubic),
      logCurve().end(1, 1.2, easeInOutCubic)
    )
  );

  yield* waitFor(1);

  // Final message

  yield* all(
    thanksRef().opacity(1, 1),
    thanksRef().y(0, 1),
  );

  // Subtle pulse effect

  yield* titleRef().scale(1.05, 2, easeInOutCubic).to(1, 2, easeInOutCubic);

  yield* waitFor(3);
});
