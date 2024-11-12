import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
function weightedRandom(items, weights) {
	let totalWeight = 0;
	for (let i = 0; i < weights.length; i++) {
		totalWeight += weights[i];
	}

	let random = Math.random() * totalWeight;
	let currentWeight = 0;

	for (let i = 0; i < items.length; i++) {
		currentWeight += weights[i];
		if (random < currentWeight) {
			return items[i];
		}
	}
}
var speed = 600;
function createChart(width, data, groups, transitionData, invalidation) {
	const height = width;
	const color = d3.interpolateWarm;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const svg = d3.select("svg");
	const context = canvas.getContext("2d");
	const nodes = data.map((d) => Object.create(d));

	const simulation = d3
		.forceSimulation(nodes)
		.alphaTarget(0.3) // stay hot
		.velocityDecay(0.1) // low friction
		.force(
			"x",
			d3
				.forceX()
				.x((d) => groups[d.group].x)
				.strength(0.01)
		)
		.force(
			"y",
			d3
				.forceY()
				.y((d) => groups[d.group].y)
				.strength(0.01)
		)
		.force(
			"collide",
			d3
				.forceCollide()
				.radius((d) => d.r + 1)
				.iterations(3)
		)
		// .force("charge",d3.forceCenter(width / 2, height / 2))
		.on("tick", ticked);
		var paused = false;
	// simulation.stop();
	document.getElementById("pauseplay").addEventListener("click",() => {
		if (paused) {
			simulation.restart();
		} else {
			simulation.stop();
		}
		paused = !paused
	})
	// Add event listeners to canvas
	// d3.select(canvas)
	//     .on("touchmove", event => event.preventDefault())
	//     .on("pointermove", pointerMoved);

	// Stop simulation on invalidation
	// invalidation.then(() => simulation.stop());

	function pointerMoved(event) {
		const [x, y] = d3.pointer(event);
	}
	var fiveminute = 0;
	function changeNodeById(id) {
		if (paused) {
			return;
		}
		// console.log("oh gosh");
		// console.log(transitionData[fiveminute]);
		// console.log(transitionData.map(row => row[0]));
		let newGroup = weightedRandom(
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
			transitionData[fiveminute][nodes[id].group]
		);
		if (typeof newGroup === "undefined") {
			// console.log(nodes[id],transitionData[fiveminute][nodes[id].group])
			return;
		}
		nodes[id].group = newGroup;
		// console.log(nodes[randomNode].group)
		simulation
			.force(
				"x",
				d3
					.forceX()
					.x((d) => {
						if (typeof groups[d.group] == "undefined") {
							// console.log(d.group);
							return 10000;
						}
						return groups[d.group].x;
					})
					.strength(0.01)
			)
			.force(
				"y",
				d3
					.forceY()
					.y((d) => {
						if (typeof groups[d.group] == "undefined") {
							// console.log(d.group);
							return 10000;
						}
						return groups[d.group].y;
					})
					.strength(0.01)
			);
		simulation.alpha(1).restart();
	}
	let changeTimes = [];
	function setRecurringChange(id) {
		let newTime = ((5 * 60 * 1000) /speed) * Math.random();
		changeNodeById(id);
		setTimeout(() => {
			setRecurringChange(id);
		}, newTime + (5 * 60 * 1000) /speed - changeTimes[id]);
		changeTimes[id] = newTime;
	}
	for (let i = 0; i < data.length; i++) {
		let time = ((5 * 60 * 1000) /speed) * Math.random();
		changeTimes[i] = time;
		setTimeout(() => {
			setRecurringChange(i);
		}, time);
	}
	let minute = 0;
	function setFiveMinuteInterval() {
		setTimeout(() => {
			fiveminute += 1;
			fiveminute = fiveminute % 288;
			setFiveMinuteInterval();
		}, (5 * 60 * 1000) / speed);
	}
	function setMinuteInterval() {
		setTimeout(() => {
			minute += 1;
			document.getElementById("time").innerText =
				((minute - (minute % 60)) / 60).toString().padStart(2, "0") +
				":" +
				(minute % 60).toString().padStart(2, "0");
			setMinuteInterval();
		}, (60 * 1000) /speed);
	}
	setFiveMinuteInterval();
	setMinuteInterval();
	document.getElementById("speedSlider").addEventListener("change",(e) => {
		speed = parseFloat(document.getElementById("speedSlider").value);
		console.log((60 * 1000) /speed);
	})
	
		// console.log("hi");
	
	var x = d3.scaleLinear([-500,500],[0,1000])
	var y = d3.scaleLinear([-500,500],[0,1000])
	svg.selectAll("circle")
		.data(nodes)
		.enter() // This creates a new circle for each data point
		.append("circle")
		.attr("cx", (d) => x(d.x)) // Set the x-coordinate (cx) of the circle
		.attr("cy", (d) => y(d.y)) // Set the y-coordinate (cy) of the circle
		.attr("r", (d) => d.r) // Set the radius (r) of the circle
		.attr("fill", "steelblue")
		.on('mouseover', function (d, i) {
			d3.select(this).transition()
				 .duration(50)
				 .attr('opacity', '.5')})
		.on('mouseout', function (d, i) {
		d3.select(this).transition()
				.duration(50)
				.attr('opacity', '1')});
	function ticked() {
		svg.selectAll("circle") // This creates a new circle for each data point
			.attr("cx", (d) => x(d.x)) // Set the x-coordinate (cx) of the circle
			.attr("cy", (d) => y(d.y)) // Set the y-coordinate (cy) of the circle
			.attr("r", (d) => d.r) // Set the radius (r) of the circle
			.attr("fill", (d) => color(d.group / 14));
		// context.clearRect(0, 0, width, height);
		// context.save();
		// context.translate(width / 2, height / 2);
		// for (let i = 0; i < nodes.length; ++i) {
		// 	const d = nodes[i];
		// 	context.beginPath();

		// 	context.moveTo(d.x + d.r, d.y);
		// 	context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
		// 	context.fillStyle = color(d.group / 14);
		// 	context.fill();
		// 	// console.log(d.x,d.y)
		// }
		// // context.fillStyle = "black";
		// // for (let i = 0; i < groups.length; i++) {

		// //   context.fillText(transitionData[i].Activity,groups[i].x*1.3,groups[i].y*1.3);
		// // }
		// context.restore();
	}
	return canvas;
}
const timeData = await d3.json("markovchain-1deep.json");
console.log(timeData);
let radius = 280;
let groups = [];
for (let i = 0; i < 18; i++) {
	groups.push({
		x: radius * Math.cos((2 * Math.PI * i) / 18),
		y: radius * Math.sin((2 * Math.PI * i) / 18),
	});
}
// Usage example
const data = [];
for (let i = 0; i < 400; i++) {
	data.push({
		group: Math.floor(Math.random() * 15),
		r: 4,
	});
}

// Assuming 'invalidation' is a Promise
const invalidation = Promise.resolve(); // Replace with actual invalidation logic
const chart = createChart(700, data, groups, timeData, invalidation);
document.body.appendChild(chart);
