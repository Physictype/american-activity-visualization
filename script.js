import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
const data = await d3.csv("/usa-activity-data.csv", function(d) {
  return { date: d3.timeParse("%Y-%m-%d")(d.date), value: +d.value }; // Parse date and convert value to number
});

class Vector2 {
    constructor(x,y) {
        this.x=x;
        this.y = y;
    }
    add(v) {
        var res = new Vector2(this.x,this.y);
        res.x += v.x;
        res.y += v.y;
        return res;
    }
    addu(v) {
        this.x = this.add(v).x;
        this.y = this.add(v).y;
        return this;
    }
    sub(v) {
        var res = new Vector2(this.x,this.y);
        res.x -= v.x;
        res.y -= v.y;
        return res;
    }
    subu(v) {
        this.x = this.sub(v).x;
        this.y = this.sub(v).y;
        return this
    }
    mag() {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    mult(s) {
        return new Vector2(this.x*s,this.y*s);
    }
    dot(v) {
        return this.x*v.x+this.y*v.y;
    }
    x;
    y;
}

class Particle {
    constructor(posx,posy,idx) {
        this.position = new Vector2(posx,posy);
        this.velocity = new Vector2(0,0);
        this.idx = idx;
    }
    position;
    velocity;
    idx;
}
function goofy_acceleration() {

}

function elastic_collision(p1,p2) {

}

const source_positions = [new Vector2(100,200),new Vector2(360,210)];
var particles = [new Particle(100,200,1),new Particle(100,230,1),new Particle(360,200,0)];
var ATTRACT_CONST = 0.00001;


function force(pos1,pos2) {
    let scale = ATTRACT_CONST*pos2.sub(pos1).mag();///pos1.sub(pos2).mag()/pos1.sub(pos2).mag()/pos1.sub(pos2).mag();
    // console.log(scale)
    return pos2.sub(pos1).mult(scale);//.mult(scale);
}

var x = d3.scaleLinear()
    .domain([0, 460])
    .range([ 0, width ]);

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 400])
    .range([ height, 0]);
svg.append('g')
    .selectAll("dot")
    .data(particles)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.position.x); } )
      .attr("cy", function (d) { return y(d.position.y); } )
      .attr("r", 5)
      .style("fill", function (d) { return d3.interpolateRainbow(d.idx/10);})
console.log(svg.append('g')
.selectAll("dot")
    .data(particles)
    .enter()
    .append("line")
      .attr("x1",function (d) {console.log("SOUS");return x(d.position.x)})
      .attr("y1",function (d) {return y(d.position.y)})
      .attr("x2",function (d) {return x(d.position.x+d.velocity.x*1000)})
      .attr("y2",function (d) {return y(d.position.y+d.velocity.y*1000)})
    //   .style("stroke", function (d) { return d3.interpolateRainbow(d.idx/10);})
      .attr("stroke-width", 5))
    
// var pos_display = svg.append('g')
//     .selectAll("dot")
//     .data(particles)
//     .enter()
//     .append("circle")
//       .attr("cx", function (d) { return x(d.position.x); } )
//       .attr("cy", function (d) { return y(d.position.y); } )
//       .attr("r", 5)
//       .style("fill", "#69b3a2")

console.log(svg);
const BOUNCE_CONST = 0.0;
var moveInterval = setInterval(() => {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
            if (particles[i].position.sub(particles[j].position).mag()<5) {
                let offset = Math.random;
                
                // console.log(particles[i].position
                //     .sub(particles[j].position));
                //     console.log(particles[i].velocity);
                let diff = particles[i].position
                                .sub(particles[j].position);
                let normDiff = diff.mult(1/diff.mag());
                
                            
                // console.log(particles[i].velocity
                //     .dot(diff));
                let vel1with = normDiff.mult(particles[i].velocity
                                            .dot(normDiff))

                let vel2with = normDiff.mult(particles[j].velocity
                                            .dot(normDiff))
        
                particles[i].velocity.subu(vel1with.mult(1+BOUNCE_CONST));
                particles[j].velocity.subu(vel2with.mult(1+BOUNCE_CONST));
                //particles[i].velocity.addu(offset);
                //particles[j].velocity.addu(-offset);
                // console.log(particles[i].velocity);
                // console.log(vel1with);

                let avg = particles[i].position.add(particles[j].position).mult(0.5);
                // particles[i].position = avg.add(normDiff.mult(5));
                // particles[j].position = avg.add(normDiff.mult(-5));
            }
        }
    }
    for (let i = 0; i < particles.length; i++) {
        let f = force(particles[i].position,source_positions[particles[i].idx])
        particles[i].velocity.addu(f);
        // if (particles[i].position.sub(source_positions[particles[i].idx]).mag()<10) {
        //     particles[i].velocity = new Vector2(0,0);
        // }
        particles[i].position.addu(particles[i].velocity);
        
    }
    const circles = svg.selectAll("circle")
        .data(particles); // Bind the new data

    // Update existing circles
    circles
        .transition() // Add a transition for smooth updates
        .duration(0)
        .attr("cx", d => x(d.position.x))
        .attr("cy", d => y(d.position.y));

    // Enter new circles
    circles.enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 30) // Adjust circle radius as needed
        .attr("fill", "steelblue"); // Adjust color as needed

    // Exit and remove any circles that no longer have data
    circles.exit()
        .remove();
    const vel_lines = svg.selectAll("line")
