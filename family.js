function render_person(p){
    body = $(".container");
    person_html = $('<h1></h1>');
    person_html.attr('class', 'person');
    person_html.attr('id', 'person_' + p.id);
    person_html.text(p.name);
    body.append(person_html);
    // alert(person_html);
}

var data;

function nodeById(id){
    for(var i in data){
        if(data[i].id == id){
            return data[i];
        }
    }
}

function hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}

function render_tree(node, pos, scale){

    

    //alert(data);
    var person = nodeById(node);
    //alert( person );
    
    //alert('render: '+person.name+' '+pos.left);

    $('#person_' + person.id).offset(pos);
    
    if(!person.hasOwnProperty('parents')){
        //alert(person.name);
        return;
        
    }
    
    var scale_drop = 0.5;
    var scale_upd = scale*scale_drop;
    
    //alert('r1 '+person.name);
    var p = {top: pos.top-100, left: pos.left-scale*1000};
    render_tree(person.parents[0], p, scale_upd);
    
    //alert('r2 '+person.name);
    render_tree(person.parents[1], {top: pos.top-120, left: pos.left+scale*1000}, scale_upd);
    
}

$.getJSON("data.json", function(json) {
    data = json;
    var pos = {top: 1500, left: 2500};
    for(var i in json){
        var person = json[i];
        render_person(person);
        //$('#person_' + person.id).offset(pos);
    }
    render_tree(1, pos, 1.);

    // element = $('#ta_json');
    // element.offset({top: 100, left: 200});
});
