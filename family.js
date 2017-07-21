
sigma.classes.graph.addMethod('neighbors', function(nodeId) { 
    var k, 
        j,
        index2,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {}; 
    for (j in index) {
        neighbors[j] = this.nodesIndex[j];
        index2 = this.allNeighborsIndex[j];
        for (k in index2) 
            neighbors[k] = this.nodesIndex[k];
    }
     
    return neighbors; 
}); 

sigma.parsers.json(
    'data/graph.json',
    {
        container: 'sigma-container',
        type: sigma.renderers.canvas
    },
    function (s) {
        // We first need to save the original colors of our 
        // nodes and edges, like this: 
        
        s.graph.nodes().forEach(function(n) { 
            n.originalColor = n.color; 
        }); 
        s.graph.edges().forEach(function(e) { 
            e.originalColor = e.color; 
        }); 
        
        // When a node is clicked, we check for each node 
        // if it is a neighbor of the clicked one. If not, 
        // we set its color as grey, and else, it takes its 
        // original color. 
        
        // We do the same for the edges, and we only keep 
        // edges that have both extremities colored. 
        
        s.bind('clickNode', function(e) {
            var nodeId = e.data.node.id,
                toKeep = s.graph.neighbors(nodeId); 
            toKeep[nodeId] = e.data.node;
            s.graph.nodes().forEach(function(n) {
                if (toKeep[n.id]) 
                    n.color = n.originalColor; 
                else n.color = '#eee'; 
            }); 
            
            s.graph.edges().forEach(function(e) { 
                if (toKeep[e.source] && toKeep[e.target]) 
                    e.color = e.originalColor; 
                else 
                    e.color = '#eee'; 
            }); 
            
            // Since the data has been modified, we need to 
            // call the refresh method to make the colors 
            // update effective. 
            s.refresh();
        });
        
        s.bind('clickStage', function(e) {
            s.graph.nodes().forEach(function(n) { 
             n.color = n.originalColor;
        }); 
        s.graph.edges().forEach(function(e) { 
             e.color = e.originalColor;
        }); 
           
            s.refresh();
        });
    }
);
