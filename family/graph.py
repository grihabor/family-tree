from family import Person
from family.colors import COLOR_PARENTS_EDGE, COLOR_CHILDREN_EDGE


class Graph:
    def __init__(self, graph):
        assert 'nodes' in graph
        assert 'edges' in graph
        self.graph = graph

    @property
    def nodes(self):
        return self.graph['nodes']

    @property
    def edges(self):
        return self.graph['edges']

    @classmethod
    def create_from_data(cls, data, layers_layout=False):

        graph = dict(
            nodes=[],
            edges=[],
        )

        for layer_id, node_list in data.layers.items():
            for x, node_id in enumerate(node_list):
                node = data.nodes[node_id]
                graph['nodes'].append(dict(
                    id=node.id,
                    label=node.label,
                    type='square' if type(node) == Person else None,
                    x=x if layers_layout else node.x,
                    y=node.layer if layers_layout else node.y,
                    color=node.color,
                    size=node.size,
                    class='other' if type(node) != Person else node.sex,
                ))

        for edge_id, (src, dst, (layer_step_y, _)) in enumerate(data.walk()):
            graph['edges'].append(dict(
                id='edge_{}'.format(edge_id),
                source=src,
                target=dst,
                color=COLOR_PARENTS_EDGE if layer_step_y == 0 else COLOR_CHILDREN_EDGE,
                size=5,
                class='parents' if layer_step_y == 0 else 'children',
            ))

        return Graph(graph)