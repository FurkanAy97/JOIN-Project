let letters = [];
let contactsByLetter = [];
let remoteContactsAsJSON;

/**
 * Initializes the contact list by fetching remote contacts, parsing them,
 * and organizing them by their first letters.
 * @returns {Promise<void>}
 */
async function initContactList() {
  checkifLoggedIn()
  let res = await getItem("contactsRemote");
  remoteContactsAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));
  emptyContent();
  pushInitials();
  renderContactList();
}

function pushInitials() {
  for (let i = 0; i < remoteContactsAsJSON.length; i++) {
    const contact = remoteContactsAsJSON[i];
    let name = contact.name;
    let firstLetter = name.charAt(0);
    if (!letters.includes(firstLetter)) {
      letters.push(firstLetter);
    }
    if (!contactsByLetter[firstLetter]) {
      contactsByLetter[firstLetter] = [];
    }
    contactsByLetter[firstLetter].push(contact);
  }
}

/**
 * Empties the content of the contact list, resetting the letters and contactsByLetter arrays,
 * and clearing the inner HTML of the contactList element.
 * @returns {void}
 */
function emptyContent() {
  letters = [];
  contactsByLetter = [];
  document.getElementById("contactList").innerHTML = "";
}

/**
 * Renders the contact list on the web page using the organized contacts data.
 * Invokes `renderSelectContactHTML()` when a contact is selected.
 */
function renderContactList() {
  for (let i = 0; i < letters.length; i++) {
    let letter = letters[i];
    let contactsWithLetter = contactsByLetter[letter];
    document.getElementById(
      "contactList"
    ).innerHTML += `<div id="${letter}" ><h3 class="letterHeader" >${letter}</h3></div>`;

    displayContacts(contactsWithLetter, letter, i);
  }
}

/**
 * Displays the contacts with the given letter, adding their HTML representation
 * to the appropriate section on the web page.
 *
 * @param {Array} contactsWithLetter - An array of contacts with the same starting letter.
 * @param {string} letter - The starting letter of the contacts.
 * @param {number} i - Index of the current iteration.
 */
function displayContacts(contactsWithLetter, letter, i) {
  for (let j = 0; j < contactsWithLetter.length; j++) {
    let contact = contactsWithLetter[j];
    let name = contact.name;
    let initials = getInitials(name);
    let email = contact.email;
    let color = contact.color;
    document.getElementById(`${letter}`).innerHTML += addContactsHTML(i, j, color, initials, name, email);
  }
}

/**
 * Generates the HTML code for a single contact entry.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 * @param {string} color - Contact's color.
 * @param {string} initials - Initials of the contact's name.
 * @param {string} name - Contact's name.
 * @param {string} email - Contact's email.
 * @returns {string} The HTML code representing a single contact.
 */
function addContactsHTML(i, j, color, initials, name, email) {
  return `
    <div id='singleContact${i}-${j}' class="singleContact" onclick="selectContact(${i},${j})">
      <div style="background-color:${color}" class="singleContactInitials"> ${initials}</div>
      <div class="singleContactName">
      <h3>${name}</h3>
      <p>${email}</p>
      </div>
    </div>
    `;
}

/**
 * Selects a contact and displays its information in the container next to it.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 */
function selectContact(i, j) {
  //select a contact to display further information in container next to it
  let elem = document.querySelectorAll(".singleContact");
  for (let k = 0; k < elem.length; k++) {
    elem[k].classList.remove("selectedContact");
  }
  document.getElementById(`singleContact${i}-${j}`).classList.add("selectedContact");
  changeMobileView();
  document.getElementById("contactsMid").innerHTML = renderSelectContactHTML(i, j);
}

/**
 * Renders the HTML representation of a selected contact's details.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 * @returns {string} The HTML code representing the selected contact's details.
 */
