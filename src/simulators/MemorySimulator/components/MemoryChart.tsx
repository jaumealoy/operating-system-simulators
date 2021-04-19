import React, { useEffect, useLayoutEffect, useRef } from "react";
import { SVG, Svg, G, Text, Rect } from "@svgdotjs/svg.js";

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
	blocks?: number[];
	groupBlocks?: boolean;
	customBlockText?: (position: number) => string;
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
	const initialized = useRef<boolean>(false);
	const chart = useRef<Svg>();
	const imageGroup = useRef<G>();

	if (!initialized.current) {
		let canvas: Svg = SVG();
		chart.current = canvas;
		imageGroup.current = canvas.group();

		initialized.current = true;
	}

	let showBlockSize: boolean = props.showBlockSize || false;
	let groupBlocks: boolean = props.groupBlocks == undefined ? true : props.groupBlocks;

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
			// creating the SVG element
			chart.current.addTo(container.current);
		}

		// resize the chart on window resize
		let onResize = () => {
			fitAvailableSize();
		};

		window.addEventListener("resize", onResize);

		// remove the resize listener once the component is unloaded
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	useEffect(() => {
		let canvas = imageGroup.current;

		if (chart.current != undefined && canvas != undefined) {
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
				]).move(maxWidth + MEMORY_WIDTH + 2 * BORDER_WIDTH, BORDER_WIDTH + UNIT_HEIGHT * props.pointer + UNIT_HEIGHT / 6);
			} else if (props.blocks != undefined) {
				let maxTextBlockSize: number = 0;
				let texts: Text[] = [];

				for (let i = 0; i < props.blocks.length; i++) {
					let text: Text = canvas.text(props.blocks[i].toString())
										   .font({ color: "black", size: FONT_SIZE });

					if (text.length() > maxTextBlockSize) {
						maxTextBlockSize = text.length();
					}

					texts.push(text);
				}

				extraWidth = 40 + maxTextBlockSize;

				let offset: number = 0;
				for (let i = 0; i < props.blocks.length; i++) {
					canvas.polyline([
						[0, 8],
						[20, 8],
						[20, props.blocks[i] * UNIT_HEIGHT],
						[0, props.blocks[i] * UNIT_HEIGHT]
					])
					.fill("transparent")
					.stroke({ color: "black", width: BORDER_WIDTH })
					.move(MEMORY_WIDTH + extraWidth - maxTextBlockSize, BORDER_WIDTH + offset * UNIT_HEIGHT + 4);

					// move block text to block center
					texts[i].move(
						MEMORY_WIDTH + extraWidth + 25 + - maxTextBlockSize, 
						offset * UNIT_HEIGHT + ((props.blocks[i] * UNIT_HEIGHT - FONT_SIZE) / 2));

					offset += props.blocks[i];
				}
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
			
				if (groupBlocks) {
					// find the next change
					while (end < props.data.length && props.data[end] == props.data[start]) {
						end++;
					}
				}

				let rect: Rect =canvas.rect(MEMORY_WIDTH, UNIT_HEIGHT * (end - start))
					  .move(BORDER_WIDTH + maxWidth, start * UNIT_HEIGHT + BORDER_WIDTH)
					  .stroke({ width: BORDER_WIDTH, color: "black" });

				if (props.data[start] >= 1 && props.data[start] <= props.processes.length) {
					let processId = props.data[start] - 1;
					rect.fill(PROCESS_COLORS[processId % PROCESS_COLORS.length]);

					let text: string;
					if (props.customBlockText == undefined) {
						text = props.processes[processId].toString();
					} else {
						text = props.customBlockText(start);
					}

					canvas.text(text)
						  .font({ size: FONT_SIZE, fill: "white" })
						  .move(
							  BORDER_WIDTH + maxWidth + FONT_SIZE, 
							  start * UNIT_HEIGHT + (UNIT_HEIGHT - FONT_SIZE) / 2 + BORDER_WIDTH / 2
						  );
				} else if (props.data[start] < 0) {
					rect.fill(pattern);
				} else {
					rect.remove();
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
					if (props.data[start] != 0) {
						canvas.line(
							BORDER_WIDTH + maxWidth, j * UNIT_HEIGHT + BORDER_WIDTH / 2, 
							BORDER_WIDTH + maxWidth + MEMORY_WIDTH, j * UNIT_HEIGHT + BORDER_WIDTH / 2
						   )
						  .stroke({ width: BORDER_WIDTH / 2, color: "black", dasharray: "5,5" });
					}
				}

				i = end;
			}

			fitAvailableSize();

		}
	});

	return (
		<div ref={container}></div>
	);
}

export default MemoryChart;