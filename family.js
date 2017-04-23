var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;

var person_dict = {};
var couples = {};

var subtree_space = 50;
var row_space = 120;
var couple_space = 60;

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
		var rect = get_person_rect(person);
		person.width = rect.width;
		person.height = rect.height;
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

		var w1 = person_dict[couple.person[0]].width;
		var w2 = person_dict[couple.person[1]].width;

		var couple_width = couple_space + 2 * Math.max(w1, w2);

		return Math.max(tree_width, couple_width);
	} else {
		return person.width;
	}
}

function render_line(pos, pos_to) {
	pos = {
		x: Math.round(pos.x),
		y: Math.round(pos.y)
	}
	pos_to = {
		x: Math.round(pos_to.x),
		y: Math.round(pos_to.y)
	}
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	ctx.lineTo(pos_to.x, pos_to.y);
	ctx.stroke();
}

function render_zigzag(pos, pos_to, y_from) {
	pos = {
		x: Math.round(pos.x),
		y: Math.round(pos.y)
	};
	pos_to = {
		x: Math.round(pos_to.x),
		y: Math.round(pos_to.y)
	};
	var y_center = Math.round((y_from + pos_to.y) / 2);
	
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	ctx.lineTo(pos.x, y_center);
	ctx.lineTo(pos_to.x, y_center);
	ctx.lineTo(pos_to.x, pos_to.y);
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

		var w = couple_space + (other.width + person.width) / 2;
		if (other.sex == 'male') {
			w = -w;
		}

		var pos_to = {
			x: pos.x + w,
			y: pos.y
		}

		var center = (person.width + couple_space) / 2;
		if (other.sex == 'male') {
			center = -center;
		}
		center += pos.x;

		render_line({
			x: center - couple_space / 2,
			y: pos.y
		}, {
			x: center + couple_space / 2,
			y: pos.y
		});
		render_person(other, pos_to);

		for (var i in couple.children) {
			var child = person_dict[couple.children[i]];
			var child_pos = {
				x: center + child.pos,
				y: pos.y + row_space
			};

			render_zigzag({
				x: center,
				y: pos.y
			}, {
				x: child_pos.x,
				y: child_pos.y - child.height / 2
			},
			pos.y + person.height / 2
			);

			render_subtree(couple.children[i], child_pos);
		}
	}

}

function create_canvas(width, height) {
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	init_context();
}

function calc_upper_node(node, node_width) {

	var cur_child = person_dict[node];
	if(!('parent_couple_id' in cur_child)){
		return cur_child.width;
	}
	//alert(cur_child.name + " " + cur_child.parent_couple_id);
	var couple = couples[cur_child.parent_couple_id];

	if(cur_child.sex == 'female') { 

		/* Calculate subtree */

		var cur_x = node_width;
		cur_child.pos = node_width / 2;

		for(var i in couple.children) {
			var child_id = couple.children[i];
			/* Skip cur_child */
			if(node == child_id) {
				continue;
			}

			var subtree_width = calc_subtree(child_id);        
			person_dict[child_id].pos = cur_x + subtree_space + subtree_width / 2;        
			cur_x += subtree_width + subtree_space;
		}

		var upper_subtree_width = cur_x;


	} else {
		var cur_x = 0;
		for(var i in couple.children){
			var child_id = couple.children[i];
			if(node == child_id){
				continue;
			}

			var subtree_width = calc_subtree(child_id);        
			person_dict[child_id].pos = cur_x + subtree_width / 2;        
			cur_x += subtree_width + subtree_space;
		}

		cur_child.pos = cur_x + node_width / 2;
		var upper_subtree_width = cur_x + node_width;
	}
	for(i in couple.children) {
		var child = person_dict[couple.children[i]];
		child.pos -= upper_subtree_width / 2;
		if('couple_id' in child){
			var x = (child.width + couple_space) / 2;
			if(child.sex == 'male') {
				x = -x;
			}
			child.pos += x;
		}
	}

	var parents = [
		person_dict[couple.person[0]],
		person_dict[couple.person[1]]
	];

	var couple_width = parents[0].width + couple_space + parents[1].width;
	upper_subtree_width = Math.max(upper_subtree_width, couple_width);

	/* Calculate supertree */

	var w1 = calc_upper_node(couple.person[0], upper_subtree_width);
	var w2 = calc_upper_node(couple.person[1], upper_subtree_width);

	if(person_dict[couple.person[0]].sex == 'female'){
		var t = w1;
		w1 = w2;
		w2 = t;
	}

	if(cur_child.sex == 'female'){
		var supertree_width = w1 * 2 + couple_space;//w1 + w2 + subtree_space;

		if(cur_child.pos - (cur_child.width - couple_space) / 2 > - supertree_width / 2){
			cur_child.pos = (cur_child.width - couple_space) / 2 - supertree_width / 2;
		}
		
		return Math.max(supertree_width, upper_subtree_width);
	} else {

		var supertree_width = 2 * w2 + couple_space;//w1 + w2 + subtree_space;

		if(cur_child.pos + (cur_child.width + couple_space) / 2 < supertree_width / 2){
			cur_child.pos = supertree_width / 2 - (cur_child.width + couple_space) / 2;
		}

		return Math.max(supertree_width, upper_subtree_width);

	}
}

function render_couple_person(person, couple_pos) {
	var x = (person.width + couple_space) / 2;
	if(person.sex == 'male'){
		x = -x;
	}
	render_person(person, {
		x: couple_pos.x + x,
		y: couple_pos.y
	});
	render_upper_tree(person.id, {
		x: couple_pos.x + x,
		y: couple_pos.y
	});
}

function render_upper_tree(node, pos) {
	var child = person_dict[node];

	if(!('parent_couple_id' in child)) {
		return;
	}
	var couple = couples[child.parent_couple_id];
	var parents = [
	person_dict[couple.person[0]],
	person_dict[couple.person[1]]
	];

	if(parents[0].sex == 'male'){
		parents = [parents[1], parents[0]];
	}

	var couple_pos = {
		x: pos.x - child.pos,
		y: pos.y - row_space
	};
	render_couple_person(parents[0], couple_pos);
	render_couple_person(parents[1], couple_pos);

	for(var i in couple.children){
		var child_id = couple.children[i];
		if(child_id == node){
			continue;
		}

		var child = person_dict[child_id];
		render_subtree(child_id, {
			x: couple_pos.x + child.pos,
			y: couple_pos.y + row_space
		});	
	}
	
}

function show_subtree(node) {
	var tree_width = calc_subtree(node);
	
	var w = calc_upper_node(node, tree_width);

	tree_width = 10000;//Math.round(1.2 * tree_width);
	
	create_canvas(tree_width, 5000);
	
	var pos = {
		x: Math.round(tree_width / 2),
		y: 750
	};
	render_subtree(node, pos);
	
	render_upper_tree(node, pos);

	ctx.stroke();
}

function init_context() {
	ctx = canvas.getContext('2d');
	ctx.font = "30px Arial";
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';	
}


function run() {

	$.getJSON("data.json", function(json) {

		canvas = document.createElement("canvas");
		init_context();
		fill_person_dict_and_couples(json);
        node = 23; //41 35 65
        show_subtree(node);
    });
}

run();

