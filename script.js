const noteInput = document.getElementById('noteInput');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
const noteList = document.getElementById('noteList');
const boldButton = document.getElementById('boldButton');
const italicButton = document.getElementById('italicButton');
const ulButton = document.getElementById('ulButton');
const olButton = document.getElementById('olButton');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let editingIndex = null;

function loadNotes() {
    noteList.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.className = 'note-item';
        li.innerHTML = `
            <span>${note}</span>
            <button class="edit-button" onclick="editNote(${index})">Edit</button>
            <button onclick="deleteNote(${index})">Delete</button>
        `;
        noteList.appendChild(li);
    });
    const draft = localStorage.getItem('draft');
    if (draft && editingIndex === null) noteInput.innerHTML = draft;
}

saveButton.addEventListener('click', function () {
    const noteText = noteInput.innerHTML.trim();
    if (noteText && noteText !== '<br>') {
        if (editingIndex !== null) {
            notes[editingIndex] = noteText;
            editingIndex = null;
            saveButton.textContent = 'Add Note';
        } else {
            notes.push(noteText);
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.removeItem('draft');
        noteInput.innerHTML = '';
        loadNotes();
    }
});

clearButton.addEventListener('click', function () {
    noteInput.innerHTML = '';
    localStorage.removeItem('draft');
    if (editingIndex !== null) {
        editingIndex = null;
        saveButton.textContent = 'Add Note';
    }
});

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

function editNote(index) {
    noteInput.innerHTML = notes[index];
    editingIndex = index;
    saveButton.textContent = 'Update Note';
    localStorage.setItem('draft', noteInput.innerHTML);
}

noteInput.addEventListener('input', function () {
    localStorage.setItem('draft', noteInput.innerHTML);
});

boldButton.addEventListener('click', function () {
    document.execCommand('bold', false, null);
    noteInput.focus();
});

italicButton.addEventListener('click', function () {
    document.execCommand('italic', false, null);
    noteInput.focus();
});

ulButton.addEventListener('click', function () {
    document.execCommand('insertUnorderedList', false, null);
    noteInput.focus();
});

olButton.addEventListener('click', function () {
    document.execCommand('insertOrderedList', false, null);
    noteInput.focus();
});

window.onload = loadNotes;