const noteInput = document.getElementById('noteInput');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
const noteList = document.getElementById('noteList');
const boldButton = document.getElementById('boldButton');
const italicButton = document.getElementById('italicButton');
const ulButton = document.getElementById('ulButton');
const olButton = document.getElementById('olButton');
const searchInput = document.getElementById('searchInput');
const wordCount = document.getElementById('wordCount');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let pinnedNotes = JSON.parse(localStorage.getItem('pinnedNotes')) || [];
let editingIndex = null;

function updateWordCount() {
    const text = noteInput.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `Word Count: ${words}`;
}

function loadNotes() {
    noteList.innerHTML = '';
    const searchTerm = searchInput.value.toLowerCase();
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];
    allNotes.forEach((note, index) => {
        if (note.toLowerCase().includes(searchTerm)) {
            const li = document.createElement('li');
            li.className = 'note-item';
            if (pinnedNotes.includes(note)) li.classList.add('pinned');
            li.innerHTML = `
                <span>${note}</span>
                <button class="pin-button" onclick="togglePin(${index})">${pinnedNotes.includes(note) ? 'Unpin' : 'Pin'}</button>
                <button class="edit-button" onclick="editNote(${index})">Edit</button>
                <button onclick="deleteNote(${index})">Delete</button>
            `;
            noteList.appendChild(li);
        }
    });
    const draft = localStorage.getItem('draft');
    if (draft && editingIndex === null) noteInput.innerHTML = draft;
    updateWordCount();
}

saveButton.addEventListener('click', function () {
    const noteText = noteInput.innerHTML.trim();
    if (noteText && noteText !== '<br>') {
        if (editingIndex !== null) {
            const isPinned = pinnedNotes.includes(notes[editingIndex]);
            notes[editingIndex] = noteText;
            if (isPinned) {
                pinnedNotes[pinnedNotes.indexOf(notes[editingIndex])] = noteText;
            }
            editingIndex = null;
            saveButton.textContent = 'Add Note';
        } else {
            notes.push(noteText);
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
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
    updateWordCount();
});

function deleteNote(index) {
    const noteToDelete = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))][index];
    notes = notes.filter(note => note !== noteToDelete);
    pinnedNotes = pinnedNotes.filter(note => note !== noteToDelete);
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    loadNotes();
}

function editNote(index) {
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];
    noteInput.innerHTML = allNotes[index];
    editingIndex = notes.indexOf(allNotes[index]);
    saveButton.textContent = 'Update Note';
    localStorage.setItem('draft', noteInput.innerHTML);
    updateWordCount();
}

function togglePin(index) {
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];
    const note = allNotes[index];
    if (pinnedNotes.includes(note)) {
        pinnedNotes = pinnedNotes.filter(n => n !== note);
    } else {
        pinnedNotes.unshift(note);
    }
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    loadNotes();
}

noteInput.addEventListener('input', function () {
    localStorage.setItem('draft', noteInput.innerHTML);
    updateWordCount();
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

searchInput.addEventListener('input', loadNotes);

window.onload = loadNotes;