export class SheetsNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SheetsNotFoundError'
  }
}

export class SheetsValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SheetsValidationError'
  }
}

export class SheetsRateLimitError extends Error {
  constructor(message = 'Google Sheets API rate limit exceeded') {
    super(message)
    this.name = 'SheetsRateLimitError'
  }
}

export function handleSheetsError(err: unknown): never {
  if (err && typeof err === 'object' && 'response' in err) {
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 429) throw new SheetsRateLimitError()
    if (status === 404) throw new SheetsNotFoundError('Spreadsheet or sheet not found')
  }
  if (err instanceof Error) throw err
  throw new Error('Unknown Google Sheets error')
}

export function isSheetsError(
  err: unknown
): err is SheetsNotFoundError | SheetsValidationError | SheetsRateLimitError {
  return (
    err instanceof SheetsNotFoundError ||
    err instanceof SheetsValidationError ||
    err instanceof SheetsRateLimitError
  )
}
