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
        component: () => import("@/views/redirect/index.vue"),
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
    redirect: "/setting/front",
    meta: {
      title: "网站设置",
      icon: "el-icon-Setting",
    },
    children: [
      {
        path: "front",
        name: "front",
        component: () => import("@/views/setting/front.vue"),
        meta: {
          title: "客户端设置",
          icon: "el-icon-Cellphone",
          keepAlive: true,
        },
      },
      {
        path: "admin",
        name: "admin",
        component: () => import("@/views/setting/admin.vue"),
        meta: {
          title: "后台设置",
          icon: "el-icon-Monitor",
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
          icon: "blog",
        },
      },
      {
        path: ":id",
        name: "blog_detail",
        component: () => import("@/views/blog/detail/index.vue"),
        redirect(to) {
          const id = to.params.id;
          return `/blog/${id}/preview`;
        },
        meta: {
          title: "详情界面",
          keepAlive: true,
          hidden: true,
          activeMenu: "/blog/home",
        },
        children: [
          {
            path: "preview",
            name: "blog_preview",
            component: () => import("@/views/blog/detail/preview.vue"),
            meta: {
              title: "预览博客",
              keepAlive: true,
              hidden: true,
            },
          },
          {
            path: "manage",
            name: "blog_manage",
            component: () => import("@/views/blog/detail/manage.vue"),
            meta: {
              title: "管理博客",
              keepAlive: true,
              hidden: true,
            },
          },
        ],
      },
      {
        path: "publish",
        name: "publish",
        component: () => import("@/views/blog/publish.vue"),
        meta: {
          title: "发表博客",
          keepAlive: true,
          icon: "edit",
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
          title: "标签管理",
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
          title: "分类管理",
          icon: "menu",
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: "/other",
    component: Layout,
    redirect: "/other/friendlink",
    meta: {
      title: "其他页面",
      icon: "el-icon-Document",
    },
    children: [
      {
        path: "friendlink",
        name: "friendlink",
        component: () => import("@/views/other/friendLink.vue"),
        meta: {
          title: "友情链接",
          keepAlive: true,
          icon: "link",
        },
      },
      {
        path: "photowall",
        name: "photowall",
        component: () => import("@/views/other/photoWall.vue"),
        meta: {
          title: "照片墙",
          keepAlive: true,
          icon: "el-icon-Picture",
        },
      },
      {
        path: "about",
        name: "about",
        component: () => import("@/views/other/about.vue"),
        meta: {
          title: "关于本站",
          keepAlive: true,
          icon: "el-icon-Warning",
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
          icon: "api",
        },
      },
      {
        path: "swagger",
        name: "swagger",
        component: () => import("@/views/api/swagger.vue"),
        meta: {
          title: "Swagger",
          keepAlive: true,
          icon: "api",
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
