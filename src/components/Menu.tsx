import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown, Navbar, Nav } from "react-bootstrap";

import { useTranslation } from "react-i18next";

interface Language {
	id: string;
	name: string;
	flag: string;
}

const languages: {[id: string]: Language} = {
	es: { id: "es", name: "Castellano", flag: "" },
	ca: { id: "ca", name: "Català", flag: "" }
};

interface MenuItem {
	key: string;
	title: string;
	to: string;
}

function Menu() {
	const { t, i18n } = useTranslation();
	const [selectedLanguage, setSelectedLanguage] = useState(i18n.language in languages ? i18n.language : "es");

	const location = useLocation();
	const items: MenuItem[] = [
		{ key: "cpu_simulator", title: t("menu.CPUSimulator"), to: "/cpu" },
		{ key: "io_simulator", title: t("menu.IOSimulator"), to: "/io" },
		{ key: "memory_simulator", title: t("menu.MemorySimulator"), to: "/memory" },
		{ key: "help", title: t("menu.FAQ"), to: "/help" }
	];

	const selectLanguage = (language: string) => {
		setSelectedLanguage(language);
		i18n.changeLanguage(language);
	};

	return (
		<Navbar 
			expand="md"
			className="mb-2"
			variant="dark" 
			bg="dark">
			<div className="container">
				<Navbar.Toggle aria-controls="main_menu" />
				<Navbar.Collapse id="main_menu">
					<Nav className="mr-auto">
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
					</Nav>
				</Navbar.Collapse>

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
		</Navbar>
	);
}

export default Menu;