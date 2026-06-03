import { z } from "zod/mini";

const SuccessResultSchema = z.object({
    success: z.boolean()
});
type SuccessResult = z.infer<typeof SuccessResultSchema>;

const DataResultSchema = z.object({
    data: z.string(),
});
type DataResult = z.infer<typeof DataResultSchema>;

export { SuccessResultSchema, type SuccessResult, DataResultSchema, type DataResult };