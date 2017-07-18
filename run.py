import json

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

    for layer_id, node_list in data.layers.items():
        for x, node_id in enumerate(node_list):
            node = data.nodes[node_id]
            graph['nodes'].append(dict(
                id=node.id,
                label=node.label.replace(' ', '\n'),
                type='square',
                x=x,
                y=layer_id,
                color=node.color,
                size=node.size
            ))

    for edge_id, (src, dst, _) in enumerate(data.walk()):
        graph['edges'].append(dict(
            id='edge_{}'.format(edge_id),
            source=src,
            target=dst
        ))

    with open(GRAPH_JSON, 'w') as f:
        json.dump(graph, f)


if __name__ == '__main__':
    main()
