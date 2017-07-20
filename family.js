
sigma.classes.graph.addMethod('neighbors', function(nodeId) { 
    var k, 
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {}; 
    for (k in index) 
        neighbors[k] = this.nodesIndex[k]; 
    return neighbors; 
}); 

sigma.parsers.json(
    'data/graph.json',
    {
        container: 'sigma-container',
        type: sigma.renderers.canvas
    },
    function (s) {}
);
