import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
function weightedRandom(items, weights) {
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      totalWeight += parseInt(weights[i]);
    }
  
    let random = Math.random() * totalWeight;
    let currentWeight = 0;
  
    for (let i = 0; i < items.length; i++) {
        // console.log(currentWeight)
      currentWeight += parseInt(weights[i]);
      if (random < currentWeight) {
        return items[i];
      }
    }
  }
function createChart(width, data, groups, transitionData,invalidation) {
    const height = width;
    const color = d3.interpolateWarm;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const nodes = data.map(d => Object.create(d));
  
    const simulation = d3.forceSimulation(nodes)
        .alphaTarget(0.3) // stay hot
        .velocityDecay(0.1) // low friction
        .force("x", d3.forceX().x((d) => groups[d.group].x).strength(0.01))
        .force("y", d3.forceY().y((d) => groups[d.group].y).strength(0.01))
        .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(3))
        // .force("charge",d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);
  
    // Add event listeners to canvas
    // d3.select(canvas)
    //     .on("touchmove", event => event.preventDefault())
    //     .on("pointermove", pointerMoved);
  
    // Stop simulation on invalidation
    // invalidation.then(() => simulation.stop());
  
    function pointerMoved(event) {
      const [x, y] = d3.pointer(event);
      
    }
    var hour = 0;
    function changeGroupRandomly() {
        const randomNode = Math.floor(Math.random() * nodes.length);
        // console.log(transitionData.map(row => row[0]));
        nodes[randomNode].group = weightedRandom([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],transitionData.map(row => row[hour]).slice(0,transitionData.map(row => row[hour]).length-1))
        // console.log(nodes[randomNode].group)
        simulation.force("x", d3.forceX().x((d) => groups[d.group].x).strength(0.01))
        .force("y", d3.forceY().y((d) => groups[d.group].y).strength(0.01));
        simulation.alpha(1).restart();
    }
    setInterval(() => {
        changeGroupRandomly();
        // simulation.alpha(1).restart(); // Restart simulation to apply changes
    }, 100);
    setInterval(() => {
        hour += 1;
        hour = hour % 24;
        console.log(hour);
    },5000)
  
    function ticked() {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      for (let i = 0; i < nodes.length; ++i) {
        const d = nodes[i];
        context.beginPath();
        context.moveTo(d.x + d.r, d.y);
        context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        context.fillStyle = color(d.group/14);
        context.fill();
        // console.log(d.x,d.y)
      }
      context.fillStyle = "black";
      for (let i = 0; i < groups.length; i++) {
        
        context.fillText(transitionData[i].Activity,groups[i].x*1.3,groups[i].y*1.3);
      }
      context.restore();
    }
    return canvas;
  }
  const timeData = await d3.csv("usa-activity-data.csv")
  console.log(timeData)
  let radius = 400;
  let groups = []
  for (let i = 0; i < timeData.length-1; i++) {
    groups.push({x:radius*Math.cos(2*Math.PI*i/(timeData.length-1)),y:radius*Math.sin(2*Math.PI*i/(timeData.length-1))})
  }
  // Usage example
  const data = [
  ];
  for (let i = 0; i < 1000; i++) {
    data.push({group: Math.floor(Math.random()*(timeData.length-1)),r: 4});
  }
  
  
  // Assuming 'invalidation' is a Promise
  const invalidation = Promise.resolve(); // Replace with actual invalidation logic
  const chart = createChart(2000, data, groups,timeData,invalidation);
  document.body.appendChild(chart);
  