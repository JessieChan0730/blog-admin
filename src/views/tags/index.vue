<script setup lang="ts">
import { TagsVO, TagsAPI, TagsForm } from "@/api/tags";
import type { Pagination } from "@/api/pagination";
import { onMounted } from "vue";
import type { FormRules, FormInstance } from "element-plus";
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";

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

const tagForm = reactive<TagsForm>({
  name: "",
});

let tagsListPagination = reactive<Pagination<TagsVO>>({
  count: 0,
  next: "",
  previous: "",
  results: [],
});

// 表单验证规则
const tagsFormRuler = reactive<FormRules<TagsForm>>({
  name: [
    { required: true, message: "必须填写标签名！", trigger: "blur" },
    {
      min: 1,
      max: 8,
      message: "标签名长度最小为1，最大为8！",
      trigger: "blur",
    },
  ],
});

const currentPage = ref(1);
const disabled = ref(false);
const background = ref(true);
const ruleFormRef = ref<FormInstance>();
const pageSize = ref(5);
// 选中的tags
const selectTags = ref<TagsVO[]>([]);
// 请求数据
onMounted(() => {
  loadTagsData(1);
});
/**
 * 计算属性
 * 通过checkbox选中的tags实例，计算出对应的ID数组
 */
const ids = computed(() => {
  return selectTags.value.map((tag) => {
    return tag.id;
  });
});
const loadTagsData = async (page: number) => {
  const response = await TagsAPI.getAllTags(page);
  if (response) {
    tagsListPagination.count = response.count;
    tagsListPagination.next = response.next;
    tagsListPagination.previous = response.previous;
    tagsListPagination.results = response.results;
  }
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};

const handleCurrentChange = (page: number) => {
  loadTagsData(page);
};

const showDialog = (type: DType, row?: any) => {
  if (type == DType.Edit) {
    dialogInfo.title = "编辑标签";
    // 初始化dialog中编辑框的内容
    tagForm.name = row.name;
    tagForm.id = row.id;
  } else if (type == DType.Add) {
    dialogInfo.title = "新增标签";
  }
  dialogInfo.type = type;
  dialogInfo.visible = true;
};

const closeDialog = () => {
  dialogInfo.visible = false;
  tagForm.name = "";
  tagForm.id = -1;
};

const commit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  let result: TagsVO;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (dialogInfo.type == DType.Add) {
        result = await TagsAPI.addTags(tagForm);
        // 刷新页面数据
        if (tagsListPagination.results.length < pageSize.value) {
          tagsListPagination.results.push(result);
        }
        tagsListPagination.count++;
      } else if (dialogInfo.type == DType.Edit) {
        result = await TagsAPI.updateTags(tagForm.id as number, tagForm);
        tagsListPagination.results = tagsListPagination.results?.map((tag) => {
          if (tag.id == result.id) {
            tag.name = result.name;
          }
          return tag;
        });
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
// 删除单个tag
const deleteTag = async (id: number | string) => {
  await TagsAPI.deleteTag(id);
  // 刷新当页数据
  loadTagsData(currentPage.value);
};
// 删除多个tag
const deleteTags = async () => {
  await TagsAPI.deleteTags(ids.value);
  // 刷新当页数据
  loadTagsData(currentPage.value);
};

const selectChange = (newSelection: TagsVO[]) => {
  selectTags.value = newSelection;
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" @click="showDialog(DType.Add)" :icon="Plus">
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
          @confirm="deleteTags"
        >
          <template #reference>
            <el-button type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <el-table
        :data="tagsListPagination.results"
        border
        style="width: 100%"
        stripe
        @selection-change="selectChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column property="id" label="标签ID" width="200" />
        <el-table-column property="name" label="标签名" width="full" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="showDialog(DType.Edit, scope.row)"
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
              @confirm="deleteTag(scope.row.id)"
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
          :total="tagsListPagination.count"
          :disabled="disabled"
          :background="background"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </el-card>
    <el-dialog
      @close="closeDialog"
      v-model="dialogInfo.visible"
      :title="dialogInfo.title"
      width="500"
    >
      <el-form :model="tagForm" :rules="tagsFormRuler" ref="ruleFormRef">
        <el-form-item
          label="标签名:"
          label-width="70px"
          label-position="top"
          prop="name"
        >
          <el-input v-model="tagForm.name" auto-complete="off" />
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
