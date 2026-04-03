import { z } from "zod/mini";

const SuccessResultSchema = z.object({
    success: z.boolean()
});
type SuccessResult = z.infer<typeof SuccessResultSchema>;

export { SuccessResultSchema, type SuccessResult };