import { Router } from "@oak/oak";
import { validateBody, validateQuery } from "../middleware/validation.ts";
import { create${capitalizedModule}Schema, update${capitalizedModule}Schema, delete${capitalizedModule}Schema, list${capitalizedModule}Schema } from "../validators/${module}Validator.ts";
import * as ${module}Controller from "../controllers/${module}Controller.ts";

const router = new Router({ prefix: "/api/${module}" });

// 创建${module}
router.post("/create", 
  validateBody(create${capitalizedModule}Schema),
  ${module}Controller.create${capitalizedModule}
);

// 获取${module}列表 - 改为POST请求支持复杂查询
router.post("/list",
  validateBody(list${capitalizedModule}Schema),
  ${module}Controller.get${capitalizedModule}List
);

// 获取单个${module}
router.get("/:id",
  validateQuery(),
  ${module}Controller.get${capitalizedModule}ById
);

// 更新${module}
router.post("/update",
  validateBody(update${capitalizedModule}Schema),
  ${module}Controller.update${capitalizedModule}
);

// 删除${module}
router.post("/delete",
  validateBody(delete${capitalizedModule}Schema),
  ${module}Controller.delete${capitalizedModule}
);

export default router;