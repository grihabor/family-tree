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

var LAYER_HEIGHT = 200;
var CANVAS_PADDING = 12;
var X_MARGIN = 50;

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
	this._x = null;
	this._y = null;
	this._layer = null;

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
	this.dict = {};
	this.add_couple_child = function (child) {
		var parents = child.parents;
		var couple = new Couple(parents);
		var couple_id = couple.get_couple_id()
		if (couple_id in couples.dict) {
			/* Couple already exist */
			couple = couples.dict[couple_id];
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


function draw_person(person, pos){
	var r = [
		Math.round(pos.x - rect_padding),
		Math.round(pos.y - rect_padding),
		Math.round(person.width),
		Math.round(person.height)
	];
	
	ctx.strokeRect(r[0], r[1], r[2], r[3]);
	
	if(person.sex == "male") {
	 ctx.strokeStyle="#FF0000";
	} else {
	 ctx.strokeStyle="#00FF00";
	}
	
	ctx.strokeRect(r[0]+1, r[1]+1, r[2]-2, r[3]-2);
	
	ctx.strokeStyle="#000000";

	ctx.fillText(
		person.name,
		Math.round(pos.x),
		Math.round(pos.y)
	);
	ctx.fillText(
		person.surname,
		Math.round(pos.x),
		Math.round(pos.y + (person.height + text_padding) / 2)
	);	
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

function round(pos){
 return {
		x: Math.round(pos.x),
		y: Math.round(pos.y)
	}
}

function render_line(pos, pos_to) {
	pos = round(pos);
	pos_to = round(pos_to);
	
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	ctx.lineTo(pos_to.x, pos_to.y);
	ctx.stroke();
}

function render_bezier(pos, pos_to) {
	pos = round(pos);
	pos_to = round(pos_to);
	y_middle = Math.round((pos.y + pos_to.y) / 2);
	
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

function draw_connection(parents, child){
// alert("draw " + pid1 + );
	// TODO: fix here
 
	var parent_1 = person_dict[parents[0]];
	var parent_2 = person_dict[parents[1]];
	child = person_dict[child];
	
 var parents_x = parent_1._x + parent_2._x;
 if (parent_1._x < parent_2._x){
  parents_x = (parents_x + parent_1.width) / 2;
 } else {
  parents_x = (parents_x + parent_2.width) / 2;
 }
	
	var parents_y = parent_1._y + parent_1.height / 2;
     
	render_bezier({
		x: parents_x,
		y: parents_y - CANVAS_PADDING
	}, {
		x: child._x + child.width / 2,
		y: child._y - CANVAS_PADDING
	});
}


function create_canvas(width, height) {
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	init_context();
}



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
		var d = document.createElement('div');
		var person = person_dict[i];
		d.innerHTML = person._layer.toString() + " " + person.name;
		document.body.appendChild(d);
	}
}

function calc_layer_width(layer) {
	var width = 0;
	for (var i in layer) {
		var person = person_dict[layer[i]];
		width += person.width;
	}
	return width;
}

function calc_max_layer_width() {
	var max_layer_id = 0;
	var max_layer_width = calc_layer_width(layers[max_layer_id]);

	for (var i in layers){
		layer_width = calc_layer_width(layers[i]);
		if(layer_width > max_layer_width) {
			max_layer_width = layer_width;
			max_layer_id = i;
		}
	}
	return {width: max_layer_width, 
			id: max_layer_id};
}

function calc_canvas_size(){
	var max_layer = calc_max_layer_width();
	return {
	 width: max_layer.width + 2 * CANVAS_PADDING, 
	 height: Object.keys(layers).length * LAYER_HEIGHT + 2 * CANVAS_PADDING
	}
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

function apply_to_each_node(func, init_func){
 clear_graph();
	var person_id = 1;
	if(init_func !== null) {
	 init_func(person_id);
	}
	var path = [];

	while(true) {
		person_id = next_node(path, person_id, func);
		if (person_id == null) {
			if (path.length == 0) {
				break;
			}
			person_id = path.pop();
		}
	}
}

function draw_layers(){
 var min_layer_i = 0;
 for(var i in layers){
  var i_int = parseInt(i);
  if(i_int < min_layer_i){
   min_layer_i = i_int;
  }
 }
	for (var i in layers) {
		var layer = layers[i];
		var cur_x = CANVAS_PADDING;
		var layer_index = parseInt(i);
		for (var j in layer){

			cur_x += X_MARGIN;

			var person = person_dict[layer[j]];
			var x = cur_x;
			var y = CANVAS_PADDING + (layer_index - min_layer_i) * LAYER_HEIGHT;
			draw_person(person, {x: x, y: y});
			person._x = x;
			person._y = y;
			cur_x += person.width;
		}
	}
}

function draw_connections(){
 for(var i in person_dict){
  var p = person_dict[i];
  if(p.parents !== null){
   draw_connection(p.parents, p.id);
  }
 }
}

function calculate_grid(){
	apply_to_each_node(
	 add_person_to_layer,
	 init_layer_calculation
	);
	// debug_layers();
	var t = calc_canvas_size();
	create_canvas(t.width, t.height);
	draw_layers();
	draw_connections();
}

function run_(){

	$.getJSON("data.json", function(json) {
		canvas = document.createElement("canvas");
		init_context();
		create_person_dict_and_couples(json);
		calculate_grid();
    });
}


run_();



