
function animated_learning() {

  var svg = d3.select("body").select("svg")

  var x = d3.scaleLinear().range([200,500]).domain([0,1])

  var learning_rate = 0.2

  var n_As = 10
  var n_Bs = 10
  var n_pairs = 8

  // create elements with latent values and initial positions

  var As = []
  for (var i=0; i < n_As; i++){
    As.push({id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5})
  }

  var Bs = []
  for (var i=0; i < n_Bs; i++){
    Bs.push({id: i, latent_value: Math.random(), current_position: 0.5, next_position: 0.5})
  }

  // construct circles

  svg.selectAll(".A").data(As, function(d){ return d.id; })
    .enter().append("circle")
      .attr("class", "A A-color")
      .attr("cx", 350)
      .attr("cy", 230)
      .attr("r", 3)

  svg.selectAll(".B").data(Bs, function(d){ return d.id; })
    .enter().append("circle")
      .attr("class", "B B-color")
      .attr("cx", 350)
      .attr("cy", 270)
      .attr("r", 3)


  // simulation / animation loop

  d3.interval(function(){

    // *** SIMULATION ***

    var pairs = []

    for (var i=0; i < n_pairs; i++) {
      var A_id = Math.floor(Math.random()*n_As)

      // pair selection a stochastic function of distance from respective current positions
      var weights = Bs.map(function(d){ return d.current_position - As[A_id].current_position; })
      var cum_weights = []
      weights.reduce(function(a,b,i) { cum_weights[i] = {v: a+b, id:i}; return a + b; },0)
      cum_weights = cum_weights.sort(function(a,b){ return a.v > b.v; })
      var B_id = Math.floor(Math.random()*n_Bs)
      if (cum_weights[cum_weights.length - 1].v != 0) {
        var sel_random = Math.random() * cum_weights[cum_weights.length - 1].v
        var sel = cum_weights.find(function(d){ return d.v >= sel_random; })
        if (!(sel == null)) {
          B_id = sel.id
        }
      }

      pairs.push({A_id: A_id, B_id: B_id})

      // big = 1, small = -1
      var feedback = -1 + 2 * (As[A_id].latent_value > Bs[B_id].latent_value)

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

    var delay = 400
    var move = 500

    // draw and animate pair lines

    svg.selectAll(".pair").remove()

    svg.selectAll(".pair").data(pairs).enter().append("line")
      .attr("class", "pair")
      .attr("y1", 230)
      .attr("y2", 270)
      .style("stroke", "#000")
      .style("stroke-width", 0.25)
      .style("fill", "none")
      .attr("x1", function(d){ return x(As[d.A_id].current_position); })
      .attr("x2", function(d){ return x(Bs[d.B_id].current_position); })
      .transition().delay(delay).duration(move)
        .attr("x1", function(d){ return x(As[d.A_id].next_position); })
        .attr("x2", function(d){ return x(Bs[d.B_id].next_position); })

    // animate circles

    svg.selectAll(".A")
      .transition().delay(delay).duration(move)
        .attr("cx", function(d){ return x(d.next_position); })

    svg.selectAll(".B")
      .transition().delay(delay).duration(move)
        .attr("cx", function(d){ return x(d.next_position); })

    // *** end of svg animation code ***

    // prep next timestep

    As.forEach(function(d){
      d.current_position = d.next_position
    })

    Bs.forEach(function(d){
      d.current_position = d.next_position
    })

  }, 1200)

}

