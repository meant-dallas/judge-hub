import type { Project } from '@/types/sheets'
import { SHEET_NAMES } from './client'
import { readSheet, appendRow, updateRow, findRowByColumn } from './helpers'
import { rowToProject } from '@/types/sheets'
import { SheetsNotFoundError } from './errors'

const COL = {
  PROJECT_ID: 0,
  TITLE: 1,
  DESCRIPTION: 2,
  CATEGORY: 3,
  TEAM_NAME: 4,
  CONTACT_EMAIL: 5,
  STATUS: 6,
  CREATED_AT: 7,
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await readSheet(SHEET_NAMES.PROJECTS)
  return rows.filter((r) => r[COL.PROJECT_ID]).map(rowToProject)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const result = await findRowByColumn(SHEET_NAMES.PROJECTS, COL.PROJECT_ID, id)
  if (!result) return null
  return rowToProject(result.row)
}

export async function createProject(
  data: Omit<Project, 'created_at'>
): Promise<Project> {
  const now = new Date().toISOString()
  await appendRow(SHEET_NAMES.PROJECTS, [
    data.project_id,
    data.title,
    data.description,
    data.category,
    data.team_name,
    data.contact_email,
    data.status,
    now,
  ])
  return { ...data, created_at: now }
}

export async function updateProjectStatus(
  projectId: string,
  status: Project['status']
): Promise<void> {
  const result = await findRowByColumn(SHEET_NAMES.PROJECTS, COL.PROJECT_ID, projectId)
  if (!result) throw new SheetsNotFoundError(`Project "${projectId}" not found`)

  const updated = [...result.row]
  updated[COL.STATUS] = status
  await updateRow(SHEET_NAMES.PROJECTS, result.rowIndex, updated)
}
