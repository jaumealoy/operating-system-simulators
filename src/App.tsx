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

import IOSimulatorPage from "./simulators/IOSimulator/IOSimulatorPage";
import CPUSimulatorPage from "./simulators/CPUSimulator/CPUSimulatorPage";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useTranslation, initReactI18next } from "react-i18next";

import es from "./locales/es.json";
import ca from "./locales/ca.json";

i18n.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources: {
			es: { translation: es },
			ca: { translation: ca },
    	},
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
						<Route path="/cpu" exact={true}>
							<CPUSimulatorPage />
						</Route>

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
