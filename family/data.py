import json

from family.person import Person


class Data:
    def __init__(self, filename):
        with open(filename, 'r') as f:
            data = json.load(f)

        self.persons = {}

        for obj in data:
            person = Person(obj)
            self.persons[person.id] = person

