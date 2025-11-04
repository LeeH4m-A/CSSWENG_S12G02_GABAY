/**
 * Manages all form and modal interactions:
 * - Sidebar
 * - Edit/Filter Modals
 * - Form Toggles (e.g., toggleFields)
 * - Form Validation & Submission
 * - User/Role management buttons (Delete, Change Role)
 * - Data Page Filters
 */

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS (Called by event listeners or inline HTML)
// -----------------------------------------------------------------------------

/**
 * Toggles the visibility of fields based on the selected data type.
 */
function toggleFields() {
    const dataType = document.querySelector('input[name="data_type"]:checked')?.value;
    const biomedicalFields = document.querySelectorAll('.biomedicalfield, #barangay-field, #remarks-field');
    const nonbiomedicalFields = document.querySelectorAll('.nonbiomedicalfield');

    if (dataType === 'Biomedical') {
        biomedicalFields.forEach(field => {
            field.style.display = 'flex';
            field.querySelectorAll('input, select').forEach(input => input.required = true);
        });
        // Toggle location-specific fields based on location selection
        toggleLocationFields(); // Ensure location fields are correctly set
        nonbiomedicalFields.forEach(field => {
            field.style.display = 'none';
            field.querySelectorAll('input, select').forEach(input => input.required = false);
        });
    } else if (dataType === 'Nonbiomedical') {
        biomedicalFields.forEach(field => {
            field.style.display = 'none';
            field.querySelectorAll('input, select').forEach(input => input.required = false);
        });
        nonbiomedicalFields.forEach(field => {
            field.style.display = 'flex';
            field.querySelectorAll('input, select').forEach(input => input.required = true);
        });
    }
}

/**
 * Toggles the visibility of location-specific fields in the form.
 */
function toggleLocationFields() {
    const location = document.querySelector('input[name="location"]:checked');
    const barangayField = document.getElementById('barangay-field');
    const remarksField = document.getElementById('remarks-field');
    
    if (!barangayField || !remarksField) return; // Not on the right form

    if (location && document.querySelector('input[name="data_type"]:checked')?.value === 'Biomedical') {
        if (location.value === 'Caloocan') {
            barangayField.style.display = 'flex';
            remarksField.style.display = 'none';
        } else if (location.value === 'Not in Caloocan') {
            barangayField.style.display = 'none';
            remarksField.style.display = 'flex';
        }
    } else {
        barangayField.style.display = 'none';
        remarksField.style.display = 'none';
    }
}

/**
 * Toggles the visibility of location-specific fields in the edit form.
 */
function toggleEditLocationFields() {
    const caloocanRadio = document.querySelector('input[name="location"][value="Caloocan"]');
    const barangayField = document.getElementById('edit-barangay-field');
    const remarksField = document.getElementById('edit-remarks-field');

    if (!caloocanRadio || !barangayField || !remarksField) return;

    if (caloocanRadio.checked) {
        barangayField.classList.add('visible');
        barangayField.classList.remove('hidden');
        remarksField.classList.add('hidden');
        remarksField.classList.remove('visible');
    } else {
        remarksField.classList.add('visible');
        remarksField.classList.remove('hidden');
        barangayField.classList.add('hidden');
        barangayField.classList.remove('visible');
    }
}

/**
 * Toggle display of the "Don't Know" option based on the selected radio button.
 * Shows the test result field if "Yes" (has been tested before) is selected,
 * hides it otherwise and ensures the "Don't Know" option is unchecked.
 * @param {HTMLInputElement} radio - The radio button element that triggered the function.
 * @returns {void}
 */
function toggleDoNotKnowOption(radio) {
    const doNotKnowOption = document.getElementById('doNotKnowOption');
    if (!doNotKnowOption) return;

    if (radio.value === 'Yes') {
        doNotKnowOption.style.display = 'inline-block';
    } else {
        doNotKnowOption.style.display = 'none';
        // If "No" is selected, uncheck "Don't Know" if it was checked
        const doNotKnowInput = doNotKnowOption.querySelector('input[value="Do Not Know"]');
        if (doNotKnowInput && doNotKnowInput.checked) {
            doNotKnowInput.checked = false;
        }
    }
}

