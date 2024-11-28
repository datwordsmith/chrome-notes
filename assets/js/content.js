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
    try {
      let notes = [];
      try {
        notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
      } catch (e) {
        console.error('Error parsing stored notes:', e);
        notes = [];
      }

      const noteData = {
        text: note,
        timestamp: new Date().toLocaleString(),
        created: Date.now()
      };
      notes.unshift(noteData);
      localStorage.setItem('quickNotes', JSON.stringify(notes));
      console.log('Note saved successfully:', noteData);
    } catch (e) {
      console.error('Error saving note:', e);
    }
  }

  // Delete a single note
  function deleteNote(index) {
    try {
      let notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
      notes.splice(index, 1);
      localStorage.setItem('quickNotes', JSON.stringify(notes));
      displayNotes();
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  }

  // Delete all notes
  function deleteAllNotes() {
    try {
      localStorage.setItem('quickNotes', JSON.stringify([]));
      displayNotes();
    } catch (e) {
      console.error('Error deleting all notes:', e);
    }
  }

  // Display notes from localStorage
  function displayNotes() {
    try {
      let notes = [];
      try {
        notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
      } catch (e) {
        console.error('Error parsing stored notes:', e);
        notes = [];
      }

      notesList.innerHTML = '';
      
      // Add Delete All button if there are notes
      if (notes.length > 0) {
        const deleteAllContainer = document.createElement('div');
        deleteAllContainer.className = 'mb-1 d-flex justify-content-end';
        deleteAllContainer.innerHTML = `
          <button class="btn btn-link" id="deleteAllBtn"
              data-bs-toggle="tooltip"
              data-bs-placement="left" 
              title="Delete all saved notes"><small><small>
              Delete All</small></small>
          </button>
        `;
        notesList.appendChild(deleteAllContainer);
        
        // Add Delete All event listener
        document.getElementById('deleteAllBtn').addEventListener('click', function() {
          if (confirm('Are you sure you want to delete all notes?')) {
            deleteAllNotes();
          }
        });
      }

      notes.forEach((note, index) => {
        if (!note || typeof note.text !== 'string') {
          console.error('Invalid note object at index', index, note);
          return;
        }
      
        const noteItem = document.createElement('li');
        noteItem.className = 'list-group-item';
        const truncated = note.text.length > 40 ? note.text.slice(0, 40) + '...' : note.text;
        noteItem.innerHTML = `
          ${truncated}
          <span class="float-end">
            <a href="#" 
               data-index="${index}" 
               class="read-more-link btn btn-info btn-sm text-white" 
               data-bs-toggle="tooltip" 
               data-bs-placement="top" 
               title="Read full note"><i class="bi bi-book"></i></a>
            <button class="btn btn-danger btn-sm delete-note" 
                    data-index="${index}"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    title="Delete this note">
              <i class="bi bi-trash"></i>
            </button>
          </span>          
          <br>
          <small class="fw-bold">${note.timestamp || 'No date'}</small>
        `;
        notesList.appendChild(noteItem);
      });
      

      // Add event listeners for read more links
      document.querySelectorAll('.read-more-link').forEach(link => {
        link.addEventListener('click', function (event) {
          event.preventDefault();
          try {
            const index = parseInt(event.target.closest('.read-more-link').getAttribute('data-index')); // Ensure correct element is targeted
            if (isNaN(index)) {
              console.error('Invalid data-index attribute:', index);
              return;
            }
            const notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
            const fullNote = notes[index];
      
            if (!fullNote || typeof fullNote.text !== 'string') {
              console.error('Invalid note data for index:', index);
              return;
            }
      
            // Set full note text
            document.getElementById('full-note').textContent = fullNote.text;
      
            // Set timestamp
            const timestampElement = document.getElementById('note-timestamp');
            timestampElement.textContent = `Created on: ${fullNote.timestamp || 'Unknown date'}`;
      
            // Show offcanvas
            const offcanvasElement = document.getElementById('offcanvasRight');
            const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
            offcanvas.show();
          } catch (e) {
            console.error('Error showing full note:', e);
          }
        });
      });
      

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-note').forEach(button => {
        button.addEventListener('click', function(event) {
          const index = parseInt(event.target.closest('.delete-note').getAttribute('data-index')); // Use closest to ensure correct element
          if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(index);
          }
        });
      });


    } catch (e) {
      console.error('Error displaying notes:', e);
    }
  }

  // Load notes on page load
  displayNotes();

  // Close the popup
  const toggleSidebarButton = document.getElementById('toggleSidebar');
  toggleSidebarButton.addEventListener('click', () => {
    window.close();
  });
});