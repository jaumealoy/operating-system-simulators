import React, { useEffect, useRef } from "react";

import { SVG, PointArray } from "@svgdotjs/svg.js";


interface RequestChartProps {
	tracks?: number;
	maxTrack?: number;
	numberOfRequests?: number;
	requests: number[];
}

// chart settings
const WIDTH: number = 300;
const HEIGHT: number = 150;
const AXIS_WIDTH: number = 5;
const LINE_COLOR: string = "black";
const RADIUS: number = 10;
const TEXT_SIZE: number = 8;

function RequestChart(props: RequestChartProps) {
	const chart = useRef(SVG());

	useEffect(() => {
		let aux = chart.current;
		aux.addTo("#my_chart").size(WIDTH, HEIGHT).group();
		aux.clear();

		// highest request track
		let highestTrack: number = props.maxTrack == undefined ?
			Math.max(...props.requests) : props.maxTrack;

		let numberOfRequests = (props.numberOfRequests == undefined ? props.requests.length : props.numberOfRequests);
		const y = (request: number) : number => ((HEIGHT - 5 * AXIS_WIDTH - TEXT_SIZE) / highestTrack) * request;

		// y axis
		// calculate maximum text width
		let digits: number = Math.ceil(Math.log10(highestTrack));
		let textWidth: number = digits * TEXT_SIZE;

		const x = (time: number) : number => (((WIDTH - textWidth - AXIS_WIDTH) * time) / numberOfRequests) + textWidth;

		aux.rect(AXIS_WIDTH, HEIGHT - AXIS_WIDTH - TEXT_SIZE)
		   .move(textWidth, 0)
		   .fill({ color: LINE_COLOR });

		
		// y-axis numbers
		let positions: number[] = [];
		for (let i = 0; i < props.requests.length; i++) {
			// avoid text overlapping
			let text_y: number =  y(props.requests[i]);
			let found: boolean = false;
			let j: number = 0;
			while (!found && j < positions.length) {
				found = Math.abs(positions[j] - text_y) <= TEXT_SIZE;
				j++;
			}

			if(!found){
				let tmp: string = props.requests[i].toString();
				let a = aux.text(tmp)
			   		.font({ fill: LINE_COLOR, size: TEXT_SIZE })
				a.move(textWidth - a.length() - AXIS_WIDTH, text_y);

				positions.push(text_y);
			}

			// drawing axis line
			aux.rect(1 * AXIS_WIDTH, AXIS_WIDTH / 2)
			   .move(textWidth - AXIS_WIDTH / 2, y(props.requests[i]) + TEXT_SIZE / 2)
			   .fill({ color: LINE_COLOR });
		}

		// x axis
		aux.rect(WIDTH, AXIS_WIDTH)
		   .move(textWidth, HEIGHT - AXIS_WIDTH * 2 - TEXT_SIZE)
		   .fill({ color: LINE_COLOR });

		for(let i = 0; i < numberOfRequests; i++) {

			let text = aux.text(i.toString())
			   .move(x(i), HEIGHT - TEXT_SIZE)
			   .font({ fill: LINE_COLOR, size: TEXT_SIZE });

			   aux.rect(AXIS_WIDTH / 2, AXIS_WIDTH)
				  .move(x(i) + (text.length() - AXIS_WIDTH / 2) / 2, HEIGHT - AXIS_WIDTH * 1.5 - TEXT_SIZE)
				  .fill({ color: LINE_COLOR });
		}

		for (let i = 0; i < props.requests.length; i++) {			
			// line between requests
			if (i > 0) {
				let arrow = new PointArray([[0, 0], [2, 0], [1, 2]]);

				let line = aux.line(
					x(i - 1) + RADIUS / 4, y(props.requests[i - 1]) + RADIUS / 2,
					x(i) + RADIUS / 4, y(props.requests[i]) + RADIUS / 2
				).stroke({ width: 1, color: LINE_COLOR })
				
				// arrow
				line.marker("end", 30, 30, (add) => { 
					add.polygon(arrow)
					   .fill({ color: LINE_COLOR })
					   .rotate(-90, 1, 1)
					   .scale(2)
					   .translate(13 - RADIUS / 2, 15 - 1)
				});
			}

			// requests
			aux.circle(RADIUS)
			   .move(x(i), y(props.requests[i]))
			   .translate(AXIS_WIDTH / 2 - RADIUS / 2, 0)
			   .fill({ color: LINE_COLOR });			
		}


		return () => {
			//aux.scale(2, 2);
			aux.clear();
		};
	});

	return (
		<>
			<div id="my_chart">

			</div>
		</>
	);
}

export default RequestChart;