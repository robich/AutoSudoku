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

test("Variable Ordering", function() {
	    
        var vars = new Variables();
        
        var x = new Variable("x", [1, 2, 3, 4, 5, 6]);
		var y = new Variable("y", [4, 5, 6, 7]);
		
		vars.addVariables([x, y]);
		
		equal(vars.getAllVariables()[0], x);
		
		variableOrdering();
		
		// y's label is smaller than the one of x.
		equal(vars.getAllVariables()[0], y);
		
		
});