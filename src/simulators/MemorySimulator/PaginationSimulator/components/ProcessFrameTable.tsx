import React from "react";
import Latex from "../../../../components/Latex";
import { Process, Request, ProcessEntry } from "./../PaginationSimulator";

interface ProcessFrameTable {
	process: Process;
	entry: ProcessEntry;
	showPointer: boolean;
	accessBit: boolean;
	modifiedBit: boolean;
	request?: Request;
	pageFailure?: number;
}

function ProcessFrameTable(props: ProcessFrameTable) {
	let childs: React.ReactNode[] = [];

	for (let i = 0; i < props.process.frames; i++) {
		let child: React.ReactNode = (
			<div key={i} className={"frame" + ((props.showPointer && i == props.entry.pointer) ? " selected" : "")}>
				<div className="frame-index">
					<span>
						{i < props.entry.loadedPages.length ?
							props.entry.pages[props.entry.loadedPages[i]].data.frame
							:
							"-"
						}
					</span>
				</div>

				<div className="frame-content">
					{i < props.entry.loadedPages.length ?
						<div className="frame-content-value">
							<Latex>
								{props.entry.loadedPages[i].toString()
									+ (props.accessBit && props.entry.pages[props.entry.loadedPages[i]].data.accessBit ?
										"^{A}" : "")
									+ (props.modifiedBit && props.entry.pages[props.entry.loadedPages[i]].data.modifiedBit ?
										"_{M}" : "")
								}
							</Latex>
						</div>
						:
						"-"
					}
				</div>
			</div>
		);

		childs.push(child);
	}

	return (
		<div className="process-snapshot">
			<span className="">
				{props.request ?
					<>
						{props.request.page}
						{props.request.modified && <sup>*</sup>}
					</>
					:
					<>&nbsp;</>
				}
			</span>
			<div className="process-frames">
				{childs}
			</div>
			<span>
				{(props.pageFailure != undefined && (props.pageFailure & 0b100) > 0) ?
					<>
						{((props.pageFailure & 0b01) == 0) ? "f" : "F"}
						{props.modifiedBit && ((props.pageFailure & 0b10) > 0) && <sup>*</sup>} 
					</>
					:
					<>&nbsp;</>
				}
			</span>
		</div>
	);
}

export default ProcessFrameTable;