document.addEventListener('DOMContentLoaded', function () {
  const noteForm = document.getElementById('note-form');
  const noteInput = document.getElementById('note');
  const notesList = document.getElementById('notes-list');

  // Handle form submission
  noteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const noteText = noteInput.value.trim();
    if (noteText) {
      saveNoteToStorage(noteText);
      displayNotes();
      noteInput.value = '';
    }
  });

  // Save note to localStorage
  function saveNoteToStorage(note) {
    let notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
    notes.push(note);
    localStorage.setItem('quickNotes', JSON.stringify(notes));
  }

  // Display notes from localStorage
  function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
    notesList.innerHTML = '';
    notes.forEach((note) => {
      const noteItem = document.createElement('li');
      noteItem.className = 'list-group-item';
      noteItem.textContent = note;
      notesList.appendChild(noteItem);
    });
  }

  // Load notes on page load
  displayNotes();

  // Close the popup
  const toggleSidebarButton = document.getElementById('toggleSidebar');
  toggleSidebarButton.addEventListener('click', () => {
    window.close();
  });
});
