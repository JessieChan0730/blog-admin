import type { App } from "vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/setting/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "Dashboard",
        meta: {
          hidden: false,
          title: "dashboard",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error-page/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error-page/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: "/setting",
    component: Layout,
    redirect: "/setting/home",
    children: [
      {
        path: "home",
        name: "meta",
        component: () => import("@/views/setting/index.vue"),
        meta: {
          title: "网站设置",
          icon: "el-icon-Setting",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/blog",
    component: Layout,
    redirect: "/blog/home",
    meta: {
      title: "博客管理",
      icon: "el-icon-Document",
    },
    children: [
      {
        path: "home",
        name: "my_blog",
        component: () => import("@/views/blog/index.vue"),
        meta: {
          title: "我的博客",
          keepAlive: true,
        },
      },
      {
        path: "publish",
        name: "publish",
        component: () => import("@/views/blog/publish.vue"),
        meta: {
          title: "发表博客",
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: "/tag",
    component: Layout,
    redirect: "/tags/home",
    children: [
      {
        path: "home",
        name: "tags",
        component: () => import("@/views/tags/index.vue"),
        meta: {
          title: "博客标签",
          icon: "el-icon-CollectionTag",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/category",
    component: Layout,
    redirect: "/category/home",
    children: [
      {
        path: "home",
        name: "category",
        component: () => import("@/views/category/index.vue"),
        meta: {
          title: "博客分类",
          icon: "menu",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/doc",
    component: Layout,
    redirect: "/category/redoc",
    meta: {
      title: "API文档",
      icon: "api",
    },
    children: [
      {
        path: "redoc",
        name: "redoc",
        component: () => import("@/views/api/redoc.vue"),
        meta: {
          title: "Redoc",
          keepAlive: true,
        },
      },
      {
        path: "swagger",
        name: "swagger",
        component: () => import("@/views/api/swagger.vue"),
        meta: {
          title: "Swagger",
          keepAlive: true,
        },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

/**
 * 重置路由
 */
export function resetRouter() {
  router.replace({ path: "/login" });
}

export default router;
