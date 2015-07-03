var DEBUG = false;

var NBCONSTRAINTS = 0;

function extend(subclass, superclass) {
   function Dummy() {}
   Dummy.prototype = superclass.prototype;
   subclass.prototype = new Dummy();
   subclass.prototype.constructor = subclass;
   subclass.superclass = superclass;
   subclass.superproto = superclass.prototype;
}

function deepCopyArray(array, dim) {
	var output = [];
	for (var i = 0; i < array.length; i++) {
		output[i] = array[i];
	}
	
	return output;
}

function BadValueException(message) {
	this.message = message;
	this.toString = function() {
		return "Bad value: " + message;
	}
}

function UndefinedArgumentException() {
	this.toString = function() {
		return "An argument was undefined";
	}
	
}

function UnknownOperator(message) {
	this.message = message;
	this.toString = function() {
		return "Unknown operator: " + message;
	}
	
}

function OutOfBoundsException(message) {
	this.message = message;
	this.toString = function() {
		return "Out of bounds: " + message;
	}
	
}




/**
 * name:
 * 		a string representing the name of the variable
 * domain:
 * 		a list of allowed values for this variable, e.g. [1, 2, 3, 4, 5]
 */
function Variable (name, domain) {
	this.name = name;
	this.value = "none";
	this.domain = deepCopyArray(domain);
	this.label = deepCopyArray(domain);
	
	
	
	this.toString = function() {
		return "var : " + this.name + '\t value: ' + this.value + '\t domain = {' + this.domain + '} \t label = {' + this.label + '}';
	}
	
	this.removeFromLabel = function(value) {
		var index = this.label.indexOf(value);
		if (index > -1) {
			this.label.splice(index, 1);
		}
	}
	
	this.removeFromDomain = function(value) {
		var index = this.domain.indexOf(value);
		if (index > -1) {
			this.domain.splice(index, 1);
		}
	}
	
	this.initLabel = function() {
		this.label = deepCopyArray(this.domain);
	}
	
	
	
	this.getValue = function() {
		return this.value;
	}
	
	this.updateValue = function(value) {
		var index = this.domain.indexOf(value);
		if (index == -1 && this.domain != "integers" && value != "none") {
			console.warn("Warning: Trying to set a value outside of the variable's domain: value '" + value +
				"' is not in " + this.domain);
		}
		this.value = value;
	}
	
	this.getName = function() {
		return this.name;
	}
	
	this.getDomainSize = function() {
		return this.domain.length;
	}
	
	this.getLabelSize = function() {
		return this.label.length;
	}
	
	this.setLabel = function(lab) {
		this.label = lab;
	}
	
	
	this.getDomain = function() {
		return this.domain;
	}
	
	this.getLabel = function() {
		return this.label;
	}
	
	
}

/**
 * vars:
 * 		a list of Variables
 */
function Constraint (vars) {
	
	this.vars = vars;
	
	this.getVars = function() {
		return this.vars;
	}
	
	this.dimension = function() {
		return 0;
	}
	
	this.isValid = function(variable, value) {
		return false;
	}
	
	this.toString = function() {
		return "Constraint: " + this.vars;
	}
}

/**
 * refVar:
 * 		a Variable
 * op:
 * 		an operator, e.g. '>' or '!='
 * ref:
 * 		an integer
 */
function UnaryConstraint (refVar, op, ref) {
	UnaryConstraint.superclass.call(this, [refVar.getName()]);
	this.ref = ref;
	this.op = op;
	this.refVar = refVar;
	
	this.dimension = function() {
		return 1;
	}
	
	this.isValid = function(variable, value) {
		
		NBCONSTRAINTS++;
		
		var savedValue = variable.getValue();
		variable.updateValue(value);
		
		var valid = false;
		
		switch(this.op) {
			case "<":
				valid = this.refVar.getValue() < this.ref;
				break;
			case "<=":
				valid = this.refVar.getValue() <= this.ref
				break;
			case "==":
				valid = this.refVar.getValue() == this.ref;
				break;
			case "!=":
				valid = this.refVar.getValue() != this.ref;
				break;
			default:
				throw new UnknownOperator(this.op);
		}
		
		variable.updateValue(savedValue);
		
		return valid;
	}
	
	this.toString = function() {
		return "\nConstraint: " + this.refVar.getName() + ' ' + this.op + ' ' + this.ref;
	}
	
	
	
} extend(UnaryConstraint, Constraint);

