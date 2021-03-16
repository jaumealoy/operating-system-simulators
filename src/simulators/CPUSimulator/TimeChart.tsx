import React, { useEffect, useLayoutEffect, useRef } from "react";
import { SVG, G, Text } from "@svgdotjs/svg.js";
import { ProcessSnapshot } from "./CPUSimulator";

/* Visual settings */
const FONT_SIZE: number = 10;
const FONT_COLOR: string = "black";
const PROCESS_HEIGHT: number = 10;
const AXIS_WIDTH: number= 3;
const TICK_SIZE: number = 15;

const PROCESS_COLORS: string[] = [
	"#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#f1c40f", "#34495e", "#1abc9c"
];

const BLOCKED_COLOR: string = "#bdc3c7";

interface TimeChartProps {
	processes: string[];
	events: ProcessSnapshot[][];
	maxTicks: number;
	step?: number;
};

interface ChartPeriod {
	start: number;
	end: number;
	status: "running" | "blocked";
};

interface GroupRef {
	g: G | null;
};

function TimeChart(props: TimeChartProps) {
	const container = useRef<HTMLDivElement>(null);

	// SVG.js chart and containers
	const chart = useRef(SVG());
	const imageGroup = useRef<GroupRef>({ g: null });

	// step number
	const step: number = props.step || 5;

	useLayoutEffect(() => {
		if (container.current != null) {
			// adding SVG element
			chart.current.addTo(container.current);
			imageGroup.current.g = chart.current.group();
		}

		let onResize = () => {
			if (container.current != null && imageGroup.current.g != null) {
				// get available width
				let width: number = container.current.getBoundingClientRect().width;

				// fit chart horizontally
				let canvas = imageGroup.current.g;
				canvas.transform({ scale: [1, 1] });
				let scale: number = width / canvas.width();
				canvas.scale(scale, scale, 0, 0);

				canvas.size(
					canvas.width() * scale,
					canvas.height() * scale
				);
			}
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	useEffect(() => {
		if (container.current != null && imageGroup.current.g != null) {
			let canvas: G = imageGroup.current.g;
			canvas.clear();

			// draw texts
			let processesTexts: Text[] = [];
			let maxTextWidth: number = 20;
			props.processes.map(name => {
				let txt = canvas.text(name)
								.font({ fill: FONT_COLOR, size: FONT_SIZE });
				
				if (txt.length() > maxTextWidth) {
					maxTextWidth = txt.length() + 2 * AXIS_WIDTH;
				}

				processesTexts.push(txt);
			});

			// calculate header height and draw horizontal axis
			let headerHeight: number = FONT_SIZE + AXIS_WIDTH;
			canvas.line([
				[0, headerHeight - AXIS_WIDTH / 2],
				[maxTextWidth + props.maxTicks * TICK_SIZE, headerHeight - AXIS_WIDTH / 2]
			]).stroke({ width: AXIS_WIDTH, color: FONT_COLOR });

			// move texts to the correct position
			processesTexts.map((text: Text, index: number) => {
				text.move(
					(maxTextWidth - text.length()) / 2,
					headerHeight + index * PROCESS_HEIGHT + (PROCESS_HEIGHT - FONT_SIZE) / 2
				);
			});

			// draw vertical bar
			let verticalBar = canvas.line([
				[maxTextWidth, headerHeight],
				[maxTextWidth, headerHeight + props.processes.length * PROCESS_HEIGHT]
			]).stroke({ width: AXIS_WIDTH, color: FONT_COLOR });

			// drawing ticks
			for (let i = 0; i < props.maxTicks; i++) {
				let startX: number = maxTextWidth + i * TICK_SIZE;
				let startY: number = headerHeight;

				canvas.line([
					[startX, startY],
					[startX, startY + props.processes.length * PROCESS_HEIGHT]
				]).stroke({ width: 1, color: FONT_COLOR, dasharray: "7,5" });

				if ((i % step) == 0) {
					let txt: Text = canvas.text(i.toString())
										  .font({ size: FONT_SIZE });
					txt.move(startX - txt.length() / 2, 0);
				}
			}
			
			// draw process events
			// convert the raw input data to chart periods
			let data: {[key: string]: ChartPeriod[]} = {};
			let foundPeriod: {[key: string]: boolean} = {};
			let foundStatus: {[key: string]: "running" | "blocked"} = {};
			props.processes.map(id => foundPeriod[id] = false);

			for (let tick = 0; tick < props.events.length; tick++) {
				let events = props.events[tick];

				let newFounds: {[key: string]: boolean} = { };
				props.processes.map(id => newFounds[id] = false);

				let newStatus: {[key: string]: "running" | "blocked"} = {};

				for (let i = 0; i < events.length; i++) {
					let id: string = events[i].id;

					if (!foundPeriod[id] || (foundPeriod[id] && events[i].status != foundStatus[id])) {
						// we must start a new period for this process
						newFounds[id] = true;
						newStatus[id] = events[i].status;

						if (!(id in data)) {
							data[id] = [];
						}

						data[id].push({
							start: tick,
							end: tick + 1,
							status: events[i].status
						});
					} else {
						// we must increase the end of the process one cycle more
						// as we have found it again
						data[id][data[id].length - 1].end++;
						newFounds[id] = true;
						newStatus[id] = events[i].status;
					}
				}

				foundPeriod = newFounds;
				foundStatus = newStatus;
			}

			props.processes.map((id: string, index: number) => {
				if (id in data) {
					for (let i = 0; i < data[id].length; i++) {
						let period = data[id][i];
						let rect = canvas.rect(
							(period.end - period.start) * TICK_SIZE,
							PROCESS_HEIGHT
						).move(
							maxTextWidth + period.start * TICK_SIZE, 
							headerHeight + index * PROCESS_HEIGHT
						).stroke({width: 1, color: FONT_COLOR});

						if (period.status == "running") {
							rect.fill(PROCESS_COLORS[index % PROCESS_COLORS.length]);
						} else if (period.status == "blocked") {
							let pattern = chart.current.pattern(10, 10, (add) => {
								add.rect(10, 10).fill("white");
								add.path("M 0,10 L 10,0 M -10,10 L 5, -5 M 0,20 L 15, 5")
								.stroke({ color: BLOCKED_COLOR, width: 2 });
							});

							rect.fill(pattern);
						}
					}
				}
			});

			verticalBar.front()
					   .height(verticalBar.height() + 1);

			// resize it to fit horizontally
			let availableWidth: number = container.current.getBoundingClientRect().width;
			canvas.transform({ scale: [1, 1] });
			let scale: number = availableWidth / canvas.width();
			canvas.scale(scale, scale, 0, 0);

			chart.current.size(
				canvas.width() * scale,
				canvas.height() * scale 
			);
		}
	});

	return (
		<div ref={container}></div>
	);
}

export default TimeChart;