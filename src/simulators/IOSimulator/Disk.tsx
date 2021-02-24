import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SVG, PointArray } from "@svgdotjs/svg.js";
import useInterval from "../../helpers/useInterval";

interface DiskProps {
	tracks: number;
	currentTrack: number;
	nextTrack: number;
	duration: number;
}

const COLOR: string = "black";

const CENTER_RADIUS: number = 10;
const HEADER_RADIUS: number = 3;

const WIDTH: number = 300;

const FPS: number = 30;

interface Circle {
	x: number;
	y: number;
	radius: number;
}

/**
 * Calculates the intersection between two circles
 * References: 
 * - https://math.stackexchange.com/questions/256100/how-can-i-find-the-points-at-which-two-circles-intersect
 * - https://stackoverflow.com/questions/8367512/how-do-i-detect-intersections-between-a-circle-and-any-other-circle-in-the-same
 * @param c1 Circle 1
 * @param c2 Circle 2
 */
const circleIntersection = (c1: Circle, c2: Circle) : number[][] => {
	let results: number[][] = [];

	// check if there is intersection between circles
	let R: number = Math.sqrt((c1.x - c2.x)**2 + (c1.y - c2.y)**2);

	if (Math.abs(c1.radius - c2.radius) <= R && R <= (c1.radius + c2.radius)) {
		// there is a solution
		let x: number = (c1.x + c2.x) + ((c1.radius**2 - c2.radius**2) / (R**2)) * (c2.x - c1.x);
		x *= 1/2; 

		let y: number = (c1.y + c2.y) + ((c1.radius**2 - c2.radius**2) / (R**2)) * (c2.y - c1.y);
		y *= 1/2;

		let tmp: number = 2 * ((c1.radius**2 + c2.radius**2) / (R**2)) - ((c1.radius**2 - c2.radius**2)**2 / (R**4)) - 1;
		tmp = Math.sqrt(tmp) / 2;

		let dX: number = tmp * (c2.y - c1.y);
		let dY: number = tmp * (c1.x - c2.x);

		results.push([x + dX, y + dY], [x - dX, y - dY]);
	}

	return results;
}

const getValidIntersection = (intersections: number[][], minX: number) => {
	let i;
	for (i = 0; i < intersections.length && intersections[i][0] < minX; i++);
	return intersections[i];
}

const rad2Deg = (radians: number) => radians * 180 / Math.PI;

function Disk(props: DiskProps) {
	const container = useRef<HTMLDivElement>(null);
	const chart = useRef(SVG());

	// helper functions
	const spaceBetweenTracks: number = (WIDTH / 2 - CENTER_RADIUS) / props.tracks;
	const trackRadius = (track: number) => WIDTH / 2 - track * spaceBetweenTracks;

	// angular velocity
	const w = useRef<number>(0);
	const [angle, setAngle] = useState<number>(0);
	const targetAngle = useRef<number>(0);

	// render
	const lastRender = useRef<number>(Date.now());

	useEffect(() => {
		// define the circle described by the header
		let headerCirlce: Circle = {
			x: WIDTH / 2,
			y: WIDTH,
			radius: WIDTH / 2
		};

		// calculate the current angle 
		let currentTrackCircle: Circle = {
			x: WIDTH / 2,
			y: WIDTH / 2,
			radius: trackRadius(props.currentTrack)
		};

		let intersections: number[][] = circleIntersection(headerCirlce, currentTrackCircle);
		let intersection: number[] = getValidIntersection(intersections, WIDTH / 2);
		let angle = rad2Deg(Math.atan((intersection[1] - WIDTH) / (intersection[0] - WIDTH / 2))) + 90;
		let currentAngle = angle;
		setAngle(angle);

		// calculate the target angle
		let targetTrackCircle: Circle = {
			x: WIDTH / 2,
			y: WIDTH / 2,
			radius: trackRadius(props.nextTrack)
		};

		intersections = circleIntersection(headerCirlce, targetTrackCircle);
		intersection = getValidIntersection(intersections, WIDTH / 2);
		angle = rad2Deg(Math.atan((intersection[1] - WIDTH) / (intersection[0] - WIDTH / 2))) + 90;

		targetAngle.current = angle;

		// setting last render to now
		lastRender.current = Date.now();
		w.current = (currentAngle - targetAngle.current) / props.duration;
	}, [props.currentTrack, props.currentTrack]);


	useLayoutEffect(() => {
		if (container.current != null) {
			let width: number = WIDTH;
			let height: number = container.current.getBoundingClientRect().height;

			let centerX: number = width / 2;
			let centerY: number = centerX;

			chart.current.addTo(container.current).size(600, 600);
			chart.current.clear();

			for (let i = 0; i < props.tracks; i++) {   
				let radius: number = trackRadius(i);

				let color = "rgba(0, 0, 0, 0.2)";
				if (props.currentTrack == i) {
					color = "black";
				} else if (props.nextTrack == i) {
					color = "purple";
				}

				chart.current.circle()
				.radius(radius)
				.move(centerX - radius, centerY - radius)
				.stroke({ color, width: 3 }).fill("transparent")
			}

			// drawing center block
			chart.current.circle()
			.radius(CENTER_RADIUS)
			.move(centerX - CENTER_RADIUS, centerY - CENTER_RADIUS)
			.fill(COLOR);

			// drawing header position
			let base: number = 50;

			let group = chart.current.group();
			group.polygon([ [0, width / 2], [base / 2, 0], [base, width / 2] ])
			.fill("black")

			group.circle()
			.radius(HEADER_RADIUS)
			.fill("blue")
			.move(base / 2 - HEADER_RADIUS, -HEADER_RADIUS)
		
			group.move(width / 2 - base / 2, width / 2)

			/*let angle: number = test;

			let headerCircle: Circle = {
				x: width / 2,
				y: width,
				radius: width / 2
			};

			let currentTrackCircle: Circle = {
				x: width / 2,
				y: width / 2,
				radius: trackRadius(props.currentTrack)
			};

			let intersection: number[][] = circleIntersection(headerCircle, currentTrackCircle);
			console.log(intersection);

			intersection.map(sol => {
				chart.current.circle()
				.radius(2)
				.fill("red")
				.move(sol[0], sol[1]);
			});

			let validSolution: number[] = getValidIntersection(intersection, WIDTH / 2);


			let dX = (validSolution[0] - width / 2);
			let dY = (validSolution[1] - width);
			
			angle = Math.atan(dY / dX) * 180 / Math.PI + 90;*/

			group.rotate(angle, width / 2, width);
		}
	});

	useInterval(
		() => {
			let now: number = Date.now();
			let delta: number = now - lastRender.current;
			lastRender.current = now;

			// updating current angle if needed
			if (w.current != 0) {
				if (Math.abs(angle - targetAngle.current) < Math.abs(w.current * delta)) {
					w.current = 0;
				} else {
					setAngle(angle - w.current * delta);
				}
			}
		},
		1000 / FPS,
		true
	);

	return (
		<div ref={container} id="disk_element"></div>
	)
}

export default Disk;