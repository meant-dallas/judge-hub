import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  email:      text('email').primaryKey(),
  role:       text('role').notNull().default('judge'),
  name:       text('name').notNull().default(''),
  status:     text('status').notNull().default('active'),
  created_at: text('created_at').notNull().default(''),
  notes:      text('notes').notNull().default(''),
})

export const events = sqliteTable('events', {
  event_id:             text('event_id').primaryKey(),
  name:                 text('name').notNull(),
  description:          text('description').notNull().default(''),
  date:                 text('date').notNull(),
  status:               text('status').notNull().default('draft'),
  created_at:           text('created_at').notNull(),
  created_by:           text('created_by').notNull(),
  active_participant_id: text('active_participant_id').notNull().default(''),
  time_limit_minutes:   integer('time_limit_minutes').notNull().default(0),
  overtime_deduction:   integer('overtime_deduction').notNull().default(0),
  normalize_scores:     integer('normalize_scores').notNull().default(sql`0`),
})

export const participants = sqliteTable('participants', {
  participant_id: text('participant_id').primaryKey(),
  name:           text('name').notNull(),
  description:    text('description').notNull().default(''),
  category:       text('category').notNull().default(''),
  team_name:      text('team_name').notNull().default(''),
  contact_email:  text('contact_email').notNull().default(''),
  status:         text('status').notNull().default('pending'),
  created_at:     text('created_at').notNull(),
  event_id:       text('event_id').notNull(),
  overtime:       integer('overtime').notNull().default(sql`0`),
})

export const criteria = sqliteTable('criteria', {
  criteria_id: text('criteria_id').primaryKey(),
  name:        text('name').notNull(),
  description: text('description').notNull().default(''),
  max_score:   real('max_score').notNull().default(10),
  weight:      real('weight').notNull().default(1),
  category:    text('category').notNull().default(''),
  event_id:    text('event_id').notNull(),
})

export const scores = sqliteTable('scores', {
  score_id:       text('score_id').primaryKey(),
  judge_email:    text('judge_email').notNull(),
  participant_id: text('participant_id').notNull(),
  criteria_id:    text('criteria_id').notNull(),
  score:          real('score').notNull().default(0),
  comments:       text('comments').notNull().default(''),
  submitted_at:   text('submitted_at').notNull().default(''),
  is_draft:       integer('is_draft').notNull().default(sql`1`),
})

export const assignments = sqliteTable('assignments', {
  assignment_id:  text('assignment_id').primaryKey(),
  judge_email:    text('judge_email').notNull(),
  participant_id: text('participant_id').notNull(),
  assigned_at:    text('assigned_at').notNull(),
  assigned_by:    text('assigned_by').notNull(),
})
