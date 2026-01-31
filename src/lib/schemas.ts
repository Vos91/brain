import { z } from "zod";

// Task validation schema
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Titel is verplicht")
    .max(200, "Titel mag maximaal 200 karakters zijn")
    .trim(),
  description: z
    .string()
    .max(2000, "Beschrijving mag maximaal 2000 karakters zijn")
    .default(""),
  status: z.enum(["todo", "in-progress", "complete"]),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["dev", "research", "admin", "cron", "communication"]),
  assignee: z.enum(["Arie", "Jasper"]).nullable(),
  notes: z
    .string()
    .max(5000, "Notities mogen maximaal 5000 karakters zijn")
    .default(""),
  due_date: z.string().nullable(),
});

export const newTaskSchema = taskSchema.omit({ status: true }).extend({
  status: z.literal("todo").default("todo"),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type NewTaskInput = z.infer<typeof newTaskSchema>;

// Validation helper
export function validateTask(data: unknown): { success: true; data: TaskInput } | { success: false; error: string } {
  const result = taskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || "Validatie mislukt" };
}

export function validateNewTask(data: unknown): { success: true; data: NewTaskInput } | { success: false; error: string } {
  const result = newTaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || "Validatie mislukt" };
}
