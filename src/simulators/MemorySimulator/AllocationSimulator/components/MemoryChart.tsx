import React, { useRef, useEffect, useLayoutEffect } from "react";
import { SVG, Svg, G, Text, Rect } from "@svgdotjs/svg.js";

const DEFAULT_HEIGHT: number = 450;
const MEMORY_WIDTH: number = 200;
const BORDER_WIDTH: number = 3;
const FONT_SIZE: number = 14;
const ARROW_SIZE: number = 20;

interface MemoryBlock {
	start: number;
	end: number;
	type: number;
	text?: string;
}

interface MemoryChartProps {
	capacity: number;
	blocks: MemoryBlock[];
	groups?: number[];
	pointer?: number;
	height?: number;
}

const PROCESS_COLORS: string[] = [
	"#3498db", "#9b59b6", "#e67e22", "#e74c3c", 
	"#f1c40f", "#34495e", "#1abc9c"
];

function MemoryChart(props: MemoryChartProps) {
	const container = useRef<HTMLDivElement>(null);
	
	// SVG.js chart references
	const initialized = useRef<boolean>(false);
	const chart = useRef<Svg>();
	const imageGroup = useRef<G>();

	if (!initialized.current) {
		let canvas: Svg = SVG();
		chart.current = canvas;
		imageGroup.current = canvas.group();
		initialized.current = true;
	}

	// default props values
	const HEIGHT: number = (props.height ? props.height : DEFAULT_HEIGHT);

	let fitAvailableSize = () => {
		if (container.current != null && chart.current != null && imageGroup.current != null) {
			let availableWidth: number = container.current.getBoundingClientRect().width;

			chart.current.width(availableWidth);

			// remove any scale to get the correct size
			let canvas = imageGroup.current;
			canvas.transform({ scale: [1, 1] });
			canvas.move(0, 0);

			if (canvas.width() < availableWidth) {
				// center it
				canvas.move((availableWidth - canvas.width()) / 2, BORDER_WIDTH);
			} else {
				// scale it down to fit horizontally
				let scale = availableWidth / canvas.width();
				canvas.scale(scale, scale, 0, 0);
			}
		}
	};

	useLayoutEffect(() => {
		if (chart.current != undefined && container.current != null) {
			// create the SVG element
			chart.current.addTo(container.current);
		}

		// make the chart resizable
		let onResize = () => {
			fitAvailableSize();
		};

		window.addEventListener("resize", onResize);

		// remove the resize listener on component unload
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	useEffect(() => {
		let canvas = imageGroup.current;

		if (chart.current != undefined && canvas != undefined) {
			canvas.clear();

			// drawing main memory section
			let extraWidth: number = BORDER_WIDTH;
			canvas.rect(MEMORY_WIDTH, HEIGHT)
				  .move(extraWidth, BORDER_WIDTH + ARROW_SIZE / 2)
				  .fill("transparent")
				  .stroke({ color: "black", width: BORDER_WIDTH });

			// hack to align different memories in comparaison view when one has a pointer
			canvas.rect(1, ARROW_SIZE).fill("transparent");
			
			// draw blocks, pointers and groups
			let y = (logicalPosition: number) : number => 
				BORDER_WIDTH + 
				ARROW_SIZE / 2 +
				(logicalPosition / props.capacity) * HEIGHT;

			let pattern = chart.current.pattern(10, 10, (add) => {
				add.rect(10, 10).fill("white");
				add.path("M 0,10 L 10,0 M -10,10 L 5, -5 M 0,20 L 15, 5")
				.stroke({ color: "black", width: 2 });
			});

			for (let i = 0; i < props.blocks.length; i++) {
				if (props.blocks[i].type == 0) continue;

				let start = props.blocks[i].start;
				let end = props.blocks[i].end;

				let blockHeight: number = y(end) - y(start);

				let block = canvas.rect(MEMORY_WIDTH, blockHeight)
								  .stroke({ color: "black", width: BORDER_WIDTH })
								  .move(BORDER_WIDTH, y(start));

				if (props.blocks[i].type < 0) {
					block.fill(pattern);
				} else {
					block.fill(PROCESS_COLORS[(props.blocks[i].type - 1) % PROCESS_COLORS.length])
				}

				let text = props.blocks[i].text;
				if (text != undefined) {
					let element = canvas.text(text)
										.fill("white")
										.font({ size: FONT_SIZE })
										.move(block.x() + BORDER_WIDTH * 4, block.y() + BORDER_WIDTH);

					if ((block.height() - BORDER_WIDTH) < FONT_SIZE) {
						element.font({ size: block.height() / 1.75 })
					}
				}
			}

			// pointer and groups	
			if (props.pointer != undefined) {
				canvas.polygon([
					[ARROW_SIZE, 0],
					[0, ARROW_SIZE / 2],
					[ARROW_SIZE, ARROW_SIZE]
				]).move(extraWidth + MEMORY_WIDTH + BORDER_WIDTH, y(props.pointer) - ARROW_SIZE / 2)
			} else if (props.groups != undefined) {
				let sum: number = 0;
				let maxTextWidth: number = 0;

				for (let i = 0; i < props.groups.length; i++) {
					let sY = y(sum);
					let eY = y(sum + props.groups[i]);
					let sX = MEMORY_WIDTH + extraWidth + BORDER_WIDTH * 2;

					canvas.polyline([
						[0, 0],
						[15, 0],
						[15, eY - sY],
						[0, eY - sY]
					])
					.fill("transparent")
					.stroke({ color: "black", width: BORDER_WIDTH })
					.move(sX, sY);

					let text: Text = canvas.text(props.groups[i].toString())
										   .font({ size: FONT_SIZE })
										   .move(sX + 20, (eY + sY) / 2 - FONT_SIZE / 2)

					if (text.length() > maxTextWidth) {
						maxTextWidth = text.length();
					}

					sum += props.groups[i];
				}

				extraWidth += maxTextWidth;
			}


			// show legend if necessary
			let fragmentation: boolean = false;
			for (let i = 0; i < props.blocks.length && !fragmentation; i++) {
				fragmentation = props.blocks[i].type < 0;
			}

			if (fragmentation) {
				let x = BORDER_WIDTH;
				let y = canvas.height() + BORDER_WIDTH * 4 + 10;

				canvas.rect(20, 20)
					  .stroke({ color: "black", width: BORDER_WIDTH })
					  .fill(pattern)
					  .move(x, y);

				canvas.text("Fragmentación interna")
					  .move(x + 30, y);
			}

			chart.current.size(canvas.width() + extraWidth + BORDER_WIDTH, canvas.height() + BORDER_WIDTH * 2 + 100);

			fitAvailableSize();
		}
	});

	return (
		<div ref={container}></div>
	);
}

export default MemoryChart;