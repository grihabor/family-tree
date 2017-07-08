

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
