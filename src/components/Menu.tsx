import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import { useTranslation } from "react-i18next";

interface Language {
	id: string;
	name: string;
	flag: string;
}

const languages: {[id: string]: Language} = {
	es: { id: "es", name: "Castellano", flag: "" },
	ca: { id: "ca", name: "Català", flag: "" },
	en: { id: "en", name: "English", flag: "" }
};

interface MenuItem {
	key: string;
	title: string;
	to: string;
}

function Menu() {
	const { t, i18n } = useTranslation();
	const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

	const location = useLocation();
	const items: MenuItem[] = [
		{ key: "io_simulator", title: t("menu.IOSimulator"), to: "/io" }
	];

	const selectLanguage = (language: string) => {
		setSelectedLanguage(language);
		i18n.changeLanguage(language);
	};


	console.log(location.pathname)

	return (
		<nav className="navbar navbar-dark bg-dark mb-2">
			<div className="container">
				<div className="">
					<ul className="navbar-nav">
						{items.map(item => 
							<li 
								key={item.key}
								className="nav-item">
								<Link
									className={"nav-link" + (location.pathname == item.to ? " active" : "")}
									to={item.to}>
									{item.title}
								</Link>
							</li>
						)}
					</ul>
				</div>

				<Dropdown>
					<Dropdown.Toggle variant="menu-select" className="nav-link">
						{languages[selectedLanguage].name}
					</Dropdown.Toggle>

					<Dropdown.Menu>
						{Object.entries(languages).map(([key, lang]) => 
							<Dropdown.Item 
								onClick={() => selectLanguage(lang.id)}
								key={lang.id}>
								{lang.name}
							</Dropdown.Item>
						)}
					</Dropdown.Menu>
				</Dropdown>


			</div>
		</nav>
	);
}

export default Menu;