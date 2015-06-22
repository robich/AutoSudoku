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
var CONTRAINTES = [];

/**
 * Returned value when a failure occurs.
 */
var ECHEC='echec';

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
		return a.getLabelSize() > b.getLabelSize();
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
	
}

