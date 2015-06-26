test("SubGrid", function() {
	
    var subGrid = new SubGrid(3, 3);
	
    subGrid.addVariable(5, [4, 5, 6, 7], 1, 2);
    deepEqual(subGrid.getAbsoluteValue(1, 2), new Pair(10, 11));
    
    
    subGrid.generateConstraints();
	
});

test("Grid", function() {
	
    var grid = new Grid();
    
    alert(grid);
	
    equal(1, 1);
	
});