/**
 * refVar1:
 * 		a Variable
 * refVar2:
 * 		a variable
 * op:
 * 		an operator, e.g. "!="
 */
function BinaryConstraint(refVar1, op, refVar2) {
	BinaryConstraint.superclass.call(this, [refVar1.getName(), refVar2.getName()]);
	this.refVar1 = refVar1;
	this.op = op;
	this.refVar2 = refVar2;
	
	this.dimension = function() {
		return 2;
	}
	
	this.isValid = function(variable, value) {
		
		NBCONSTRAINTS++;
		
		var savedValue = variable.getValue();
		variable.updateValue(value);
		
		var valid = false;
		
		switch(this.op) {
			case "!=":
				valid = this.refVar1.getValue() != this.refVar2.getValue();
				break;
			case "==":
				valid = this.refVar1.getValue() == this.refVar2.getValue();
				break;
			case "<":
				valid = this.refVar1.getValue() < this.refVar2.getValue();
				break;
			case "NAND":
				valid = ! (this.refVar1.getValue() && this.refVar2.getValue());
				break;
			case "->": // p => q is the same as not p OR q
				valid = !this.refVar1.getValue() || this.refVar2.getValue();
				break;
			default:
				throw new UnknownOperator(this.op);
		}
		
		variable.updateValue(savedValue);
		
		return valid;
		
	}
	
	this.isPossible = function(variable) {
		
		if (variable.getDomain().length == 0) {
			return false;
		}
		
		var possible = false;
		
		variable.getDomain().forEach(function(d) {
				if (this.isValid(variable, d)) {
					possible = true;
				}
				
			}, this);
		
		return possible;
	}
	
	/**
	 * Remove from refVar1 and refVar2's domains all impossible values.
	 * 
	 * @return true iff a modification on the domains occured
	 */
	this.revise = function() {
		
		var modified = false;
		
		[ [this.refVar1, this.refVar2], [this.refVar2, this.refVar1] ].forEach(function(pair) {
			deepCopyArray(pair[0].getDomain()).forEach(function(x) {
					pair[0].updateValue(x);
					if (!this.isPossible(pair[1])) {
						pair[0].removeFromDomain(x);
						modified = true;
					}
					
				}, this);
			pair[0].updateValue("none");
		}, this);
		
		return modified;
		
	}
	
	/**
	 * @return true iff the label of refVar1 or refVar2 stays non empty
	 */
	this.propagate = function(variable) {
		
		var var2 = this.refVar1;
		
		if (variable == this.refVar1) {
			var2 = this.refVar2;
		}
		
		deepCopyArray(var2.getLabel()).forEach(function(lab) {
			
				// Constraint satisfied?
				if (!this.isValid(var2, lab)) {
					var2.removeFromLabel(lab);
				}
				
			}, this
		);
		
		return var2.getLabelSize() > 0;
		
		
	}
	
	
	this.toString = function() {
		return "\nBC: " + this.refVar1.getName() + ' ' + this.op + ' ' + this.refVar2.getName();
	}
	
} extend(BinaryConstraint, Constraint);


/** CSP */

/**
 * Global variables definition.
 */
	
/**
 * List of all the variables.
 */
var VARIABLES = [];

/**
 * List of all the constraints.
 */
var CONSTRAINTS = [];

/**
 * Returned value when a failure occurs.
 */
var FAIL = 'fail';

/**
 * Counts the number of iterations of the algorithm.
 */
var ITERATIONS = 0;

/**
 * List of all the solutions.
 */
var SOLUTIONS = [];

/**
 * Helper methods.
 */
	
function getStringFromDictionnary(dictionnary) {
	var s = "";
	for (var key in dictionnary) {
		s += key + "=" + dictionnary[key] + " ";
	}
	return s;
}

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

function getArrayFromHtml() {
	var array = bidimDeepCopy(PROBLEM);
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array[0].length; j++) {
			var v = document.getElementById(i + "" + j).value;
			if (v.length == 1) {
				array[i][j] = document.getElementById(i + "" + j).value;
			} else {
				array[i][j] = 0;
			}
		}
	}
	return array;
}


/**
 * Constraint Satisfaction Problem methods.
 */

/**
 * Sorts variables in ascending order.
 */
function variableOrdering() {
	VARIABLES.sort(function(a, b){
		return a.getDomainSize() - b.getDomainSize();
	});
}

/**
 * @return	the index of the variable with the smallest label cardinality,
 * 			ignoring the first <code>from</code>.
 */
