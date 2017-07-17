
class Couple:
    def __init__(self, parents):
        assert len(parents) == 2
        self.parents = parents if parents[0] < parents[1] else parents[::-1]
        self.children = []
        self.id = '_'.join(self.parents)

    def __repr__(self):
        return '<{} id={} children={}>'.format(
            self.__class__.__name__, self.id, tuple(self.children)
        )
