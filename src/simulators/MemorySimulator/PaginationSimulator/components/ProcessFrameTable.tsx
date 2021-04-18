import React from "react";
import { Process, ProcessEntry } from "./../PaginationSimulator";

interface ProcessFrameTable {
	process: Process;
	entry: ProcessEntry;
	showPointer: boolean;
}

function ProcessFrameTable(props: ProcessFrameTable) {
	let childs: React.ReactNode[] = [];

	for (let i = 0; i < props.process.frames; i++) {
		let child: React.ReactNode = (
			<div key={i} className={"frame" + ((props.showPointer && i == props.entry.pointer) ? " selected" : "")}>
				<div className="frame-content">
					{i < props.entry.loadedPages.length ?
						<>
							{props.entry.loadedPages[i]}
							{props.entry.pages[props.entry.loadedPages[i]].data.accessBit &&
								<sup>A</sup>}
							{props.entry.pages[props.entry.loadedPages[i]].data.modifiedBit &&
								<sub>M</sub>}
						</>
						:
						"-"
					}
				</div>
				<div className="frame-index">{i}</div>
			</div>
		);

		childs.push(child);
	}

	return (
		<div className="process-frames">
			{childs}
		</div>
	);
}

export default ProcessFrameTable;