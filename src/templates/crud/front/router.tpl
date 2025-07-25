import { DEFAULT_LAYOUT } from "../base";
import type { AppRouteRecordRaw } from "../types";

const ${moduleUpperCase}: AppRouteRecordRaw = {
  path: "/${module}",
  name: "${module}",
  component: DEFAULT_LAYOUT,
  meta: {
    locale: "${moduleName}",
    icon: "icon-${module}",
    requiresAuth: true,
    order: ${order},
  },
  redirect: "/${module}/list",
  children: [
    {
      path: "list",
      name: "${module}-list",
      component: () => import("@/views/${module}/index.vue"),
      meta: {
        locale: "${moduleName}列表",
        requiresAuth: true,
        roles: ["*"],
      },
    },
  ],
};

export default ${moduleUpperCase};
