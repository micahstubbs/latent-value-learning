/* global d3 */

function animatedLearning() {
  const width = 384;
  const height = 200;  // change the height and the rest of the layout responds ✨

  const margin = {
    top: height * 0.05,
    bottom: height * 0.05,
    left: 0,
    right: 0
  };

  // calculate some useful values for plot layout
  const innerHeight = height - margin.top - margin.bottom;
  const pointYDistance  = innerHeight * 0.3;
  const pointYOffset = (innerHeight - pointYDistance) / 2;

  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  const g =  svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // draw the center line
  g.append('line')
    .attr('x1', x.range()[0])
    .attr('x2', x.range()[1])
    .attr('y1', innerHeight / 2)
    .attr('y2', innerHeight / 2)
    .style('stroke', 'black')
    .style('stroke-width', '0.75')
    .style('fill', 'none')

  // draw A elements label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', pointYOffset * 0.4)
    .attr('dy', '0.35em')
    .classed('A-color', true)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text('A elements');

  // draw B elements label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', pointYOffset + pointYDistance + (pointYOffset * 0.6))
    .attr('dy', '0.35em')
    .classed('B-color', true)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text('B elements');

  const learningRate = 0.2;

  const nAs = 10;
  const nBs = 10;
  const nPairs = 8;

  //
  // create elements with latent values and initial positions
  //
  const As = [];
  for (let i = 0; i < nAs; i += 1) {
    As.push({ 
      id: i,
      latentValue: Math.random(),
      currentPosition: 0.5, 
      nextPosition: 0.5
    });
  }

  const Bs = [];
  for (let i = 0; i < nBs; i += 1) {
    Bs.push({
      id: i,
      latentValue: Math.random(),
      currentPosition: 0.5,
      nextPosition: 0.5
    });
  }

  //
  // construct circles
  //
  g.selectAll('.A').data(As, d => d.id)
    .enter().append('circle')
      .attr('class', 'A A-color')
      .attr('cx', width / 2)
      .attr('cy', pointYOffset)
      .attr('r', 3);

  g.selectAll('.B').data(Bs, d => d.id)
    .enter().append('circle')
      .attr('class', 'B B-color')
      .attr('cx', width / 2)
      .attr('cy', pointYOffset + pointYDistance)
      .attr('r', 3);

  //
  // simulation / animation loop
  //
  d3.interval(() => {
    // *** SIMULATION ***

    const pairs = [];

    for (let i = 0; i < nPairs; i += 1) {
      const aId = Math.floor(Math.random() * nAs);

      // pair selection a stochastic function of distance from respective current positions
      const weights = Bs.map(d => d.currentPosition - As[aId].currentPosition);

      let cumWeights = [];
      weights.reduce((a, b, i) => { 
        cumWeights[i] = { 
          v: a + b, 
          id: i 
        }; 
        return a + b; 
      }, 0);
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
      const feedback = -1 + (2 * (As[aId].latentValue > Bs[bId].latentValue));

      // use feedback if it contradicts current
      if ((feedback === -1) && (As[aId].currentPosition <= Bs[bId].currentPosition)) {
        As[aId].nextPosition = As[aId].currentPosition + (Math.random() * learningRate);
        Bs[bId].nextPosition = Bs[bId].currentPosition - (Math.random() * learningRate);
      }

      if ((feedback === 1) && (As[aId].currentPosition >= Bs[bId].currentPosition)) {
        As[aId].nextPosition = As[aId].currentPosition - (Math.random() * learningRate);
        Bs[bId].nextPosition = Bs[bId].currentPosition + (Math.random() * learningRate);
      }

      As[aId].nextPosition = Math.min(1, Math.max(0, As[aId].nextPosition));
      Bs[bId].nextPosition = Math.min(1, Math.max(0, Bs[bId].nextPosition));
    }

    // *** SVG ANIMATION ***

    const delay = 400;
    const move = 500;

    //
    // draw and animate pair lines
    //
    g.selectAll('.pair').remove();

    g.selectAll('.pair')
      .data(pairs)
      .enter().append('line')
        .attr('class', 'pair')
        .attr('y1', pointYOffset)
        .attr('y2', pointYOffset + pointYDistance)
        .style('stroke', '#000')
        .style('stroke-width', 0.25)
        .style('fill', 'none')
        .attr('x1', d => x(As[d.aId].currentPosition))
        .attr('x2', d => x(Bs[d.bId].currentPosition))
        .transition()
          .delay(delay)
          .duration(move)
          .attr('x1', d => x(As[d.aId].nextPosition))
          .attr('x2', d => x(Bs[d.bId].nextPosition));

    //
    // animate circles
    //
    g.selectAll('.A')
      .transition()
        .delay(delay)
        .duration(move)
        .attr('cx', d => x(d.nextPosition));

    g.selectAll('.B')
      .transition()
        .delay(delay)
        .duration(move)
        .attr('cx', d => x(d.nextPosition));

    // *** end of svg animation code ***

    //
    // prep next timestep
    //
    As.forEach((d) => {
      d.currentPosition = d.nextPosition;
    });

    Bs.forEach((d) => {
      d.currentPosition = d.nextPosition;
    });
  }, 1200);
}

