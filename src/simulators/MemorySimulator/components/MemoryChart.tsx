import React, { useEffect, useLayoutEffect, useRef } from "react";
import { SVG, G, Text, Rect } from "@svgdotjs/svg.js";

const MEMORY_WIDTH: number = 200;
const UNIT_HEIGHT: number = 25;
const BORDER_WIDTH: number = 3;
const FONT_SIZE: number = 14;

interface MemoryChartProps {
	capacity: number;
	processes: string[];
	data: number[];
	showBlockSize?: boolean;
	pointer?: number;
};

interface GroupRef {
	g: G | null;
}

const PROCESS_COLORS: string[] = [
	"#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#f1c40f", "#34495e", "#1abc9c"
];

function MemoryChart(props: MemoryChartProps) {
	const container = useRef<HTMLDivElement>(null);

	// SVG.js chart references
	const chart = useRef(SVG());
	const imageGroup = useRef<GroupRef>({ g: null });

	let showBlockSize: boolean = props.showBlockSize || false;

	useLayoutEffect(() => {
		if (container.current != null) {
			console.log("Creating new contaienr");

			// creating the SVG element
			chart.current.addTo(container.current);
			imageGroup.current.g = chart.current.group();
		}

		// resize the chart on window resize
		let onResize = () => {
			throw new Error("Not implemented yet");
		};

		window.addEventListener("resize", onResize);

		// remove the resize listener once the component is unloaded
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	useEffect(() => {
		let canvas = imageGroup.current.g;

		console.log("Updated state");

		if (canvas != null) {
			canvas.clear();

			// drawing all texts and calculate their maximum width
			let texts: Text[] = [];
			let maxWidth: number = 0;

			for (let i = 0; i < props.capacity; i++) {
				let text: Text = canvas.text(`@${i}`)
									   .font({ size: FONT_SIZE, fill: "black" });

				if (text.length() > maxWidth) {
					maxWidth = text.length();
				}

				texts.push(text);
			}

			texts.map((text: Text, index: number) => {
				text.move(maxWidth - text.length(), index * UNIT_HEIGHT + (UNIT_HEIGHT - FONT_SIZE) / 2);
			});
			
			// drawing memory container
			canvas.rect(MEMORY_WIDTH, props.capacity * UNIT_HEIGHT)
				  .fill({ color: "transparent"}) 
				  .stroke({ color: "black", width: BORDER_WIDTH })
				  .move(BORDER_WIDTH + maxWidth, BORDER_WIDTH);

			let extraWidth: number = 0;
			if (props.pointer != undefined) {
				extraWidth = 40;
				canvas.polygon([
					[UNIT_HEIGHT, UNIT_HEIGHT / 6],
					[0, UNIT_HEIGHT / 2],
					[UNIT_HEIGHT, UNIT_HEIGHT - UNIT_HEIGHT / 6]
				]).move(maxWidth + MEMORY_WIDTH + 2 * BORDER_WIDTH, BORDER_WIDTH + UNIT_HEIGHT * props.pointer + UNIT_HEIGHT / 6)
			}

			chart.current.size(
				MEMORY_WIDTH + 2 * BORDER_WIDTH + maxWidth + extraWidth, 
				props.capacity * UNIT_HEIGHT + BORDER_WIDTH * 2
			);

			// drawing memory sections
			for (let i = 0; i < props.capacity; i++) {
				canvas.line(
					BORDER_WIDTH + maxWidth, BORDER_WIDTH + i * UNIT_HEIGHT,
					MEMORY_WIDTH + BORDER_WIDTH + maxWidth, BORDER_WIDTH + i * UNIT_HEIGHT
				).stroke({ color: "black", width: BORDER_WIDTH });
			}

			// patterns
			let pattern = chart.current.pattern(10, 10, (add) => {
				add.rect(10, 10).fill("white");
				add.path("M 0,10 L 10,0 M -10,10 L 5, -5 M 0,20 L 15, 5")
				.stroke({ color: "black", width: 2 });
			});

			// drawing memory data
			for (let i = 0; i < props.data.length;) {
				let start: number = i;
				let end: number = i + 1;
			
				// find the next change
				while (end < props.data.length && props.data[end] == props.data[start]) {
					end++;
				}

				let rect: Rect =canvas.rect(MEMORY_WIDTH, UNIT_HEIGHT * (end - start))
					  .move(BORDER_WIDTH + maxWidth, start * UNIT_HEIGHT + BORDER_WIDTH)
					  .stroke({ width: BORDER_WIDTH, color: "black" });

				if (props.data[start] >= 0 && props.data[start] < props.processes.length) {
					rect.fill(PROCESS_COLORS[props.data[start] % PROCESS_COLORS.length]);

					canvas.text(props.processes[props.data[start]].toString())
						  .font({ size: FONT_SIZE, fill: "white" })
						  .move(
							  BORDER_WIDTH + maxWidth + FONT_SIZE, 
							  start * UNIT_HEIGHT + (UNIT_HEIGHT - FONT_SIZE) / 2 + BORDER_WIDTH / 2
						  );
				} else {
					rect.fill(pattern);
				}

				if (showBlockSize) {
					// draw block size if needed
					let sizeText: Text = canvas.text((end - start).toString())
											.font({ fill: "white", size: FONT_SIZE });

					let textContainer: Rect = canvas.rect(sizeText.length() + 2 * BORDER_WIDTH, FONT_SIZE + BORDER_WIDTH)
						.fill("rgba(0, 0, 0, 0.2)")
						.move(
							BORDER_WIDTH + MEMORY_WIDTH - sizeText.length(), 
							start * UNIT_HEIGHT + (UNIT_HEIGHT - FONT_SIZE) / 2 + BORDER_WIDTH / 2
						).backward();
					
					sizeText.move(textContainer.x() + BORDER_WIDTH, textContainer.y()).front();
				}

				// draw dashed lines inside a block
				for (let j = start + 1; j < end; j++) {
					canvas.line(
							BORDER_WIDTH + maxWidth, j * UNIT_HEIGHT + BORDER_WIDTH / 2, 
							BORDER_WIDTH + maxWidth + MEMORY_WIDTH, j * UNIT_HEIGHT + BORDER_WIDTH / 2
						   )
						  .stroke({ width: BORDER_WIDTH / 2, color: "black", dasharray: "5,5" })
				}

				i = end;
			}
		}
	});

	return (
		<div ref={container}></div>
	);
}

export default MemoryChart;