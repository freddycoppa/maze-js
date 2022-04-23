// Author: Vedant Vrattikoppa

const len = 50, breadth = 50; // number of tiles in maze
const cellWidth = 8, borderWidth = 2;
const width = len * (cellWidth + borderWidth) + borderWidth;
const height = breadth * (cellWidth + borderWidth) + borderWidth;

const maze = [];
let begin, end;

let blockEvents = false, blockSelect = true;

let selectState = {
	which: "none",
	div: document.createElement("div"),
	select: function(which) {
		this.which = which;
		if (which == "begin") this.div.textContent = "Select Starting Point";
		else if (which == "end") this.div.textContent = "Select End Point";
	},
	unselect: function() {
		this.which = "none";
		this.div.textContent = "";
	}
};

const body = document.querySelector("body");

const timeout = 16;

const pathColor = "blue";

let color = "white";



function colorBetween(cell0, cell1, color) {
    function colorBorder(cell, border) {
        maze[cell.x][cell.y][border + "Border"].style.backgroundColor = color;
    }

    if (cell0.x == cell1.x) {
        if (cell0.y < cell1.y) colorBorder(cell0, "down");
        else colorBorder(cell1, "down");
    }
    else if (cell0.y == cell1.y) {
        if (cell0.x < cell1.x) colorBorder(cell0, "right");
        else colorBorder(cell1, "right");
    }    
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function reset() {
	selectState.unselect();
	blockSelect = true;
    for (let x = 0; x < len; x++) for (let y = 0; y < breadth; y++) {
        maze[x][y].parent = null;
        maze[x][y].visited = false;
        maze[x][y].square.style.backgroundColor = "black";
        if (x < len - 1) maze[x][y].rightBorder.style.backgroundColor = "black";
        if (y < breadth - 1) maze[x][y].downBorder.style.backgroundColor = "black";
    }
}

function generate() {
	blockEvents = true;
	
    function carve(node) {
        if (!node) {
			blockEvents = false;
			return;
		}

        node.visited = true;
        node.square.style.backgroundColor = pathColor;
        const possibleNodes = [];

        function pushIfNotVisited(node) {
			if (!node.visited) possibleNodes.push(node);
		}

        function passOnTo(next) { 
			if (next) colorBetween(node, next, pathColor);
			setTimeout(() => {
            	carve(next);
            	node.square.style.backgroundColor = "white";
				if (next) colorBetween(node, next, "white");
        	}, timeout); 
		}

        if (node.x + 1 < len) pushIfNotVisited(maze[node.x + 1][node.y]);
        if (node.x - 1 > -1) pushIfNotVisited(maze[node.x - 1][node.y]);
        if (node.y + 1 < breadth) pushIfNotVisited(maze[node.x][node.y + 1]);
        if (node.y - 1 > -1) pushIfNotVisited(maze[node.x][node.y - 1]);

        if (possibleNodes.length == 0) passOnTo(node.parent);
        else {
            let choice = randomChoice(possibleNodes);
            choice.parent = node;
            passOnTo(choice);
        }
    }

    carve(randomChoice(randomChoice(maze)));

	blockSelect = false;
}

function clear() {
	let node = begin;
	while (node.parent) {
		colorBetween(node, node.parent, color);
		node.square.style.backgroundColor = color;
		node = node.parent;
	}
}

function getPath() {
	function makeRoot(node, parent=null) {
		if (!node) return;
		makeRoot(node.parent, node);
		node.parent = parent;
	}

	makeRoot(end);	

	function drawPath(node) {
		if (!node.parent) {
			blockEvents = false;
			return;
		}
		node.square.style.backgroundColor = color
		colorBetween(node, node.parent, color);
		setTimeout(drawPath, timeout, node.parent);
	}

	
	blockEvents = true;
	drawPath(begin);
}



// event handlers

document.onkeydown = event => {
	if (blockEvents) return;
	
    switch (event.key) {
		case 'g':
			reset();
			generate();
			break;
		case 'p':
			selectState.unselect();
			if (!(begin && end)) return;
			if (color == "white") {
				blockSelect = true;
				color = pathColor;
			} else {
				blockSelect = false;
				color = "white";
			}
			getPath();
			begin.square.style.backgroundColor = "green";
			break;
		case 's':
			if (!blockSelect) {
				if (selectState.which == "begin") selectState.unselect();
				else selectState.select("begin");
			}
			break;
		case 'e':
			if (!blockSelect) {
				if (selectState.which == "end") selectState.unselect();
				else selectState.select("end");
			}
			break;
		case 'c':
			selectState.unselect();
			color = "white";
			clear();
			begin.square.style.backgroundColor = "green";
			end.square.style.backgroundColor = "red";
			blockSelect = false;
			break;
		case 'r':
			reset();
			break;
	}
};


body.onclick = e => {
	if (!blockEvents) if (e.target == e.currentTarget) selectState.unselect();
};



// initialize maze

for (let x = 0; x < len; x++) {
    maze[x] = [];
    for (let y = 0; y < breadth; y++) {
        maze[x][y] = {
            x: x,
            y: y
        };
    }
}

const main = document.createElement("div");
main.id = "main";
main.style.width = width + 'px';
main.style.height = height + 'px';
main.style.backgroundColor = "black";
main.style.margin = "auto";
main.style.position = "relative";
body.appendChild(main);

for (let x = 0; x < len; x++) {
    for (let y = 0; y < breadth; y++) {
        const square = document.createElement("div");

        square.style.position = "absolute";
        square.style.left = (borderWidth + x * (cellWidth + borderWidth)) + 'px';
        square.style.top = (borderWidth + y * (cellWidth + borderWidth)) + 'px';
        square.style.width = cellWidth + 'px';
        square.style.height = cellWidth + 'px';

        main.appendChild(square);

        maze[x][y].square = square;

		square.onclick = () => {
			if (blockEvents) return;

			if (selectState.which == "begin") {
				if (begin) begin.square.style.backgroundColor = "white";
				begin = maze[x][y];
				if (begin == end) end = null;
				begin.square.style.backgroundColor = "green";
			} else if (selectState.which == "end") {
				if (end) end.square.style.backgroundColor = "white";
				end = maze[x][y];
				if (end == begin) begin = null;
				end.square.style.backgroundColor = "red";
			}

			selectState.unselect();
		}

        if (x < len - 1) {
            const rightBorder = document.createElement("div");

            rightBorder.style.position = "absolute";
            rightBorder.style.left = ((x + 1) * (cellWidth + borderWidth)) + 'px';
            rightBorder.style.top = (borderWidth + y * (cellWidth + borderWidth)) + 'px';
            rightBorder.style.width = borderWidth + 'px';
            rightBorder.style.height = cellWidth + 'px';

            main.appendChild(rightBorder);

            maze[x][y].rightBorder = rightBorder;
        }

        if (y < breadth - 1) {
            const downBorder = document.createElement("div");
    
            downBorder.style.position = "absolute";
            downBorder.style.left = (borderWidth + x * (cellWidth + borderWidth)) + 'px';
            downBorder.style.top = ((y + 1) * (cellWidth + borderWidth)) + 'px';
            downBorder.style.width = cellWidth + 'px';
            downBorder.style.height = borderWidth + 'px';
    
            main.appendChild(downBorder);
    
            maze[x][y].downBorder = downBorder;
        }
    }
}

body.appendChild(selectState.div);