import json

import itertools

from family import Person
from family.colors import COLOR_PARENTS_EDGE, COLOR_CHILDREN_EDGE
from family.data import Data
import os

from family.graph import Graph
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
    graph = Graph.create_from_data(data)

    with open(GRAPH_JSON, 'w') as f:
        json.dump(graph.graph, f)

    for i in itertools.count(0):
        filename = 'data/layers_{}.pkl'.format(i)
        if not os.path.exists(filename):
            break

        data = Data(FILE_JSON, layers_filename=filename)

        graph = Graph.create_from_data(data)

        with open('data/graph_{}.json'.format(i), 'w') as f:
            json.dump(graph.graph, f)

if __name__ == '__main__':
    main()
