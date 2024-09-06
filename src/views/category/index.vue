<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import type { CategoryForm, CategoryVo, QueryParams } from "@/api/category";
import { CategoryAPI } from "@/api/category";
import type { FormInstance, FormRules } from "element-plus";
import { PaginationType, useGetPageSize } from "@/hooks/settings";

enum DType {
  Add,
  Edit,
  NUll,
}

interface DialogInfo {
  visible: boolean;
  title: string;
  type: DType;
}

const dialogInfo = reactive<DialogInfo>({
  visible: false,
  title: "",
  type: DType.NUll,
});

let categoryListPagination = reactive<Pagination<CategoryVo>>({
  count: 1,
  next: "",
  previous: "",
  results: [],
});

let queryParams = reactive<QueryParams>({
  name: "",
  page: 1,
});

const categoryForm = reactive<CategoryForm>({
  name: "",
  display: false,
});

const categoryFormRuler = reactive<FormRules<CategoryForm>>({
  name: [
    { required: true, message: "必须填写分类名！", trigger: "blur" },
    {
      min: 1,
      max: 10,
      message: "分类名长度最小为1，最大为10！",
      trigger: "blur",
    },
  ],
  display: [],
});
// 拆分 queryParams，并且交给监听器处理
const name = toRef(queryParams, "name");
const page = toRef(queryParams, "page");
// 分页组件状态
const pageSize = ref(0);
const disabled = ref(false);
const background = ref(true);
// 搜索的内容
const searchContent = ref("");
// 加载动画
const loading = ref(false);
// 表单实例
const ruleFormRef = ref<FormInstance>();
// 选中的category
const selectCategories = ref<CategoryVo[]>([]);
// 挂载时，加载第一页数据
onMounted(() => {
  init();
});
// 计算属性
const ids = computed(() => {
  return selectCategories.value.map((category) => {
    return category.id;
  });
});
// 监听器
watch([name, page], async () => {
  loading.value = true;
  await loadCategoryData(queryParams);
  loading.value = false;
});

const init = async () => {
  pageSize.value = await useGetPageSize(PaginationType.Category);
  await loadCategoryData();
};

// 展示dialog
const showDialog = (type: DType, row?: any) => {
  if (type == DType.Edit) {
    dialogInfo.title = "编辑分类";
    // 初始化dialog中编辑框的内容
    categoryForm.name = row.name;
    categoryForm.display = row.display;
    categoryForm.id = row.id;
  } else if (type == DType.Add) {
    dialogInfo.title = "新增分类";
  }
  dialogInfo.type = type;
  dialogInfo.visible = true;
};

// 关闭对话框
const closeDialog = () => {
  dialogInfo.visible = false;
  categoryForm.name = "";
  categoryForm.id = -1;
  categoryForm.display = false;
};

// 提交对话框数据
const commit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  let result: CategoryVo;
  await formEl.validate(async (valid) => {
    if (valid) {
      // TODO 验证通过
      if (dialogInfo.type == DType.Add) {
        // TODO 新增
        result = await CategoryAPI.addCategory(categoryForm);
        if (categoryListPagination.results.length < pageSize.value) {
          categoryListPagination.results.push(result);
        }
        categoryListPagination.count++;
      } else if (dialogInfo.type == DType.Edit) {
        // TODO 编辑
        result = await CategoryAPI.updateCategory(categoryForm);
        categoryListPagination.results = categoryListPagination.results?.map(
          (category) => {
            if (category.id == result.id) {
              category.name = result.name;
              category.display = result.display;
            }
            return category;
          }
        );
      } else {
        ElNotification({
          title: "错误",
          message: "系统错误",
          type: "error",
        });
      }
      closeDialog();
    } else {
      ElNotification({
        title: "错误",
        message: "请按照表单规则提交",
        type: "error",
      });
    }
  });
};

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

// 删除单个category
const deleteCategory = async (id: number | string) => {
  await CategoryAPI.deleteCategory(id);
  // 手动刷新当页页面
  await loadCategoryData(queryParams);
};
// 删除多个category
const deleteCategories = async () => {
  if (ids.value.length !== 0) {
    await CategoryAPI.deleteCategories(ids.value);
    // 手动刷新当页页面
    await loadCategoryData(queryParams);
  } else {
    ElMessage.error("请框选对应的链接");
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
  searchContent.value = "";
};

const handleCurrentChange = (currentPage: number) => {
  page.value = currentPage;
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};

const selectChange = (newSelection: CategoryVo[]) => {
  selectCategories.value = newSelection;
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
        <el-button type="success" :icon="Plus" @click="showDialog(DType.Add)">
          新增
        </el-button>
        <el-popconfirm
          confirm-button-text="确认"
          cancel-button-text="取消"
          :icon="InfoFilled"
          icon-color="#f40"
          title="你确定要删除这些标签吗？"
          width="220"
          confirm-button-type="danger"
          @confirm="deleteCategories"
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
        @selection-change="selectChange"
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
          <template #default="prop">
            <el-button
              size="small"
              type="primary"
              @click="showDialog(DType.Edit, prop.row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              confirm-button-text="确认"
              cancel-button-text="取消"
              :icon="InfoFilled"
              icon-color="#f40"
              title="你确定要删除这个标签吗？"
              width="220"
              confirm-button-type="danger"
              @confirm="deleteCategory(prop.row.id)"
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
    <!--Dialog-->
    <el-dialog
      @close="closeDialog"
      v-model="dialogInfo.visible"
      :title="dialogInfo.title"
      width="500"
    >
      <el-form
        :model="categoryForm"
        :rules="categoryFormRuler"
        ref="ruleFormRef"
      >
        <el-form-item
          label="标签名:"
          label-width="70px"
          label-position="top"
          prop="name"
        >
          <el-input v-model="categoryForm.name" auto-complete="off" />
        </el-form-item>
        <el-form-item
          label="是否展示:"
          label-width="70px"
          label-position="top"
          prop="display"
        >
          <el-switch v-model="categoryForm.display" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="commit(ruleFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
