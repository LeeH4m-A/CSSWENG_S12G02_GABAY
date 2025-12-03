class ProfileManager {
  constructor() {
    this.editMode = false;
    this.originalValues = {};
    this.dropdownOptions = {
      gender: ['Man', 'Woman', 'Transgender']
    };
    
    // Default profile picture URL
    this.defaultProfilePic = 'https://res.cloudinary.com/dof7fh2cj/image/upload/v1719207075/hagwnwmxbpkpczzyh46g.jpg';
    
    // Track current original photo for undo
    this.originalPhoto = '';
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    this.photoContainer = document.querySelector('.photo-for-profile');
    this.uploadInput = document.getElementById('uploadPhoto');
    this.photo = document.getElementById('idPhoto');
    this.editBtn = document.getElementById('editInfoBtn');
    this.cancelBtn = document.getElementById('cancelEditBtn');
    this.printBtn = document.getElementById('printBtn');
    this.undoBtn = document.getElementById('undoPhoto');
    this.revertBtn = document.getElementById('revertPhoto');
    this.profileContainer = document.querySelector('.container-for-profile');
  }

  bindEvents() {
    this.uploadInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    this.editBtn.addEventListener('click', () => this.toggleEditMode());
    this.cancelBtn.addEventListener('click', () => this.cancelEdit());
    this.printBtn.addEventListener('click', () => this.printIdCard());
    this.undoBtn.addEventListener('click', () => this.undoPhotoChange());
    this.revertBtn.addEventListener('click', () => this.revertToDefaultPhoto());
  }

  handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!this.validateFile(file)) {
      e.target.value = '';
      return;
    }

    // Show confirmation before uploading
    this.showConfirmation(
      'Are you sure you want to upload this photo?',
      () => {
        this.previewPhoto(file);
      },
      () => {
        // If user cancels, clear the file input
        e.target.value = '';
        this.showMessage('Photo upload cancelled', 'warning');
      }
    );
  }

  validateFile(file) {
    const fileSizeKB = file.size / 1024;
    const maxSizeKB = 500;
    
    if (fileSizeKB > maxSizeKB) {
      this.showMessage('Please select a file below 500kB', 'error');
      return false;
    }
    
    return true;
  }

  previewPhoto(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.photo.src = event.target.result;
      this.showMessage('Photo preview updated', 'info');
    };
    reader.readAsDataURL(file);
  }

  undoPhotoChange() {
    if (!this.editMode) {
      this.showMessage('Please click "Edit Info" first to make changes', 'error');
      return;
    }

    // Simply revert to the original photo from when edit mode started
    this.photo.src = this.originalPhoto;
    this.uploadInput.value = '';
    this.showMessage('Photo change undone', 'success');
  }

  revertToDefaultPhoto() {
    if (!this.editMode) {
      this.showMessage('Please click "Edit Info" first to make changes', 'error');
      return;
    }

    this.showConfirmation(
      'Are you sure you want to revert to the default profile picture? This will only update the preview until you save.',
      () => {
        this.photo.src = this.defaultProfilePic;
        this.uploadInput.value = '';
        this.showMessage('Profile picture preview reverted to default', 'success');
      }
    );
  }

  showMessage(message, type = 'info') {
    const existingMessages = document.querySelectorAll('.custom-message');
    existingMessages.forEach(msg => msg.remove());

    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.className = 'custom-message';
    
    const backgroundColor = {
      'success': '#4CAF50',
      'error': '#f44336',
      'info': '#2196F3',
      'warning': '#ff9800'
    }[type] || '#2196F3';

    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${backgroundColor};
      color: white;
      border-radius: 5px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.style.opacity = '0';
        setTimeout(() => {
          if (messageEl.parentElement) {
            document.body.removeChild(messageEl);
          }
        }, 300);
      }
    }, 3000);
  }

  showConfirmation(message, onConfirm, onCancel = null) {
    const existingDialogs = document.querySelectorAll('.custom-confirmation');
    existingDialogs.forEach(dialog => dialog.remove());

    const dialogEl = document.createElement('div');
    dialogEl.className = 'custom-confirmation';
    dialogEl.innerHTML = `
      <div class="confirmation-content">
        <p>${message}</p>
        <div class="confirmation-buttons">
          <button class="confirm-btn">Yes</button>
          <button class="cancel-btn">No</button>
        </div>
      </div>
    `;

    dialogEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    `;

    const contentEl = dialogEl.querySelector('.confirmation-content');
    contentEl.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    const confirmBtn = dialogEl.querySelector('.confirm-btn');
    const cancelBtn = dialogEl.querySelector('.cancel-btn');

    [confirmBtn, cancelBtn].forEach(btn => {
      btn.style.cssText = `
        padding: 10px 20px;
        margin: 0 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
      `;
    });

    confirmBtn.style.backgroundColor = '#4CAF50';
    confirmBtn.style.color = 'white';
    cancelBtn.style.backgroundColor = '#f44336';
    cancelBtn.style.color = 'white';

    confirmBtn.onclick = () => {
      document.body.removeChild(dialogEl);
      onConfirm();
    };

    cancelBtn.onclick = () => {
      document.body.removeChild(dialogEl);
      if (onCancel) onCancel();
    };

    document.body.appendChild(dialogEl);
  }

  toggleEditMode() {
    if (!this.editMode) {
      this.enterEditMode();
    } else {
      this.saveEdits();
    }
  }

  enterEditMode() {
    this.originalValues = {};
    const editableFields = document.querySelectorAll('.editable');

    editableFields.forEach(field => {
      this.originalValues[field.dataset.field] = field.textContent.trim();
      this.replaceWithEditableElement(field);
    });

    // Store the original photo when entering edit mode
    this.originalPhoto = this.photo.src;
    this.originalValues.photoSrc = this.photo.src;
    
    this.updateUIForEditMode(true);
    this.showMessage('Edit mode activated. Click Save when done.', 'info');
  }

  replaceWithEditableElement(field) {
    const fieldName = field.dataset.field;
    let editableElement;

    if (this.dropdownOptions[fieldName]) {
      editableElement = this.createDropdown(fieldName, field.textContent.trim());
    } else {
      editableElement = this.createInput(fieldName, field.textContent.trim());
    }

    field.replaceWith(editableElement);
  }

  createDropdown(fieldName, currentValue) {
    const select = document.createElement('select');
    select.classList.add('inline-edit', 'profile-id-select');
    select.dataset.field = fieldName;

    this.dropdownOptions[fieldName].forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      option.selected = (optionValue === currentValue);
      select.appendChild(option);
    });

    return select;
  }

  createInput(fieldName, currentValue) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.classList.add('inline-edit', 'profile-textarea', 'profile-id-select');
    input.dataset.field = fieldName;
    
    return input;
  }

  updateUIForEditMode(enable) {
    this.editMode = enable;
    this.editBtn.textContent = enable ? 'Save Info' : 'Edit Info';
    this.cancelBtn.style.display = enable ? 'inline-block' : 'none';
    this.photoContainer.classList.toggle('edit-mode', enable);
  }

  async saveEdits() {
    const inputs = document.querySelectorAll('.inline-edit');
    const formData = new FormData();

    const isPhotoReverted = (this.photo.src === this.defaultProfilePic && this.originalValues.photoSrc !== this.defaultProfilePic);
    
    const file = this.uploadInput.files[0];
    if (file && !this.validateFile(file)) {
      return;
    }

    inputs.forEach(input => {
      formData.append(input.dataset.field, input.value.trim());
    });

    if (file) {
      formData.append('photo', file);
    } else if (isPhotoReverted) {
      formData.append('revertPhoto', 'true');
    }

    try {
      this.showMessage('Saving changes...', 'info');
      const result = await this.submitFormData(formData);
      this.handleSaveSuccess(result);
    } catch (error) {
      this.handleSaveError(error);
    }
    
    // Exit edit mode after save (not cancelling)
    this.exitEditMode(false);
  }

  async submitFormData(formData) {
    const response = await fetch('/profile/update', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  handleSaveSuccess(result) {
    // Update the page content without reloading
    this.exitEditMode(false);
    // Update all the fields with the new data
    const editableFields = document.querySelectorAll('.editable');
    editableFields.forEach(field => {
      const fieldName = field.dataset.field;
      if (result.user[fieldName]) {
        field.textContent = result.user[fieldName];
      }
    });

    // Update photo if it changed
    if (result.user.userIcon) {
      this.photo.src = result.user.userIcon;
    }

    this.updateSidebar(result.user);

    this.showMessage('Profile updated successfully!', 'success');
  }

  updateSidebar(userData) {
  // Update sidebar user image
  const sidebarImg = document.querySelector('.user-img img');
  if (sidebarImg && userData.userIcon) {
    sidebarImg.src = userData.userIcon;
  }
  
  // Update sidebar user name
  const sidebarName = document.querySelector('.user .bold');
  if (sidebarName && userData.name) {
    sidebarName.textContent = userData.name;
  }
}
    
  handleSaveError(error) {
    console.error('Failed to update profile:', error);
    this.showMessage('Update failed. Please try again.', 'error');
    // Don't reload - let user fix the error and try again
  }

  cancelEdit() {
    this.exitEditMode(true); // Pass true to indicate cancellation
    this.showMessage('Changes cancelled', 'warning');
  }

  exitEditMode(isCancelling = false) {
    const inputs = document.querySelectorAll('.inline-edit');
    
    inputs.forEach(input => {
      const fieldName = input.dataset.field;
      
      // Use original value if cancelling, otherwise use current input value
      const value = isCancelling ? 
        (this.originalValues[fieldName] || '') : 
        input.value.trim();
      
      // Handle different field types based on their original structure
      if (fieldName === 'name') {
        // For name field - it's a <b> element inside user-header
        const nameSpan = document.createElement('b');
        nameSpan.textContent = value;
        nameSpan.id = 'profile-label';
        nameSpan.className = 'editable user-name';
        nameSpan.dataset.field = fieldName;
        input.replaceWith(nameSpan);
      } else {
        // For other fields - they're <p> elements with 'editable info-value' classes
        const paragraph = document.createElement('p');
        paragraph.textContent = value;
        paragraph.className = 'editable info-value';
        paragraph.dataset.field = fieldName;
        input.replaceWith(paragraph);
      }
    });

    // Revert photo if it was changed but not saved
    if (isCancelling && this.originalValues.photoSrc) {
      this.photo.src = this.originalValues.photoSrc;
    }

    // Clear file input
    this.uploadInput.value = '';

    // Update UI state
    this.updateUIForEditMode(false);
  }

  printIdCard() {
    this.showMessage('Generating ID card...', 'info');
    
    html2canvas(this.profileContainer, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null
    }).then(canvas => {
      this.downloadCanvas(canvas);
      this.showMessage('ID card downloaded successfully!', 'success');
    }).catch(error => {
      console.error('Print failed:', error);
      this.showMessage('Failed to generate ID card. Please try again.', 'error');
    });
  }

  downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'id-card.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize the profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProfileManager();
});