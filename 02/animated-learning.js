
function animated_learning() {

  const svg = d3.select("body").select("svg");

  const x = d3.scaleLinear().range([200,500]).domain([0,1]);

  const learning_rate = 0.2;

  const n_As = 10;
  const n_Bs = 10;
  const n_pairs = 8;

  // create elements with latent values and initial positions

  const As = [];
  for (var i=0; i < n_As; i++){
    As.push({id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5})
  }

  const Bs = [];
  for (var i=0; i < n_Bs; i++){
    Bs.push({id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5})
  }

  // construct circles

  svg.selectAll(".A").data(As, d => d.id)
    .enter().append("circle")
      .attr("class", "A A-color")
      .attr("cx", 350)
      .attr("cy", 230)
      .attr("r", 3)

  svg.selectAll(".B").data(Bs, d => d.id)
    .enter().append("circle")
      .attr("class", "B B-color")
      .attr("cx", 350)
      .attr("cy", 270)
      .attr("r", 3)


  // simulation / animation loop

  d3.interval(() => {

    // *** SIMULATION ***

    const pairs = [];

    for (let i=0; i < n_pairs; i++) {
      const A_id = Math.floor(Math.random()*n_As);

      // pair selection a stochastic function of distance from respective current positions
      const weights = Bs.map(d => d.current_position - As[A_id].current_position);
      let cum_weights = [];
      weights.reduce((a, b, i) => { cum_weights[i] = {v: a+b, id:i}; return a + b; },0)
      cum_weights = cum_weights.sort((a, b) => a.v > b.v)
      let B_id = Math.floor(Math.random()*n_Bs);
      if (cum_weights[cum_weights.length - 1].v != 0) {
        const sel_random = Math.random() * cum_weights[cum_weights.length - 1].v;
        const sel = cum_weights.find(d => d.v >= sel_random);
        if (!(sel == null)) {
          B_id = sel.id
        }
      }

      pairs.push({A_id, B_id})

      // big = 1, small = -1
      const feedback = -1 + 2 * (As[A_id].latent_value > Bs[B_id].latent_value);

      // use feedback if it contradicts current
      if ((feedback == -1) && (As[A_id].current_position <= Bs[B_id].current_position)) {
        As[A_id].next_position = As[A_id].current_position + Math.random() * learning_rate
        Bs[B_id].next_position = Bs[B_id].current_position - Math.random() * learning_rate
      }

      if ((feedback == 1) && (As[A_id].current_position >= Bs[B_id].current_position)) {
        As[A_id].next_position = As[A_id].current_position - Math.random() * learning_rate
        Bs[B_id].next_position = Bs[B_id].current_position + Math.random() * learning_rate
      }

      As[A_id].next_position = Math.min(1, Math.max(0, As[A_id].next_position))
      Bs[B_id].next_position = Math.min(1, Math.max(0, Bs[B_id].next_position))

    }

    // *** SVG ANIMATION ***

    const delay = 400;
    const move = 500;

    // draw and animate pair lines

    svg.selectAll(".pair").remove()

    svg.selectAll(".pair").data(pairs).enter().append("line")
      .attr("class", "pair")
      .attr("y1", 230)
      .attr("y2", 270)
      .style("stroke", "#000")
      .style("stroke-width", 0.25)
      .style("fill", "none")
      .attr("x1", d => x(As[d.A_id].current_position))
      .attr("x2", d => x(Bs[d.B_id].current_position))
      .transition().delay(delay).duration(move)
        .attr("x1", d => x(As[d.A_id].next_position))
        .attr("x2", d => x(Bs[d.B_id].next_position))

    // animate circles

    svg.selectAll(".A")
      .transition().delay(delay).duration(move)
        .attr("cx", d => x(d.next_position))

    svg.selectAll(".B")
      .transition().delay(delay).duration(move)
        .attr("cx", d => x(d.next_position))

    // *** end of svg animation code ***

    // prep next timestep

    As.forEach(d => {
      d.current_position = d.next_position
    })

    Bs.forEach(d => {
      d.current_position = d.next_position
    })

  }, 1200)

}

