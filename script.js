const noteInput = document.getElementById('noteInput');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
const noteList = document.getElementById('noteList');
const boldButton = document.getElementById('boldButton');
const italicButton = document.getElementById('italicButton');
const ulButton = document.getElementById('ulButton');
const olButton = document.getElementById('olButton');
const h1Button = document.getElementById('h1Button');
const searchInput = document.getElementById('searchInput');
const wordCount = document.getElementById('wordCount');
const printPreviewButton = document.getElementById('printPreviewButton');
const printPreview = document.getElementById('printPreview');
const copyButton = document.getElementById('copyButton');
const categoryColor = document.getElementById('categoryColor');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let pinnedNotes = JSON.parse(localStorage.getItem('pinnedNotes')) || [];
let noteColors = JSON.parse(localStorage.getItem('noteColors')) || {};
let editingIndex = null;
let history = [];
let historyIndex = -1;

function updateWordCount() {
    const text = noteInput.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `Word Count: ${words}`;
}

function saveToHistory() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(noteInput.innerHTML);
    historyIndex++;
    if (history.length > 20) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        noteInput.innerHTML = history[historyIndex];
        updateWordCount();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        noteInput.innerHTML = history[historyIndex];
        updateWordCount();
    }
}

function copyToClipboard() {
    const content = noteInput.innerHTML;
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = content;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    try {
        document.execCommand('copy');
        alert('Content copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy content');
    }
    document.body.removeChild(tempTextarea);
}

// Helper function to determine where to drop the note
function getTargetIndex(e) {
    const listItems = noteList.querySelectorAll('li');
    for (let i = 0; i < listItems.length; i++) {
        const rect = listItems[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
            return i;
        }
    }
    return listItems.length;
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
            if (noteColors[index]) li.style.backgroundColor = noteColors[index];

            // Create span for note content
            const span = document.createElement('span');
            span.innerHTML = note;
            li.appendChild(span);

            // Create pin button
            const pinButton = document.createElement('button');
            pinButton.className = 'pin-button';
            pinButton.textContent = pinnedNotes.includes(note) ? 'Unpin' : 'Pin';
            pinButton.onclick = () => togglePin(index);
            pinButton.draggable = false; // Prevent buttons from triggering drag
            li.appendChild(pinButton);

            // Create edit button
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Edit';
            editButton.onclick = () => editNote(index);
            editButton.draggable = false;
            li.appendChild(editButton);

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteNote(index);
            deleteButton.draggable = false;
            li.appendChild(deleteButton);

            // Make the list item draggable
            li.draggable = true;
            li.addEventListener('dragstart', function (e) {
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', index);
            });
            li.addEventListener('dragend', function () {
                this.classList.remove('dragging');
            });

            noteList.appendChild(li);
        }
    });
    const draft = localStorage.getItem('draft');
    if (draft && editingIndex === null) {
        noteInput.innerHTML = draft;
        history = [draft];
        historyIndex = 0;
    }
    updateWordCount();
}

// Allow dropping by preventing default behavior
noteList.addEventListener('dragover', function (e) {
    e.preventDefault();
});

// Handle the drop event to reorder notes
noteList.addEventListener('drop', function (e) {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const targetIndex = getTargetIndex(e);
    const P = pinnedNotes.length;
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];

    if (draggedIndex < P && targetIndex <= P) {
        // Reorder within pinned notes
        const note = pinnedNotes.splice(draggedIndex, 1)[0];
        pinnedNotes.splice(targetIndex, 0, note);
        localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    } else if (draggedIndex >= P && targetIndex >= P) {
        // Reorder within unpinned notes
        const unpinnedNotes = notes.filter(note => !pinnedNotes.includes(note));
        const draggedNote = unpinnedNotes[draggedIndex - P];
        unpinnedNotes.splice(draggedIndex - P, 1);
        unpinnedNotes.splice(targetIndex - P, 0, draggedNote);
        // Reconstruct the notes array
        const pinnedInNotes = notes.filter(note => pinnedNotes.includes(note));
        notes = [...pinnedInNotes, ...unpinnedNotes];
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    // No action if dragged between sections (e.g., pinned to unpinned)
    loadNotes();
});

saveButton.addEventListener('click', function () {
    const noteText = noteInput.innerHTML.trim();
    const selectedColor = categoryColor.value;
    if (noteText && noteText !== '<br>') {
        if (editingIndex !== null) {
            const isPinned = pinnedNotes.includes(notes[editingIndex]);
            notes[editingIndex] = noteText;
            if (selectedColor) noteColors[editingIndex] = selectedColor;
            else delete noteColors[editingIndex];
            if (isPinned) {
                pinnedNotes[pinnedNotes.indexOf(notes[editingIndex])] = noteText;
            }
            editingIndex = null;
            saveButton.textContent = 'Add Note';
        } else {
            notes.push(noteText);
            if (selectedColor) noteColors[notes.length - 1] = selectedColor;
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
        localStorage.setItem('noteColors', JSON.stringify(noteColors));
        localStorage.removeItem('draft');
        noteInput.innerHTML = '';
        categoryColor.value = '';
        history = [];
        historyIndex = -1;
        loadNotes();
    }
});

clearButton.addEventListener('click', function () {
    noteInput.innerHTML = '';
    categoryColor.value = '';
    localStorage.removeItem('draft');
    history = [];
    historyIndex = -1;
    if (editingIndex !== null) {
        editingIndex = null;
        saveButton.textContent = 'Add Note';
    }
    updateWordCount();
});

copyButton.addEventListener('click', copyToClipboard);

function deleteNote(index) {
    const noteToDelete = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))][index];
    notes = notes.filter(note => note !== noteToDelete);
    pinnedNotes = pinnedNotes.filter(note => note !== noteToDelete);
    delete noteColors[index];
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    localStorage.setItem('noteColors', JSON.stringify(noteColors));
    loadNotes();
}

function editNote(index) {
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];
    noteInput.innerHTML = allNotes[index];
    editingIndex = notes.indexOf(allNotes[index]);
    categoryColor.value = noteColors[editingIndex] || '';
    saveButton.textContent = 'Update Note';
    localStorage.setItem('draft', noteInput.innerHTML);
    history = [allNotes[index]];
    historyIndex = 0;
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
    saveToHistory();
    updateWordCount();
});

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
    }
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

h1Button.addEventListener('click', function () {
    document.execCommand('formatBlock', false, 'h1');
    noteInput.focus();
});

printPreviewButton.addEventListener('click', function () {
    const allNotes = [...pinnedNotes, ...notes.filter(note => !pinnedNotes.includes(note))];
    printPreview.innerHTML = '<div class="print-preview-content">' + allNotes.join('<hr>') + '</div>';
    printPreview.classList.remove('hidden');
    printPreview.addEventListener('click', (e) => {
        if (e.target === printPreview) printPreview.classList.add('hidden');
    });
});

searchInput.addEventListener('input', loadNotes);

window.onload = loadNotes;