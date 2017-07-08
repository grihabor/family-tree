function draw_person(person, pos) {
    var r = [
        Math.round(pos.x),
        Math.round(pos.y),
        Math.round(person.width),
        Math.round(person.height)
    ];

    ctx.strokeRect(r[0], r[1], r[2], r[3]);

    if (person.sex == "male") {
        ctx.strokeStyle = "#FF0000";
    } else {
        ctx.strokeStyle = "#00FF00";
    }

    ctx.strokeRect(r[0] + 1, r[1] + 1, r[2] - 2, r[3] - 2);

    ctx.strokeStyle = "#000000";

    ctx.fillText(
        person.name,
        Math.round(pos.x + RECT_PADDING),
        Math.round(pos.y + RECT_PADDING)
    );
    ctx.fillText(
        person.surname,
        Math.round(pos.x + RECT_PADDING),
        Math.round(pos.y + (person.height + TEXT_PADDING) / 2)
    );
}


function render_line(pos, pos_to) {
    pos = round(pos);
    pos_to = round(pos_to);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos_to.x, pos_to.y);
    ctx.stroke();
}

function render_bezier(pos, pos_to, k) {
    if (!k) {
        k = 0.5;
    }
    pos = round(pos);
    pos_to = round(pos_to);
    y_middle = Math.round(pos.y * k + pos_to.y * (1 - k));

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.bezierCurveTo(pos.x, y_middle, pos_to.x, y_middle, pos_to.x, pos_to.y);
    ctx.stroke();
}


function render_zigzag(pos, pos_to, y_from) {
    pos = round(pos);
    pos_to = round(pos_to);
    var y_center = Math.round((y_from + pos_to.y) / 2);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, y_center);
    ctx.lineTo(pos_to.x, y_center);
    ctx.lineTo(pos_to.x, pos_to.y);
    ctx.stroke();
}


function draw_connection(parents, child) {

    var parent_1 = person_dict[parents[0]];
    var parent_2 = person_dict[parents[1]];
    child = person_dict[child];

    var parents_x = parent_1._x + parent_2._x;
    if (parent_1._x < parent_2._x) {
        parents_x = (parents_x + parent_1.width) / 2;
    } else {
        parents_x = (parents_x + parent_2.width) / 2;
    }

    var parents_y = parent_1._y + parent_1.height / 2;

    render_bezier({
        x: parents_x,
        y: parents_y
    }, {
        x: child._x + child.width / 2,
        y: child._y
    }, k = 0.1);

}


function draw_layers() {
    var min_layer_i = 0;
    for (var i in layers) {
        var i_int = parseInt(i);
        if (i_int < min_layer_i) {
            min_layer_i = i_int;
        }
    }
    for (var i in layers) {
        var layer = layers[i];
        var cur_x = CANVAS_PADDING;
        var layer_index = parseInt(i);
        var y = CANVAS_PADDING + (layer_index - min_layer_i) * LAYER_HEIGHT;

        for (var j in layer) {
            var person = person_dict[layer[j]];
            var x = cur_x;
            draw_person(person, {x: x, y: y});
            person._x = x;
            person._y = y;
            cur_x += person.width + X_MARGIN;
        }
    }
}

function draw_couple_connection(parents) {
    var parent_1 = person_dict[parents[0]];
    var parent_2 = person_dict[parents[1]];

    var x = null;
    if (parent_1._x > parent_2._x) {
        var t = parent_1;
        parent_1 = parent_2;
        parent_2 = t;
    }

    var x1 = parent_1._x + parent_1.width;
    var x2 = parent_2._x;

    var y = parent_1._y + parent_1.height / 2;
    render_line({
        x: x1, y: y
    }, {
        x: x2, y: y
    });
}

function draw_couple_connections() {
    for (var i in couples.dict) {
        var parents = couples.dict[i].parents;
        draw_couple_connection(parents);
    }
}

function draw_parent_child_connections() {
    for (var i in person_dict) {
        var p = person_dict[i];
        if (p.parents !== null) {
            draw_connection(p.parents, p.id);
        }
    }
}

function draw_connections() {
    draw_parent_child_connections();
    draw_couple_connections();
}