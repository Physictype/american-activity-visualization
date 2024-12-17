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
await d3.csv("Activity Descriptions.csv").then((x) => {
	// console.log(x[0]);
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
	let selectIdx = 0;
	let cameraFollowX = 0;
	let cameraFollowY = 0;
	let cameraX = 0;
	let cameraY = 0;
	let camSpeed = 0.05;
	nodes[selectIdx].r=10;
	let followingSelected = true;
	document.getElementById("funfbutton").onclick = () => {
		followingSelected = !followingSelected;
	}
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
				.x((d) => groups[Math.floor(activities[d.group] / 10000)].x)
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
				.radius((d) => d.r+1)
				.iterations(3)
		)
		// .force("charge",d3.forceCenter(width / 2, height / 2))
		.on("tick", ticked);
	var paused = false;
	// simulation.stop();
	document.getElementById("pauseplay").addEventListener("click", () => {
		paused = !paused;
	});

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
	function setApproxInterval(callback, interval) {
		let running = true
		const startTime = Date.now()
		
		const loop = (nthRun) => {
			const targetTime = nthRun * interval + startTime
			const timeout = targetTime - Date.now()
			setTimeout(() => {
			if (running) {
				callback()
				loop(nthRun + 1)
			}
			}, timeout)
		}
		
		loop(1)
		return () => running = false
	}
	
	function clearApproxInterval(stopInterval) {
		stopInterval()
	}
	setApproxInterval(() => {
		if (paused) {
			return;
		}
		speed = parseFloat(document.getElementById("speedSlider").value);
		currentTime += speed / (60 * 1000);
		if (currentTime>5*fiveminute+5) {
			fiveminute = Math.floor(currentTime/5);
			fiveminute = fiveminute % 288;
		}
		if (currentTime>second/60+1/60) {
			second = Math.floor(currentTime*60);
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

	},5)
	// setInterval(() => {
	// 	if (paused) {
	// 		return;
	// 	}
	// 	currentTime += speed / (60 * 1000);
	// 	if (currentTime>5*fiveminute+5) {
	// 		fiveminute ++;
	// 		fiveminute = fiveminute % 288;
	// 	}
	// 	if (currentTime>second/60+1/60) {
	// 		second ++;
	// 		second = second % 86400;
	// 		if (second >= 43200) {
	// 			document.getElementById("time").innerText =
	// 			((((second - (second % 60)) / 60)-((second - (second % 60)) / 60)%60)/60-12).toString().padStart(2, "0") +
	// 			":" +(((second - (second % 60)) / 60)%60).toString().padStart(2, "0") +
	// 				":" +
	// 				(second % 60).toString().padStart(2, "0")+" PM";
	// 		} else {
	// 			document.getElementById("time").innerText =
	// 		((((second - (second % 60)) / 60)-((second - (second % 60)) / 60)%60)/60).toString().padStart(2, "0") +
	// 		":" +(((second - (second % 60)) / 60)%60).toString().padStart(2, "0") +
	// 			":" +
	// 			(second % 60).toString().padStart(2, "0")+" AM";
	// 		}
	// 		if (document.getElementById("time").innerText.substring(0,2)=="00") {
	// 			document.getElementById("time").innerText="12"+document.getElementById("time").innerText.substring(2,11);
	// 		}
			
	// 	}
	// 	for (let i = 0; i < data.length; i++) {
	// 		if (currentTime>changeTimes[i]) {
	// 			changeNodeById(i);
	// 			changeTimes[i]=5*fiveminute+5*Math.random()+5;
	// 		}
	// 	}

	// },1)
	function changeNodeById(id) {
		let newGroup = weightedRandom(
			activityRange,
			transitionData[fiveminute][nodes[id].group]
		);
		if (typeof newGroup === "undefined") {
			return;
		}
		nodes[id].group = newGroup;
		simulation.force(
			"collide",
			d3
				.forceCollide()
				.radius((d) => d.r+1)
				.iterations(3)
		)
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
							console.log(Math.floor(activities[d.group] / 10000));
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
	});

	document.getElementById("randomButton").onclick = () => {
		let randomIdx = Math.floor(Math.random()*400);
		// console.log(nodes.length)
		nodes[randomIdx].r=10;
		nodes[selectIdx].r=4;
		selectIdx = randomIdx;
		svg.selectAll("circle").attr("r", (d) => d.r);
		simulation.force(
			"collide",
			d3
				.forceCollide()
				.radius((d) => d.r+1)
				.iterations(3)
		)
		simulation.alpha(1).restart();
	}
	document.getElementById("forceTransition").onclick = () => {
		changeNodeById(selectIdx);
	}


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
		})
		.on("click", function (d, i) {
			// console.log("hey",d,i,);
			nodes[i.index].r = 10;
			nodes[selectIdx].r=4;
			selectIdx = i.index;
			svg.selectAll("circle").attr("r", (d) => d.r);
			simulation.force(
				"collide",
				d3
					.forceCollide()
					.radius((d) => d.r+1)
					.iterations(3)
			)
			simulation.alpha(1).restart();
		}).nodes().forEach(circ => {
			circ.addEventListener("mouseover", () => {
				console.log("work?");
			})
		});
	
	function ticked() {
		svg.selectAll("circle") // This creates a new circle for each data point
			.attr("cx", (d) => x(d.x-cameraX)) // Set the x-coordinate (cx) of the circle
			.attr("cy", (d) => y(d.y-cameraY)) // Set the y-coordinate (cy) of the circle
			.attr("r", (d) => {
				if (d.index == selectIdx) {
					return d.r-1;
				} else {
					return d.r;
				}
			}) // Set the radius (r) of the circle
			.attr("fill", (d) => color(activities[d.group] / 10000 / 14))
			.attr("stroke-width",(d) => {
				if (d.index == selectIdx) {
					return 2;
				} else {
					return 0;
				}
			})
			.attr("stroke",(d) => "black");
		document.getElementById("selectedID").innerText = selectIdx+1
		let stringedActivity = activities[nodes[selectIdx].group.toString()].toString().padStart(6,'0');
		let level1 = stringedActivity.substring(0,2);
		let level2 = stringedActivity.substring(2,4);
		let level3 = stringedActivity.substring(4,6);
		document.getElementById("selectedActivityID").innerText = level1+"."+level2+"."+level3;
		document.getElementById("level1Activity").innerText = activityDescs[parseInt(level1)];
		document.getElementById("level2Activity").innerText = activityDescs[parseInt(level1+level2)];
		document.getElementById("level3Activity").innerText = activityDescs[parseInt(level1+level2+level3)];
		// console.log(activityDescs[parseInt(level1)],activityDescs[parseInt(level1+level2)],activityDescs[parseInt(level1+level2+level3)])
		if (followingSelected) {
			cameraFollowX = nodes[selectIdx].x;
			cameraFollowY = nodes[selectIdx].y;
		} else {
			cameraFollowX = 0;
			cameraFollowY = 0;
		}
		cameraX += (cameraFollowX-cameraX)*camSpeed;
		cameraY += (cameraFollowY-cameraY)*camSpeed;
	}
	return canvas;
}
var timeData = [];
let loadingBar = document.getElementById("loadingBar");
await Promise.all(Array(288).keys().map((x) => d3.json("markovchain-3deep-0323/markovchain-3deep-0323-"+x.toString()+".json"))).then((values) => {
	timeData = values;
})
// for (let i = 0; i < 288; i++) {
// 	//TODO: Progress bar
// 	//https://cdn.jsdelivr.net/gh/physictype/usa-activity-visualization@latest/markovchain-3deep-0323/markovchain-3deep-0323-1.json
// 	timeData.push(await d3.json("/markovchain-3deep-0323/markovchain-3deep-0323-"+i.toString()+".json"))
// 	loadingBar.children[1].children[0].style.width=(i/288*100)+"px"
// }
console.log(timeData);
const activities = await d3.json("activitylist.json");
let radius = 320;
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
const activityStarts = await d3.json("activitystarts.json")
for (let i = 0; i < 400; i++) {
	data.push({
		group: weightedRandom(activitiesdeep1,activityStarts),
		r: 4,
	});
}

// Assuming 'invalidation' is a Promise
const invalidation = Promise.resolve(); // Replace with actual invalidation logic
const chart = createChart(700, data, groups, timeData, activities,invalidation);
document.body.appendChild(chart);
