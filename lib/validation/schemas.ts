import { z } from 'zod'

// ─── Events ──────────────────────────────────────────────────────────────────

export const CreateEventSchema = z.object({
  event_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  created_by: z.string().email(),
})

export const UpdateEventStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'completed', 'archived']),
})

// ─── Participants ─────────────────────────────────────────────────────────────

export const CreateParticipantSchema = z.object({
  participant_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  category: z.string().default(''),
  team_name: z.string().default(''),
  contact_email: z.string().email().or(z.literal('')).default(''),
  status: z.enum(['pending', 'active', 'judging', 'complete']).default('pending'),
  event_id: z.string().default(''),
})

export const UpdateParticipantStatusSchema = z.object({
  status: z.enum(['pending', 'active', 'judging', 'complete']),
})

// ─── Criteria ─────────────────────────────────────────────────────────────────

export const CreateCriterionSchema = z.object({
  criteria_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  max_score: z.number().positive(),
  weight: z.number().positive().default(1),
  category: z.string().default(''),
  event_id: z.string().default(''),
})

// ─── Users ───────────────────────────────────────────────────────────────────

export const UpsertUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'coordinator', 'judge']),
  name: z.string().optional(),
})

export const SetUserStatusSchema = z.object({
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
})

// ─── Scores ──────────────────────────────────────────────────────────────────

export const UpsertScoreSchema = z.object({
  judge_email: z.string().email(),
  participant_id: z.string().min(1),
  criteria_id: z.string().min(1),
  score: z.number().min(0).max(100),
  comments: z.string().default(''),
  is_draft: z.boolean().default(true),
})

export const SubmitScoresSchema = z.object({
  participantId: z.string().min(1),
})

// ─── Assignments ─────────────────────────────────────────────────────────────

export const AssignJudgeSchema = z.object({
  judgeEmail: z.string().email(),
  participantId: z.string().min(1),
})

// ─── Inferred types ──────────────────────────────────────────────────────────

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type CreateParticipantInput = z.infer<typeof CreateParticipantSchema>
export type CreateCriterionInput = z.infer<typeof CreateCriterionSchema>
export type UpsertUserInput = z.infer<typeof UpsertUserSchema>
export type UpsertScoreInput = z.infer<typeof UpsertScoreSchema>
export type AssignJudgeInput = z.infer<typeof AssignJudgeSchema>
