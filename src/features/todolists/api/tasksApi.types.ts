import { z } from "zod/v4"
import { TaskPriority, TaskStatus } from "@/common/enums"
import { baseResponseSchema } from "@/common/types"

export const domainTaskSchema = z.object({
  description: z.string().nullable(),
  deadline: z.string().nullable(),
  startDate: z.string().nullable(),
  title: z.string(),
  id: z.string(),
  todoListId: z.string(),
  order: z.int(),
  addedDate: z.iso.datetime({ local: true }),
  status: z.enum(TaskStatus),
  priority: z.enum(TaskPriority),
})

export type DomainTask = z.infer<typeof domainTaskSchema>

export const getTasksShema = z.object({
  error: z.string().nullable(),
  totalCount: z.number().int().nonnegative(),
  items: domainTaskSchema.array(),
})

export type GetTasksResponse = z.infer<typeof getTasksShema>

// create and update task
export const taskOperationResponseSchema = baseResponseSchema(
  z.object({
    item: domainTaskSchema,
  }),
)

export type TaskOperationResponse = z.infer<typeof taskOperationResponseSchema>

export type UpdateTaskModel = {
  description: string | null
  startDate: string | null
  deadline: string | null
  title: string
  status: TaskStatus
  priority: TaskPriority
}
