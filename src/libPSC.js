var NBCONTRAINTES=0;

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