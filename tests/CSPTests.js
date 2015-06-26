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
});

test("Forward checking", function() {
	    
        var vars = new Variables();
        var constraints = new Constraints();
        
        var v1 = new Variable("a",[2, 3]);
        var v2 = new Variable("b",[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        var v3 = new Variable("c",[0, 1, 2]);
        var v4 = new Variable("d",[0, 1, 2]);
        var v5 = new Variable("e",[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 , 11]);
        
        vars.addVariables([v1, v2, v3, v4, v5]);
        
        var cv2 = new UnaryConstraint(v2, "<", 4);
        var cv1v2 = new BinaryConstraint(v1,"!=",v2);
        var cv2v3 = new BinaryConstraint(v2,"!=",v3);
        var cv2v4 = new BinaryConstraint(v2,"!=",v4);
        var cv2v5 = new BinaryConstraint(v2,"!=",v5);
        var cv3v4 = new BinaryConstraint(v3,"!=",v4);
        var cv3v5 = new BinaryConstraint(v3,"!=",v5);
        var cv4v5 = new BinaryConstraint(v4,"!=",v5);
        var cv5v1 = new BinaryConstraint(v5,"<",v1);
        
        constraints.addConstraints([cv2, cv1v2, cv2v3, cv2v4, cv2v5, cv3v4, cv3v5, cv4v5, cv5v1]);
        
        // Test nodes consistency.
        vars.nodesConsistency();
        deepEqual(vars.getVariable("b").getDomain(), [0, 1, 2, 3]);
        
        // Test arcs consistency.
        constraints.arcsConsistency();
        deepEqual(vars.getVariable("e").getDomain(), [0, 1, 2]);
        
        // Test variable ordering.
        variableOrdering();
        var array = vars.getAllVariables();
        equal(true, array[0].getName() == "a" && array[1].getName() == "c"
        	&& array[2].getName() == "d"
        	&& array[3].getName() == "e"
        	&& array[4].getName() == "b");
        
        // Test forward checking.
        var sol = forwardChecking(0, false, true);
        equal(true, sol != ECHEC);
});