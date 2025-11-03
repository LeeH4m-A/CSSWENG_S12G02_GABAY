
const photoContainer = document.querySelector('.photo-for-profile');
const uploadInput = document.getElementById('uploadPhoto');
const photo = document.getElementById('idPhoto');
const editBtn = document.getElementById('editInfoBtn');
const cancelBtn = document.getElementById('cancelEditBtn');
const printBtn = document.getElementById('printBtn');
const profileContainer = document.querySelector('.container-for-profile');

const dropdownOptions = {
  gender: ['Male', 'Female', 'Other']
};


let editMode = false;
let originalValues = {};

// === PHOTO PREVIEW ===
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > 500) {
    alert('Please select a file below 500kB');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    photo.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// === EDIT / SAVE HANDLER ===
editBtn.addEventListener('click', () => {
  const editableFields = document.querySelectorAll('.editable');

  if (!editMode) {
    // Enter edit mode
    originalValues = {};
    editableFields.forEach(field => {
      originalValues[field.dataset.field] = field.textContent.trim();

      let editableElement;
      if (dropdownOptions[field.dataset.field]) {
        editableElement = document.createElement('select');
        dropdownOptions[field.dataset.field].forEach(optionValue => {
          const option = document.createElement('option');
          option.value = optionValue;
          option.textContent = optionValue;
          if (optionValue === originalValues[field.dataset.field]) option.selected = true;
          editableElement.appendChild(option);
        });
      } else {
        editableElement = document.createElement('input');
        editableElement.value = originalValues[field.dataset.field];
        editableElement.classList.add('profile-textarea');
      }

      editableElement.classList.add('inline-edit', 'profile-id-select'); 
      editableElement.dataset.field = field.dataset.field;
      field.replaceWith(editableElement);
    });

    originalValues.photoSrc = photo.src;

    editBtn.textContent = 'Save Info';
    cancelBtn.style.display = 'inline-block';
    photoContainer.classList.add('edit-mode');
    editMode = true;

  } else {
    // Save edits
    const inputs = document.querySelectorAll('.inline-edit');
    const formData = new FormData();

    inputs.forEach(input => {
      formData.append(input.dataset.field, input.value.trim());
      const span = document.createElement('span');
      span.textContent = input.value.trim();
      span.className = 'editable';
      span.dataset.field = input.dataset.field;
      input.replaceWith(span);
    });

  
    const file = uploadInput.files[0];
    if (file) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > 500) {
        alert('Please select a file below 500kB.');
        return; // stop saving
      }
      formData.append('photo', file);
    }

    fetch('/profile/update', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log('Profile updated successfully:', data);
      
      alert('Profile updated succesfully');
      location.reload();
    })
    .catch(err => {
      console.error('Failed to update profile:', err);
      
      alert('Update failed. Please try again.');
      location.reload();
    });

    editBtn.textContent = 'Edit Info';
    cancelBtn.style.display = 'none';
    photoContainer.classList.remove('edit-mode');
    editMode = false;
  }
});


// === CANCEL HANDLER ===
cancelBtn.addEventListener('click', () => {
  location.reload();
});

// === PRINT ID CARD AS PNG ===
printBtn.addEventListener('click', () => {
  html2canvas(profileContainer, { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'id-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});