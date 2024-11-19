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
let activityDescs = {};
await d3.csv("/Activity Descriptions.csv").then((x) => {
	console.log(x[0]);
	for (let i = 0; i < x.length; i++) {
		activityDescs[parseInt(x[i]["Code"])]=x[i].Description
	}
})
console.log(activityDescs)
var speed = 600;
function createChart(width, data, groups, transitionData, activities,invalidation) {
	const height = width;
	const color = d3.interpolateWarm;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const svg = d3.select("svg");
	const context = canvas.getContext("2d");
	const nodes = data.map((d) => Object.create(d));
	const activityRange = [];
	for (let i = 0; i < activities.length; i++) {
		activityRange.push(i);
	}

	const simulation = d3
		.forceSimulation(nodes)
		.alphaTarget(0.3) // stay hot
		.velocityDecay(0.1) // low friction
		.force(
			"x",
			d3
				.forceX()
				.x((d) => {console.log(d.group);return groups[Math.floor(activities[d.group] / 10000)].x})
				.strength(0.01)
		)
		.force(
			"y",
			d3
				.forceY()
				.y((d) => groups[Math.floor(activities[d.group] / 10000)].y)
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
	document.getElementById("pauseplay").addEventListener("click", () => {
		// if (paused) {
		// 	simulation.restart();
		// } else {
		// 	simulation.stop();
		// }
		paused = !paused;
	});
	// Add event listeners to canvas
	// d3.select(canvas)
	//     .on("touchmove", event => event.preventDefault())
	//     .on("pointermove", pointerMoved);

	// Stop simulation on invalidation
	// invalidation.then(() => simulation.stop());

	function pointerMoved(event) {
		const [x, y] = d3.pointer(event);
	}
	var currentTime = 0;
	var minute = 0;
	var second = 0;
	var fiveminute = 0;
	let changeTimes = [];
	for (let i = 0; i < data.length; i++) {
		let time = 5 * Math.random();
		changeTimes.push(time);
	}
	setInterval(() => {
		if (paused) {
			return;
		}
		currentTime += speed / (60 * 1000);
		if (currentTime>5*fiveminute+5) {
			fiveminute ++;
			fiveminute = fiveminute % 288;
		}
		if (currentTime>second/60+1/60) {
			second ++;
			second = second % 86400;
			if (second >= 43200) {
				document.getElementById("time").innerText =
				((((second - (second % 60)) / 60)-((second - (second % 60)) / 60)%60)/60-12).toString().padStart(2, "0") +
				":" +(((second - (second % 60)) / 60)%60).toString().padStart(2, "0") +
					":" +
					(second % 60).toString().padStart(2, "0")+" PM";
			} else {
				document.getElementById("time").innerText =
			((((second - (second % 60)) / 60)-((second - (second % 60)) / 60)%60)/60).toString().padStart(2, "0") +
			":" +(((second - (second % 60)) / 60)%60).toString().padStart(2, "0") +
				":" +
				(second % 60).toString().padStart(2, "0")+" AM";
			}
			if (document.getElementById("time").innerText.substring(0,2)=="00") {
				document.getElementById("time").innerText="12"+document.getElementById("time").innerText.substring(2,11);
			}
			
		}
		for (let i = 0; i < data.length; i++) {
			if (currentTime>changeTimes[i]) {
				changeNodeById(i);
				changeTimes[i]=5*fiveminute+5*Math.random()+5;
			}
		}
	},1)
	// function setRecurringChange(id) {
	// 	let newTime = ((5 * 60 * 1000) / speed) * Math.random();
	// 	changeNodeById(id);
	// 	setTimeout(() => {
	// 		setRecurringChange(id);
	// 	}, newTime + (5 * 60 * 1000) / speed - changeTimes[id]);
	// 	changeTimes[id] = newTime;
	// }
	// for (let i = 0; i < data.length; i++) {
	// 	let time = ((5 * 60 * 1000) / speed) * Math.random();
	// 	changeTimes[i] = time;
	// 	setTimeout(() => {
	// 		setRecurringChange(i);
	// 	}, time);
	// }
	function changeNodeById(id) {
		// console.log("oh gosh");
		// console.log(transitionData[fiveminute]);
		// console.log(transitionData.map(row => row[0]));
		let newGroup = weightedRandom(
			activityRange,
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
						if (
							typeof groups[Math.floor(activities[d.group] / 10000)] ==
							"undefined"
						) {
							// console.log(d.group);
							return 10000;
						}
						return groups[Math.floor(activities[d.group] / 10000)].x;
					})
					.strength(0.01)
			)
			.force(
				"y",
				d3
					.forceY()
					.y((d) => {
						if (
							typeof groups[Math.floor(activities[d.group] / 10000)] ==
							"undefined"
						) {
							// console.log(d.group);
							return 10000;
						}
						return groups[Math.floor(activities[d.group] / 10000)].y;
					})
					.strength(0.01)
			);
		simulation.alpha(1).restart();
	}
	
	document.getElementById("speedSlider").addEventListener("change", (e) => {
		speed = parseFloat(document.getElementById("speedSlider").value);
		console.log((60 * 1000) / speed);
	});

	// console.log("hi");

	var x = d3.scaleLinear([-400, 400], [0, 700]);
	var y = d3.scaleLinear([-400, 400], [0, 700]);
	svg.selectAll("circle")
		.data(nodes)
		.enter() // This creates a new circle for each data point
		.append("circle")
		.attr("cx", (d) => x(d.x)) // Set the x-coordinate (cx) of the circle
		.attr("cy", (d) => y(d.y)) // Set the y-coordinate (cy) of the circle
		.attr("r", (d) => d.r) // Set the radius (r) of the circle
		.attr("fill", "steelblue")
		.on("mouseover", function (d, i) {
			d3.select(this).transition().duration(50).attr("opacity", ".5");
		})
		.on("mouseout", function (d, i) {
			d3.select(this).transition().duration(50).attr("opacity", "1");
		});
	function ticked() {
		svg.selectAll("circle") // This creates a new circle for each data point
			.attr("cx", (d) => x(d.x)) // Set the x-coordinate (cx) of the circle
			.attr("cy", (d) => y(d.y)) // Set the y-coordinate (cy) of the circle
			.attr("r", (d) => d.r) // Set the radius (r) of the circle
			.attr("fill", (d) => color(activities[d.group] / 10000 / 14));
		document.getElementById("testact").innerText = activityDescs[Math.floor(activities[nodes[0].group.toString()]/10000)]+"—"+activityDescs[Math.floor(activities[nodes[0].group.toString()]/100)]+"—"+activityDescs[activities[nodes[0].group.toString()]];
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
const timeData = [];
for (let i = 0; i < 288; i++) {
	timeData.push(await d3.json("markovchain-3deep-0323/markovchain-3deep-0323-"+i.toString()+".json"))
}
console.log(timeData);
const activities = await d3.json("activitylist.json");
let radius = 280;
let groups = {};
let activitiesdeep1=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,50]
for (let i = 0; i < 18; i++) {
	groups[activitiesdeep1[i]]={
		x: radius * Math.cos((2 * Math.PI * i) / 18),
		y: radius * Math.sin((2 * Math.PI * i) / 18),
	};
}
// Usage example
const data = [];
for (let i = 0; i < 400; i++) {
	data.push({
		group: Math.floor(Math.random()*activities.length),
		r: 4,
	});
}

// Assuming 'invalidation' is a Promise
const invalidation = Promise.resolve(); // Replace with actual invalidation logic
const chart = createChart(700, data, groups, timeData, activities,invalidation);
document.body.appendChild(chart);