/**
 * Clears the form inputs.
 */
function clearForm() {
    const form = document.getElementById('tracker-form');
    if (form) {
        form.reset();
        // Reset field visibility
        toggleFields();
    }
}

/**
 * Checks if a field is empty (contains only whitespace).
 * @param {string} field - The field value to check.
 * @returns {boolean} True if the field is not empty, false otherwise.
 */
function checkEmpty(field) {
    if (field === null || field === undefined) return false;
    return !/^\s*$/.test(field);
}

/**
 * Validates the form before submission.
 * Ensures the appropriate selections based on the tested and result values.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
function validateForm() {
    var tested = document.querySelector('input[name="tested"]:checked');
    var result = document.querySelector('input[name="result"]:checked');

    if (result && result.value === "Do Not Know") {
        if (!tested || tested.value !== "Yes") {
            alert("You can only select 'Don't Know' if the person has been tested before.");
            return false;
        }
    }

    // Check location-specific fields
    // Check location-specific fields based on chosen location
    var location = document.querySelector('input[name="location"]:checked');
    if (location) {
        if (location.value === "Caloocan") {
            var barangay = document.getElementById('barangay').value;
            if (!barangay) {
                alert("Please fill the Barangay field.");
                return false;
            }
            document.getElementById('remarks').removeAttribute('required');
        } else if (location.value === "Not in Caloocan") {
            var remarks = document.getElementById('remarks').value;
            if (!remarks) {
                alert("Please fill the Remarks field.");
                return false;
            }
            document.getElementById('barangay').removeAttribute('required');
        }
    }

    // Check other required fields
    // Check if all required fields are filled (excluding location-specific fields already validated)
    var form = document.getElementById("tracker-form");
    if (!form.checkValidity()) {
         // Use browser's built-in validation messages
        form.reportValidity();
        alert("Please fill all required fields.");
        return false;
    }

    // If all checks pass, submit
    // Submit the form if all validations pass
    form.submit();
    return true; // Although submit() happens, we can return true
}

/**
 * Confirms the role change action and submits the form if confirmed.
 * Reverts the select element to its original value if not confirmed.
 * @param {HTMLSelectElement} selectElement - The select element triggering the role change.
 */
function confirmRoleChange(selectElement) {
    if (confirm('Are you sure you want to change this user\'s role?')) {
        selectElement.form.submit();
    } else {
        // Revert to original value
        selectElement.selectedIndex = selectElement.getAttribute('data-original-index');
    }
}

/**
 * Confirms the delete user action and prevents the default link action if not confirmed.
 * @param {Event} event - The event object.
 * @param {HTMLAnchorElement} linkElement - The link element triggering the delete action.
 * @returns {boolean} - Returns true if the user confirmed the action, otherwise false.
 */
function confirmDeleteUser(event) {
    if (!confirm('Are you sure you want to delete this user?')) {
        event.preventDefault();
        return false;
    }
    return true;
}


// --- Data Page Filter Helpers ---

function constructQueryString() {
    const filters = [
        'bioGenderFilter', 'bioFromDateFilter', 'bioToDateFilter', 'locationFilter',
        'ageRangeFilter', 'testedBeforeFilter', 'testResultFilter', 'reasonFilter',
        'kvpFilter', 'linkageFilter', 'nonBioGenderFilter', 'nonBioFromDateFilter',
        'nonBioToDateFilter', 'stigmaFilter', 'discriminationFilter', 'violenceFilter'
    ];
    
    const params = new URLSearchParams();
    filters.forEach(id => {
        const el = document.querySelector(`#${id}`);
        if (el && el.value) {
            params.append(id, el.value);
        }
    });
    console.log('Filters:', params.toString()); // Debug log
    return params.toString();
}

function setSelectedOptions() {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
        const el = document.querySelector(`#${key}`);
        if (el) {
            el.value = value;
        }
    });
}

