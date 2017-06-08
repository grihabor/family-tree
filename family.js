var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;

var person_dict = null;
var couples = null;
var layers = {};

var subtree_space = 50;
var row_space = 120;
var couple_space = 60;

var canvas;
var ctx;


function Person(person_data){
	var rect = get_person_rect(person_data);
	this.width = rect.width;
	this.height = rect.height;

	this.name = person_data.name;
	this.surname = person_data.surname;
	this.id = person_data.id;
	this.couple_id = null;
	this.parent_couple_id = null;
	this.couple_person = null;
	this.parents = null;
	this.sex = person_data.sex;

	for (var attr_name in person_data){
		this[attr_name] = person_data[attr_name];
	}
}

function Couple(parents){
	this.parents = parents;
	this.children = [];
	this.get_couple_id = function () {
		return Math.min(parents[0], parents[1]) + "_" + 
			Math.max(parents[0], parents[1]);
	};
	this.add_child = function (child_id) {
		this.children.push(child_id);
	};
}

function Couples(){
	this.dict = {}
	this.add_couple_child = function (child) {
		var parents = child.parents;
		var couple = new Couple(parents);
		var couple_id = couple.get_couple_id()
		if (couple_id in couples) {
			/* Couple already exist */
			couple = couples[couple_id];
			couple.add_child(child.id);
		} else {
			/* Add couple to the dict */
			couple.add_child(child.id);
			this.dict[couple_id] = couple;

			var p1 = person_dict[parents[0]];
			p1.couple_id = couple_id;
			p1.couple_person = parents[1];
			
			var p2 = person_dict[parents[1]];
			p2.couple_id = couple_id;
			p2.couple_person = parents[0];
		}
		child.parent_couple_id = couple_id;
	};
}

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




function create_person_dict_and_couples(json) {
	var data = json;
	couples = new Couples();
	person_dict = {};
	
	/* Fill person_dict */
	for (var i in data) {
		var person = new Person(data[i]);
		person_dict[person.id] = person;
	}

	/* Fill couples dict */
	for (var i in data) {
		var person = data[i];

		if (person.parents == null) {
			continue;
		}
		couples.add_couple_child(person);
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


function create_canvas(width, height) {
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	init_context();
}


/*
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
*/

function init_context() {
	ctx = canvas.getContext('2d');
	ctx.font = "30px Arial";
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';	
}


function Pair(person_id, shift) {
 this.person_id = person_id;
 this.shift = shift;
}

function node_directions(node){
	var dir_list = [];
	if (node.couple_person !== null){
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
	for (var i in person_dict){
		person_dict[i]._visited = false;
	}
}

function debug_layers() {
	for (var i in person_dict){
		d = document.createElement('div');
		d.innerHTML = str(person_dict[i]._layer);
	}
}

function iterate_node(path, person_id) {
	var person = person_dict[person_id];
	person._visited = true;
	
	var dir_list = node_directions(person);
	for (var i in dir_list) {
		var new_person_id = dir_list[i].person_id;
		var p = person_dict[new_person_id];
		if (!p._visited) {
			path.push(person_id);
			return p.id;
		}
	}
	return null;
}

function apply_to_each_node(func){
	var person_id = 8;
	var person = person_dict[person_id];
	person._layer = 0;
	var path = [];

	while(true) {
		person_id = iterate_node(path, person_id);
		if (person_id == null) {
			if (path.length == 0) {
				break;
			}
			person_id = path.pop();
		}
	}
}

function calculate_grid(){
	apply_to_each_node(null);
}

function run_(){

	$.getJSON("data.json", function(json) {
 //todo: debug children addition
		canvas = document.createElement("canvas");
		init_context();
		create_person_dict_and_couples(json);
		calculate_grid();
		debug_layers();
    });
}


run_();



