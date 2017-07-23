var prefix = 'target_';

function get_animate_to(s, graph_index) {

    return function (data) {
        var node_map = {},
            edge_map = {},
            j,
            node;
        for (j in data.nodes) {
            node = data.nodes[j];
            node_map[node.id] = node;
        }

        s.graph.nodes().forEach(function (n) {
            n.target_x = node_map[n.id].x;
            n.target_y = node_map[n.id].y;
        });

        sigma.plugins.animate(
            s,
            {
                x: prefix + 'x',
                y: prefix + 'y'
            },
            {
                duration: 1000,
                onComplete: function () {
                    load_graph(s, graph_index + 1);
                }
            }
        );
    }
}


function load_graph(s, i) {
    $.getJSON('data/graph_' + i + '.json', get_animate_to(s, i));
}


var start_index = 0;

sigma.parsers.json(
    'data/graph_' + start_index + '.json', {
        renderers: [{
            container: 'sigma-container',
            type: sigma.renderers.canvas
        }]
    },
    function (s) {
        load_graph(s, start_index);
    }
);

