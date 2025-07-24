import { z } from "zod";

export const create${capitalizedModule}Schema = z.object({
${createValidation}
});

export const update${capitalizedModule}Schema = z.object({
${updateValidation}
});

export const delete${capitalizedModule}Schema = z.object({
${deleteValidation}
});

export const list${capitalizedModule}Schema = z.object({
${listValidation}
});

export type Create${capitalizedModule} = z.infer<typeof create${capitalizedModule}Schema>;
export type Update${capitalizedModule} = z.infer<typeof update${capitalizedModule}Schema>;
export type Delete${capitalizedModule} = z.infer<typeof delete${capitalizedModule}Schema>;
export type List${capitalizedModule} = z.infer<typeof list${capitalizedModule}Schema>;