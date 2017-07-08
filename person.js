
function Person(person_data) {
    var rect = get_person_rect(person_data);
    this.width = rect.width;
    this.height = rect.height;

    this.name = person_data.name;
    this.surname = person_data.surname;
    this.id = person_data.id;
    this.couple_id = null;
    this.parent_couple_id = null;
    this.couple_person = null;
    this.parents = null;
    this.sex = person_data.sex;
    this._x = null;
    this._y = null;
    this._layer = null;

    for (var attr_name in person_data) {
        this[attr_name] = person_data[attr_name];
    }
}
