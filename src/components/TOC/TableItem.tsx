import React from "react";
import { TOCItem } from "./TableOfContent";

interface TableItemProps {
	id: string;
	target: string;
	title: string;
	items: TOCItem[];
}

function TableItem(props: TableItemProps) {
	return (
		<>
			<li id={props.id}>
				<a href={`#${props.target}`}>{props.title}</a>
			</li>

			{props.items.length > 0 &&
				<ul>
					{props.items.map(item =>
						<TableItem 
							key={item.id}
							target={item.target}
							id={item.id}
							title={item.title}
							items={item.items} />    
					)}
				</ul>
			}
		</>
	)
}

export default TableItem;