from abc import abstractmethod, ABC


class Node(ABC):
    @abstractmethod
    def edges(self):
        return []
    