from .node import Node


class Couple(Node):
    def __init__(self, parents):
        assert len(parents) == 2
        self.parents = parents if parents[0] < parents[1] else parents[::-1]
        self.children = []
        super().__init__(
            '_'.join(str(id_) for id_ in self.parents),
            color=dict(r=200, g=130, b=100),
            size=1
        )

    def steps(self):
        return [(p, 0) for p in self.parents] + [(ch, 1) for ch in self.children]

    @property
    def label(self):
        return 'children={}'.format(tuple(self.children))


