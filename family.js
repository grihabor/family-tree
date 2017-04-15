function render_person(p){
    body = $(".container");
    person_html = '<h1 class="person" id="person_' + p.id + '">' + p.name + '</h1>';
    body.append(person_html);
    // alert(person_html);
}

$.getJSON("data.json", function(json) {
    t = "";
    for(var i in json){
        person = json[i];
        render_person(person);
    }

    // element = $('#ta_json');
    // element.offset({top: 100, left: 200});
});
