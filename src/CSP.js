/**
	Note:	Any page running this script must load its library first (via <script src="../src/libCSP.js"></script> for example)
			This is due to the fact that there is no equivalent of "import" or "require" in JavaScript.
*/

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
var ECHEC = 'echec';

/**
 * Counts the number of iterations of the algorithm.
 */
var ITERATIONS = 0;

/**
 * List of all the solutions.
 */
var SOLUTIONS = [];

/**
 * Constraint Satisfaction Problem methods.
 */

/**
 * Sorts variables in ascending order.
 */
function variableOrdering() {
	VARIABLES.sort(function(a, b){
		return a.getDomainSize() > b.getDomainSize();
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


function displaySolution(solution) {
	console.log("Solution found in " + ITERATIONS + " steps with " + NBCONSTRAINTS + " verified constraints.\n" +
	        "SOLUTION = " + solution);
}

function displayNbIterations(k) {
	console.log("Iterations = " + ITERATIONS + ", depth = " + k + ", " + NBCONSTRAINTS + " verified constraints");
}

/**
 * @return labels (in a dictionnary) of the variable of indexed >= k
 */
function getLabels(k) {
	var labels = {};
	
	for (var i = k; i < VARIABLES.length; i++) {
		labels[VARIABLES[i]] = deepCopyArray(VARIABLES[i].getLabel());
	}
	
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
		VARIABLES.forEach(function(v){
			s += "\t" + v.toString() + "\n";
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
    	
    	if(redo) {
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
	
	if (init) {
		ITERATIONS = 0;
		SOLUTIONS = [];
		NBCONSTRAINTS = 0;
		
		VARIABLES.forEach(function(v){
			v.initLabel();
		});
	}
	
	ITERATIONS++;
	
	displayNbIterations(k);
	
	if (k >= VARIABLES.length) {
		alert("solution found!");
		var solution = {};
		
		VARIABLES.forEach(function(v){
			solution[v.getName()] = v.value;
		}, this);
		
		displaySolution(solution);
		SOLUTIONS.concat(solution);
		
		if (!allSolutions) {
			return SOLUTIONS;
		}
		
	} else {
		
		dvo(k);
		
		var variable = VARIABLES[k];
		
		var oldLabels = getLabels(k);
		
		var labelSize = variable.getLabelSize();
		
		for (var i = 0; i < labelSize; i++) {
			var value = variable.label[i];
			variable.updateValue(value);
			variable.label = [value];
			if (propagateToNextVars(k)) {
    	    	var rest = forwardChecking(k+1, allSolutions, false);
    	    	if (rest != ECHEC) {
    	    		alert("pas echec: " + rest);
    	    		return rest;
    	    	}
			}
			
			updateLabels(oldLabels);
		}
	}
	
	return ECHEC;
}



