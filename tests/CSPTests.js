test("Variables", function() {
	    
        var vars = new Variables();
        var x = new Variable("x", [1, 2, 3, 4, 5, 6]);
		var y = new Variable("y", [4, 5, 6, 7]);
		vars.addVariable(x);
		vars.addVariable(y);
		
		equal(vars.getVariable("x"), x);
		equal(vars.getVariable("y"), y);
		
		vars = new Variables();
		
		equal(vars.getVariable("y"), "none");
		
		vars.addVariables([x, y]);
		
		equal(vars.getVariable("x"), x);
		equal(vars.getVariable("y"), y);
		
});

test("variableOrdering", function() {
	    
        var vars = new Variables();
        
        var x = new Variable("x", [1, 2, 3, 4, 5, 6]);
		var y = new Variable("y", [4, 5, 6, 7]);
		
		vars.addVariables([x, y]);
		
		equal(vars.getAllVariables()[0], x);
		
		variableOrdering();
		
		// y's label is smaller than the one of x.
		equal(vars.getAllVariables()[0], y);
		
		
});

test("getIndexWithMinLabelSize", function() {
	    
        var vars = new Variables();
        
        var x = new Variable("x", [1, 2, 3, 4, 5, 6]);
		var y = new Variable("y", [4, 5, 6, 7]);
		var z = new Variable("z", [7, 8, 9]);
		var w = new Variable("w", [5, 5.5, 5.6, 5.6]);
		
		vars.addVariables([x, y, z, w]);
		
		equal(getIndexWithMinLabelSize(0), 2);
		
		equal(getIndexWithMinLabelSize(3), 3);
		
		throws(function () {
			getIndexWithMinLabelSize(2000);
		}, OutOfBoundsException);	
});

test("Constraints", function() {
	var constraints = new Constraints();
	
	var x = new Variable("x", [1, 2, 3, 4, 5, 6]);
	var y = new Variable("y", [4, 5, 6, 7]);
	var z = new Variable("z", [7, 8, 9]);
		
		
	var c1 = new Constraint([x, y]);
	var c2 = new Constraint([x, z]);
	
	constraints.addConstraint(c1);
	constraints.addConstraint(c2);
	
	equal(constraints.getNbConstraints(), 2);
	
	constraints.arcsConsistency();
	
});

test("consistencyWithPreviousVars", function() {
	    
        var vars = new Variables();
        
        var x = new Variable("x", [1, 2, 3, 4, 5, 6, 12]);
		var y = new Variable("y", [12]);
		var z = new Variable("z", [16, 17, 18, 19, 20, 21]);
		
		x.updateValue(4);
		y.updateValue(12);
		z.updateValue(16);
		
		vars.addVariables([x, y, z]);
		
		var uc = new BinaryConstraint(z, "<", x);
		var uc1 = new BinaryConstraint(x, "==", y);
		
		var constraints = new Constraints();
		constraints.addConstraint(uc);
		constraints.addConstraint(uc1);
		
		equal(consistencyWithPreviousVars(0), true);
		equal(consistencyWithPreviousVars(1), false);
		equal(consistencyWithPreviousVars(2), false);
		
		propagateToNextVars(2);
});