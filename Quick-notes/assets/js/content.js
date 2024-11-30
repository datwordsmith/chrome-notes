// Constants
const STORAGE_KEY = 'quickNotes';

class MyQuickNotesManager {
  constructor() {
    this.noteForm = document.getElementById('note-form');
    this.noteInput = document.getElementById('note');
    this.notesList = document.getElementById('notes-list');
    this.currentNoteIndex = null;
    this.bindEvents();
    this.displayNotes();
  }

  bindEvents() {
    this.noteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const noteText = this.noteInput.value.trim();
      if (noteText) {
        await this.saveNote(noteText);
        await this.displayNotes();
        this.noteInput.value = '';
      }
    });

    document.getElementById('toggleSidebar')?.addEventListener('click', () => window.close());
  }

  // Storage operations
  async getNotes() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      return result[STORAGE_KEY] || [];
    } catch (e) {
      console.error('Error retrieving notes:', e);
      return [];
    }
  }

  async saveNote(text) {
    try {
      const notes = await this.getNotes();
      notes.unshift({
        text,
        timestamp: new Date().toLocaleString(),
        created: Date.now()
      });
      await chrome.storage.sync.set({ [STORAGE_KEY]: notes });
    } catch (e) {
      console.error('Error saving note:', e);
    }
  }

  async deleteNote(index) {
    try {
      const notes = await this.getNotes();
      notes.splice(index, 1);
      await chrome.storage.sync.set({ [STORAGE_KEY]: notes });
      await this.displayNotes();
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  }

  async deleteAllNotes() {
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: [] });
      await this.displayNotes();
    } catch (e) {
      console.error('Error deleting all notes:', e);
    }
  }

  createDeleteAllButton() {
    const container = document.createElement('div');
    container.className = 'mb-1 d-flex justify-content-end';
    container.innerHTML = `
      <button class="btn btn-link" id="deleteAllBtn"
          data-bs-toggle="tooltip"
          data-bs-placement="left" 
          title="Delete all saved notes">
          <small><small>Delete All</small></small>
      </button>
    `;
    
    container.querySelector('#deleteAllBtn').addEventListener('click', () => {
      // Show the modal popup
      const deleteAllNotesModal = new bootstrap.Modal(document.getElementById('deleteAllNotesModal'));
      deleteAllNotesModal.show();
  
      // Set up the confirm delete all button
      const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
      confirmDeleteAllBtn.onclick = async () => {
        await this.deleteAllNotes();
        deleteAllNotesModal.hide();
      };
    });
  
    return container;
  }
  

  createNoteItem(note, index) {
    if (!note?.text || typeof note.text !== 'string') {
      console.error('Invalid note object:', note);
      return null;
    }

    const noteItem = document.createElement('li');
    noteItem.className = 'list-group-item position-relative';
    noteItem.style.cursor = 'pointer';
    const truncated = note.text.length > 40 ? `${note.text.slice(0, 40)}...` : note.text;
    
    noteItem.innerHTML = `
      <div class="note-content">
        ${truncated}
        <br>
        <small class="fw-bold">${note.timestamp || 'No date'}</small>
      </div>
      <span class="float-end position-absolute" style="right: 1rem; top: 50%; transform: translateY(-50%);">
        <button class="btn btn-danger btn-sm delete-note" 
                data-index="${index}"
                data-bs-toggle="tooltip" 
                data-bs-placement="top" 
                title="Delete this note">
          <i class="bi bi-trash"></i>
        </button>
      </span>
    `;

    this.bindNoteItemEvents(noteItem, index);
    return noteItem;
  }



  bindNoteItemEvents(noteItem, index) {
    const deleteBtn = noteItem.querySelector('.delete-note');
  
    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
  
      // Show the modal popup
      const deleteNoteModal = new bootstrap.Modal(document.getElementById('deleteNoteModal'));
      deleteNoteModal.show();
  
      // Set up the confirm delete button
      const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
      confirmDeleteBtn.onclick = async () => {
        await this.deleteNote(index);
        deleteNoteModal.hide();
      };
    });
  
    noteItem.addEventListener('click', async (event) => {
      if (!event.target.closest('.delete-note')) {
        await this.showFullNote(index);
      }
    });
  }
  

  async showFullNote(index) {
    try {
      const notes = await this.getNotes();
      const note = notes[index];
      
      if (!note?.text) {
        throw new Error('Invalid note data');
      }

      this.currentNoteIndex = index;

      const noteContentElement = document.getElementById('full-note');
      const timestampElement = document.getElementById('note-timestamp');
      const actionsContainer = document.getElementById('note-actions');

      noteContentElement.textContent = note.text;
      timestampElement.textContent = `Created on: ${note.timestamp || 'Unknown date'}`;

      actionsContainer.innerHTML = `
        <button class="btn btn-warning btn-sm text-white" id="editNoteBtn">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
        <button class="btn btn-success btn-sm me-1" id="saveNoteBtn" style="display: none;">
          <i class="bi bi-floppy"></i> Save
        </button>
        <button class="btn btn-secondary btn-sm" id="cancelEditBtn" style="display: none;">
          <i class="bi bi-x-circle"></i> Cancel
        </button>
      `;

      // Bind edit mode events
      this.bindEditModeEvents(noteContentElement, note.text);

      const offcanvasElement = document.getElementById('offcanvasRight');
      const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();      

    } catch (e) {
      console.error('Error showing full note:', e);
    }
  }

  bindEditModeEvents(noteContentElement, originalText) {
    const editBtn = document.getElementById('editNoteBtn');
    const saveBtn = document.getElementById('saveNoteBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    editBtn.addEventListener('click', () => {
      // Enter edit mode
      noteContentElement.contentEditable = true;
      noteContentElement.focus();
      noteContentElement.classList.add('form-control');
      
      // Toggle buttons
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
      cancelBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', async () => {
      const newText = noteContentElement.textContent.trim();
      if (newText) {
        await this.updateNote(this.currentNoteIndex, newText);
        this.exitEditMode(noteContentElement);
      }
    });

    cancelBtn.addEventListener('click', () => {
      // Reset content and exit edit mode
      noteContentElement.textContent = originalText;
      this.exitEditMode(noteContentElement);
    });
  }

  exitEditMode(noteContentElement) {
    noteContentElement.contentEditable = false;
    noteContentElement.classList.remove('form-control');
    
    // Reset buttons
    document.getElementById('editNoteBtn').style.display = 'inline-block';
    document.getElementById('saveNoteBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
  }

  async updateNote(index, newText) {
    try {
      const notes = await this.getNotes();
      notes[index] = {
        ...notes[index],
        text: newText,
        lastEdited: new Date().toLocaleString()
      };
      await chrome.storage.sync.set({ [STORAGE_KEY]: notes });
      await this.displayNotes();
    } catch (e) {
      console.error('Error updating note:', e);
    }
  }


  async displayNotes() {
    try {
      const notes = await this.getNotes();
      this.notesList.innerHTML = '';

      if (notes.length > 0) {
        this.notesList.appendChild(this.createDeleteAllButton());
        
        notes.forEach((note, index) => {
          const noteItem = this.createNoteItem(note, index);
          if (noteItem) {
            this.notesList.appendChild(noteItem);
          }
        });
      } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center p-4';
        emptyState.innerHTML = `
          <img src="assets/img/bkg.png" 
               alt="No notes found" 
               class="image-fluid rounded shadow"
               style="opacity: 0.6; height: 200px;">
        `;
        this.notesList.appendChild(emptyState);
      }
    } catch (e) {
      console.error('Error displaying notes:', e);
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => new MyQuickNotesManager());