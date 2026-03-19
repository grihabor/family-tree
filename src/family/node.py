from family.person import Person, PersonId
from family.couple import Couple, CoupleId


NodeId = PersonId | CoupleId
Node = Person | Couple
