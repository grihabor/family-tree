function render_person(p){
    body = $(".container");
    person_html = $('<td></td>');
    person_html.attr('class', 'person');
    person_html.text(p.name);
    
    table = $('<table></table>')
    table.attr('border', 5);
    table.attr('id', 'person_' + p.id);
    
    table.append($('<tr></tr>').append(person_html));
    body.append(table);
}

function render(person, pos){
    var canvas = document.getElementById('family_tree');
    
    if(!canvas.getContext){
        // alert('context unsupported');
    }
    
    var ctx = canvas.getContext('2d');
    //alert(ctx);
    
    ctx.fillText(person.name, pos.left, pos.top);
}

 
var scale_drop = 0.5;
var leave_shift = 500;
var data;

function nodeById(id){
    for(var i in data){
        if(data[i].id == id){
            return data[i];
        }
    }
}

function render_tree(node, pos, scale){
    var person = nodeById(node);
    // $('#person_' + person.id).offset(pos);
    render(person, pos);
    
    if(!person.hasOwnProperty('parents')){
        return;
    }
   
    var scale_upd = scale*scale_drop;
    
    var p1 = {top: pos.top-100, left: pos.left-scale*leave_shift};
    var p2 = {top: pos.top-120, left: pos.left+scale*leave_shift};
    
    render_tree(person.parents[0], p1, scale_upd);
    render_tree(person.parents[1], p2, scale_upd);
    
}

$.getJSON("data.json", function(json) {
    data = json;
    var pos = {top: 500, left: 1500};
    for(var i in json){
        var person = json[i];
        // render_person(person);
    }
    render_tree(1, pos, 1.);
});