function getIndexWithMinLabelSize(from) {
	
	if (from > VARIABLES.length) {
		throw new OutOfBoundsException("from cannot be higher than the amount of variables.");
	}
	
	
	var minIndex = from;
	
	var minVal = VARIABLES[minIndex].getLabelSize();
	
	for (var i = from; i < VARIABLES.length; i++) {
		if (VARIABLES[i].getLabelSize() < minVal) {
			minIndex = i;
			minVal = VARIABLES[i].getLabelSize();
		}
		
	}
	
	return minIndex;
	
}

/**
 * Apply the Dynamic Variable Ordering starting from index k.
 */
function dvo(k) {
	var indexMin = getIndexWithMinLabelSize(k);
	if (indexMin != k) {
		// swap variables k and indexMin.
		var tmp = VARIABLES[k];
		VARIABLES[k] = VARIABLES[indexMin];
		VARIABLES[indexMin] = tmp;
	}
}

/**
 * Assert that all constraints on variable k and the previous ones are satisfied.
 * 
 * @param k current position in the variables
 * @return true iff consitent
 */
function consistencyWithPreviousVars(k) {
	
	var consistent = true;
	
	CONSTRAINTS.forEach(function(c) {
			// if k's name is in c 
			if (c.getVars().indexOf(VARIABLES[k].getName()) > -1 ) {
				for (var i = 0; i < k; i++) {
					// if i's name is also in c
					if (c.getVars().indexOf(VARIABLES[i].getName()) > -1 ) {
						if (!c.isValid(VARIABLES[k], VARIABLES[k].getValue())) {
							consistent = false;
							break;
						}
					}
				}
			}
		}, this
	);
	
	return consistent;
}

/**
 * Tries to lower label of other vars in any constraint with var whose index is k using BinaryConstraint.propagate().
 * 
 * @return true iff all constrainst are still satisfied
 */
function propagateToNextVars(k) {
	var satisfied = true;
	
	CONSTRAINTS.forEach(function(c) {
			// if k's name is in c
			if (c.getVars().indexOf(VARIABLES[k].getName()) > -1 ) {
				for (var i = k+1; i < VARIABLES.length; i++) {
					// if i's name is also in c
					if (c.getVars().indexOf(VARIABLES[i].getName()) > -1 ) {
						
						if (!c.propagate(VARIABLES[k])) {
							satisfied = false;
						}
						
					}
				}
			}
		}, this
	);
	
	return satisfied;
}

function getInfo() {
	return "Solution found in " + ITERATIONS + " steps with " + NBCONSTRAINTS + " verified constraints";
}

function displaySolution(solution) {
	return getInfo() +
			".\nSOLUTION = " + getStringFromDictionnary(solution);
}

function displayNbIterations(k) {
	console.log("Iterations = " + ITERATIONS + ", depth = " + k + ", " + NBCONSTRAINTS + " verified constraints");
}

/**
 * @return labels (in a dictionnary) of the variable of indexed >= k
 */
function getLabels(k) {
	var labels = {};

	VARIABLES.forEach(function(v, i){
		labels[v.getName()] = deepCopyArray(v.label);
	});
	

	return labels;
}

function updateLabels(labels) {
	VARIABLES.forEach(function(v){
		if (v.getName() in labels) {
			v.setLabel(deepCopyArray(labels[v.getName()]));
		}
		
	});
}


function Variables () {
	
	VARIABLES = [];
	
	this.getVariable = function(name) {
		var output = "none";
		
		VARIABLES.forEach(function(v){
			if (v.getName() == name) {
				output = v;
			}
			
		});
		
		return output;
	}
	
	this.addVariable = function(variable) {
		VARIABLES[VARIABLES.length] = variable;
	}
	
	this.addVariables = function(varList) {
		VARIABLES = VARIABLES.concat(varList);
	}
	
	this.getAllVariables = function() {
		return VARIABLES;
	}
	
	this.getNbVariables = function() {
		return VARIABLES.length;
	}
	
	/**
	 * Remove from the domain all values that violate unary constraints.
	 */
	this.nodesConsistency = function() {
		CONSTRAINTS.forEach(function(c){
			
			// We want c to be unary.
			if (c.dimension() == 1) {
				deepCopyArray(c.refVar.domain).forEach(function(d) {
					if (!c.isValid(c.refVar, d)) {
						c.refVar.removeFromDomain(d);
					}
					
				}, this);
				
			}
			
		}, this);
	}
	
	this.toString = function() {
		var s =  "Vars:\n";
		var i = 1;
		VARIABLES.forEach(function(v){
			s += "\t" + i++ + " " +  v.toString() + "\n";
		});
		
		return s;
	}
	
	
	
}

