
const noteInput = document.getElementById('noteInput');
const saveButton = document.getElementById('saveButton');

window.onload = function () {
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteInput.value = savedNote;
    }
};


saveButton.addEventListener('click', function () {
    const noteText = noteInput.value;
    localStorage.setItem('note', noteText);
    alert('Note saved!');
});