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


function assign_neighbours_target_coords(centerNodeId, toKeep) {
    var i,
        j,
        y,
        node,
        center = {x: [], y: []},
        center_node = toKeep[centerNodeId],
        local_layers = {},
        local_layer,
        scale = .5;

    for (i in toKeep) {
        node = toKeep[i];
        y = center_node.orig_y - node.orig_y;
        if (!local_layers[y]) {
            local_layers[y] = [];
        }
        local_layers[y].push(node);
    }

    function compare(a, b) {
        if (a.orig_x < b.orig_x)
            return -1;
        if (a.orig_x > b.orig_x)
            return 1;
        return 0;
    }

    for (i in local_layers) {
        local_layer = local_layers[i];
        local_layer.sort(compare);

        for (j in local_layer) {
            node = local_layer[j];
            node.target_x = center_node.orig_x + parseInt(j) * scale;
            node.target_y = center_node.orig_y - parseInt(i) * scale;

            center.x.push(node.target_x);
            center.y.push(node.target_y);
        }
    }

    var sum = function (s, v) {
        return s + v;
    };
    center.x = center.x.reduce(sum) / center.x.length;
    center.y = center.y.reduce(sum) / center.y.length;

    return center;
}


function move_cameras(s, coords) {
    var i,
        cam;
        
    coords.ratio = .5;
    coords.angle = 0;
    for (i in s.cameras) {
        cam = s.cameras[i];
        sigma.misc.animation.camera( 
            cam, coords, 
            {
                duration: s.settings('animationsTime') || 300
            } 
        );
    }
}

function get_params() {
    const mq = window.matchMedia( "only screen and (max-device-width: 480px)" );
    var params = {
        labelThreshold: 8,
        maxEdgeSize: 2,
        labelSizeRatio: 1,
        labelSize: "proportional"
    };

    if (mq.matches) {
        params.maxNodeSize = 16;
        params.labelThreshold = 20;
    } 
    // alert(params.labelThreshold);
    // alert(window.innerWidth);
    // alert(window.innerHeight);
    return params;
}


sigma.parsers.json(
    'data/graph.json', {
        renderers: [{
            container: 'sigma-container',
            type: sigma.renderers.canvas
        }],
        settings: get_params()
    },
    function (s) {

        // We first need to save the original colors of our 
        // nodes and edges, like this: 

        s.graph.nodes().forEach(function (n) {
            n.originalColor = n.color;
            n.orig_x = n.x;
            n.orig_y = n.y;
            
        });
        s.graph.edges().forEach(function (e) {
            
            if (e.class.indexOf('children') !== -1) {
                e.color = "#ffdab9";
            }
            
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
                toKeep = s.graph.neighbors(nodeId),
                center;

            toKeep[nodeId] = e.data.node;

            center = assign_neighbours_target_coords(nodeId, toKeep);

            s.graph.nodes().forEach(function (n) {
                var angle = Math.random() * 314,
                    radius = 2.,
                    node = e.data.node;

                if (toKeep[n.id]) {
                    n.color = n.originalColor;
                } else {
                    n.color = '#eee';
                    n.target_x = center.x + radius * Math.cos(angle);
                    n.target_y = center.y + radius * Math.sin(angle);
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
                {
                    duration: 1000,
                    onComplete: function () {
                        move_cameras(s, center);
                    }
                }
            );
        });

        s.bind('clickStage', function (e) {

            console.log(e);
            console.log(e.data);
            console.log(e.target);

            s.graph.nodes().forEach(function (n) {
                n.color = n.originalColor;
                n.target_y = n.orig_y;
                n.target_x = n.orig_x;
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
                {
                    duration: 500
                }
            );
        });
    }
);