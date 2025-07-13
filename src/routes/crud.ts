import { Router } from "@oak/oak";
import { validateBody } from "../middleware/validation.ts";
import { createCrudSchema } from "../validators/crudValidator.ts";
import * as crudController from "../controllers/crudController.ts";

const router = new Router({ prefix: "/api/crud" });

// 创建crud
router.post("/", validateBody(createCrudSchema), crudController.createCrud);

export default router;
