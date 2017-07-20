import json

from family import Person
from family.colors import COLOR_PARENTS_EDGE, COLOR_CHILDREN_EDGE
from family.data import Data
import os

from family.node import Node

DIR_DATA = 'data'
FILE_JSON = os.path.join(DIR_DATA, 'data.json')
# FILE_TEMP = os.path.join(DIR_DATA, 'tmp.gefx')
# FILE_GEFX = os.path.join(DIR_DATA, 'data.gefx')
GRAPH_JSON = os.path.join(DIR_DATA, 'graph.json')

class GraphNode:
    def __init__(self, node: Node):
        self.id = node.id
        self.type = str(type(node))
        self.label = node.label

def main():
    data = Data(FILE_JSON)

    graph = dict(
        nodes=[],
        edges=[],
    )

    layers_layout = False

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
                size=node.size
            ))

    for edge_id, (src, dst, (layer_step_y, _)) in enumerate(data.walk()):
        graph['edges'].append(dict(
            id='edge_{}'.format(edge_id),
            source=src,
            target=dst,
            color=COLOR_PARENTS_EDGE if layer_step_y == 0 else COLOR_CHILDREN_EDGE
        ))

    with open(GRAPH_JSON, 'w') as f:
        json.dump(graph, f)


if __name__ == '__main__':
    main()
