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
    	return "Constraint: " + this.refVar.getName() + ' ' + this.op + ' ' + this.ref;
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
		return "Binary Constraint: " + this.refVar1.getName() + ' ' + this.op + ' ' + this.refVar2.getName();
	}
	
} extend(BinaryConstraint, Constraint);