function renderSelectContactHTML(i, j) {
  let contact = contactsByLetter[letters[i]][j];
  let name = contact.name;
  let email = contact.email;
  let phone = contact.phone;
  let initials = getInitials(name);
  return `
  <img id="arrowBack" onclick="exitContact()" class="arrowBack hideArrow" src="assets/icons/arrow-left-black.png">
  <div class="contact-name">
    <div id="emptyInitial">
      <div  style="background-color:${contact.color}" class="contact-initials">
        ${initials}
      </div>
    </div>
    <div>
      <h1 id="emptyName" >${name}</h1>
      
    </div>
  </div>
  <div class="contact-info">
    <div class="contact-info-edit">
      <p>Contact Information</p>
      <div class="edit-contact">
        <img src="assets/icons/pencil.small.png" />
        <p onclick="openEditContact(${i}, ${j})">&nbsp; Edit Contact</p>
      </div>
    </div>
    <h3>Email</h3>
    <p id="emptyEmail" >${email}</p>
    <h3>Phone</h3>
    <p id="emptyPhone" >${phone}</p>
  </div>`;
}

/**
 * Adds a new contact to the contact list.
 * Retrieves the contact information from the input fields.
 * @returns {Promise<void>}
 */
async function addContact() {
  let name = document.getElementById("newContactName");
  let email = document.getElementById("newContactEmail");
  let phone = document.getElementById("newContactPhone");
  let randomNumber = Math.floor(Math.random() * nameColor.length);

  pushNewContact(name, email, phone, randomNumber);
  await setItem("contactsRemote", remoteContactsAsJSON);
  closeContactWindow(name, email, phone);
}

/**
 * Pushes a new contact object to the remote contacts array.
 *
 * @param {HTMLInputElement} name - The input element for contact name.
 * @param {HTMLInputElement} email - The input element for contact email.
 * @param {HTMLInputElement} phone - The input element for contact phone.
 * @param {number} randomNumber - A random number used to select a color for the contact.
 */
function pushNewContact(name, email, phone, randomNumber) {
  let newContact = {
    name: name.value.charAt(0).toUpperCase() + name.value.slice(1),
    email: email.value,
    phone: phone.value,
    color: nameColor[randomNumber],
  };
  remoteContactsAsJSON.push(newContact);
}

/**
 * Closes the contact input window and performs related cleanup actions.
 *
 * @param {HTMLInputElement} name - The input element for contact name.
 * @param {HTMLInputElement} email - The input element for contact email.
 * @param {HTMLInputElement} phone - The input element for contact phone.
 */
function closeContactWindow(name, email, phone) {
  name.value = "";
  email.value = "";
  phone.value = "";
  contactPopup("new");
  toggleNewContact();
  initContactList();
}

/**
 * Opens and closes the overlay to add a new contact.
 */
function toggleNewContact() {
  const addContactsOverlay = document.getElementById(`addContactsOverlay`);
  addContactsOverlay.classList.toggle("d-none");
}

/**
 * Opens the overlay to edit a contact.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 */
function openEditContact(i, j) {
  document.getElementById(`editContactsOverlay`).classList.remove("d-none");
  document.getElementById("editContactsOverlay").innerHTML = createEditHTML(i, j);
  let editName = document.getElementById("editName");
  let editMail = document.getElementById("editMail");
  let editPhone = document.getElementById("editPhone");
  let contact = contactsByLetter[letters[i]][j];
  let initials = getInitials(contact.name);
  editName.value = contact.name;
  editMail.value = contact.email;
  editPhone.value = contact.phone;
  document.getElementById("editImage").innerHTML = `
    <div style="background-color:${contact.color}" class="contactImage editInitials">
      ${initials}
    </div>`;
}

/**
 * Creates the HTML code for the edit contact overlay.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 * @returns {string} The HTML code for the edit contact overlay.
 */
function createEditHTML(i, j) {
  return /*html*/ ` <div class="addContact">
  <div class="addContactLeft">
    <img src="assets/icons/logo-white-blue.png" />
    <h1>Edit contact</h1>
    <p>Tasks are better with a team</p>
    <div class="blueLine"></div>
  </div>
  <div class="addContactRight editContactRight">
    <div onclick="closeEditContact()" class="x-mark">
      x
    </div>
    <form class="editForm" onsubmit="event.preventDefault(), saveContact(${i}, ${j}), contactPopup('edit') ">
      <div class="createContactContainer">
        <div id="editImage">
          <img class="contactImage" src="assets/icons/add_contact.png" />
        </div>
        <div class="contactInputContainer">
          <input
          required
            id="editName"
            class="addContactInput contactName"
            placeholder="Name"
            type="name" 
          />
          <input
          required
            id="editMail"
            class="addContactInput contactEmail"
            placeholder="Email"
            type="email" 
          />
          <input
          required
            id="editPhone"
            class="addContactInput contactPhone"
            placeholder="Phone"
            type="number" 
          />
        </div>
      </div>
        <div class="addContactBtn">
          <button type="button" onclick="deleteContact(${i}, ${j}), exitContact()" class="cancel-btn">Delete</button>
          <button type="submit" class="create-contact-btn">
            Save
          </button>
        </div>
      </div>
    </form>
  </div>`;
}

