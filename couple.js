
function Couple(parents) {
    this.parents = parents;
    this.children = [];
    this.get_couple_id = function () {
        return Math.min(parents[0], parents[1]) + "_" +
            Math.max(parents[0], parents[1]);
    };
    this.add_child = function (child_id) {
        this.children.push(child_id);
    };
}

function Couples(person_dict) {
    this.dict = {};
    this.person_dict = person_dict;
    this.add_couple_child = function (child) {
        var parents = child.parents;
        var couple = new Couple(parents);
        var couple_id = couple.get_couple_id();
        if (couple_id in couples.dict) {
            /* Couple already exist */
            couple = couples.dict[couple_id];
            couple.add_child(child.id);
        } else {
            /* Add couple to the dict */
            couple.add_child(child.id);
            this.dict[couple_id] = couple;

            var p1 = this.person_dict[parents[0]];
            p1.couple_id = couple_id;
            p1.couple_person = parents[1];

            var p2 = this.person_dict[parents[1]];
            p2.couple_id = couple_id;
            p2.couple_person = parents[0];
        }
        child.parent_couple_id = couple_id;
    };
}
