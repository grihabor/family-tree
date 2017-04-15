function render_person(p){
    body = $(".container");
    
}

$.getJSON("data.json", function(json) {
    t = "";
    for(var i in json){
        person = json[i];
        t += person.name + '<br>';
    }

    element = $('#ta_json');
    
    
    element.offset({top: 100, left: 200});
    
    element.html(t);
});
