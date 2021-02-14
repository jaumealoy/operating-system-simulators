import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';

import { 
	BrowserRouter as Router, 
	Route, 
	Switch 
} from "react-router-dom"; 

import "./common/css/App.scss";

import IOSimulatorPage from './simulators/IOSimulator/IOSimulatorPage';


function App() {
	const [counter, setCounter] = useState(0);

	return (
		<div className="">
			<Router>
				<Menu />

				<div className="container">
					<Switch>

						<Route path="/io" exact={true}>
							<IOSimulatorPage />
						</Route>
						
					</Switch>
				</div>
			</Router>
		</div>
	);
}

export default App;
