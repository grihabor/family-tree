function render_person(person, pos){
    var canvas = document.getElementById('family_tree');
    var ctx = canvas.getContext('2d');
    
    ctx.textAlign = "center";
    ctx.fillText(person.name, pos.left, pos.top);
}

 
var scale_drop = 0.5;
var leave_shift = 300;
var data;

function get_data(json){
    for(var i in json){
        
    }
}

function nodeById(id){
    for(var i in data){
        if(data[i].id == id){
            return data[i];
        }
    }
}

function render_tree(node, pos, scale){
    var person = nodeById(node);
    render_person(person, pos);
    
    if(!person.hasOwnProperty('parents')){
        return;
    }
   
    var scale_upd = scale*scale_drop;
    
    var p1 = {top: pos.top-20, left: pos.left-scale*leave_shift};
    var p2 = {top: pos.top-30, left: pos.left+scale*leave_shift};
    
    render_tree(person.parents[0], p1, scale_upd);
    render_tree(person.parents[1], p2, scale_upd);
    
}

$.getJSON("data.json", function(json) {
    data = json;
    var pos = {top: 500, left: 800};
    render_tree(1, pos, 1.);
});
