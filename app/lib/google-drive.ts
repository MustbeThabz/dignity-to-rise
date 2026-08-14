import { google } from "googleapis";

export async function uploadVolunteerRecord(filename: string, record: unknown) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!folderId || !email || !privateKey) return false;

  const auth = new google.auth.JWT({ email, key: privateKey, scopes: ["https://www.googleapis.com/auth/drive.file"] });
  const drive = google.drive({ version: "v3", auth });
  await drive.files.create({
    requestBody: { name: filename, parents: [folderId], mimeType: "application/json" },
    media: { mimeType: "application/json", body: JSON.stringify(record, null, 2) },
    fields: "id"
  });
  return true;
}
