import { DEFAULT_LAYOUT } from "../base";
import type { AppRouteRecordRaw } from "../types";

const NOTE: AppRouteRecordRaw = {
  path: "/note",
  name: "note",
  component: DEFAULT_LAYOUT,
  meta: {
    locale: "通知",
    icon: "icon-note",
    requiresAuth: true,
    order: 20,
  },
  redirect: "/note/list",
  children: [
    {
      path: "list",
      name: "note-list",
      component: () => import("@/views/note/index.vue"),
      meta: {
        locale: "通知列表",
        requiresAuth: true,
        roles: ["*"],
      },
    },
  ],
};

export default NOTE;
