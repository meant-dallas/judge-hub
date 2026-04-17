import type { UserRole } from './index'

export interface SheetUser {
  email: string
  role: UserRole
  name: string
  status: 'active' | 'inactive'
  created_at: string
  notes: string
}

export interface Participant {
  participant_id: string
  name: string
  description: string
  category: string
  team_name: string
  contact_email: string
  status: 'pending' | 'active' | 'judging' | 'complete'
  created_at: string
  event_id: string
}

export interface Criterion {
  criteria_id: string
  name: string
  description: string
  max_score: number
  weight: number
  category: string
  event_id: string
}

export interface Event {
  event_id: string
  name: string
  description: string
  date: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
  created_by: string
  active_participant_id: string  // '' when no live session
}

export interface Score {
  score_id: string
  judge_email: string
  participant_id: string
  criteria_id: string
  score: number
  comments: string
  submitted_at: string
  is_draft: boolean
}

export interface Assignment {
  assignment_id: string
  judge_email: string
  participant_id: string
  assigned_at: string
  assigned_by: string
}

export interface LeaderboardEntry {
  participant_id: string
  name: string
  weighted_score: number
  judge_count: number
}

// Row-to-object mappers

export function rowToUser(row: string[]): SheetUser {
  return {
    email: row[0] ?? '',
    role: (row[1] ?? 'judge') as UserRole,
    name: row[2] ?? '',
    status: (row[3] ?? 'active') as 'active' | 'inactive',
    created_at: row[4] ?? '',
    notes: row[5] ?? '',
  }
}

export function rowToParticipant(row: string[]): Participant {
  return {
    participant_id: row[0] ?? '',
    name: row[1] ?? '',
    description: row[2] ?? '',
    category: row[3] ?? '',
    team_name: row[4] ?? '',
    contact_email: row[5] ?? '',
    status: (row[6] ?? 'pending') as Participant['status'],
    created_at: row[7] ?? '',
    event_id: row[8] ?? '',
  }
}

export function rowToCriterion(row: string[]): Criterion {
  return {
    criteria_id: row[0] ?? '',
    name: row[1] ?? '',
    description: row[2] ?? '',
    max_score: parseFloat(row[3] ?? '10'),
    weight: parseFloat(row[4] ?? '1'),
    category: row[5] ?? '',
    event_id: row[6] ?? '',
  }
}

export function rowToEvent(row: string[]): Event {
  return {
    event_id: row[0] ?? '',
    name: row[1] ?? '',
    description: row[2] ?? '',
    date: row[3] ?? '',
    status: (row[4] ?? 'draft') as Event['status'],
    created_at: row[5] ?? '',
    created_by: row[6] ?? '',
    active_participant_id: row[7] ?? '',
  }
}

export function rowToScore(row: string[]): Score {
  return {
    score_id: row[0] ?? '',
    judge_email: row[1] ?? '',
    participant_id: row[2] ?? '',
    criteria_id: row[3] ?? '',
    score: parseFloat(row[4] ?? '0'),
    comments: row[5] ?? '',
    submitted_at: row[6] ?? '',
    is_draft: row[7] === 'TRUE',
  }
}

export function rowToAssignment(row: string[]): Assignment {
  return {
    assignment_id: row[0] ?? '',
    judge_email: row[1] ?? '',
    participant_id: row[2] ?? '',
    assigned_at: row[3] ?? '',
    assigned_by: row[4] ?? '',
  }
}
