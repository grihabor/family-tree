import json
import random
from typing import Dict

import itertools

from collections import defaultdict

import logging

from family.couple import Couple
from family.person import Person

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Layer(list):
    pass


def longest_layer_id(layers):
    return max(layers, key=lambda x: len(layers[x]))


def shift_to_middle(nodes, layers):
    longest_layer = layers[longest_layer_id(layers)]
    for layer_id, layer in layers.items():
        # TODO: continue here
        pass

    return layers


def apply_coords(nodes, layers):
    def set_node_x_coord(node_to_insert, calculated_x, layer_id):
        layer_to_insert_to = layers[layer_id]

        def _set_node_x_coord(node, x, layer):
            if not hasattr(layer, 'by_coord'):
                layer.by_coord = {}
            if x not in layer.by_coord:
                layer.by_coord[x] = node.id
                return

            # Shift nodes until everything is ok

            direction = random.randint(0, 1)
            if direction == 0:
                direction = -1

            while True:
                next_node = nodes[layer.by_coord[x]]
                next_x = x + direction
                if next_x not in layer.by_coord:
                    # if next_x is empty
                    layer.by_coord[next_x] = next_node.id
                    layer.by_coord[x] = node.id
                    return

                temp_node = nodes[layer.by_coord[x]]
                layer.by_coord[x] = node.id
                node = temp_node
                x = next_x

        _set_node_x_coord(node_to_insert, calculated_x, layer_to_insert_to)
        for calculated_x, node_id_ in layer_to_insert_to.by_coord.items():
            nodes[node_id_].x = calculated_x

    longest_layer = layers[longest_layer_id(layers)]
    for x, node_id in enumerate(longest_layer):
        node = nodes[node_id]
        node.x = x
        node.y = 0

    start_node = nodes[longest_layer[0]]
    for src, dst, layer_step in walk_nodes(nodes, start_node=start_node):
        src_node = nodes[src]
        assert src_node.x is not None
        assert src_node.y is not None
        dst_node = nodes[dst]
        if dst_node.y is None:
            dst_node.y = src_node.y + layer_step[0]

        layer = dst_node.layer
        if dst_node.x is None:
            set_node_x_coord(dst_node, src_node.x + layer_step[1], layer)


def _persons_dict(data) -> Dict[int, Person]:
    persons = {}

    for obj in data:
        person = Person(obj)
        persons[person.id] = person
    return persons


def _couples_dict(persons) -> Dict[int, Couple]:
    couples = {}
    for person in persons.values():
        if person.parents is None:
            continue

        """ couple -> parents """
        couple = Couple([persons[parent_id] for parent_id in person.parents])
        if couple.id not in couples:
            couples[couple.id] = couple
        else:
            couple = couples[couple.id]

        """ couple -> child """
        couple.children.append(person.id)
        """ couple <- child """
        person.parent_couple_id = couple.id

        """ couple <- parents """
        for parent_id in couple.parents:
            persons[parent_id].couple_id = couple.id
    return couples


def walk_nodes(nodes, *, start_node=None):
    """DFS algorithm"""

    node = next(iter(nodes.values())) if start_node is None else start_node
    path = [None]
    visited = {node.id}

    while True:
        next_node = None
        for next_node_id, layer_step in node.steps():
            if next_node_id not in visited:
                next_node = nodes[next_node_id]
                visited.add(next_node.id)
                path.append(node.id)
                yield node.id, next_node.id, layer_step
                break
        if next_node is None:
            next_node_id = path.pop()
            if next_node_id is None:
                break
            next_node = nodes[next_node_id]
        node = next_node


def _layers_dict(nodes, *, start_node=None):
    layers = defaultdict(Layer)
    for node_id, next_node_id, (layer_step_y, layer_step_x) in walk_nodes(nodes, start_node=start_node):
        node = nodes[node_id]
        next_node = nodes[next_node_id]

        if next_node.layer is not None:
            raise RuntimeError('Layer for {} already set'.format(next_node))

        if node.layer is None:
            """Initialize first node"""
            node.layer = 0
            layers[0].append(node.id)

        next_node_layer = node.layer + layer_step_y
        next_node.layer = next_node_layer
        if layer_step_x >= 0:
            layers[next_node_layer].append(next_node.id)
        else:
            layers[next_node_layer].insert(
                len(layers[next_node_layer]) - 1,
                next_node.id
            )

    return layers


def clear_nodes_layer(nodes):
    for node in nodes.values():
        node.layer = None


def ordered_nodes(nodes_to_order, nodes):
    """Order node layer for better layout"""
    groups = {}
    ordered = Layer()
    for node_id in nodes_to_order:
        node = nodes[node_id]
        if type(node) == Couple:
            """groups[couple] -> parents"""
            groups[node.id] = node.parents
            """groups[parents] -> couple"""
            groups[node.parents[0]] = node.id
            groups[node.parents[1]] = node.id

    for node_id in nodes_to_order:
        node = nodes[node_id]
        if node.id not in groups:
            ordered.append(node_id)
        else:
            if node_id in ordered:
                """Already added"""
                continue

            if type(node) == Person:
                node = nodes[node.couple_id]

            """type(node) is guaranteed to be Couple"""
            ordered.append(node.parents[0])
            ordered.append(node.id)
            ordered.append(node.parents[1])

    return ordered


def guarantee_layers_nice_placement(nodes, layers):
    # TODO: continue here
    return layers


def ordered_layers(layers, nodes):
    """Move nodes around inside each layer for better layout"""
    ordered_layers = {}
    for layer_id, layer_nodes in layers.items():
        ordered_layers[layer_id] = ordered_nodes(layer_nodes, nodes)

    return ordered_layers


class Data:
    def __init__(self, filename):
        with open(filename, 'r') as f:
            data = json.load(f)

        self.persons = _persons_dict(data)
        self.couples = _couples_dict(self.persons)
        self.nodes = {node.id: node for node in itertools.chain(
            self.persons.values(), self.couples.values()
        )}
        layers = _layers_dict(self.nodes)  # guarantee_layers_nice_placement(self.nodes)
        layers = ordered_layers(layers, self.nodes)
        apply_coords(self.nodes, layers)
        layers = guarantee_layers_nice_placement(self.nodes, layers)
        layers = shift_to_middle(self.nodes, layers)
        self.layers = layers

    def walk(self):
        yield from walk_nodes(self.nodes)
