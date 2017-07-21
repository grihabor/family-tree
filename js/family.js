sigma.classes.graph.addMethod('neighbors', function (nodeId) {
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



function calculate_target_coords(node, centerNodeId, toKeep){
    var coords = {};
    coords.x = node.x;
    coords.y = node.y;
    return coords;
}


function get_label_threshold() {
    return 12;
}


sigma.parsers.json(
    'data/graph.json', {
        renderers: [{
            container: 'sigma-container',
            type: sigma.renderers.canvas
        }],
        settings: {
            labelThreshold: get_label_threshold()
        }
    },
    function (s) {

        var original_state = true;
        // We first need to save the original colors of our 
        // nodes and edges, like this: 

        s.graph.nodes().forEach(function (n) {
            n.originalColor = n.color;
            n.prev_x = n.x;
            n.prev_y = n.y;
        });
        s.graph.edges().forEach(function (e) {
            e.originalColor = e.color;
        });

        // When a node is clicked, we check for each node 
        // if it is a neighbor of the clicked one. If not, 
        // we set its color as grey, and else, it takes its 
        // original color. 

        // We do the same for the edges, and we only keep 
        // edges that have both extremities colored. 

        s.bind('clickNode', function (e) {
            var target,
                nodeId = e.data.node.id,
                toKeep = s.graph.neighbors(nodeId);
            toKeep[nodeId] = e.data.node;
            s.graph.nodes().forEach(function (n) {
                var angle=Math.random() * 314,
                    radius=5.,
                    node=e.data.node;

                if (toKeep[n.id]) {
                    n.color = n.originalColor;

                    target = calculate_target_coords(n, nodeId, toKeep);

                    n.target_x = n.x;
                    n.target_y = n.y;

                } else {
                    n.color = '#eee';
                    n.target_x = node.x + radius * Math.cos(angle);
                    n.target_y = node.y + radius * Math.sin(angle);
                }
            });

            s.graph.edges().forEach(function (e) {
                if (toKeep[e.source] && toKeep[e.target])
                    e.color = e.originalColor;
                else
                    e.color = '#eee';
            });

            // Since the data has been modified, we need to 
            // call the refresh method to make the colors 
            // update effective. 
            s.refresh();


            sigma.plugins.animate(
                s,
                {
                    x: 'target_x',
                    y: 'target_y'
                },
                2000
            );
        });

        s.bind('clickStage', function (e) {

            console.log(e);

            original_state = 0;
            s.graph.nodes().forEach(function (n) {
                n.color = n.originalColor;
                n.target_y = n.prev_y;
                n.target_x = n.prev_x;
            });
            s.graph.edges().forEach(function (e) {
                e.color = e.originalColor;
            });

            s.refresh();

            sigma.plugins.animate(
                s,
                {
                    x: 'target_x',
                    y: 'target_y'
                },
                2000
            );
        });
    }
);