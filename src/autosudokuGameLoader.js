/**
	Note:
		To load a sudoku game, you need to have a <div id="autoSudoku"></div> somewhere in the page body,
		and libCSP.js, CSP.js, sudo.js must be loaded prior to this script.
*/

var div = document.getElementById("autoSudoku");

var baseProblem = [[X,X,X,X,X,5,X,7,X], 
	   [X,6,X,X,X,4,5,3,8],
	   [X,X,X,X,X,9,X,X,2],
	   [X,X,8,X,X,X,X,X,9],
	   [X,3,X,X,1,X,X,6,X],
	   [7,X,X,X,X,X,8,X,X],
	   [3,X,X,5,X,X,X,X,X],
	   [8,1,2,3,X,X,X,4,X],
	   [X,7,X,2,X,X,X,X,X]];
	   
function bidimDeepCopy(array) {
	var output = [[X,X,X,X,X,X,X,X,X], 
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X]];
	   
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array[0].length; j++) {
			output[i][j] = array[i][j];
		}
	}
	
	return output;
}
	   
var currProb = bidimDeepCopy(baseProblem);

var empty = [[X,X,X,X,X,X,X,X,X], 
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X],
	   [X,X,X,X,X,X,X,X,X]];

function buildDivFrom(from, type) {
	var divContent = "<div id='game'><table><caption>AutoSudoku</caption>" +
	  "<colgroup><col><col><col>" + 
	  "<colgroup><col><col><col>" + 
	  "<colgroup><col><col><col>";
	for (var i = 0; i < 9; i++) {
		if (i % 3 == 0) {
		    divContent += "<tbody>";
		}
		
		divContent += "<tr>"
		for (var j = 0; j < 9; j++) {
			divContent += "<td class='cell'><input type='text' maxlength='1' ";
			if (type == "array") {
				if (from[i][j] != 0) {
					divContent += "value='" + from[i][j] + "'";
				}
			} else if (type == "grid") {
				divContent += "value='" + from.getVariable(i, j).getValue() + "'";
			}
			divContent += "/></td>";
		}
		divContent += "</tr>";
	}
	divContent += "</table></div>";
	divContent += "<button onclick='computeSudoku();'>Compute sudoku</button>";
	divContent += "<button onclick='buildDivFrom(empty, \"array\"); currProb = bidimDeepCopy(empty);'>reset</button>";
	divContent += "<button onclick='buildDivFrom(baseProblem, \"array\"); currProb = bidimDeepCopy(baseProblem);'>use original problem</button>";
	divContent += "<p id='error'></p>";
	
	div.innerHTML = divContent;
}
	   
function computeSudoku() {
	var t0 = performance.now();
	var grid = new Grid();
	var res = run(grid, currProb);
	var t1 = performance.now();
	// Only keep 3 digits precision.
	var elapsed = Math.floor((t1 - t0) * 1000) / 1000;
	
	if (res == FAIL) {
		document.getElementById('error').innerHTML += "Cannot solve sudoku (" + elapsed + " milliseconds)";
	} else {
		buildDivFrom(grid, "grid");
		div.innerHTML += "<p>" + getInfo() + " (" + elapsed + " milliseconds).</p>";
	}						
}

// Init div.
buildDivFrom(baseProblem, "array");


    