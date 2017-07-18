from abc import abstractmethod, ABC
from typing import List, Tuple


class Node(ABC):
    def __init__(self, node_id):
        self.id = node_id

        self.x = None
        self.y = None
        self.layer = None


    @abstractmethod
    def steps(self) -> List[Tuple[int, int]]:
        return []

    def __repr__(self):
        return '<{} id={} label="{}">'.format(
            self.__class__.__name__, self.id, self.label
        )

    @property
    @abstractmethod
    def label(self):
        return ''
