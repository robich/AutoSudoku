test("Variable", function() {
        var v = new Variable("x", [1, 2, 3, 4, 5, 6]);
		v.updateValue(3);
		v.removeFromLabel(5);
		
		equal(v.getValue(), 3);
		equal(v.getDomainSize(), 6);
		equal(v.getLabelSize(), 5);
		equal(v.getName(), "x");
		
		throws(function () {
			v.updateValue(100);
		}, BadValueException);	
});
	
test("Constraint", function() {
	var v1 = new Variable("v1", [1, 2, 3, 4, 5, 6]);
	var v2 = new Variable("v2", [1, 2]);
	var c = new Constraint([v1, v2]);
	
	equal(c.dimension(), 0);
	equal(c.isValid(v1, 3), false);
});

test("Unary constraints", function() {
	var v1 = new Variable("v1", [3, 4, 5, 6]);
	v1.updateValue(5);
	var uc = new UnaryConstraint(v1, "!=", 5);
	var uc2 = new UnaryConstraint(v1, "<", 20);
	var uc3 = new UnaryConstraint(v1, "<=", 4);
	var ucBad = new UnaryConstraint(v1, "?", 5);
	
	equal(uc.dimension(), 1);
	
	throws(function () {
		ucBad.isValid(v1, 3);
	}, UnknownOperator);
	
	equal(uc2.isValid(v1, 3), true);
	equal(uc2.isValid(v1, 4), true);
	equal(uc2.isValid(v1, 5), true);
	equal(uc2.isValid(v1, 6), true);
	
	equal(uc3.isValid(v1, 3), true);
	equal(uc3.isValid(v1, 4), true);
	equal(uc3.isValid(v1, 5), false);
	equal(uc3.isValid(v1, 6), false);
});

test("Binary constraints", function() {
	var v1 = new Variable("v1", [1, 2, 3, 4, 5, 6]);
	var v2 = new Variable("v2", [3, 4, 5, 6, 7, 8]);
	
	v1.updateValue(4);
	v2.updateValue(4);
	
	var refVar1 = new Variable("refVar1", "integers");
	var refVar2 = new Variable("refVar2", "integers");
	
	var cv1v2Bad = new BinaryConstraint(refVar1, "?" ,refVar2);
	var cv1v2 = new BinaryConstraint(v1, "==" ,v2);
	
	throws(function () {
		cv1v2Bad.isValid(v1, 3);
	}, UnknownOperator);
	
	equal(cv1v2.isValid(v1, 4), true);
	
	equal(cv1v2.refVar2.getDomainSize(), 6);
	cv1v2.revise();
	// New domain must be 3, 4, 5, 6
	equal(cv1v2.refVar2.getDomainSize(), 4);
	
	cv1v2.propagate();
	
});