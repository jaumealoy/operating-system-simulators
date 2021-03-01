import React from "react";

import TimeChart from "./TimeChart";

function CPUSimulatorPage() {
	return (
		<>
			<div className="row">
				<div className="col-md-6">
					<TimeChart 
						processes={["A", "B", "E", "C", "D"]}
						maxTicks={20}
						events={[
							[ { id: "B", status: "running" } ],
							[ { id: "B", status: "running" } ],
							[ { id: "B", status: "running" }, { id: "E", status: "blocked" } ],
							[ { id: "A", status: "running" }, { id: "E", status: "blocked" } ],
							[ { id: "A", status: "running" }, { id: "E", status: "blocked" } ],
							[ { id: "C", status: "running" } ],
							[ { id: "D", status: "running" } ],
							[ { id: "C", status: "running" } ],
							[ { id: "c", status: "running" } ]
						]}
				 		/>
				</div>
			</div>
		</>
	);
}

export default CPUSimulatorPage;