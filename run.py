from family.data import Data
import networkx as nx
import os

DIR_DATA = 'data'
FILE_JSON = os.path.join(DIR_DATA, 'data.json')
FILE_TEMP = os.path.join(DIR_DATA, 'tmp.gefx')
FILE_GEFX = os.path.join(DIR_DATA, 'data.gefx')


def main():
    data = Data(FILE_JSON)
    g = nx.DiGraph()
    for layer_id, node_list in data.layers.items():
        for x, node_id in enumerate(node_list):
            node = data.nodes[node_id]
            g.add_node(node_id, attr_dict=dict(
                viz=dict(
                    position=dict(x=x, y=layer_id, z=0),
                    color=node.color,
                    size=node.size
                )
            ))
            #g.node[node_id]['viz']['position']['x'] = x
            #g.node[node_id]['viz']['position']['y'] = layer_id
    for src, dst, _ in data.walk():
        g.add_edge(src, dst)
    nx.write_gexf(g, FILE_TEMP)


    with open(FILE_GEFX, 'w') as fw, open(FILE_TEMP, 'r') as fr:
        for line in fr:
            line = line.replace('<ns0:', '<viz:')
            print(line)
            fw.write(line)


if __name__ == '__main__':
    main()