function Constraints () {
	
	CONSTRAINTS = [];
	
	this.addConstraint = function(c) {
		CONSTRAINTS[CONSTRAINTS.length] = c;
	}
	
	this.addConstraints = function(constraintsList) {
		CONSTRAINTS = CONSTRAINTS.concat(constraintsList);
	}
	
	
	this.getNbConstraints = function() {
		return CONSTRAINTS.length;
	}
	
	/**
	 * A value v in x_i's domain can be inconsistent with another x_j.
	 * In that case, remove v from x_i's domain, and rerun method:
	 * a deletion can cascade.
	 */
	this.arcsConsistency = function() {
		var redo = false;
		
		CONSTRAINTS.forEach(function(c){
			if (c.dimension() == 2 && c.revise()) {
				redo = true;
			}
			
		});
		
		if (redo) {
			this.arcsConsistency();
		}
		
	}
	
	
	this.toString = function() {
		var s = "Constraints:\n";
		var i = 0;
		CONSTRAINTS.forEach(function(c){
			i++;
			s += "\t" + i + ". " + c + "\n";
		});
		
		return s;
	}
	
	
	
}

/**
 * Forward checking algorithm + Dynamic Variable Ordering.
 * 
 * @param k depth of search, starts at 0
 * @param allSolutions boolean value that decides if we keep all possible solutions
 * @parem init boolean value deciding if we init global values ITERATIONS, SOLUTIONS
 */
function forwardChecking(k, allSolutions, init) {
	
    var retVal = FAIL;
	
	if (init) {
		ITERATIONS = 0;
		SOLUTIONS = [];
		NBCONSTRAINTS = 0;
		
		VARIABLES.forEach(function(v){
			v.initLabel();
		});
	}
	
	ITERATIONS++;
	
	if (DEBUG) {
		displayNbIterations(k);
	}
	
	if (k >= VARIABLES.length) {
		var solution = {};
		
		VARIABLES.forEach(function(v){
			solution[v.getName()] = v.value;
		}, this);
		
		if (DEBUG) {
			console.log(displaySolution(solution));
		}
		SOLUTIONS.concat(solution);
		
		if (!allSolutions) {
			return SOLUTIONS;
		}
		
	} else {
		dvo(k);
		
		var variable = VARIABLES[k];
		var oldLabels = getLabels(k);
		var labelSize = variable.getLabelSize();

		deepCopyArray(variable.getLabel()).forEach(function(e){
			variable.updateValue(e);
			variable.label = [e];
			
			if (propagateToNextVars(k)) {
				var rest = forwardChecking(k+1, allSolutions, false);
				if (rest != FAIL) {
					retVal = rest;
				}
				
			}
			
			updateLabels(oldLabels);
		});
	}

return retVal;
}

