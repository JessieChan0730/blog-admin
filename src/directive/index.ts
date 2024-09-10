import type { App } from "vue";

import { hasPerm } from "./permission";
import { highlight } from "@/directive/highlight";

// 全局注册 directive
// 指令
export function setupDirective(app: App<Element>) {
  // 使 v-hasPerm 在所有组件中都可用
  app.directive("hasPerm", hasPerm);
  app.directive("highlight", highlight);
}
