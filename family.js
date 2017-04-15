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

function render_tree(node, pos){

    alert('render: '+node);

    //alert(data);
    person = nodeById(node);
    //alert( person );

    $('#person_' + person.id).offset(pos);
    
    if(!person.hasOwnProperty('parents')){
        alert(person.name);
        return;
    }
    
    render_tree(person.parents[0], {top: pos.top-100, left: pos.top-100});
    render_tree(person.parents[1], {top: pos.top-100, left: pos.top+100});
}

$.getJSON("data.json", function(json) {
    data = json;
    pos = {top: 500, left: 500};
    for(var i in json){
        person = json[i];
        render_person(person);
        //$('#person_' + person.id).offset(pos);
    }
    render_tree(1, pos);

    // element = $('#ta_json');
    // element.offset({top: 100, left: 200});
});
