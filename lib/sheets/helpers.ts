import type { sheets_v4 } from 'googleapis'
import { getSheetsClient, SPREADSHEET_ID } from './client'
import { cache, SHEET_CACHE_TTL_MS } from './cache'
import { handleSheetsError } from './errors'

type Sheets = sheets_v4.Sheets

// Cached sheetId resolution (name → numeric id required for deleteRow)
const sheetIdCache = new Map<string, number>()

async function resolveSheetId(sheetName: string, sheets: Sheets): Promise<number> {
  if (sheetIdCache.has(sheetName)) return sheetIdCache.get(sheetName)!
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    for (const sheet of res.data.sheets ?? []) {
      if (sheet.properties?.title && sheet.properties.sheetId != null) {
        sheetIdCache.set(sheet.properties.title, sheet.properties.sheetId)
      }
    }
  } catch (err) {
    handleSheetsError(err)
  }
  const id = sheetIdCache.get(sheetName)
  if (id === undefined) throw new Error(`Sheet "${sheetName}" not found in spreadsheet`)
  return id
}

/** Read all data rows (excludes header). Results are cached. */
export async function readSheet(
  sheetName: string,
  sheets: Sheets = getSheetsClient()
): Promise<string[][]> {
  const cacheKey = `sheet:${sheetName}`
  const cached = cache.get<string[][]>(cacheKey)
  if (cached) return cached

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    })
    const rows = (res.data.values ?? []).slice(1) as string[][] // skip header
    cache.set(cacheKey, rows, SHEET_CACHE_TTL_MS)
    return rows
  } catch (err) {
    handleSheetsError(err)
  }
}

/** Append a new row to the sheet. Invalidates cache. */
export async function appendRow(
  sheetName: string,
  values: string[],
  sheets: Sheets = getSheetsClient()
): Promise<void> {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    })
    cache.invalidate(`sheet:${sheetName}`)
  } catch (err) {
    handleSheetsError(err)
  }
}

/**
 * Update a single row by its 0-based data index (not including header).
 * Actual sheet row = rowIndex + 2 (1 for header, 1 for 1-based indexing).
 */
export async function updateRow(
  sheetName: string,
  rowIndex: number,
  values: string[],
  sheets: Sheets = getSheetsClient()
): Promise<void> {
  const sheetRow = rowIndex + 2
  const range = `${sheetName}!A${sheetRow}`
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
    cache.invalidate(`sheet:${sheetName}`)
  } catch (err) {
    handleSheetsError(err)
  }
}

/**
 * Delete a row by its 0-based data index.
 * Uses batchUpdate with DeleteDimensionRequest (requires numeric sheetId).
 */
export async function deleteRow(
  sheetName: string,
  rowIndex: number,
  sheets: Sheets = getSheetsClient()
): Promise<void> {
  const sheetId = await resolveSheetId(sheetName, sheets)
  const sheetRow = rowIndex + 1 // +1 for header offset; batchUpdate uses 0-based startIndex
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: sheetRow,
                endIndex: sheetRow + 1,
              },
            },
          },
        ],
      },
    })
    cache.invalidate(`sheet:${sheetName}`)
  } catch (err) {
    handleSheetsError(err)
  }
}

/** Find the first row where column[colIndex] === value. Returns rowIndex (0-based) and full row. */
export async function findRowByColumn(
  sheetName: string,
  colIndex: number,
  value: string,
  sheets: Sheets = getSheetsClient()
): Promise<{ rowIndex: number; row: string[] } | null> {
  const rows = await readSheet(sheetName, sheets)
  const rowIndex = rows.findIndex((row) => (row[colIndex] ?? '').toLowerCase() === value.toLowerCase())
  if (rowIndex === -1) return null
  return { rowIndex, row: rows[rowIndex] }
}

/**
 * Update multiple rows in a single API call.
 * Each update: { rowIndex: 0-based data index, values: string[] }
 */
export async function batchUpdateRows(
  sheetName: string,
  updates: Array<{ rowIndex: number; values: string[] }>,
  sheets: Sheets = getSheetsClient()
): Promise<void> {
  if (updates.length === 0) return
  const data = updates.map(({ rowIndex, values }) => ({
    range: `${sheetName}!A${rowIndex + 2}`,
    values: [values],
  }))
  try {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data,
      },
    })
    cache.invalidate(`sheet:${sheetName}`)
  } catch (err) {
    handleSheetsError(err)
  }
}
