import { Router } from "@oak/oak";
import { validateBody, validateQuery } from "../middleware/validation.ts";
import { createNoteSchema, updateNoteSchema } from "../validators/noteValidator.ts";
import * as noteController from "../controllers/noteController.ts";

const router = new Router({ prefix: "/api/note" });

// 创建note
router.post("/", 
  validateBody(createNoteSchema),
  noteController.createNote
);

// 获取note列表
router.get("/list",
  validateQuery(),
  noteController.getNoteList
);

// 获取单个note
router.get("/:id",
  validateQuery(),
  noteController.getNoteById
);

// 更新note
router.put("/update",
  validateBody(updateNoteSchema),
  noteController.updateNote
);

// 删除note
router.delete("/delete",
  validateBody({
    id: { type: "number" }
  }),
  noteController.deleteNote
);

export default router;