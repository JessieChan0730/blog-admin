import type { App } from "vue";

import hljsVuePlugin from "@highlightjs/vue-plugin";
import "highlight.js/styles/stackoverflow-light.css";
import "highlight.js/lib/common";

export function setupLHighLight(app: App<Element>) {
  // 使 v-hasPerm 在所有组件中都可用
  app.use(hljsVuePlugin);
}
