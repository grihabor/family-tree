import enum


class Sex(enum.Enum):
    MALE = 'male'
    FEMALE = 'female'


class Person:
    def __init__(self, data):

        self.name = data['name']
        self.surname = data['surname']
        self.id = data['id']
        self.sex = Sex(data['sex'])

        self.couple_id = None
        self.parent_couple_id = None
        self.couple_person = None
        self.parents = None

        self.x = None
        self.y = None
        self.layer = None

        for attr_name in data:
            setattr(self, attr_name, data[attr_name])

    def __repr__(self):
        return '<{0.__class__.__name__} id={0.id} name={0.name} surname={0.surname}>'.format(self)
