import React, { useLayoutEffect, useState, Ref, useRef } from "react";
import { Col } from "react-bootstrap";
import _uniqueId from "lodash/uniqueId";
import TableItem from "./TableItem";

type HeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface TableOfContentProps {
	root: HeadingType;
};

interface TOCItem {
	id: string;
	target: string;
	title: string;
	items: TOCItem[];
	element: HTMLElement;
};

type HeadersDict = {
	[key in HeadingType]?: HTMLCollectionOf<HTMLHeadingElement>
};

/**
 * @param element HTMLElement
 * @returns absolute Y position of an element inside the document
 */
const elementYOffset = (element: HTMLElement) => {
	let bodyRect = document.body.getBoundingClientRect();
	let elemRect = element.getBoundingClientRect();
	return elemRect.top - bodyRect.top;
};

function TableOfContent(props: TableOfContentProps) {
	// list tree
	const [toc, setTOC] = useState<TOCItem[]>([]);

	// fetch all possible headers
	let headerTags: HeadingType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
	let headers: HeadersDict = {};
	headerTags.map(tag => headers[tag] = document.getElementsByTagName(tag));

	/**
	 * @param currentHeading current heading level
	 * @param below 
	 * @param above 
	 * @returns a list of TOCItems between the header represented by below and above
	 */
	const findItemsBelowAndAbove = (currentHeading: HeadingType, below: HTMLHeadingElement, above: HTMLHeadingElement | null) => {
		let items: TOCItem[] = [];
		let index: number = headerTags.indexOf(currentHeading);
		
		if (index == (headerTags.length - 1)) {
			// there cannot be more items below as this item is the lowest level header
		} else {
			let nextLevel = headers[headerTags[index + 1]];
			if (nextLevel != undefined) {
				for (let i = 0; i < nextLevel.length; i++) {
					let element = nextLevel[i];

					/**
					 * For an explanation of the function compareDocumentPosition
					 * and examples visit: https://johnresig.com/blog/comparing-document-position/
					 * 
					 * A.compareDocumentPosition(B) & DOCUMENT_POSITION_FOLLOWING is true if 
					 * A is after B.
					 */

					if ((below.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) 
						&& (above == null ||(above != null && element.compareDocumentPosition(above) & Node.DOCUMENT_POSITION_FOLLOWING))) {
						// this element is between below and above

						// calculate which will be its final element
						let nextItem: HTMLHeadingElement | null = above;
						if (i < nextLevel.length - 1) {
							if ((nextLevel[i + 1].compareDocumentPosition(below) & Node.DOCUMENT_POSITION_PRECEDING)
								&& (above == null || (above != null && nextLevel[i + 1].compareDocumentPosition(above) & Node.DOCUMENT_POSITION_FOLLOWING))) {
								nextItem = nextLevel[i + 1];
							}
						}	

						// generate an unique id for the header, if there isn't any
						let targetId: string;
						if (element.hasAttribute("id")) {
							targetId = element.getAttribute("id") || "";
						} else {
							targetId = _uniqueId("toc");
							element.setAttribute("id", targetId);
						}

						let item: TOCItem = {
							title: element.innerText,
							items: findItemsBelowAndAbove(
								headerTags[index + 1], 
								element, 
								nextItem
							),
							element: element,
							id: _uniqueId("toc"),
							target: targetId
						};

						items.push(item);
					}
				}
			}
		}

		return items;
	};

	useLayoutEffect(() => {
		let headerRoot = headers[props.root];
		let newTOC: TOCItem[] = [];
		if (headerRoot != undefined) {
			if (headerRoot.length > 0) {
				for (let i = 0; i < headerRoot.length; i++) {
					// set an unique identifier for this header
					let targetId: string;
					if (headerRoot[i].hasAttribute("id")) {
						targetId = headerRoot[i].getAttribute("id") || "";
					} else {
						targetId = _uniqueId("toc");
						headerRoot[i].setAttribute("id", targetId);
					}
					

					// add the item to the TOC list with all children
					newTOC.push({
						title: headerRoot[i].innerText,
						items: findItemsBelowAndAbove(
							headerTags[headerTags.indexOf(props.root)],
							headerRoot[i],
							(i == (headerRoot.length - 1)) ? null : headerRoot[i + 1]
						),
						element: headerRoot[i],
						id: _uniqueId("toc"),
						target: targetId
					});
				}
			}
		}

		setTOC(newTOC);

		
		// the variable "toc" is not the reference to the updated TOC
		// we must use the "newTOC" variable to have access to latest 
		// TOC items
		let onScroll = (event: Event) => {
			// we want to find the closest TOC item to the scroll position
			let minY = Number.MIN_SAFE_INTEGER;
			let element: string | null = null;

			// iterate over all the TOC items
			let stack = [...newTOC];
			let item: TOCItem | undefined;
			while ((item = stack.pop()) != undefined) {
				// mark as not active all the elements
				document.getElementById(item.id)?.classList.remove("active");

				let box = item.element.getBoundingClientRect();
				// the closest section to the scroll is that one with maximum .top
				// below 0
				if (box.top <= 0 && box.top > minY) {
					minY = box.top;
					element = item.id;
				}
				
				// we must look all the children of this element
				item.items.map(item => stack.push(item));
			}

			if (element != null) {
				// mark the closest element as active
				document.getElementById(element)?.classList.add("active")
			}
		};

		// listen to scroll events to update the selected TOC item
		window.addEventListener("scroll", onScroll);
		
		// clean-up function
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	

	return (
		<Col md={4}>
			<div className="toc">
				<span className="title">Tabla de contenidos</span>
				<ul>
					{toc.map(item => 
						<TableItem 
							key={item.id}
							target={item.target}
							id={item.id}
							title={item.title}
							items={item.items} />	
					)}
				</ul>
			</div>
		</Col>
	)
}

export default TableOfContent;
export type { TOCItem };