/**
 * Closes the overlay for editing a contact.
 */
function closeEditContact() {
  document.getElementById(`editContactsOverlay`).classList.add("d-none");
}

/**
 * Saves the changes made to a contact and updates the contact list.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 * @returns {Promise<void>}
 */
async function saveContact(i, j) {
  let editName = document.getElementById("editName").value;
  let editMail = document.getElementById("editMail").value;
  let editPhone = document.getElementById("editPhone").value;
  let contact = contactsByLetter[letters[i]][j];
  contact.name = editName;
  contact.email = editMail;
  contact.phone = editPhone;
  updateLocalStorageContacts(contact);
  document.getElementById("contactsMid").innerHTML = "";
  initContactList();
  closeEditContact();
}

/**
 * Updates the local storage with modified contact data.
 *
 * @param {Object} contact - The contact object with updated information.
 * @returns {Promise<void>}
 */
async function updateLocalStorageContacts(contact) {
  remoteContactsAsJSON.name = contact.name;
  remoteContactsAsJSON.email = contact.email;
  remoteContactsAsJSON.phone = contact.phone;
  await setItem("contactsRemote", remoteContactsAsJSON);
}

/**
 * Deletes a contact from the contact list and updates the contact list.
 * @param {number} i - Index of the letter group the contact belongs to.
 * @param {number} j - Index of the contact within the letter group.
 * @returns {Promise<void>}
 */
async function deleteContact(i, j) {
  let editName = document.getElementById("editName");
  let editMail = document.getElementById("editMail");
  let editPhone = document.getElementById("editPhone");
  let contact = contactsByLetter[letters[i]][j];
  let contactIndex = remoteContactsAsJSON.indexOf(contact);
  contactsByLetter[letters[i]].splice(j, 1);
  remoteContactsAsJSON.splice(contactIndex, 1);
  await setItem("contactsRemote", remoteContactsAsJSON);
  emptyEditFields(editName, editMail, editPhone);
  initContactList();
  closeEditContact();
}

/**
 * Empties the edit fields for contact information.
 *
 * @param {HTMLInputElement} editName - The input element for contact name.
 * @param {HTMLInputElement} editMail - The input element for contact email.
 * @param {HTMLInputElement} editPhone - The input element for contact phone.
 */
function emptyEditFields(editName, editMail, editPhone) {
  editName.value = "";
  editMail.value = "";
  editPhone.value = "";
  document.getElementById("contactsMid").innerHTML = "";
}

/**
 * Adjusts the view for mobile devices when a contact is selected.
 */
function changeMobileView() {
  document.getElementById("newContactBtn").classList.add("hideMobile");
  document.getElementById("contactsRight").classList.add("contactInfoMobile");
  document.getElementById("contactList").classList.add("hideMobile");
}

/**
 * Exits the contact details view and goes back to the contact list view.
 */
function exitContact() {
  document.getElementById("contactsRight").classList.remove("contactInfoMobile");
  document.getElementById("contactList").classList.remove("hideMobile");
  document.getElementById("newContactBtn").classList.remove("hideMobile");
  document.getElementById("arrowBack").classList.add("hideMobile");
}

//----------------contact successfully created/edited ---------------//
/**
 * Displays a popup message to indicate successful contact creation or edit.
 * @param {string} change - The type of change: 'new' or 'edit'.
 */
function contactPopup(change) {
  let success = document.getElementById("changedContact");

  success.style.display = "block";
  if (change == "new") {
    success.innerHTML = "Contact successfully created";
  } else {
    success.innerHTML = "Contact successfully edited";
  }
  setTimeout(function () {
    success.style.display = "none";
  }, 2000);
}
//----------------contact successfully created/edited ---------------//
