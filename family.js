
var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;
var data;
var couples = {};

var subtree_space = rect_padding*2 + 10;
var row_space = 120;
var couple_space = 20;

var canvas = document.getElementById('family_tree');
var ctx = canvas.getContext('2d');
ctx.font = "30px Arial";
ctx.textAlign = 'left';
ctx.textBaseline = 'top';

var pos = {top: 600, left: 2000};


function render_person(person, pos){
    if('x' in pos){
    pos = {left:pos.x, top:pos.y};}
    

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

/*

function coupleById(id){
    for(var i in couples){
        if(couples[i].id == id){
            return couples[i];
        }
    }	
}
*/

function add_couple_child(child){

    parents = child.parents;
    couple_id = Math.min(parents[0], parents[1]) + "_" + Math.max(parents[0], parents[1]);
    if(couple_id in couples){
       children = couples[couple_id].children;
       children.push(child.id);
    } else {
       couples[couple_id] = {children: [child.id], person:parents};
       nodeById(parents[0]).couple_id = couple_id;
       nodeById(parents[1]).couple_id = couple_id;
    }
    child.parent_couple_id = couple_id;
    
    
    //alert(couple_id+" "+couples[couple_id].children);
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

function _depr_render_tree(node, pos, scale){
    var person = nodeById(node);
    render_person(person, pos);
    
    if(!person.hasOwnProperty('parents')){
        return;
    }
   
    var scale_upd = scale*scale_drop;
    
    var p1 = {top: pos.top-leaves_pad_height, left: pos.left-scale*leaves_pad_width};
    var p2 = {top: pos.top-leaves_pad_height, left: pos.left+scale*leaves_pad_width};
    
    _depr_render_tree(person.parents[0], p1, scale_upd);
    _depr_render_tree(person.parents[1], p2, scale_upd);
    
}

function get_person_rect(person){


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
    
    return {
        left: Math.min(name_pos.left, surname_pos.left),
        top: surname_pos.top,
        width: Math.max(name_size.width, surname_size.width),
        height: name_size.height + surname_size.height + text_padding
    };
}

function calc_couple(couple_id){
var couple = couples[couple_id];
	       //alert(couple_id + " " + " "+couple.children);
	       
	       //var subtree_width = [];
	       var cur_x = 0;
	       /* calculate subtree */
	       for(var i in couple.children){
	           //alert('child '+i);
	           var w = calc_positions(
	               couple.children[i],
	               {x:pos.x+i, y:pos.y+1}
	           )
	           
	           //subtree_width.push(w);
	           var child = nodeById(couple.children[i]);
	           
	           child.pos = cur_x + w/2;
	           //alert(child.name+ ": " +w);
	           cur_x += w + subtree_space;
	       }
	       
	       var tree_width = cur_x - subtree_space;
	       //alert('total: '+tree_width);
	       
	       for(var i in couple.children){
            var child = nodeById(couple.children[i]);
            child.pos -= tree_width/2;
        }
	           
	       //alert(person.name + person.couple_id);
	       //alert('tree width '+tree_width);
	       return tree_width;
}

function calc_positions(node){
    //alert(node);

    var person = nodeById(node);
    if('pos' in person){
	       return;
	   }
    
	   //person.pos = pos;
	   
	   //alert();
	   
	   var rect_width = get_person_rect(person).width;
	   
	   
    if('couple_id' in person){
        var couple_offset;
        if(person.sex == 'male'){
            person.shift = - rect_width/2;
        } else {
            person.shift = rect_width/2;
        }
        //alert(couple_offset);
    
    var couple = couples[person.couple_id];
    //couple.pos = couple_offset;
    //alert(person.couple_id+" "+couple.person);
	       var tree_width = calc_couple(person.couple_id);
	       
	       
	       
	       
	       var w1 = get_person_rect(
	           nodeById(
	               couple.person[0])
	       ).width;
	       var w2 = get_person_rect(
	           nodeById(
	               couple.person[1])
	       ).width;
	       
	       var couple_width = couple_space + w1 + w2;
	       
	       //alert(w1 +" + "+w2 + " " + couple_width +" "+ tree_width);
	       return Math.max(tree_width, couple_width);
	   } else {
	       return rect_width;
	   }
	   
	   

}

function render(node, pos){
    var person = nodeById(node);
    render_person(person, pos);
    
    //alert(person+""+ pos.x);
    
    if('couple_id' in person){
	       var couple = couples[person.couple_id];
	       /*
	       var p1 = nodeById(couple.person[0]);
	       var p2 = nodeById(couple.person[1]);
	       
	       
	       
	       render_person(p1, {
	           x:pos.x,
	           y:pos.y
	       });
	       render_person(p2, {
	           x:pos.x+ shift2,
	           y:pos.y
	       });
	       */
	       
	       
    for(var i in couple.children){
        var child = nodeById(couple.children[i]);
        //alert(child.name+child.pos)
        //alert(couple.pos);
        render(couple.children[i], {x:child.pos+pos.x, y:pos.y+row_space});
    }
    } 
        
}

function run(){

    $.getJSON("data.json", function(json) {
        data = json;
        calc_data();
        
        node=8;
        
        calc_positions(node);
        render(node, {x:800, y:500});
    
        //render_tree(30, pos, 1.);
    });
}

run();