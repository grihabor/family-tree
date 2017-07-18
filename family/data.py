import json
from typing import Dict

import itertools

from collections import defaultdict

from family.couple import Couple
from family.node import Node
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
            couple = Couple(person.parents)
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
        self.layers = self._layers_dict()
    
    def walk(self):

        node = next(iter(self.nodes.values()))
        path = [None]
        visited = {node.id}

        while True:
            next_node = None
            for next_node_id, layer_step in node.steps():
                if next_node_id not in visited:
                    next_node = self.nodes[next_node_id]
                    visited.add(next_node.id)
                    path.append(node.id)
                    yield node.id, next_node.id, layer_step
                    break
            if next_node is None:
                next_node_id = path.pop()
                if next_node_id is None:
                    break
                next_node = self.nodes[next_node_id]
            node = next_node

    def _layers_dict(self):
        layers = defaultdict(list)
        for node_id, next_node_id, layer_step in self.walk():
            node = self.nodes[node_id]
            next_node = self.nodes[next_node_id]
            if next_node.layer is None:
                if node.layer is None:
                    """Initialize first node"""
                    node.layer = 0
                    layers[0].append(node.id)
                next_node_layer = node.layer + layer_step
                next_node.layer = next_node_layer
                layers[next_node_layer].append(next_node.id)
            else:
                raise RuntimeError('Next node layer must be uninitizlied')

        return layers