/** Sudoku */

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
var PROBLEM = [[X,X,X,X,X,X,X,X,X], 
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
	
	this.getArray = function() {
		var array = bidimDeepCopy(PROBLEM);
		
		var subGridCol = 0;
		var subGridRow = 0;
		var m = 0;
		var n = 0;
		
		for (var i = 0; i < NBELEM; i++) {
			subGridCol = 0;
			if (i > 0 && i % SUBGRID_SIZE == 0) {
				subGridRow++;
			}

			for (var j = 0; j < NBELEM; j++) {
				if (j > 0 && j % SUBGRID_SIZE == 0) {
					subGridCol++;
				}
				
				var value = GRID[getPosSubGrid(i)][getPosSubGrid(j)].getValue(getPosInSubGrid(i), getPosInSubGrid(j));
				if (!isNaN(value)) {
					array[i][j] = value;
				} else {
					array[i][j] = 0;
				}
				n++;
			}
			
			m++;
		}
		
		return array;
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
	 * Generates all column constraints.
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

function run (g, p) {
	console.log("New problem");
	
	PROBLEM = bidimDeepCopy(p);
	
	gVariables = new Variables();

	gConstraints = new Constraints();
	
	g.init();
	
	g.generateLineConstraints();
	g.generateColumnConstraints();
	g.generateSubGridConstraints();
	
	gVariables.nodesConsistency();
	
	gConstraints.arcsConsistency();
	/* TODO: For a reason I don't have the time to investigate, this causes chrome to fail (it cannot find a solution). */
	//variableOrdering();
	
	//console.log(gVariables.toString());
	
	return forwardChecking(0, false, true);
}

/** Game loader */


var div = document.getElementById("autoSudoku");
if (div == null) {
	var msg = "Error: No div with id autoSudoku found.";
	console.log(msg);
	throw new Error(msg);
}

var baseProblem = [[X,X,X,X,X,5,X,7,X], 
	   [X,6,X,X,X,4,5,3,8],
	   [X,X,X,X,X,9,X,X,2],
	   [X,X,8,X,X,X,X,X,9],
	   [X,3,X,X,1,X,X,6,X],
	   [7,X,X,X,X,X,8,X,X],
	   [3,X,X,5,X,X,X,X,X],
	   [8,1,2,3,X,X,X,4,X],
[X,7,X,2,X,X,X,X,X]];

/*baseProblem = [[X,2,X,X,7,X,X,X,X], 
                [X,X,X,X,X,3,X,X,9],
                [6,X,X,8,X,X,1,X,X],
                [X,X,9,X,X,X,7,X,X],
                [X,5,X,X,X,X,X,6,X],
                [X,X,4,X,X,X,8,X,X],
                [X,X,3,X,X,9,X,X,4],
                [8,X,X,5,X,X,X,X,X],
                [X,X,X,X,6,X,X,2,X]];*/
	   
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
	   
function isMSIE() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
            return true;
        else
            return false;
}

function update(value, i, j) {
	var v = parseInt(value);
	if (v < 1 || v > 9) {
		currProb[i][j] = 0;
		document.getElementById(i + "" + j).value = "";
	} else {
		currProb[i][j] = v;
	}
}

function buildDivFrom(from, type) {
	var divContent = "<div id='game'><table><caption>AutoSudoku</caption><colgroup><col><col><col>" +
					  "<colgroup><col><col><col>" + 
					  "<colgroup><col><col><col>";
	for (var i = 0; i < 9; i++) {
		if (i % 3 == 0) {
			divContent += "<tbody>";
		}
		divContent += "<tr>"
		for (var j = 0; j < 9; j++) {
			var cellId = i + "" + j;
			divContent += "<td class='cell'><input id='" + cellId + "' type='text' maxlength='1' onchange='update(this.value, " + i + ", " + j + ");' ";
			if (type == "array") {
				if (from[i][j] != 0) {
					divContent += "value='" + from[i][j] + "'";
				}
			} else if (type == "grid") {
				var v = from.getVariable(i, j);
				if (!isNaN(v.getValue())) {
					divContent += "value='" + v.getValue() + "'";
				}
			}
			divContent += "/></td>";
		}
		divContent += "</tr>";
	}
	divContent += "</table></div>";
	divContent += "<button onclick='computeSudoku();'>Compute sudoku</button>";
	divContent += "<button onclick='buildDivFrom(empty, \"array\"); currProb = bidimDeepCopy(empty);'>reset</button>";
	divContent += "<button onclick='buildDivFrom(baseProblem, \"array\"); currProb = bidimDeepCopy(baseProblem);'>use original problem</button>";
	divContent += "<p id='info'></p>";
	
	div.innerHTML = divContent;
	
	if (isMSIE()) {
		for (var i = 0; i < 81; i++) {
			document.querySelectorAll('#autoSudoku input')[i].style.width = "auto";
			document.querySelectorAll('#autoSudoku input')[i].style.height = "auto";
		}
	}
	
}
	   
function computeSudoku() {
	var t0 = performance.now();
	var grid = new Grid();
	var res = run(grid, currProb);
	currProb = grid.getArray();
	var t1 = performance.now();
	// Only keep 3 digits precision.
	var elapsed = Math.floor((t1 - t0) * 1000) / 1000;
	
	if (res == FAIL) {
		currProb = deepCopyArray(empty);
		grid.init();
		buildDivFrom(grid, "grid");
		document.getElementById('info').innerHTML = "Cannot solve sudoku - " + ITERATIONS + " steps, " + NBCONSTRAINTS + " verified constraints (" + elapsed + " milliseconds)";
	} else {
		buildDivFrom(grid, "grid");
		document.getElementById('info').innerHTML = getInfo() + " (" + elapsed + " milliseconds).";
	}
}

// Init div.
buildDivFrom(baseProblem, "array");