/**
 * Note: scripts CSP.js and libCSP.js need to be loaded in order for this file to run properly.
 */

/**
 * Represents to empty cell.
 */ 
var X = 0;

/**
 * Each cell has the same domain.
 */
var DOMAIN = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * The initial problem.
 */
var PROBLEM = [[X,X,X,X,X,X,X,X,2], 
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X],
[X,X,X,X,X,X,X,X,X]]

/**
 * Sudoku's bidimensional array.
 */
var GRID = [[]];

/**
 * COLS = ROWS = 9.
 */
var NBELEM = 9;

var SUBGRID_SIZE = 3;

var gVariables= new Variables();

var gConstraints = new Constraints();

function getPosSubGrid(pos) {
	return Math.floor(pos / SUBGRID_SIZE);
}

function getPosInSubGrid(pos) {
	return pos % SUBGRID_SIZE;
}

function cellIsEmpty(s) {
	return s == X;
}

function Pair(x, y) {
	this.x = x;
	this.y = y;
	
	this.toString = function() {
		return "(" + x + ", " + y + ")";
	}
	
}


/**
 * @param posL position on line
 * @param posC position on column
 */
function SubGrid(posL, posC) {
	
	this.posL = posL;
	this.posC = posC;
	this.notPossible = [];
	this.subGrid = [];
	
	for (var i = 0 ; i < SUBGRID_SIZE; i++) {
		this.subGrid.push([]);
	}
	
	
	// Create a variable for each cell.
	for (var i = 0; i < SUBGRID_SIZE; i++) {
		for (var j = 0; j < SUBGRID_SIZE; j++) {
			var id = "v[" + this.posL + "," + this.posC + "][" + i + "," + j + "]";
			var v = new Variable(id, DOMAIN);
			this.subGrid[i][j] = v;
			gVariables.addVariable(v);
		}
		
	}
	
	/**
	 * Class methods.
	 */
	
	this.addVariable = function(value, domain, posX, posY) {
		if (DOMAIN.indexOf(value) > -1) {
			this.subGrid[posX][posY].domain = [value];
			this.notPossible[this.notPossible.length] = value;
		} else {
			this.subGrid[posX][posY].domain = deepCopyArray(DOMAIN);
		}
	}
	
	this.getAbsoluteValue = function(x, y) {
		var posX = this.posL * SUBGRID_SIZE + x;
		var posY = this.posC * SUBGRID_SIZE + y;
        return new Pair(posX, posY);
	}
	
	this.getValue = function(posX, posY) {
		return this.subGrid[posX][posY].getValue();
	}
	
	/**
	 * Add the needed constraints for all x_i != x_j in subgrid.
	 */
	this.generateConstraints = function() {
		
		for (var i = 0; i < SUBGRID_SIZE; i++) {
			for (var j = 0; j < SUBGRID_SIZE; j++) {
				for (var k = 0; k < SUBGRID_SIZE; k++) {
					for (var l = 0; l < SUBGRID_SIZE; l++) {
						if (k > i || (k == i && l > j)) {
							var v1 = this.subGrid[i][j];
							var v2 = this.subGrid[k][l];
							var c = new BinaryConstraint(v1, "!=", v2);
							gConstraints.addConstraint(c);
						}
					}
				}
			}
		}
	}
	
}

function Grid() {
	
	this.init = function() {
		GRID = [[], [], []];
		
		for (var i = 0; i < SUBGRID_SIZE; i++) {
			for (var j = 0; j < SUBGRID_SIZE; j++) {
				GRID[i][j] = new SubGrid(i, j);
			}
		}
		
		
		var subGridCol = 0;
		var subGridRow = 0;
		for (var i = 0; i < NBELEM; i++) {
			subGridCol = 0;
			if (i > 0 && i % SUBGRID_SIZE == 0) {
				subGridRow++;
			}
			
			for (var j = 0; j < NBELEM; j++) {
				if (j > 0 && j % SUBGRID_SIZE == 0) {
					subGridCol++;
				}
				if (PROBLEM[i][j] != X) {
					GRID[getPosSubGrid(i)][getPosSubGrid(j)].addVariable(PROBLEM[i][j], [PROBLEM[i][j]], getPosInSubGrid(i), getPosInSubGrid(j));
				} else {
					GRID[getPosSubGrid(i)][getPosSubGrid(j)].addVariable(PROBLEM[i][j], DOMAIN, getPosInSubGrid(i), getPosInSubGrid(j));
				}
			}
		}
	}
	
	this.init();
	
	this.toString = function() {
		var subGridCol = 0;
		var subGridRow = 0;
		var line = "";
		
		for (var i = 0; i < NBELEM; i++) {
			subGridCol = 0;
			if (i > 0 && i % SUBGRID_SIZE == 0) {
				subGridRow++;
			}
			line += "\t";
			for (var j = 0; j < NBELEM; j++) {
				if (j > 0 && j % SUBGRID_SIZE == 0) {
					subGridCol++;
				}
				
				line += GRID[getPosSubGrid(i)][getPosSubGrid(j)].getValue(getPosInSubGrid(i), getPosInSubGrid(j)) + " " ;
			}
			
			line += "\n";
		}
		
		return line;
	}
	
	this.getVariable = function(posX, posY) {
		return GRID[getPosSubGrid(posX)][getPosSubGrid(posY)].subGrid[getPosInSubGrid(posX)][getPosInSubGrid(posY)];
	}
	
	/**
	 * Generates all constraints on lines.
	 */
	this.generateLineConstraints = function() {
		
		for (var i = 0; i < NBELEM; i++) {
			for (var j = 0; j < NBELEM; j++) {
				for (var k = j+1; k < NBELEM; k++) {
					var v1 = this.getVariable(j, i);
					var v2 = this.getVariable(k, i);
					var c = new BinaryConstraint(v1, "!=", v2);
					gConstraints.addConstraint(c);
				}
				
			}
			
		}
		
	}
	
	/**
	 * generates all column constraints.
	 */
	this.generateColumnConstraints = function() {
		
		for (var i = 0; i < NBELEM; i++) {
			for (var j = 0; j < NBELEM; j++) {
				for (var k = j+1; k < NBELEM; k++) {
					var v1 = this.getVariable(i, j);
					var v2 = this.getVariable(i, k);
					var c = new BinaryConstraint(v1, "!=", v2);
					gConstraints.addConstraint(c);
				}
				
			}
			
		}
	}
	
	this.generateSubGridConstraints = function() {
		for (var i = 0; i < SUBGRID_SIZE; i++) {
			for (var j = 0; j < SUBGRID_SIZE; j++) {
				GRID[i][j].generateConstraints();
			}
			
		}
		
	}
	
	
	
	
	
	
}






