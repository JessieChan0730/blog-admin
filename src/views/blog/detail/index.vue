<script setup lang="ts">
import router from "@/router";

const paths = router.currentRoute.value.fullPath.split("/")[3];
</script>

<template>
  <div class="app-container">
    <el-card>
      <template #default>
        <el-menu
          ellipsis
          class="w-full"
          mode="horizontal"
          :router="true"
          :default-active="paths"
        >
          <el-menu-item index="preview">预览</el-menu-item>
          <el-menu-item index="manage">管理</el-menu-item>
        </el-menu>
        <div class="view-container mt-4">
          <router-view />
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
