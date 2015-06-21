var NBCONSTRAINTS = 0;

function extend(subclass, superclass) {
   function Dummy() {}
   Dummy.prototype = superclass.prototype;
   subclass.prototype = new Dummy();
   subclass.prototype.constructor = subclass;
   subclass.superclass = superclass;
   subclass.superproto = superclass.prototype;
}

function deepCopyArray(array) {
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



/**
 * name:
 * 		a string representing the name of the variable
 * domain:
 * 		a list of allowed values for this variable, e.g. [1, 2, 3, 4, 5]
 */
function Variable (name, domain) {
	this.name = name;
	this.domain = deepCopyArray(domain);
	this.value = null;
	this.label = deepCopyArray(domain);
	
	this.toString = function() {
		return "var : " + this.name + '\t value: ' + this.value + '\t domain = {' + this.domain + '} ';
	}
	
	this.removeFromLabel = function(value) {
		var index = this.label.indexOf(value);
		if (index > -1) {
			this.label.splice(index, 1);
		}
	}
	
	this.getValue = function() {
		return this.value;
	}
	
	this.updateValue = function(value) {
		var index = this.label.indexOf(value);
		if (index == -1) {
			throw new BadValueException("trying to set a value outside of the variable's domain.");
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
}

/**
 * vars:
 * 		a list of Variables
 */
function Constraint (vars) {
	this.vars = vars;
	
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
	UnaryConstraint.superclass.call(this, refVar.getName());
    this.ref = ref;
    this.op = op;
    this.refVar = refVar;
    
    this.dimension = function() {
    	return 1;
    }
    
    this.isValid = function(variable, value) {
    	if (typeof variable == 'undefined' || typeof value == 'undefined') {
    		throw new UndefinedArgumentException();
    	}
    	
    	NBCONSTRAINTS++;
    	var savedValue = variable.getValue();
    	variable.updateValue(value);
    	
    	var valid = false;
    	
    	switch(this.op) {
        	case "<":
            	valid = this.refVar.getValue() < this.ref;
            	break;
        	case "<=":
        	    valid = this.refVar.valeur <= this.ref
        	    break;
        	case "==":
        	    valid = this.refVar.valeur == this.ref;
        	    break;
        	case "!=":
        	    valid = this.refVar.valeur != this.ref;
        	    break;
        	default:
        		throw new UnknownOperator(this.op);
    	}
    	
    	variable.updateValue(savedValue);
    	
    	return valid;
    }
    
    this.toString = function() {
    	return "Constraint: " + this.refVar.getName() + ' ' + this.op + ' ' + this.ref;
    }
    
    
    
} extend(UnaryConstraint, Constraint);

