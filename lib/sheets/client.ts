import { google } from 'googleapis'
import type { sheets_v4 } from 'googleapis'

const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

if (!clientEmail || !privateKeyRaw || !spreadsheetId) {
  throw new Error(
    'Missing required Google Sheets env vars: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID'
  )
}

const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

let sheetsClient: sheets_v4.Sheets | null = null

export function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: 'v4', auth })
  }
  return sheetsClient
}

export const SPREADSHEET_ID = spreadsheetId

export const SHEET_NAMES = {
  USERS: 'Users',
  PARTICIPANTS: 'Participants',
  CRITERIA: 'Criteria',
  SCORES: 'Scores',
  ASSIGNMENTS: 'Assignments',
  EVENTS: 'Events',
} as const
