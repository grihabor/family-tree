import logging
from dataclasses import dataclass
from typing import Literal, NewType, TYPE_CHECKING, Union

from family.colors import COLOR_FEMALE_NODE, COLOR_MALE_NODE
import msgspec

if TYPE_CHECKING:
    from family.couple import CoupleId

logger = logging.getLogger(__name__)


PersonId = NewType("PersonId", int)


class RawPerson(msgspec.Struct):
    id: PersonId
    sex: Literal["male", "female"]
    name: str | None = None
    surname: str | None = None
    prev_surname: str | None = None
    parents: list[PersonId] | None = None


@dataclass
class Person:
    id: PersonId
    name: str
    sex: Literal["male", "female"]
    surname: str | None = None
    prev_surname: str | None = None
    parents: tuple[int, int] | tuple[int] | None = None
    size: int = 3
    couple_id: Union["CoupleId", None] = None
    parent_couple_id: Union["CoupleId", None] = None

    x: int | None = None
    y: int | None = None
    layer: int | None = None

    @property
    def color(self) -> str:
        return COLOR_FEMALE_NODE if self.sex == "female" else COLOR_MALE_NODE

    def sex_step(self):
        return -1 if self.sex == "male" else 1

    @property
    def label(self):
        return "{} {}".format(self.name, self.surname)

    def steps(self) -> list[tuple["CoupleId", tuple[int, int]]]:
        edges = []
        if self.parent_couple_id:
            edges.append((self.parent_couple_id, (-1, 0)))
        if self.couple_id:
            edges.append((self.couple_id, (0, self.sex_step())))
        # Order is important for better visualization
        return edges
