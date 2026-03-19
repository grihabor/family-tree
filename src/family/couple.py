from typing import List, NewType

from family.person import Person, PersonId
from family.colors import COLOR_COUPLE_NODE


CoupleId = NewType("CoupleId", str)


class Couple:
    size: int = 1
    color: str = COLOR_COUPLE_NODE

    x: int | None = None
    y: int | None = None
    layer: int | None = None

    def __init__(self, parents: List[Person]):
        assert len(parents) == 2
        self._parents = parents if parents[0].id < parents[1].id else parents[::-1]
        self.parents: list[PersonId] = [parent.id for parent in parents]
        self.children: list[PersonId] = []

    @property
    def id(self) -> CoupleId:
        return CoupleId("_".join(str(id_) for id_ in self.parents))

    def steps(self) -> list[tuple[PersonId, tuple[int, int]]]:
        # Order is important for better visualization
        return [(parent.id, (0, -parent.sex_step())) for parent in self._parents] + [
            (ch, (1, 0)) for ch in self.children
        ]

    @property
    def label(self):
        return ""
