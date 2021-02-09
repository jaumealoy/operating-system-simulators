import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import RequestChart from './simulators/IOSimulator/RequestChart';

function App() {
	const [counter, setCounter] = useState(0);

	return (
		<div className="App">
			<Menu />

			<div className="container">
				<RequestChart 
					tracks={counter}
					requests={[220, 40, 100, 50, 20, 10, 1, 60, 300]} />
			</div>
		</div>
	);
}

export default App;
