<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import type { CategoryVo, QueryParams } from "@/api/category";
import { CategoryAPI } from "@/api/category";

let categoryListPagination = reactive<Pagination<CategoryVo>>({
  count: 2,
  next: "",
  previous: "",
  results: [],
});

let queryParams = reactive<QueryParams>({
  name: "",
  page: 1,
});

// 拆分 queryParams，并且交给监听器处理
const name = toRef(queryParams, "name");
const page = toRef(queryParams, "page");
// 分页组件状态
const pageSize = ref(5);
const disabled = ref(false);
const background = ref(true);
// 搜索的内容
const searchContent = ref("");
// 加载动画
const loading = ref(false);

// 挂载时，加载第一页数据
onMounted(() => {
  loadCategoryData();
});
// 监听器
watch([name, page], async () => {
  loading.value = true;
  await loadCategoryData(queryParams);
  loading.value = false;
});

// 加载数据
const loadCategoryData = async (params?: QueryParams) => {
  const response = await CategoryAPI.getCategoryData(params);
  if (response) {
    categoryListPagination.count = response.count;
    categoryListPagination.next = response.next;
    categoryListPagination.previous = response.previous;
    categoryListPagination.results = response.results;
  }
};

// 搜索
const search = () => {
  name.value = searchContent.value;
  page.value = 1;
};
// 重置
const reset = () => {
  name.value = "";
  page.value = 1;
};

const handleCurrentChange = (currentPage: number) => {
  page.value = currentPage;
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
          <el-input v-model="searchContent" placeholder="分类名" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="search">
            <i-ep-search />
            搜索
          </el-button>
          <el-button @click="reset">
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
        v-loading="loading"
        :data="categoryListPagination.results"
        border
        style="width: 100%"
        stripe
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column
          align="center"
          property="id"
          label="分类ID"
          width="200"
        />
        <el-table-column
          align="center"
          property="name"
          label="分类名"
          width="full"
        />
        <el-table-column
          align="center"
          property="display"
          label="主页展示"
          width="full"
          prop="display"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.display ? 'success' : 'danger'"
              disable-transitions
            >
              {{ scope.row.display ? "展示" : "不展示" }}
            </el-tag>
          </template>
        </el-table-column>
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
          v-model:current-page="queryParams.page"
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
