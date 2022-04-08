var web3;
if (window.ethereum != null) {
  web3 = new Web3(window.ethereum);
  try {
    (async function () {
      await window.web3.currentProvider.enable();
      const addr = await getUserAddress();
      localStorage.setItem("address", btoa(addr));
    })();
  } catch (err) {
    alert("Please do not deny the request");
    userHasProfile = false;
    userLoggedIn = false;
    throw Error("User denied access");
  }
}

const peoplecontract = "0x12439e833EA7DD3B9a7B28952303269CF3739e5c";
const body = document.querySelector(".body");
const initialRoute = "/";
let currentCardIndex = 0;
let people = [];
let accs;
const notfound = `<div class="notfound"><h1>No People are available.</h1></div>`;
const card = `
<div class="card">
<div class="card-img-container">
    <img src="{{IMAGE_LINK}}"
        class="card-img">
</div>
<div class="card-details">
    <h1 class="card-name">{{USER_NAME}}</h1>
    <p class="card-description">{{USER_DESCRIPTION}}</p>
    <span class="card-address">{{USER_ADDRESS}}</span>
</div>
</div>`;
const login = `<div class="notfound"><h1>Please login using your wallet</h1></div>`;
const createprofile = `<div class="login-card"><h1>Create a profile.</h1><div class="input-container">    <p>Your name:</p>    <input type="text" class="nameinput"></div><div class="input-container">    <p>Your Image URL:</p>    <input type="url" class="imageinput"></div><div class="input-container">    <p>Your Description:</p>    <textarea class="descriptioninput"></textarea></div><button type="button" class="createprofile button">Create</button></div>`;
const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_image",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "addPerson",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPeople",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "image",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
        ],
        internalType: "struct People.Person[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "getPerson",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "image",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
        ],
        internalType: "struct People.Person",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function getUserAddress() {
  return (await web3.eth.getAccounts())[0];
}

let userLoggedIn = false;
let userHasProfile = false;

const contract = new web3.eth.Contract(abi, peoplecontract);
// Checking if user is logged in
async function createUser({ username, image, description }) {
  if (userHasProfile) {
    return;
  } else {
    getUserAddress().then((addr) => {
      const transaction = contract.methods.addPerson(
        username,
        image,
        description
      );
      contract.methods
        .addPerson(username, image, description)
        .send({ from: addr })
        .catch((err) => {
          console.error(err.message);
        });
    });
  }
}

function checkUserLogon() {
  let addr = window.localStorage.getItem("address");
  if (addr) {
    addr = atob(addr);
    userLoggedIn = true;
  } else {
    userLoggedIn = false;
  }
}
checkUserLogon();

async function getCurrentUserProfile() {
  const addr = await getUserAddress();
  const person = await contract.methods.getPerson(addr).call();
  return person;
}

// Checking if user has a profile
async function checkUserProfile() {
  let res = false;
  if (!userLoggedIn) {
    userHasProfile = false;
    res = false;
    return res;
  }
  const addr = await getUserAddress();
  const currentUser = await getCurrentUserProfile();
  if (currentUser.addr === addr) {
    return true;
  } else {
    return false;
  }
}

// Getting People
async function getPeople() {
  return await contract.methods.getPeople().call();
}

const init = () => {
  [...body.children].map((child) => {
    if (child.className === initialRoute) {
      document
        .querySelector(`[to="${initialRoute}"]`)
        .classList.add("clicked-elem");
      child.style.display = "block";
    } else {
      child.style.display = "none";
    }
  });
  [...document.querySelectorAll(".navbar-elem")].map((elem) => {
    elem.addEventListener("click", () => {
      const celem = document.querySelector(".clicked-elem");
      if (celem === elem) return;
      else {
        celem.classList.remove("clicked-elem");
        elem.classList.add("clicked-elem");
        const to = elem.getAttribute("to");
        [...body.children].map((child) => {
          if (child.className === to) {
            child.style.display = "block";
          } else {
            child.style.display = "none";
          }
        });
      }
    });
  });
  if (!userLoggedIn) {
    document.getElementsByClassName("/me")[0].innerHTML = "";
    document.getElementsByClassName("/me")[0].innerHTML = login;
  } else {
    checkUserProfile().then((res) => {
      if (res) {
        let mecard = card;
        getCurrentUserProfile().then((res) => {
          mecard = mecard
            .replace("{{IMAGE_LINK}}", res.image)
            .replace("{{USER_NAME}}", res.name)
            .replace("{{USER_DESCRIPTION}}", res.description)
            .replace("{{USER_ADDRESS}}", res.addr);
          document.getElementsByClassName("/me")[0].innerHTML = mecard;
        });
      } else {
        document.getElementsByClassName("/me")[0].innerHTML = createprofile;
        document
          .getElementsByClassName("/me")[0]
          .querySelector(".createprofile")
          .addEventListener("click", (e) => {
            const username = document.querySelector(".nameinput").value;
            const image = document.querySelector(".imageinput").value;
            const description =
              document.querySelector(".descriptioninput").value;
            if (!username || !image || !description) {
              alert("Please fill in all the fields");
            } else {
              createUser({ username, image, description });
            }
          });
      }
    });
    getPeople().then(async (_people, index) => {
      const addr = await getUserAddress();
      [..._people].map((person) => {
        if (person.addr === addr) {
          return;
        }
        let pcard = card;
        people.push(person);
        pcard = pcard
          .replace("{{IMAGE_LINK}}", person.image)
          .replace("{{USER_NAME}}", person.name)
          .replace("{{USER_DESCRIPTION}}", person.description)
          .replace("{{USER_ADDRESS}}", person.addr);
        document.getElementsByClassName("cards-container")[0].innerHTML = pcard;
      });
    });
  }
  verifyButtons();
};
window.addEventListener("DOMContentLoaded", init);

function nextCard() {
  if (currentCardIndex === people.length - 1) {
    return;
  } else {
    currentCardIndex += 1;
    changeCard(currentCardIndex - 1);
  }
}
function prevCard() {
  if (currentCardIndex === 0) {
    return;
  } else {
    currentCardIndex -= 1;
    changeCard(currentCardIndex + 1);
  }
}

function changeCard(index) {
  let person = people[index];
  if (person === undefined) {
    return;
  }
  let pcard = card;
  pcard = pcard
    .replace("{{IMAGE_LINK}}", person.image)
    .replace("{{USER_NAME}}", person.name)
    .replace("{{USER_DESCRIPTION}}", person.description)
    .replace("{{USER_ADDRESS}}", person.addr);

  document.getElementsByClassName("cards-container")[0].innerHTML = pcard;
  dispatchEvent(new Event("oncardchange"));
}

document.querySelector(".next").addEventListener("click", nextCard);
document.querySelector(".prev").addEventListener("click", prevCard);

function verifyButtons() {
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");

  if (currentCardIndex === 0) {
    prev.classList.add("btn-disabled");
  } else {
    prev.classList.remove("btn-disabled");
  }

  if (currentCardIndex === people.length - 1) {
    next.classList.add("btn-disabled");
  } else {
    next.classList.remove("btn-disabled");
  }
}

window.addEventListener("oncardchange", verifyButtons);
