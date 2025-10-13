import { formatDate } from "./date.js";

// helper function to format sheet headers
export function formatSheetHeaders(sheet, title) {
    const headerRow = sheet.addRow([title]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    if (title === 'Biomedical Records' || title === 'Nonbiomedical Records'|| title === 'Statistics') {
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9B112E' } };
    } 
    headerRow.alignment = { horizontal: 'left' };
}

// helper function to add data to sheet
export function addDataToSheet(sheet, patients, isBiomedical) {
    let headers;
    if (isBiomedical) {
        headers = ['Gender', 'Location', 'Barangay', 'Remarks', 'Age Range', 'Tested Before', 'Test Result', 'Reason', 'KVP', 'Linkage', 'Encoder', 'Date Encoded'];
    } else {
        headers = ['Gender', 'Stigma', 'Discrimination', 'Violence', 'Encoder', 'Date Encoded'];
    }

    sheet.addRow(headers).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        if (isBiomedical) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6AA26' } };
        } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6AA26' } };
        }
        cell.alignment = { horizontal: 'center' };
    });

    patients.forEach(patient => {
        if (isBiomedical) {
            const rowData = [
                patient.gender,
                patient.biomedical ? patient.biomedical.location : '',
                patient.biomedical ? patient.biomedical.barangay : '',
                patient.biomedical ? patient.biomedical.remarks : '',
                patient.biomedical ? patient.biomedical.age_range : '',
                patient.biomedical ? patient.biomedical.tested_before : '',
                patient.biomedical ? patient.biomedical.test_result : '',
                patient.biomedical ? patient.biomedical.reason : '',
                patient.biomedical ? patient.biomedical.kvp : '',
                patient.biomedical ? patient.biomedical.linkage : '',
                patient.encoder,
                formatDate(patient.date_encoded)
            ];
            sheet.addRow(rowData);
        } else {
            const nonBiomedicalRowData = [
                patient.gender,
                patient.nonbiomedical ? patient.nonbiomedical.stigma : '',
                patient.nonbiomedical ? patient.nonbiomedical.discrimination : '',
                patient.nonbiomedical ? patient.nonbiomedical.violence : '',
                patient.encoder,
                formatDate(patient.date_encoded)
            ];
            sheet.addRow(nonBiomedicalRowData);
        }
    });
}


export function autoSizeSheetColumns(sheet) {
    sheet.columns.forEach(column => {
        let maxWidth = 10;
        column.eachCell({ includeEmpty: true }, cell => {
            const len = cell.value ? cell.value.toString().length : 0;
            if (len > maxWidth) maxWidth = len;
        });
        column.width = maxWidth + 2;
    });
}
