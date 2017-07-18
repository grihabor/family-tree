var person_dict = null;
var couples = null;
var layers = {};

var canvas;
var ctx;

var LAYER_HEIGHT = 200; // distance between layers
var CANVAS_PADDING = 12; // distance from canvas border to elements
var RECT_PADDING = 10; // distance between person rect border and text
var TEXT_PADDING = 0; // distance between text lines
var X_MARGIN = 50; // distance between layer elements 


function get_person_rect(person) {

    var height = parseInt(ctx.font);
    var name_size = {
        width: ctx.measureText(person.name).width
    };
    var surname_size = {
        width: ctx.measureText(person.surname).width
    };

    var rect = {
        width: Math.max(name_size.width, surname_size.width),
        height: 2 * height + TEXT_PADDING
    };

    return {
        width: rect.width + 2 * RECT_PADDING,
        height: rect.height + 2 * RECT_PADDING
    };
}



function round(pos) {
    return {
        x: Math.round(pos.x),
        y: Math.round(pos.y)
    };
}


function create_canvas(width, height) {
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    init_context();
}


function init_context() {
    ctx = canvas.getContext('2d');
    ctx.font = '30px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
}


function Pair(person_id, shift) {
    this.person_id = person_id;
    this.shift = shift;
}

function node_directions(node) {
    var dir_list = [];
    if (node.couple_person !== null) {
        dir_list.push(new Pair(node.couple_person, 0));
        var couple = couples.dict[node.couple_id];
        for (var i in couple.children) {
            dir_list.push(new Pair(couple.children[i], 1));
        }
    }
    if (node.parents !== null) {
        dir_list.push(
            new Pair(node.parents[0], -1),
            new Pair(node.parents[1], -1)
        );
    }
    return dir_list;
}

function clear_graph() {
    for (var i in person_dict) {
        person_dict[i]._visited = false;
    }
}

function debug_layers() {
    for (var i in person_dict) {
        var d = document.createElement('div');
        var person = person_dict[i];
        d.innerHTML = person._layer.toString() + ' ' + person.name;
        document.body.appendChild(d);
    }
}

function calc_layer_width(layer) {
    var width = 0;
    for (var i in layer) {
        var person = person_dict[layer[i]];
        width += person.width;
    }
    width += (layer.length - 1) * X_MARGIN;
    return width;
}

function calc_max_layer_width() {
    var max_layer_id = 0;
    var max_layer_width = calc_layer_width(layers[max_layer_id]);

    for (var i in layers) {
        layer_width = calc_layer_width(layers[i]);
        if (layer_width > max_layer_width) {
            max_layer_width = layer_width;
            max_layer_id = i;
        }
    }
    return {
        width: max_layer_width,
        id: max_layer_id
    };
}

function calc_canvas_size() {
    var max_layer = calc_max_layer_width();
    return {
        width: max_layer.width + 2 * CANVAS_PADDING,
        height: Object.keys(layers).length * LAYER_HEIGHT + 2 * CANVAS_PADDING
    };
}

function add_person_to_layer(person, layer) {
    if (!(layer in layers)) {
        layers[layer] = [];
    }
    layers[layer].push(person.id);
    person._layer = layer;
}

function next_node(path, person_id, func) {
    var person = person_dict[person_id];
    person._visited = true;


    var dir_list = node_directions(person);
    for (var i in dir_list) {
        var new_person_id = dir_list[i].person_id;
        var shift = dir_list[i].shift;
        var p = person_dict[new_person_id];
        if (!p._visited) {
            path.push(person_id);
            func(p, person._layer + shift, path);
            return p.id;
        }
    }
    return null;
}

function init_layer_calculation(person_id) {
    var person = person_dict[person_id];
    add_person_to_layer(person, 0);
}

function apply_to_each_node(func, init_func) {
    clear_graph();
    var person_id = 1;
    if (init_func !== null) {
        init_func(person_id);
    }
    var path = [];

    while (true) {
        person_id = next_node(path, person_id, func);
        if (person_id === null) {
            if (path.length === 0) {
                break;
            }
            person_id = path.pop();
        }
    }
}

function create_gexf(person_dict, couples) {
    var params = {
        defaultEdgeType: 'directed'
    };
    var graph = gexf.create([params]);
    var i, j;

    /* Create person nodes */
    for (i in person_dict) {
        var person = person_dict[i];
        graph.addNode({
            id: person.id,
            label: person.surname + ' ' + person.name,
            attributes: person
        });
    }

    for (i in couples) {
        var couple = couples.dict[i];
        /* Create couple nodes */
        graph.addNode({
            id: couple.id,
            label: couple.id,
            attributes: {}
        });

        /* Create couple - parents edges */
        for (j in couple.parents) {
            graph.addEdge({
                id: couple.parents[j] + '_edge_' + couple.id,
                source: couple.parents[0],
                target: couple.id
            });
        }

        /* Create couple - children edges */
        for (j in couple.children) {
            graph.addEdge({
                id: couple.id + '_edge_' + couple.children[j],
                source: couple.id,
                target: couple.children[j]
            });
        }

    }
}

function calculate_grid() {
    apply_to_each_node(
        add_person_to_layer,
        init_layer_calculation
    );
    // debug_layers();

    create_gexf();

    var t = calc_canvas_size();
    create_canvas(t.width, t.height);
    d = new Drawer(ctx);
    d.draw_layers();
    d.draw_connections();


}

function run_() {

    $.getJSON('data.json', function(json) {
        canvas = document.createElement('canvas');
        init_context();
        create_person_dict_and_couples(json);
        calculate_grid();
    });
}


run_();



