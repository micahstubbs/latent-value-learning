/* global d3 */

function animatedLearning() {
  const svg = d3.select('body').select('svg');

  const x = d3.scaleLinear().range([200, 500]).domain([0, 1]);

  const learningRate = 0.2;

  const nAs = 10;
  const nBs = 10;
  const nPairs = 8;

  // create elements with latent values and initial positions

  const As = [];
  for (let i = 0; i < nAs; i += 1) {
    As.push({ id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5 });
  }

  const Bs = [];
  for (let i = 0; i < nBs; i += 1) {
    Bs.push({ id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5 });
  }

  // construct circles

  svg.selectAll('.A').data(As, d => d.id)
    .enter().append('circle')
      .attr('class', 'A A-color')
      .attr('cx', 350)
      .attr('cy', 230)
      .attr('r', 3);

  svg.selectAll('.B').data(Bs, d => d.id)
    .enter().append('circle')
      .attr('class', 'B B-color')
      .attr('cx', 350)
      .attr('cy', 270)
      .attr('r', 3);


  // simulation / animation loop

  d3.interval(() => {
    // *** SIMULATION ***

    const pairs = [];

    for (let i = 0; i < nPairs; i += 1) {
      const aId = Math.floor(Math.random() * nAs);

      // pair selection a stochastic function of distance from respective current positions
      const weights = Bs.map(d => d.current_position - As[aId].current_position);
      let cumWeights = [];
      weights.reduce((a, b, i) => { cumWeights[i] = { v: a + b, id: i }; return a + b; }, 0);
      cumWeights = cumWeights.sort((a, b) => a.v > b.v);
      let bId = Math.floor(Math.random() * nBs);
      if (cumWeights[cumWeights.length - 1].v !== 0) {
        const selRandom = Math.random() * cumWeights[cumWeights.length - 1].v;
        const sel = cumWeights.find(d => d.v >= selRandom);
        if (!(sel == null)) {
          bId = sel.id;
        }
      }

      pairs.push({ aId, bId });

      // big = 1, small = -1
      const feedback = -1 + (2 * (As[aId].latent_value > Bs[bId].latent_value));

      // use feedback if it contradicts current
      if ((feedback === -1) && (As[aId].current_position <= Bs[bId].current_position)) {
        As[aId].next_position = As[aId].current_position + (Math.random() * learningRate);
        Bs[bId].next_position = Bs[bId].current_position - (Math.random() * learningRate);
      }

      if ((feedback === 1) && (As[aId].current_position >= Bs[bId].current_position)) {
        As[aId].next_position = As[aId].current_position - (Math.random() * learningRate);
        Bs[bId].next_position = Bs[bId].current_position + (Math.random() * learningRate);
      }

      As[aId].next_position = Math.min(1, Math.max(0, As[aId].next_position));
      Bs[bId].next_position = Math.min(1, Math.max(0, Bs[bId].next_position));
    }

    // *** SVG ANIMATION ***

    const delay = 400;
    const move = 500;

    // draw and animate pair lines

    svg.selectAll('.pair').remove();

    svg.selectAll('.pair').data(pairs).enter().append('line')
      .attr('class', 'pair')
      .attr('y1', 230)
      .attr('y2', 270)
      .style('stroke', '#000')
      .style('stroke-width', 0.25)
      .style('fill', 'none')
      .attr('x1', d => x(As[d.aId].current_position))
      .attr('x2', d => x(Bs[d.bId].current_position))
      .transition().delay(delay).duration(move)
        .attr('x1', d => x(As[d.aId].next_position))
        .attr('x2', d => x(Bs[d.bId].next_position));

    // animate circles

    svg.selectAll('.A')
      .transition().delay(delay).duration(move)
        .attr('cx', d => x(d.next_position));

    svg.selectAll('.B')
      .transition().delay(delay).duration(move)
        .attr('cx', d => x(d.next_position));

    // *** end of svg animation code ***

    // prep next timestep

    As.forEach((d) => {
      d.current_position = d.next_position;
    });

    Bs.forEach((d) => {
      d.current_position = d.next_position;
    });
  }, 1200);
}

