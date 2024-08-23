import VueDOMPurifyHTML from "vue-dompurify-html";
import { App } from "vue";

// 全局注册防xss攻击的组件
export function setupVueDOMPurifyHTML(app: App<Element>) {
  app.use(VueDOMPurifyHTML);
}
