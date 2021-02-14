import React from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

interface Language {
	id: string;
	name: string;
	flag: string;
}

const languages: Language[] = [
	{ id: "ES", name: "Castellano", flag: "" },
	{ id: "CAT", name: "Català", flag: "" },
	{ id: "EN", name: "English", flag: "" }
];

interface MenuItem {
	key: string;
	title: string;
	to: string;
}

const items: MenuItem[] = [
	{ key: "io_simulator", title: "IO Simulator", to: "/io" }
];

function Menu() {
	return (
		<nav className="navbar navbar-dard bg-dark mb-sm-2">
			<div className="container">
				<div className="">
					<ul className="navbar-nav">
						{items.map(item => 
							<li 
								key={item.key}
								className="nav-item">
								<Link to={item.to}>
									{item.title}
								</Link>
							</li>
						)}
					</ul>
				</div>

				<Dropdown>
					<Dropdown.Toggle className="">
						Català
					</Dropdown.Toggle>

					<Dropdown.Menu>
						{languages.map(lang => 
							<Dropdown.Item key={lang.id}>
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