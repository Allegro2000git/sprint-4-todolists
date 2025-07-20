import { z } from "zod/v4"

const MIN = 5

export const loginSchema = z.object({
  email: z.email({ error: "Неккоректный e-mail" }),
  password: z.string().min(MIN, { error: `Минимальная длина ${MIN} симовлов` }),
  rememberMe: z.boolean(),
})

export type LoginInputs = z.infer<typeof loginSchema>
