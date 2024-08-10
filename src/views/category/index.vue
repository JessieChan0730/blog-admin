<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import type { CategoryVo, QueryParams } from "@/api/category";

let categoryListPagination = reactive<Pagination<CategoryVo>>({
  count: 2,
  next: "",
  previous: "",
  results: [
    {
      id: 1,
      name: "java",
    },
    {
      id: 2,
      name: "python",
    },
  ],
});
let queryParams = reactive<QueryParams>({
  keyWords: "",
  page: 1,
});
const pageSize = ref(5);
const currentPage = ref(1);
const disabled = ref(false);
const background = ref(true);

const handleCurrentChange = (page: number) => {
  console.log("chang current page");
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keyWords"
            placeholder="分类名"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary">
            <i-ep-search />
            搜索
          </el-button>
          <el-button>
            <i-ep-refresh />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" :icon="Plus">新增</el-button>
        <el-popconfirm
          confirm-button-text="确认"
          cancel-button-text="取消"
          :icon="InfoFilled"
          icon-color="#f40"
          title="你确定要删除这些标签吗？"
          width="220"
          confirm-button-type="danger"
        >
          <template #reference>
            <el-button type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <el-table
        :data="categoryListPagination.results"
        border
        style="width: 100%"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column property="id" label="标签ID" width="200" />
        <el-table-column property="name" label="标签名" width="full" />
        <el-table-column label="操作">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-popconfirm
              confirm-button-text="确认"
              cancel-button-text="取消"
              :icon="InfoFilled"
              icon-color="#f40"
              title="你确定要删除这个标签吗？"
              width="220"
              confirm-button-type="danger"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-pagination
          :default-page-size="pageSize"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="categoryListPagination.count"
          :disabled="disabled"
          :background="background"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
