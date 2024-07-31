<script setup lang="ts">
import { ComponentSize } from "element-plus";
import { TagsVO } from "@/api/tags";

const tagsList = ref<TagsVO[]>([
  {
    id: 1,
    name: "Python",
  },
  {
    id: 2,
    name: "Java",
  },
]);
const currentPage4 = ref(4);
const pageSize4 = ref(100);
const size = ref<ComponentSize>("default");
const disabled = ref(false);
const background = ref(true);
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success">新增</el-button>
        <el-button type="danger">删除</el-button>
      </template>
      <el-table :data="tagsList" border style="width: 100%" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column property="id" label="标签ID" width="200" />
        <el-table-column property="name" label="标签名" width="full" />
        <el-table-column label="操作">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-pagination
          v-model:current-page="currentPage4"
          v-model:page-size="pageSize4"
          :page-sizes="[100, 200, 300, 400]"
          :size="size"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="400"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
