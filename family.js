var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;

var person_dict = {};
var couples = {};

var subtree_space = 50;
var row_space = 120;
var couple_space = 100;

var canvas;
var ctx;


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
        height: 2*height + text_padding
    };

    return {
        width: rect.width + 2 * rect_padding,
        height: rect.height + 2 * rect_padding
    }
}


function render_person(person, pos) {
    if ('x' in pos) {
        pos = {
            left: pos.x,
            top: pos.y
        };
    }


    var name_size = {
        width: ctx.measureText(person.name).width,
        height: parseInt(ctx.font)
    };
    var surname_size = {
        width: ctx.measureText(person.surname).width,
        height: parseInt(ctx.font)
    };

    var surname_pos = {
        left: pos.left - surname_size.width / 2,
        top: pos.top - surname_size.height - text_padding / 2
    };
    var name_pos = {
        left: pos.left - name_size.width / 2,
        top: pos.top + text_padding / 2
    };

    var rect = {
        left: Math.min(name_pos.left, surname_pos.left),
        top: surname_pos.top,
        width: Math.max(name_size.width, surname_size.width),
        height: name_size.height + surname_size.height + text_padding
    }


    ctx.strokeRect(
        Math.round(rect.left - rect_padding),
        Math.round(rect.top - rect_padding),
        Math.round(rect.width + 2 * rect_padding),
        Math.round(rect.height + 2 * rect_padding)
    );

    ctx.fillText(person.name, Math.round(name_pos.left), Math.round(name_pos.top));
    ctx.fillText(person.surname, Math.round(surname_pos.left), Math.round(surname_pos.top));
}


function add_couple_child(child) {

    var parents = child.parents;
    var couple_id = Math.min(parents[0], parents[1]) + "_" + Math.max(parents[0], parents[1]);
    if (couple_id in couples) {
        var children = couples[couple_id].children;
        children.push(child.id);
    } else {
        couples[couple_id] = {
            children: [child.id],
            person: parents
        };
        person_dict[parents[0]].couple_id = couple_id;
        person_dict[parents[1]].couple_id = couple_id;
    }
    child.parent_couple_id = couple_id;

}

function fill_person_dict_and_couples(json) {
    var data = json;
    /* Fill person_dict */
    for (var i in data) {
        var person = data[i];
        person.width = get_person_rect(person).width;
        person_dict[person.id] = person;
    }

    /* Fill couples dict */
    for (var i in data) {
        var person = data[i];

        if (!person.hasOwnProperty('parents')) {
            continue;
        }
        add_couple_child(person);
    }

}

function calc_children(couple_id) {
	/* Calculate children positions */

    var couple = couples[couple_id];

    var cur_x = 0;
    /* calculate subtree */
    for (var i in couple.children) {
        var w = calc_subtree(couple.children[i])

        var child = person_dict[couple.children[i]];

        child.pos = cur_x + w / 2
        if ('couple_id' in child) {
            var wi = (child.width + couple_space) / 2;
            if (child.sex != 'male') {
                child.pos += wi;
            } else {
                child.pos -= wi;
            }
        }

        cur_x += w + subtree_space;
    }

    var tree_width = cur_x - subtree_space;

    for (var i in couple.children) {
        var child = person_dict[couple.children[i]];
        child.pos -= tree_width / 2;
    }


    return tree_width;
}

function calc_subtree(node) {
	/* Calculate couple position */

    var person = person_dict[node];
    if ('pos' in person) {
        return;
    }

    if ('couple_id' in person) {

        var couple = couples[person.couple_id];

        var tree_width = calc_children(person.couple_id);

        couple.pos = (person.width + couple_space) / 2;
        if (person.sex != 'male') {
            couple.pos = -couple.pos;
        }

        var w1 = person_dict[couple.person[0]].width;
        var w2 = person_dict[couple.person[1]].width;

        var couple_width = couple_space + 2 * Math.max(w1, w2);

        return Math.max(tree_width, couple_width);
    } else {
        return person.width;
    }
}

function render_line(pos, pos_to) {
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	ctx.lineTo(pos_to.x, pos_to.y);
	ctx.closePath();
	ctx.stroke();
}

function render_subtree(node, pos) {
    var person = person_dict[node];
    render_person(person, pos);

    if ('couple_id' in person) {
        var couple = couples[person.couple_id];

        var other = person_dict[couple.person[0]];
        if (other == person) {
            other = person_dict[couple.person[1]];
        }


        var w = other.width / 2;
        if (other.sex == 'male') {
            w = -w;
        }

        var pos_to = {
            x: pos.x + couple.pos + w,
            y: pos.y
        }
        render_line(pos, pos_to)
        render_person(other, pos_to);

        for (var i in couple.children) {
            var child = person_dict[couple.children[i]];
            render_subtree(couple.children[i], {
                x: pos.x + child.pos + couple.pos,
                y: pos.y + row_space
            });
        }
    }

}

function show_subtree(node, pos) {
	calc_subtree(node);
	render_subtree(node, pos);
	ctx.stroke();
}

function init_context() {
	ctx = canvas.getContext('2d');
	ctx.font = "30px Arial";
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';	
}

function create_canvas(width, height) {
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	return canvas;
}

function run() {

    $.getJSON("data.json", function(json) {

        canvas = create_canvas(5000, 1000);
        init_context();
        
        fill_person_dict_and_couples(json);

        node = 35;
		show_subtree(node, {
            x: 2500,
            y: 100
        });

    });
}

run();

