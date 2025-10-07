/* This file should include the CRUD operations needed for the Schemas */
/* This file is used to communicate with the database */
/* The previous functions that were in app.js were not changed so it
   need to be changed so that
*/

// model.js
import mongoose from 'mongoose';

// --- Schemas (your existing schemas unchanged) ---

const biomedicalSchema = new mongoose.Schema(
  {
    location: { type: String, enum: ['Caloocan', 'Not in Caloocan'], required: true },
    barangay: { 
      type: Number, 
      min: 1, 
      max: 188, 
      required() { return this.location === 'Caloocan'; } 
    },
    remarks: { 
      type: String,   
      required() { return this.location === 'Not in Caloocan'; } 
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

const nonBiomedicalSchema = new mongoose.Schema(
  {
    stigma: { type: String, enum: ['Public Stigma', 'Family Stigma', 'Self-stigma'] },
    discrimination: { type: String, enum: ['Verbal Abuse', 'Physical Abuse', 'Emotional Abuse'] },
    violence: { type: String, enum: ['Economic Abuse', 'Sexual Abuse', 'Hate Crime'] }
  }, 
  { _id: false }
);

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

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ['Member', 'Data Encoder', 'Data Manager'] },
    isAdmin: { type: Boolean },
    userIcon: { type: String }
  }, 
  { versionKey: false }
);

const loginHistorySchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String, enum: ['Member', 'Data Encoder', 'Data Manager'] },
    email: { type: String },
    lastLoginDateTime: { type: Date, default: Date.now }
  }, 
  { versionKey: false }
);

const actionHistorySchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String, enum: ['Member', 'Data Encoder', 'Data Manager'] },
    email: { type: String },
    action: { type: String },
    actionDateTime: { type: Date, default: Date.now }
  }, 
  { versionKey: false }
);

// --- Models ---
export const patientModel = mongoose.model('Patient', patientSchema);
export const userModel = mongoose.model('User', userSchema);
export const loginHistoryModel = mongoose.model('LoginHistory', loginHistorySchema);
export const actionHistoryModel = mongoose.model('ActionHistory', actionHistorySchema);
