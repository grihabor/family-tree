import json
from typing import Dict

from family.couple import Couple
from family.person import Person


class Data:
    def __init__(self, filename):
        with open(filename, 'r') as f:
            data = json.load(f)

        self.persons = {}  # type: Dict[int, Person]

        for obj in data:
            person = Person(obj)
            self.persons[person.id] = person

        self.couples = {}

        for person in self.persons.values():
            if person.parents is None:
                continue

            """ couple -> parents """
            couple = Couple(person.parents)
            if couple.id not in self.couples:
                self.couples[couple.id] = couple
            else:
                couple = self.couples[couple.id]

            """ couple -> child """
            couple.children.append(person.id)
            """ couple <- child """
            person.parent_couple_id = couple.id

            """ couple <- parents """
            for parent_id in couple.parents:
                self.persons[parent_id].couple_id = couple.id

