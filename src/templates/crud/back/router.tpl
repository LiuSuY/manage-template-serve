import { Router } from "@oak/oak";
import { validateBody, validateQuery } from "../middleware/validation.ts";
import { create${capitalizedModule}Schema, update${capitalizedModule}Schema } from "../validators/${module}Validator.ts";
import * as ${module}Controller from "../controllers/${module}Controller.ts";

const router = new Router({ prefix: "/api/${module}" });

// 创建${module}
router.post("/", 
  validateBody(create${capitalizedModule}Schema),
  ${module}Controller.create${capitalizedModule}
);

// 获取${module}列表
router.get("/list",
  validateQuery(),
  ${module}Controller.get${capitalizedModule}List
);

// 获取单个${module}
router.get("/:id",
  validateQuery(),
  ${module}Controller.get${capitalizedModule}ById
);

// 更新${module}
router.put("/:id",
  validateBody(update${capitalizedModule}Schema),
  ${module}Controller.update${capitalizedModule}
);

// 删除${module}
router.delete("/:id",
  validateQuery(),
  ${module}Controller.delete${capitalizedModule}
);

export default router;