function reloadPageWithFilters(event) {
    event.preventDefault(); // Prevent default form submission
    const queryString = constructQueryString();
    console.log('Full URL with filters:', `/data?${queryString}`); // Debug log
    window.location.href = `/data?${queryString}`;
}

// -----------------------------------------------------------------------------
// MAIN SETUP FUNCTION
// -----------------------------------------------------------------------------

/**
 * Sets up all form-related event listeners.
 */
export function setupFormHandlers() {
    
    /**
     * Event listener for the sidebar toggle button.
     * Toggles the active class on the sidebar when the button is clicked.
     */
    // --- Sidebar ---
    const btn = document.querySelector('#btn');
    const sidebar = document.querySelector('.sidebar');
    if (btn && sidebar) {
        btn.onclick = () => sidebar.classList.toggle('active');
    }

    /**
     * Event listener for the edit button.
     * Opens the edit modal with the data of the selected patient.
     */
    // --- Edit Modal ---
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editCloseSpan = document.querySelector('.close'); // Assumes first close is edit
    const editButtons = document.querySelectorAll('.btn-edit');

    if (editModal) {
        editButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                const patientId = event.target.closest('a').getAttribute('data-id');
                console.log('Fetching data for patient ID:', patientId); // Debug log
                try {
                    // Fetch patient data
                    const response = await fetch(`/edit/${patientId}`);
                    const data = await response.json();
                    
                    // This part is very long and specific, so I'm copying it directly
                    
                    const patient = data.patient;
                    console.log('Received patient data:', patient); // Debug log
                    if (!patient || !patient.data_type) {
                        console.error('Patient data_type is missing or invalid.');
                        alert('An error occurred: patient data_type is missing or invalid.');
                        return;
                    }

                    // Populate form with patient data
                    let formContent = `
                        <input type="hidden" name="id" value="${patient._id}">
                        <div class="field">
                            <label for="gender" class="data-label">Sex at birth:</label>
                            <label class="radio-option">
                                <input type="radio" name="gender" value="Male" ${patient.gender === 'Male' ? 'checked' : ''} required>
                                <span>Male</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="gender" value="Female" ${patient.gender === 'Female' ? 'checked' : ''} required>
                                <span>Female</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="gender" value="Transgender" ${patient.gender === 'Transgender' ? 'checked' : ''} required>
                                <span>Transgender</span>
                            </label>
                        </div>`;
                    
                    console.log('Patient data type:', patient.data_type); // Debug log

                    if (patient.data_type === 'Biomedical') {
                        formContent += `
                        <div class="edit-biomedicalfield">
                            <label for="location" class="data-label">Location:</label>
                            <label class="radio-option">
                                <input type="radio" name="location" value="Caloocan" ${patient.biomedical.location === 'Caloocan' ? 'checked' : ''} onclick="toggleEditLocationFields()">
                                <span>Caloocan</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="location" value="Not in Caloocan" ${patient.biomedical.location === 'Not in Caloocan' ? 'checked' : ''} onclick="toggleEditLocationFields()">
                                <span>Not in Caloocan</span>
                            </label>
                        </div>
                        <div id="edit-barangay-field" class="form-group ${patient.biomedical.location === 'Caloocan' ? 'visible' : 'hidden'}">
                            <label for="barangay" class="data-label">Barangay:</label>
                            <input type="number" id="barangay" name="barangay" class="data-input" min="1" max="188" value="${patient.biomedical.barangay || ''}">
                        </div>
                        <div id="edit-remarks-field" class="${patient.biomedical.location === 'Not in Caloocan' ? 'visible' : 'hidden'}">
                            <label for="remarks" class="data-label">Remarks:</label>
                            <input type="text" id="remarks" name="remarks" class="data-input" value="${patient.biomedical.remarks || ''}">
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="age" class="data-label">Age:</label>  
                            <select id="age" name="age_range">
                                <option value="" disabled>Select age range</option>
                                <option value="0 to 18 months" ${patient.biomedical.age_range === '0 to 18 months' ? 'selected' : ''}>0 to 18 months</option>
                                <option value="19 months to 9 years" ${patient.biomedical.age_range === '19 months to 9 years' ? 'selected' : ''}>19 months to 9 years</option>
                                <option value="10 to 14 years" ${patient.biomedical.age_range === '10 to 14 years' ? 'selected' : ''}>10 to 14 years</option>
                                <option value="15 to 19 years" ${patient.biomedical.age_range === '15 to 19 years' ? 'selected' : ''}>15 to 19 years</option>
                                <option value="20 to 24 years" ${patient.biomedical.age_range === '20 to 24 years' ? 'selected' : ''}>20 to 24 years</option>
                                <option value="25 to 29 years" ${patient.biomedical.age_range === '25 to 29 years' ? 'selected' : ''}>25 to 29 years</option>
                                <option value="30 to 39 years" ${patient.biomedical.age_range === '30 to 39 years' ? 'selected' : ''}>30 to 39 years</option>
                                <option value="40 to 49 years" ${patient.biomedical.age_range === '40 to 49 years' ? 'selected' : ''}>40 to 49 years</option>
                                <option value="50-plus" ${patient.biomedical.age_range === '50-plus' ? 'selected' : ''}>50 years and older</option>
                            </select>
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="tested_before" class="data-label">Has the person been tested before?</label>
                            <label class="radio-option">
                                <input type="radio" name="tested_before" value="Yes" ${patient.biomedical.tested_before  === 'Yes' ? 'checked' : ''}>
                                <span>Yes (Has been tested before)</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="tested_before" value="No" ${patient.biomedical.tested_before  === 'No' ? 'checked' : ''}>
                                <span>No (First Time Tester)</span>
                            </label>
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="test_result" class="data-label">Test result:</label>
                            <label class="radio-option">
                                <input type="radio" name="test_result" value="Positive" ${patient.biomedical.test_result === 'Positive' ? 'checked' : ''}>
                                <span>Positive</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="test_result" value="Negative" ${patient.biomedical.test_result === 'Negative' ? 'checked' : ''}>
                                <span>Negative</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="test_result" value="Do Not Know" ${patient.biomedical.test_result === 'Do Not Know' ? 'checked' : ''}>
                                <span>Don't Know (For repeat testers)</span>
                            </label>
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="reason" class="data-label">Reason for taking the test:</label>
                            <select id="reason" name="reason">
                                <option value="" disabled>Select reason</option>
                                <option value="Unprotected Sex" ${patient.biomedical.reason === 'Unprotected Sex' ? 'selected' : ''}>Unprotected Sex</option>
                                <option value="Injectable drugs" ${patient.biomedical.reason === 'Injectable drugs' ? 'selected' : ''}>Use of injectable drugs</option>
                                <option value="Pregnancy" ${patient.biomedical.reason === 'Pregnancy' ? 'selected' : ''}>Pregnancy</option>
                                <option value="Exposed-child" ${patient.biomedical.reason === 'Exposed-child' ? 'selected' : ''}>HIV-exposed child</option>
                                <option value="PITC" ${patient.biomedical.reason === 'PITC' ? 'selected' : ''}>PITC - III health</option>
                                <option value="Positive-partner" ${patient.biomedical.reason === 'Positive-partner' ? 'selected' : ''}>HIV positive partner</option>
                                <option value="Rape" ${patient.biomedical.reason === 'Rape' ? 'selected' : ''}>Non consensual sex and rape</option>
                                <option value="Bloodtransfusion" ${patient.biomedical.reason === 'Bloodtransfusion' ? 'selected' : ''}>History of blood transfusion or exposure to contaminated equipment</option>
                                <option value="HCW" ${patient.biomedical.reason === 'HCW' ? 'selected' : ''}>Occupational hazard health care worker (HCW)</option>
                                <option value="Administrative" ${patient.biomedical.reason === 'Administrative' ? 'selected' : ''}>Administrative reason</option>
                                <option value="History" ${patient.biomedical.reason === 'History' ? 'selected' : ''}>Subjective ill health or history of sexually transmitted infection(s)</option>
                                <option value="No reason" ${patient.biomedical.reason === 'No reason' ? 'selected' : ''}>No specific reason disclosed</option>
                            </select>
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="kvp" class="data-label">Key or Vulnerable Population (KVP) at higher risk:</label>
                            <select id="kvp" name="kvp">
                                <option value="" disabled>Select population</option>
                                <option value="PWID" ${patient.biomedical.kvp === 'PWID' ? 'selected' : ''}>Person who injects drugs (PWID) or other needle sharing</option>
                                <option value="MSM" ${patient.biomedical.kvp === 'MSM' ? 'selected' : ''}>Gay and other Men having Sex with Men (MSM)</option>
                                <option value="Transgenders" ${patient.biomedical.kvp === 'Transgenders' ? 'selected' : ''}>Transgenders</option>
                                <option value="Sex-worker" ${patient.biomedical.kvp === 'Sex-worker' ? 'selected' : ''}>Sex/entertainment worker</option>
                                <option value="Prisoner" ${patient.biomedical.kvp === 'Prisoner' ? 'selected' : ''}>Prisoner/detainee</option>
                                <option value="Migrant" ${patient.biomedical.kvp === 'Migrant' ? 'selected' : ''}>Mobile and migrant populations</option>
                                <option value="PWUD" ${patient.biomedical.kvp === 'PWUD' ? 'selected' : ''}>Person who uses non-injectable drugs (PWUD)</option>
                                <option value="Uniformed forces" ${patient.biomedical.kvp === 'Uniformed forces' ? 'selected' : ''}>Uniformed forces (military, police, security)</option>
                                <option value="Sexual-partners" ${patient.biomedical.kvp === 'Sexual-partners' ? 'selected' : ''}>Sexual Partners of identified KP at higher risk</option>
                                <option value="AGEW" ${patient.biomedical.kvp === 'AGEW' ? 'selected' : ''}>Adolescent Girls and Young Women (AGEW)</option>
                                <option value="PWD" ${patient.biomedical.kvp === 'PWD' ? 'selected' : ''}>Persons with disability</option>
                                <option value="PLHIV" ${patient.biomedical.kvp === 'PLHIV' ? 'selected' : ''}>HIV-negative sexual partners of PLHIV</option>
                                <option value="Not disclosed" ${patient.biomedical.kvp === 'Not disclosed' ? 'selected' : ''}>No key or vulnerable population known or not disclosed</option>
                            </select>
                        </div>
                        <div class="edit-biomedicalfield">
                            <label for="linkage" class="data-label">Linkage:</label>
                            <select id="linkage" name="linkage">
                                <option value="" disabled>Select linkage</option>
                                <option value="Treatment facility" ${patient.biomedical.linkage === 'Treatment facility' ? 'selected' : ''}>Linked to Treatment Facility</option>
                                <option value="Follow-up" ${patient.biomedical.linkage === 'Follow-up' ? 'selected' : ''}>Linkage not yet confirmed, under follow-up</option>
                                <option value="Unconfirmed" ${patient.biomedical.linkage === 'Unconfirmed' ? 'selected' : ''}>Linkage unconfirmed (after 3 months follow-up)</option>
                            </select>
                        </div>`;
                    } else if (patient.data_type === 'Nonbiomedical') {
                        formContent += `
                        <div class="edit-nonbiomedicalfield">
                            <label for="stigma" class="data-label">Stigma:</label>
                            <select id="stigma" name="stigma">
                                <option value="" disabled>Select category</option>
                                <option value="Public Stigma" ${patient.nonbiomedical.stigma === 'Public Stigma' ? 'selected' : ''}>Public Stigma</option>
                                <option value="Family Stigma" ${patient.nonbiomedical.stigma === 'Family Stigma' ? 'selected' : ''}>Family Stigma</option>
                                <option value="Self-stigma" ${patient.nonbiomedical.stigma === 'Self-stigma' ? 'selected' : ''}>Self-stigma</option>
                            </select>
                        </div>
                        <div class="edit-nonbiomedicalfield">
                            <label for="discrimination" class="data-label">Discrimination:</label>
                            <select id="discrimination" name="discrimination">
                                <option value="" disabled>Select category</option>
                                <option value="Verbal Abuse" ${patient.nonbiomedical.discrimination === 'Verbal Abuse' ? 'selected' : ''}>Verbal Abuse</option>
                                <option value="Physical Abuse" ${patient.nonbiomedical.discrimination === 'Physical Abuse' ? 'selected' : ''}>Physical Abuse</option>
                                <option value="Emotional Abuse" ${patient.nonbiomedical.discrimination === 'Emotional Abuse' ? 'selected' : ''}>Emotional Abuse</option>
                            </select>
                        </div>
                        <div class="edit-nonbiomedicalfield">
                            <label for="violence" class_A"data-label">Violence:</label>
                            <select id="violence" name="violence">
                                <option value="" disabled>Select category</option>
                                <option value="Economic Abuse" ${patient.nonbiomedical.violence === 'Economic Abuse' ? 'selected' : ''}>Economic Abuse</option>
                                <option value="Sexual Abuse" ${patient.nonbiomedical.violence === 'Sexual Abuse' ? 'selected' : ''}>Sexual Abuse</option>
                                <option value="Hate Crime" ${patient.nonbiomedical.violence === 'Hate Crime' ? 'selected' : ''}>Hate Crime</option>
                            </select>
                        </div>`;
                    }
                    
                    formContent += `<div class="edit-record">
                    <button type="submit" class="edit-button">Update Patient Record</button>
                    </div>`;
                    editForm.innerHTML = formContent;
                    
                    // Display the modal
                    editModal.style.display = "block";

                } catch (error) {
                    console.error('Error fetching patient data:', error);
                    alert('An error occurred while fetching patient data.');
                }
            });
        });

        /**
        * Event listener for the close button of the edit modal.
        * Closes the edit modal when clicked.
        */
        if (editCloseSpan) {
            editCloseSpan.onclick = () => editModal.style.display = "none";
        }

        /**
        * Event listener for the edit form submission.
        * Submits the updated patient data to the server.
        * @param {Event} event - The form submission event.
        */
        if (editForm) {
            editForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(editForm);
                const id = formData.get('id');
                const data = Object.fromEntries(formData.entries());
                console.log('Submitting updated data for patient ID:', id, data); // Debug log

                try {
                    const response = await fetch(`/edit/${id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const result = await response.json();
                    if (result.success) {
                        alert('Patient information updated successfully');
                        editModal.style.display = "none";
                        window.location.href = `/data`; // Reload data page
                    } else {
                        alert('An error occurred while updating the patient information');
                    }
                } catch (error) {
                    console.error('Error updating patient data:', error);
                    alert('An error occurred while updating patient data.');
                }
            });
        }
    }

    /**
    * Event listener for the filter button.
    * Opens the filter modal
    */
    // --- Filter Modal ---
    const filterModal = document.getElementById('filterModal');
    const filterForm = document.getElementById('filterForm');
    const filterCloseSpan = document.getElementsByClassName('close')[1]; // Assumes second is filter
    const filterButtons = document.querySelectorAll('.btn-filter');

    if (filterModal) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                // ... (Original logic for populating filterForm.innerHTML)
                // This is also very long, copying directly
                let formContent = `
                    <h2 class="headline">Filter</h2>
                    <div class="filter-field">
                        <label for="genderFilter" class="data-label">Sex at birth:</label>
                        <label class="radio-option">
                            <input type="radio" name="genderFilter" value="Male">
                            <span>Male</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="genderFilter" value="Female">
                            <span>Female</span>
                        </label>  
                        <label class="radio-option">
                            <input type="radio" name="genderFilter" value="Transgender">
                            <span>Transgender</span>
                        </label>  
                    </div>
                    <div class="filter-field">
                        <label for="fromDateFilter" class="data-label">From date:</label>
                        <input type="date" id="fromDateFilter" name="fromDateFilter">
                    </div>
                    <div class="filter-field">
                        <label for="toDateFilter" class="data-label">To date:</label>
                        <input type="date" id="toDateFilter" name="toDateFilter">
                    </div>
                    <h2 class="headline">Biomedical</h2>
                    <div class="filter-field">
                        <label for="locationFilter" class="data-label">Location:</label>
                        <label class="radio-option">
                            <input type="radio" name="locationFilter" value="Caloocan">
                            <span>Caloocan</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="locationFilter" value="Not in Caloocan">
                            <span>Not in Caloocan</span>
                        </label>
                    </div>
                    <div class="filter-field">
                        <label for="ageRangeFilter" class="data-label">Age Range:</label>  
                        <select id="ageRangeFilter" name="ageRangeFilter">
                            <option value="" selected>Select age range</option>
                            <option value="0 to 18 months">0 to 18 months</option>
                            <option value="19 months to 9 years">19 months to 9 years</option>
                            <option value="10 to 14 years">10 to 14 years</option>
                            <option value="15 to 19 years">15 to 19 years</option>
                            <option value="20 to 24 years">20 to 24 years</option>
                            <option value="25 to 29 years">25 to 29 years</option>
                            <option value="30 to 39 years">30 to 39 years</option>
                            <option value="40 to 49 years">40 to 49 years</option>
                            <option value="50-plus">50 years and older</option>
                        </select>
                    </div>
                    <div class="filter-field">
                        <label for="testedBeforeFilter" class="data-label">Test Before</label>
                        <label class="radio-option">
                            <input type="radio" name="testedBeforeFilter" value="Yes">
                            <span>Yes (Has been tested before)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="testedBeforeFilter" value="No">
                            <span>No (First Time Tester)</span>
                        </label>
                    </div>
                    <div class="filter-field">
                        <label for="testResultFilter" class="data-label">Test result:</label>
                        <label class="radio-option">
                            <input type="radio" name="testResultFilter" value="Positive">
                            <span>Positive</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="testResultFilter" value="Negative">
                            <span>Negative</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="testResultFilter" value="Do Not Know">
                            <span>Don't Know (For repeat testers)</span>
                        </label>
                    </div>
                    <div class="filter-field">
                        <label for="reasonFilter" class="data-label">Reason for taking the test:</label>
                        <select id="reasonFilter" name="reasonFilter">
                            <option value="" selected>Select reason</option>
                            <option value="Unprotected Sex">Unprotected Sex</option>
                            <option value="Injectable Drugs">Use of injectable drugs</option>
                            <option value="Pregnancy">Pregnancy</option>
                            <option value="Exposed-child">HIV-exposed child</option>
                            <option value="PITC">PITC - III health</option>
                            <option value="Positive-partner">HIV positive partner</option>
                            <option value="Rape">Non consensual sex and rape</option>
                            <option value="Bloodtransfusion">History of blood transfusion or exposure to contaminated equipment</option>
                            <option value="HCW">Occupational hazard health care worker (HCW)</option>
                            <option value="Administrative">Administrative reason</option>
                            <option value="History">Subjective ill health or history of sexually transmitted infection(s)</option>
                            <option value="No reason">No specific reason disclosed</option>
                        </select>
                    </div>
                    <div class="filter-field">
                        <label for="kvpFilter" class="data-label">Key or Vulnerable Population (KVP) at higher risk:</label>
                        <select id="kvpFilter" name="kvpFilter">
                            <option value=""selected>Select population</option>
                            <option value="PWID">Person who injects drugs (PWID) or other needle sharing</option>
                            <option value="MSM">Gay and other Men having Sex with Men (MSM)</option>
                            <option value="Transgenders">Transgenders</option>
                            <option value="Sex-worker">Sex/entertainment worker</option>
                            <option value="Prisoner">Prisoner/detainee</option>
                            <option value="Migrant">Mobile and migrant populations</option>
                            <option value="PWUD">Person who uses non-injectable drugs (PWUD)</option>
                            <option value="Uniformed forces">Uniformed forces (military, police, security)</option>
                            <option value="Sexual-partners">Sexual Partners of identified KP at higher risk</option>
                            <option value="AGEW">Adolescent Girls and Young Women (AGEW)</option>
                            <option value="PWD">Persons with disability</option>
                            <option value="PLHIV">HIV-negative sexual partners of PLHIV</option>
                            <option value="Not disclosed">No key or vulnerable population known or not disclosed</option>
                        </select>
                    </div>
                    <div class="filter-field">
                        <label for="linkageFilter" class="data-label">Linkage:</label>
                        <select id="linkageFilter" name="linkageFilter">
                            <option value="" selected>Select linkage</option>
                            <option value="Treatment facility">Linked to Treatment Facility</option>
                            <option value="Follow-up">Linkage not yet confirmed, under follow-up</option>
                            <option value="Unconfirmed">Linkage unconfirmed (after 3 months follow-up)</option>
                        </select>
                    </div>
                    <h2 class="headline">Nonbiomedical Filters</h2>
                    <div class="edit-nonbiomedicalfield">
                        <label for="stigmaFilter" class="data-label">Stigma:</label>
                        <select id="stigmaFilter" name="stigmaFilter">
                            <option value="" selected>Select category</option>
                            <option value="Public Stigma">Public Stigma</option>
                            <option value="Family Stigma">Family Stigma</option>
                            <option value="Self-stigma">Self-stigma</option>
                        </select>
                    </div>
                    <div class="edit-nonbiomedicalfield">
                        <label for="discriminationFilter" class="data-label">Discrimination:</label>
                        <select id="discriminationFilter" name="discriminationFilter">
                            <option value="" selected>Select category</option>
                            <option value="Verbal Abuse">Verbal Abuse</option>
                            <option value="Physical Abuse">Physical Abuse</option>
                            <option value="Emotional Abuse">Emotional Abuse</option>
                        </select>
                    </div>
                    <div class="edit-nonbiomedicalfield">
                        <label for="violenceFilter" class="data-label">Violence:</label>
                        <select id="violenceFilter" name="violenceFilter">
                            <option value="" selected>Select category</option>
                            <option value="Economic Abuse">Economic Abuse</option>
                            <option value="Sexual Abuse">Sexual Abuse</option>
                            <option value="Hate Crime">Hate Crime</option>
                        </select>
                    </div>
                    <div class="filter-data">
                    <button type="submit" class="filter-button">Apply Filter/s</button>
                    </div>`;
                
                filterForm.innerHTML = formContent;
                filterModal.style.display = "block";
            });
        });
        
        /**
         * Event listener for the close button of the filter modal.
         * Closes the filter modal when clicked.
         */
        if (filterCloseSpan) {
            filterCloseSpan.onclick = () => filterModal.style.display = "none";
        }
    }

    /**
    * Event listener for clicks outside the modal.
    * Closes the edit modal if the user clicks outside of it.
    */
    // --- Window Click (for Modals) ---
    window.onclick = (event) => {
        if (event.target == editModal) {
            editModal.style.display = "none";
        }
        if (event.target == filterModal) {
            filterModal.style.display = "none";
        }
    }

    /**
    * Event listeners for the delete button.
    * Confirms deletion of a record.
    */
    // --- Delete Buttons ---
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (event) => {
            if (!confirm('Are you sure you want to delete this record?')) {
                event.preventDefault();
            }
        });
    });

    /**
    * Store the original selected index for each role select element for reverting if necessary.
    */
    // --- Role Selects ---
    document.querySelectorAll('.role-select').forEach(select => {
        // Store original value for potential revert
        select.setAttribute('data-original-index', select.selectedIndex);
    });

    // --- Data Page Filters ---
    document.querySelectorAll('.filter-select').forEach(filter => {
        filter.addEventListener('change', reloadPageWithFilters);
    });
    // Set selected options on data page load
    if (window.location.pathname.includes('/data')) {
        setSelectedOptions();
    }
}

// Export functions to be used globally by HTML attributes
export const formHelperFunctions = {
    toggleFields,
    toggleLocationFields,
    toggleEditLocationFields,
    toggleDoNotKnowOption,
    clearForm,
    checkEmpty,
    validateForm,
    confirmRoleChange,
    confirmDeleteUser
};