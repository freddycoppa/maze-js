const len = 45, breadth = 45; // number of tiles in maze
const cellWidth = 10, borderWidth = 5;
const width = len * (cellWidth + borderWidth) + borderWidth;
const height = breadth * (cellWidth + borderWidth) + borderWidth;

const maze = [];
for (let x = 0; x < len; x++) {
    maze[x] = [];
    for (let y = 0; y < breadth; y++) {
        maze[x][y] = {
            x: x,
            y: y,
            parent: null,
            children: [],
            visited: false
        };
    }
}

let start = maze[0][0]; 

const main = document.createElement("div");
main.id = "main";
main.style.width = width + 'px';
main.style.height = height + 'px';
main.style.backgroundColor = "black";
main.style.margin = "auto";
main.style.position = "relative";
document.querySelector("body").appendChild(main);

for (let x = 0; x < len; x++) {
    for (let y = 0; y < breadth; y++) {
        const cell = document.createElement("div");

        cell.style.position = "absolute";
        cell.style.left = (borderWidth + x * (cellWidth + borderWidth)) + 'px';
        cell.style.top = (borderWidth + y * (cellWidth + borderWidth)) + 'px';
        cell.style.width = cellWidth + 'px';
        cell.style.height = cellWidth + 'px';

        main.appendChild(cell);

        maze[x][y].cell = cell;

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

function reset() {
    for (let x = 0; x < len; x++) for (let y = 0; y < breadth; y++) {
        maze[x][y].parent = null;
        maze[x][y].children = [];
        maze[x][y].visited = false;
        maze[x][y].cell.style.backgroundColor = "white";
        if (x < len - 1) maze[x][y].rightBorder.style.backgroundColor = "black";
        if (y < breadth - 1) maze[x][y].downBorder.style.backgroundColor = "black";
    }

    maze[0][0].cell.style.backgroundColor = "green";
    maze[len - 1][breadth - 1].cell.style.backgroundColor = "green";
}


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

function generate() {
    reset();
    let current = start;
    while (current) {
        current.visited = true;
        possibleNodes = [];

        function pushIfNotVisited(node) {if (!node.visited) possibleNodes.push(node);}

        if (current.x + 1 < len) pushIfNotVisited(maze[current.x + 1][current.y]);
        if (current.x - 1 > -1) pushIfNotVisited(maze[current.x - 1][current.y]);
        if (current.y + 1 < breadth) pushIfNotVisited(maze[current.x][current.y + 1]);
        if (current.y - 1 > -1) pushIfNotVisited(maze[current.x][current.y - 1]);

        if (possibleNodes.length == 0) current = current.parent;
        else {
            let choice = possibleNodes[Math.floor(Math.random() * possibleNodes.length)];
            current.children.push(choice);
            choice.parent = current;
            colorBetween(current, choice, "white");
            current = choice;
        }
    }
}

function solve() {
    let node = maze[len - 1][breadth - 1];
    while (node.parent) {
        colorBetween(node, node.parent, "red");
        node = node.parent;
        node.cell.style.backgroundColor = "red";
    }
    node.cell.style.backgroundColor = "green";
}

document.addEventListener("keydown", event => {
    if (event.key == 'g') generate();
    else if (event.key == 's') solve();
});

generate();