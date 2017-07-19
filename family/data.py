import json
from typing import Dict

import itertools

from collections import defaultdict

from family.couple import Couple
from family.person import Person


class Data:
    @classmethod
    def _persons_dict(cls, data) -> Dict[int, Person]:
        persons = {}

        for obj in data:
            person = Person(obj)
            persons[person.id] = person
        return persons

    @classmethod
    def _couples_dict(cls, persons) -> Dict[int, Couple]:
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

    def __init__(self, filename):
        with open(filename, 'r') as f:
            data = json.load(f)

        self.persons = self._persons_dict(data)
        self.couples = self._couples_dict(self.persons)
        self.nodes = {
            node.id: node for node in itertools.chain(
                self.persons.values(), self.couples.values()
            )
        }
        self.layers = self._layers_dict(self.nodes)
        self.place_couples()

    def walk(self):
        yield from self.walk_nodes(self.nodes)

    @classmethod
    def walk_nodes(cls, nodes):
        """DFS algorithm"""

        node = next(iter(nodes.values()))
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

    @classmethod
    def _layers_dict(cls, nodes):
        layers = defaultdict(list)
        for node_id, next_node_id, (layer_step_y, layer_step_x) in cls.walk_nodes(nodes):
            node = nodes[node_id]
            next_node = nodes[next_node_id]
            if next_node.layer is None:
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

            else:
                raise RuntimeError('Next node layer must be uninitizlied')

        return layers


    def ordered_nodes(self, nodes):
        """Order node layer for better layout"""
        groups = {}
        ordered = []
        for node_id in nodes:
            node = self.nodes[node_id]
            if type(node) == Couple:
                """groups[couple] -> parents"""
                groups[node.id] = node.parents
                """groups[parents] -> couple"""
                groups[node.parents[0]] = node.id
                groups[node.parents[1]] = node.id

        for node_id in nodes:
            node = self.nodes[node_id]
            if node.id not in groups:
                ordered.append(node_id)
            else:
                if node_id in ordered:
                    """Already added"""
                    continue

                if type(node) == Person:
                    node = self.nodes[node.couple_id]

                """type(node) is guaranteed to be Couple"""
                ordered.append(node.parents[0])
                ordered.append(node.id)
                ordered.append(node.parents[1])

        return ordered

    def place_couples(self):
        """Move nodes around inside each layer for better layout"""
        ordered_layers = {}
        for layer_id, nodes in self.layers.items():
            ordered_layers[layer_id] = self.ordered_nodes(nodes)
        self.layers = ordered_layers
    