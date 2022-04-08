// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract People {
    struct Person {
        string name;
        string image;
        string description;
        address addr;
    }
    Person[] people;

    function addPerson(
        string memory _name,
        string memory _image,
        string memory _description
    ) public {
        people.push(Person(_name, _image, _description, msg.sender));
    }

    function getPeople() public view returns (Person[] memory) {
        return people;
    }

    function getPerson(address _addr) public view returns (Person memory) {
        for (uint256 i = 0; i < people.length; i++) {
            if (people[i].addr == _addr) {
                return people[i];
            }
        }
        return Person("", "", "", 0x0000000000000000000000000000000000000000);
    }
}
