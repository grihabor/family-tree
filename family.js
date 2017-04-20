
var scale_drop = 0.5;
var leaves_pad_width = 1000;
var leaves_pad_height = 100;
var text_padding = 0;
var rect_padding = 10;

var person_dict = {};
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


function add_couple_child(child){

    parents = child.parents;
    couple_id = Math.min(parents[0], parents[1]) + "_" + Math.max(parents[0], parents[1]);
    if(couple_id in couples){
       children = couples[couple_id].children;
       children.push(child.id);
    } else {
       couples[couple_id] = {children: [child.id], person:parents};
       person_dict[parents[0]].couple_id = couple_id;
       person_dict[parents[1]].couple_id = couple_id;
    }
    child.parent_couple_id = couple_id;
    
}

function calc_data(json){
    var data = json;
    /* Fill person_dict */
    for(var i in data){
    var person = data[i];
        person_dict[person.id] = person;
        }
      
    
    for(var i in data){
        var person = data[i];
        
        if(!person.hasOwnProperty('parents')){
            continue;
        }
        add_couple_child(person);    
    }
    
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
	       
	       var cur_x = 0;
	       /* calculate subtree */
	       for(var i in couple.children){
	           var w = calc_positions(
	               couple.children[i],
	               {x:pos.x+i, y:pos.y+1}
	           )
	           
	           var child = person_dict[couple.children[i]];
	           
	           child.pos = cur_x + w/2;
	           
	          
        if('couple_id' in child){
            var wi = get_person_rect(child).width/2;
            if(child.sex == 'male'){
                child.pos = cur_x + wi;
            }else{
                child.pos = cur_x + w - wi;
            }
        }
	           
	           cur_x += w + subtree_space;
	       }
	       
	       var tree_width = cur_x - subtree_space;
	       
	       for(var i in couple.children){
            var child = person_dict[couple.children[i]];
            child.pos -= tree_width/2;
        }
	           

	       return tree_width;
}

function calc_positions(node){
    

    var person = person_dict[node];
    if('pos' in person){
	       return;
	   }
    
	   
	   var rect_width = get_person_rect(person).width;
	   
	   
    if('couple_id' in person){
        
    var couple = couples[person.couple_id];
 
	       var tree_width = calc_couple(person.couple_id);
	       
	       if(person.sex == 'male'){
	       couple.pos = rect_width/2;
	       }else{
	       couple.pos = - rect_width/2;
	       }
	       
	       var w1 = get_person_rect(
	           person_dict[
	               couple.person[0]]
	       ).width;
	       var w2 = get_person_rect(
	           person_dict[
	               couple.person[1]]
	       ).width;
	       
	       var couple_width = couple_space + w1 + w2;

	       return Math.max(tree_width, couple_width);
	   } else {
	       return rect_width;
	   }
	   
	   

}

function render(node, pos){
    var person = person_dict[node];
    render_person(person, pos);
    
    if('couple_id' in person){
	       var couple = couples[person.couple_id];
	       
	       var other = person_dict[couple.person[0]];
	       if(other == person){
	           other = person_dict[couple.person[1]];
	       }
	       
	       
	       var w = get_person_rect(other).width/2;
	       if(other.sex == 'male'){
	         w= -w;
	       }
	       
	       render_person(other, {
	           x:pos.x+couple.pos+w,
	           y:pos.y
	       });
	       
	       
	       
	       
    for(var i in couple.children){
        var child = person_dict[couple.children[i]];
        render(couple.children[i], {x:pos.x+child.pos+couple.pos, y:pos.y+row_space});
    }
    } 
        
}

function run(){

    $.getJSON("data.json", function(json) {
        
        calc_data(json);
        
        node=8;
        
        calc_positions(node);
        render(node, {x:1000, y:500});
    
    });
}

run();