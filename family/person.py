import logging

from family.colors import COLOR_FEMALE_NODE, COLOR_MALE_NODE
from .node import Node

logger = logging.getLogger(__name__)


class Person(Node):
    def __init__(self, data: dict):
        assert 'id' in data
        
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
        
        super().__init__(
            data['id'],
            color=COLOR_FEMALE_NODE if self.sex == 'female' else COLOR_FEMALE_NODE,
            size=3
        )


    def sex_step(self):
        return -1 if self.sex == 'male' else 1

    def steps(self):
        edges = []
        if self.parent_couple_id:
            edges.append((self.parent_couple_id, (-1, 0)))
        if self.couple_id:
            edges.append((self.couple_id, (0, self.sex_step())))
        # Order is important for better visualization
        return edges

    @property
    def label(self):
        return '{} {}'.format(self.name, self.surname)
