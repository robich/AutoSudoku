test("SubGrid", function() {
	
    var subGrid = new SubGrid(3, 3);
	
    subGrid.addVariable(5, [4, 5, 6, 7], 1, 2);
    deepEqual(subGrid.getAbsoluteValue(1, 2), new Pair(10, 11));
    
    
    subGrid.generateConstraints();
	
});

test("Grid", function() {
	
    var grid = new Grid();
    
    var prob = [[9,X,X,X,X,X,X,X,2], 
               [3,X,7,1,X,X,4,X,8],
               [X,1,X,X,5,4,X,6,X],
               [X,X,1,X,X,X,X,7,X],
               [X,X,4,X,X,X,9,X,X],
               [X,2,X,X,X,X,8,X,X],
               [X,8,X,3,2,X,X,4,X],
               [7,X,3,X,X,6,2,X,1],
               [4,X,X,X,X,X,X,X,5]];
    
    equal(true, run(grid, prob) != FAIL);
    
    equal(grid.getVariable(0, 0).getValue(), 9);
    equal(grid.getVariable(0, 1).getValue(), 4);
    equal(grid.getVariable(0, 2).getValue(), 6);
	
});