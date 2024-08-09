<script setup lang="ts">
import { ComponentSize } from "element-plus";
import { TagsVO, TagsAPI, TagsForm } from "@/api/tags";
import { onMounted } from "vue";
import type { FormRules, FormInstance } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";

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

const tagsList = ref<TagsVO[]>();
const currentPage4 = ref(4);
const pageSize4 = ref(100);
const size = ref<ComponentSize>("default");
const disabled = ref(false);
const background = ref(true);
const ruleFormRef = ref<FormInstance>();

// 请求数据
onMounted(() => {
  loadTagsData();
});

const loadTagsData = async () => {
  tagsList.value = await TagsAPI.getAllTags();
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
};

const showDialog = (type: DType, row?: any) => {
  if (type == DType.Edit) {
    dialogInfo.title = "编辑标签";
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
        tagsList.value?.push(result);
      } else if (dialogInfo.type == DType.Edit) {
        result = await TagsAPI.updateTags(tagForm.id as number, tagForm);
        tagsList.value = tagsList.value?.map((tag) => {
          if (tag.id == result.id) {
            tag.name = result.name;
          }
          return tag;
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

const deleteTag = async (id: number | string) => {
  await TagsAPI.deleteTag(id);
  tagsList.value = tagsList.value?.filter((tag) => {
    return tag.id != id;
  });
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" @click="showDialog(DType.Add)">
          新增
        </el-button>
        <el-button type="danger">删除</el-button>
      </template>
      <el-table :data="tagsList" border style="width: 100%" stripe>
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
    <el-dialog
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

<style scoped lang="scss"></style>
