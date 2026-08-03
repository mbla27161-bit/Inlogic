/**
 * Google Apps Script — paste into a new Apps Script bound to your Sheet.
 * 1. Create a Google Sheet with headers in row 1:
 *    Timestamp | Name | Phone | From | To | Type | Weight | Message | Page
 * 2. Extensions → Apps Script → paste this code
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL into assets/scripts/config.js → INLOGIC_FORM_ENDPOINT
 */

var SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([
      data.sentAt || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.from || '',
      data.to || '',
      data.type || '',
      data.weight || '',
      data.message || '',
      data.page || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('InLogic form endpoint OK');
}
