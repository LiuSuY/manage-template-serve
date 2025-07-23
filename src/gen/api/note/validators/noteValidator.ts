import { z } from "zod";

export const createNoteSchema = z.object({

});

export const updateNoteSchema = z.object({})













});

export type CreateNote = z.infer<typeof createNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;