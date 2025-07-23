import { z } from "zod";

export const create${capitalizedModule}Schema = z.object({
${createValidation}
});

export const update${capitalizedModule}Schema = z.object({
${updateValidation}
});

export type Create${capitalizedModule} = z.infer<typeof create${capitalizedModule}Schema>;
export type Update${capitalizedModule} = z.infer<typeof update${capitalizedModule}Schema>;