test("Variable2", function() {
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