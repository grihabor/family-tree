from .node import Node


class Person(Node):
    def __init__(self, data: dict):

        self.name = None
        self.surname = None
        self.id = None
        self.sex = None

        self.couple_id = None
        self.parent_couple_id = None
        # self.couple_person = None
        self.parents = None

        self.x = None
        self.y = None
        self.layer = None

        for attr_name in data:
            setattr(self, attr_name, data[attr_name])

    def __repr__(self):
        return '<{0.__class__.__name__} id={0.id} name="{0.name}" surname="{0.surname}">'.format(self)

    def edges(self):
        edges = []
        if self.couple_id:
            edges.append(self.couple_id)
        if self.parent_couple_id:
            edges.append(self.parent_couple_id)
        return edges
