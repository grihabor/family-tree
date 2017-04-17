
var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;
var data;
var couples = {};


function render_person(person, pos){
    var canvas = document.getElementById('family_tree');
    var ctx = canvas.getContext('2d');
    
    ctx.font = "30px Arial";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    name_size = {
        width: ctx.measureText(person.name).width,
        height: parseInt(ctx.font)
    };
    surname_size = { 
        width: ctx.measureText(person.surname).width,
        height: parseInt(ctx.font)
    };
    
    surname_pos = {
        left: pos.left - surname_size.width/2,
        top: pos.top - surname_size.height - text_padding/2
    };
    name_pos = {
        left: pos.left - name_size.width/2,
        top: pos.top + text_padding/2
    };
    
    rect = {
        left: Math.min(name_pos.left, surname_pos.left),
        top: surname_pos.top,
        width: Math.max(name_size.width, surname_size.width),
        height: name_size.height + surname_size.height + text_padding
    }
    
    
    ctx.rect(
        rect.left - rect_padding,
        rect.top - rect_padding,
        rect.width + 2*rect_padding,
        rect.height + 2*rect_padding
    );
    ctx.stroke();
    
    ctx.fillText(person.name, name_pos.left, name_pos.top);
    ctx.fillText(person.surname, surname_pos.left, surname_pos.top);
}

function nodeById(id){
    for(var i in data){
        if(data[i].id == id){
            return data[i];
        }
    }
}

function coupleById(id){
    for(var i in couples){
        if(couples[i].id == id){
            return couples[i];
        }
    }	
}

function add_couple_child(child){

    parents = child.parents;
    couple_id = Math.min(parents[0], parents[1]) + "_" + Math.max(parents[0], parents[1]);
    if(couple_id in couples){
       children = couples[couple_id].children;
       children.push(child.id);
    } else {
       couples[couple_id] = {children: [child.id]};
    }
    child.parent_couple_id = couple_id;
    nodeById(parents[0]).couple_id = couple_id;
    nodeById(parents[1]).couple_id = couple_id;
}

function calc_data(){
    for(var i in data){
        person = data[i];
        if(!person.hasOwnProperty('parents')){
            continue;
        }
        add_couple_child(person);    
    }
}

function render_tree(node, pos, scale){
    var person = nodeById(node);
    render_person(person, pos);
    
    if(!person.hasOwnProperty('parents')){
        return;
    }
   
    var scale_upd = scale*scale_drop;
    
    var p1 = {top: pos.top-leaves_pad_height, left: pos.left-scale*leaves_pad_width};
    var p2 = {top: pos.top-leaves_pad_height, left: pos.left+scale*leaves_pad_width};
    
    render_tree(person.parents[0], p1, scale_upd);
    render_tree(person.parents[1], p2, scale_upd);
    
}

function calc_positions(node, pos){
	var person = nodeById(node);
	person.pos = pos;

	couple = coupleById(person.couple_id);
}

$.getJSON("data.json", function(json) {
    data = json;
    calc_data();
    
    var pos = {top: 1000, left: 2500};
    render_tree(30, pos, 1.);
});
