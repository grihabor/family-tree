import json
from pprint import pprint

from family.data import Data

FILE_DATA = 'data.json'


def main():
    data = Data(FILE_DATA)
    print(data)
    pprint(data.persons)
    pprint(data.couples)

if __name__ == '__main__':
    main()
