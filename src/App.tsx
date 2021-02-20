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


import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

import es from "./locales/es.json";
import ca from "./locales/ca.json";

i18n.use(initReactI18next)
	.init({
		resources: {
			es: { translation: es },
			ca: { translation: ca },
    	},
    	lng: "ca",
    	fallbackLng: "es",
		interpolation: {
      		escapeValue: false
    	},
	});

function App() {
	const [counter, setCounter] = useState(0);

	const { t } = useTranslation();

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
