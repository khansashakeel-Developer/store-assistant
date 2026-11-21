// Saves chatbot leads into a Google Sheet.
// 1. Make a new Google Sheet. Row 1: time | client | name | contact | question
// 2. Extensions > Apps Script. Paste this code. Save.
// 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// 4. Copy the Web app URL. Put it in Vercel as LEADS_WEBHOOK_URL.
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    .appendRow([d.time, d.client, d.name, d.contact, d.question]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
