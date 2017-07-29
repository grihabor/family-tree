from typing import List

from family import Person
from family.colors import COLOR_COUPLE_NODE
from .node import Node


class Couple(Node):
    def __init__(self, parents: List[Person]):
        assert len(parents) == 2
        self._parents = parents if parents[0].id < parents[1].id else parents[::-1]
        self.parents = [parent.id for parent in parents]
        self.children = []
        super().__init__(
            '_'.join(str(id_) for id_ in self.parents),
            color=COLOR_COUPLE_NODE,
            size=1
        )

    def steps(self):
        # Order is important for better visualization
        return [(parent.id, (0, - parent.sex_step())) for parent in self._parents] + [(ch, (1, 0)) for ch in self.children]

    @property
    def label(self):
        return ''


