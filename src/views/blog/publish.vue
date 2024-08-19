<script setup lang="ts">
import { Edit, Picture, Upload } from "@element-plus/icons-vue";
const activeStep = ref(1);
</script>

<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <el-steps simple :active="activeStep">
          <el-step title="基础信息" :icon="Picture" />
          <el-step title="编写正文" :icon="Edit" />
          <el-step title="上传" :icon="Upload" />
        </el-steps>
      </template>
      <template #default></template>
      <template #footer>
        <div class="btn-group flex flex-row justify-end">
          <el-button @click="activeStep--">上一步</el-button>
          <el-button
            type="primary"
            v-if="activeStep != 3"
            @click="activeStep++"
          >
            下一步
          </el-button>
          <el-button type="primary" v-else>上传</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
