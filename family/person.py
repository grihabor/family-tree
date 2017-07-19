import logging

from .node import Node

logger = logging.getLogger(__name__)


class Person(Node):
    def __init__(self, data: dict):
        assert 'id' in data
        super().__init__(
            data['id'],
            color="rgb(100,130,200)",
            size=3
        )

        self.name = None
        self.surname = None
        self.prev_surname = None
        self.id = None
        self.sex = None

        self.couple_id = None
        self.parent_couple_id = None
        self.parents = None

        for attr_name, value in data.items():
            if hasattr(self, attr_name):
                setattr(self, attr_name, value)
            else:
                logger.warning('Unexpected field {}={}'.format(attr_name, value))

    def sex_step(self):
        return -1 if self.sex == 'male' else 1

    def steps(self):
        edges = []
        if self.couple_id:
            edges.append((self.couple_id, (0, self.sex_step())))
        if self.parent_couple_id:
            edges.append((self.parent_couple_id, (-1, 0)))
        return edges

    @property
    def label(self):
        return '{} {}'.format(self.name, self.surname)