//     svg.append('g')
// .selectAll("dot")
//     .data(particles)
//     .enter()
//     .append("line")
//       .attr("x1",function (d) {console.log("SOUS");return x(d.position.x)})
//       .attr("y1",function (d) {return y(d.position.y)})
//       .attr("x2",function (d) {return x(d.position.x+d.velocity.x*10000)})
//       .attr("y2",function (d) {return y(d.position.y+d.velocity.y*10000)})
//       .style("stroke", function (d) { return d3.interpolateRainbow(d.idx/10);})
//       .attr("stroke-width", 5)
    vel_lines
        .transition()
        .duration(0)
        .attr("x1",function (d) {console.log("SOUS");return x(d.position.x)})
        .attr("y1",function (d) {return y(d.position.y)})
        .attr("x2",function (d) {return x(d.position.x+d.velocity.x*100)})
        .attr("y2",function (d) {return y(d.position.y+d.velocity.y*100)})
        .style("stroke", "black")
        .attr("stroke-width", 5)
    vel_lines.exit()
        .remove();
},0);


// // Add the x-axis
// const xaxis = svg.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x).ticks(10));

// // Add the y-axis
// const yaxis = svg.append("g")
//   .call(d3.axisLeft(y).ticks(10));

// // Create the line generator
// const line = d3.line()  
//   .x(d => x(d.date))  // Define x coordinate using x scale
//   .y(d => y(d.value));  // Define y coordinate using y scale
// // Add the line path to the SVG
// var path = svg.append("path")
//   .datum(data)  // Bind the data
//   .attr("fill", "none")  // No fill for the line
//   .attr("stroke", "steelblue")  // Line color
//   .attr("stroke-width", 1.5)  // Line width
//   .attr("d", line);  // Generate the path data using the line generator

// // d3.select("#zoomout").on("click",(event) => {
    
// // })
// var ymax = d3.max(data,d=>d.value);
// var ymin = d3.min(data,d=>d.value);
// var range = ymax-ymin;
// d3.select("body").on("click",(event) => {
//     // console.log(event.offsetY)
//     // console.log(y.invert(event.offsetY))
//     range *= 0.6;
//     ymax = y.invert(event.offsetY)+range/2;
//     ymin = y.invert(event.offsetY)-range/2;
//     // Define a new domain for the x-axis
//     const newDomain = [
//         ymin, 
//         ymax
//     ];
    
//     // Update the x scale
//     y.domain(newDomain);

//     // Transition the x-axis
//     yaxis.transition()
//         .duration(400)  // Duration of the transition
//         .call(d3.axisLeft(y));

//     // Transition the line
//     path.transition()
//         .duration(400)
//         .attr("d", line);
// }).on("contextmenu", function (event) {
//     event.preventDefault();
//    range *= 1/0.6
//    ymax = y.invert(event.offsetY)+range/2;
//     ymin = y.invert(event.offsetY)-range/2;
//    // Define a new domain for the x-axis
//    const newDomain = [
//        ymin, 
//        ymax
//    ];
   
//    // Update the x scale
//    y.domain(newDomain);

//    // Transition the x-axis
//    yaxis.transition()
//        .duration(400)  // Duration of the transition
//        .call(d3.axisLeft(y));

//    // Transition the line
//    path.transition()
//        .duration(400)
//        .attr("d", line);
// });
// (1+1/(1+Math.pow(e,4))*(2*Math.pow(e,8-2*x)/Math.pow(Math.pow(e,4-x),3)-Math.pow(e,4-x)/Math.pow(Math.pow(e,4-x)+1,2)