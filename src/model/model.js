/* This file should include the CRUD operations needed for the Schemas */
/* This file is used to communicate with the database */
/* The previous functions that were in app.js were not changed so it
   need to be changed so that
*/

// model.js
import mongoose from 'mongoose';

// sub-schema for patient if the data is a biomedical patient record
const biomedicalSchema = new mongoose.Schema(
  {
    location: { type: String, enum: ['Caloocan', 'Not in Caloocan'], required: true },
    barangay: { 
      type: Number, 
      min: 1, 
      max: 188, 
      required() { return this.location === 'Caloocan'; } // require barangay only if location is Caloocan
    },
    remarks: { 
      type: String,   
      required() { return this.location === 'Not in Caloocan'; } // require remarks only if location is Not in Caloocan
    },
    age_range: { 
      type: String, 
      enum: [
        '0 to 18 months', '19 months to 9 years', '10 to 14 years', '15 to 19 years',
        '20 to 24 years', '25 to 29 years', '30 to 39 years', '40 to 49 years', '50-plus'
      ] 
    },
    tested_before: { type: String, enum: ['Yes', 'No'] },
    test_result: { type: String, enum: ['Positive', 'Negative', 'Do Not Know'] },
    reason: { 
      type: String, 
      enum: [
        'Unprotected Sex', 'Injectable Drugs', 'Pregnancy', 'Exposed-child', 'PITC', 'Positve-partner',
        'Rape', 'Bloodtransfusion', 'HCW', 'Administrative', 'History', 'No reason'
      ] 
    },
    kvp: { 
      type: String, 
      enum: [
        'PWID', 'MSM', 'Transgenders', 'Sex-worker', 'Prisoner', 'Migrant', 'PWUD', 
        'Uniformed forces', 'Sexual-partners', 'AGEW', 'PWD', 'PLHIV', 'Not disclosed'
      ] 
    },
    linkage: {  type: String, enum: ['Treatment facility', 'Follow-up', 'Unconfirmed'] }
  }, 
  { _id: false }
);

// sub-schema for patient if the data is a nonbiomedical patient record
const nonBiomedicalSchema = new mongoose.Schema(
  {
    stigma: { type: String, enum: ['Public Stigma', 'Family Stigma', 'Self-stigma'] },
    discrimination: { type: String, enum: ['Verbal Abuse', 'Physical Abuse', 'Emotional Abuse'] },
    violence: { type: String, enum: ['Economic Abuse', 'Sexual Abuse', 'Hate Crime'] }
  }, 
  { _id: false }
);

// schema for patient
const patientSchema = new mongoose.Schema(
  {
    data_type: { type: String, required: true, enum: ['Biomedical', 'Nonbiomedical'] },
    gender: { type: String, enum: ['Male', 'Female', 'Transgender'] },
    biomedical: biomedicalSchema,
    nonbiomedical: nonBiomedicalSchema,
    encoder: { type: String },
    date_encoded: { type: Date, default: Date.now }
  }, 
  { versionKey: false }
);


// schema for user
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ['Member', 'Volunteer', 'Data Encoder', 'Data Manager'] },
    userIcon: { type: String },
    location: {
      barangay: { type: Number, min: 1, max: 188 }, // TODO: Change this as it could be a number or name
      city: { type: String, default: 'Caloocan' },
    },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] }, 
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'] },
    educationLevel: { type: String },
    occupation: { type: String },
    incomeLevel: { type: String },
  }, 
  { versionKey: false }
);

// schema for login history
const loginHistorySchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String, enum: ['Member', 'Volunteer', 'Data Encoder', 'Data Manager'] },
    email: { type: String },
    lastLoginDateTime: { type: Date, default: Date.now }
  }, 
  { versionKey: false }
);


// schema for action history
const actionHistorySchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String, enum: ['Member', 'Volunteer', 'Data Encoder', 'Data Manager'] },
    email: { type: String },
    action: { type: String },
    actionDateTime: { type: Date, default: Date.now }
  }, 
  { versionKey: false }
);

/* TODO: use user_id for history, ig make them the same? */

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { 
      type: String, 
      enum: [
        'Community Outreach', 'Training', 
        'Meeting', 'Seminar', 'Workshop', 'Other'
      ], 
      default: 'Other' 
    },
    location: {
      venue: { type: String, required: true },
      barangay: { type: Number, min: 1, max: 188 },
      city: { type: String, default: 'Caloocan' },
    },
    date_start: { type: Date, required: true },
    date_end: { type: Date, required: true },
    organizer: { type: String, required: true },
    event_status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
    created_by: { type: String },
    date_created: { type: Date, default: Date.now }
  },
  { versionKey: false }
);


const eventParticipantSchema = new mongoose.Schema(
  {
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Event', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
  },
  { versionKey: false }
);





// --- Models ---
export const patientModel = mongoose.model('Patient', patientSchema);
export const userModel = mongoose.model('User', userSchema);
export const loginHistoryModel = mongoose.model('LoginHistory', loginHistorySchema);
export const actionHistoryModel = mongoose.model('ActionHistory', actionHistorySchema);
export const eventModel = mongoose.model('Event', eventSchema);
export const eventParticipantModel = mongoose.model('EventParticipant', eventParticipantSchema);
