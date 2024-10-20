<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import {
  CommentsAPI,
  CommentsForms,
  CommentsParams,
  CommentsVo,
} from "@/api/comments";
import router from "@/router";
import { formatDate } from "@/utils";
import { ArticleAPI, BlogSelectedVo } from "@/api/blog";
import { FormInstance, FormRules } from "element-plus";
import { PaginationType, useGetPageSize } from "@/hooks/settings";
enum DType {
  RECOVER,
  PUBLISH,
  NUll,
}

interface CommentFormView {
  article_name: string;
  content: string;
  nickname: string;
}

interface DialogInfo {
  visible: boolean;
  title: string;
  type: DType;
}

// 分页组件状态
const pageSize = ref(0);
const disabled = ref(false);
const background = ref(true);
const blogSelectedData = ref<BlogSelectedVo[]>([]);
const ruleFormRef = ref<FormInstance>();
// 加载动画
const loading = ref(false);
const selectComments = ref<CommentsVo[]>([]);
const dialogInfo = reactive<DialogInfo>({
  visible: false,
  title: "",
  type: DType.NUll,
});

const commentsListPagination = reactive<Pagination<CommentsVo>>({
  count: 1,
  next: "",
  previous: "",
  results: [],
});

const commentsForm = reactive<CommentsForms>({
  article_pk: null,
  content: "",
  parent_comment: null,
});

const rules = reactive<FormRules<CommentsForms>>({
  content: [
    { required: true, message: "请输入评论的内容", trigger: "blur" },
    { min: 1, message: "最低长度为1个字符", trigger: "blur" },
  ],
  article_pk: [
    {
      required: true,
      message: "请选择一篇文章",
      trigger: "change",
    },
  ],
});

const commentsFormView = reactive<CommentFormView>({
  article_name: "",
  content: "",
  nickname: "",
});

const queryParams = reactive<CommentsParams>({
  page: 1,
  article_pk: null,
});

// 拆分 queryParams，并且交给监听器处理
const article_pk = toRef(queryParams, "article_pk");
const page = toRef(queryParams, "page");

onMounted(async () => {
  await loadComments({ page: 1 });
  pageSize.value = await useGetPageSize(PaginationType.Category);
  const res_selected = await ArticleAPI.getArticleSelectedData();
  res_selected && blogSelectedData.value.push(...res_selected);
});

// 计算属性
const ids = computed(() => {
  return selectComments.value.map((comments) => {
    return comments.id;
  });
});

// 监听器
watch([article_pk, page], async () => {
  loading.value = true;
  await loadComments(queryParams);
  loading.value = false;
});

const loadComments = async (params?: CommentsParams) => {
  const response = await CommentsAPI.getComments(params);
  if (response) {
    Object.assign(commentsListPagination, { ...response });
  }
};

const reviewArticle = (id: number) => {
  router.push(`/blog/${id}`);
};

const changeVisible = (notification: boolean) => {
  console.log(notification);
};

const deleteComments = async (id: string | number) => {
  await CommentsAPI.deleteComments(id);
  if (commentsListPagination.results.length === 1) {
    page.value = 1;
  } else {
    await loadComments(queryParams);
  }
};

// 展示dialog
const showDialog = (type: DType, row?: any) => {
  if (type == DType.RECOVER) {
    dialogInfo.title = "回复用户";
    commentsFormView.article_name = row.article_name;
    commentsFormView.content = row.content;
    commentsFormView.nickname = row.nickname;
    commentsForm.parent_comment = row.id;
    commentsForm.article_pk = row.article_pk;
    // 初始化dialog中编辑框的内容
  } else if (type == DType.PUBLISH) {
    dialogInfo.title = "发布评论";
    commentsForm.parent_comment = null;
  }
  dialogInfo.type = type;
  dialogInfo.visible = true;
};
// 选择文章
const changeSelected = (value: number) => {
  queryParams.article_pk = value;
  queryParams.page = 1;
};

// 关闭对话框
const closeDialog = () => {
  dialogInfo.visible = false;
  commentsFormView.article_name = "";
  commentsFormView.content = "";
  commentsFormView.nickname = "";
  commentsForm.parent_comment = null;
  commentsForm.article_pk = null;
  commentsForm.content = "";
};

// 提交表单
const commit = async (formEl: FormInstance | undefined) => {
  if (dialogInfo.type == DType.RECOVER) {
    if (commentsForm.content.trim() !== "") {
      const response = await CommentsAPI.publishComments(commentsForm);
      if (response) {
        await loadComments();
        ElNotification({
          title: "成功",
          message: "回复成功",
          type: "success",
        });
        closeDialog();
      }
    } else {
      ElMessage.error("请按照表单规则提交");
    }
  } else if (dialogInfo.type == DType.PUBLISH) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        const response = await CommentsAPI.publishComments(commentsForm);
        if (response) {
          await loadComments();
          ElNotification({
            title: "成功",
            message: "回复成功",
            type: "success",
          });
          closeDialog();
        }
      } else {
        ElMessage.error("请按照表单规则提交");
      }
    });
  } else {
    ElNotification({
      title: "错误",
      message: "系统错误",
      type: "error",
    });
  }
};

const handleCurrentChange = (currentPage: number) => {
  page.value = currentPage;
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};

const reset = () => {
  article_pk.value = null;
  page.value = 1;
};

const deleteMultipleComments = async () => {
  if (ids.value.length !== 0) {
    await CommentsAPI.deleteMultipleComments(ids.value);
    // 手动刷新当页页面
    // 刷新当页数据
    if (ids.value.length === commentsListPagination.results.length) {
      queryParams.page = 1;
    } else {
      await loadComments(queryParams);
    }
  } else {
    ElMessage.error("请框选对应的评论");
  }
};

const selectChange = (newSelection: CommentsVo[]) => {
  selectComments.value = newSelection;
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form :inline="true">
        <el-form-item
          label="所属文章"
          prop="region"
          label-position="left"
          class="w-15rem"
        >
          <el-select placeholder="请选择的相关的文章" @change="changeSelected">
            <el-option
              v-for="selected in blogSelectedData"
              :key="selected.id"
              :label="selected.title"
              :value="selected.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="reset">
            <i-ep-refresh />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          type="success"
          :icon="Plus"
          @click="showDialog(DType.PUBLISH)"
        >
          评论
        </el-button>
        <el-popconfirm
          confirm-button-text="确认"
          cancel-button-text="取消"
          :icon="InfoFilled"
          icon-color="#f40"
          title="你确定要删除这些标签吗？"
          width="220"
          confirm-button-type="danger"
          @confirm="deleteMultipleComments"
        >
          <template #reference>
            <el-button type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <el-table
        row-key="id"
        border
        style="width: 100%"
        stripe
        :data="commentsListPagination.results"
        :tree-props="{ children: 'reply_comments' }"
        @selection-change="selectChange"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column
          align="center"
          property="id"
          label="评论ID"
          width="100"
        />
        <el-table-column
          align="center"
          property="avatar"
          label="头像"
          width="140"
        >
          <template #default="scope">
            <el-image
              :src="`${scope.row.avatar}`"
              class="w-full h-3rem"
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="nickname"
          label="昵称"
          width="full"
        />
        <el-table-column
          align="center"
          property="email"
          label="邮箱"
          width="full"
        />
        <el-table-column
          align="center"
          property="content"
          label="评论内容"
          width="full"
        >
          <template #default="props">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="props.row.content"
              placement="top"
            >
              <el-text class="w-150px" truncated>
                {{ props.row.content }}
              </el-text>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="article_name"
          label="所在文章"
          width="full"
        >
          <template #default="props">
            <el-link
              type="success"
              @click="reviewArticle(props.row.article_pk)"
            >
              {{ props.row.article_name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="create_time"
          label="发表时间"
          width="full"
        >
          <template #default="props">
            {{ formatDate(props.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="notification"
          label="邮件提醒"
          width="120"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.notification"
              :active-value="true"
              @change="changeVisible(scope.row)"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="prop">
            <el-button
              size="small"
              type="primary"
              @click="showDialog(DType.RECOVER, prop.row)"
            >
              回复
            </el-button>
            <el-popconfirm
              confirm-button-text="确认"
              cancel-button-text="取消"
              :icon="InfoFilled"
              icon-color="#f40"
              title="你确定要删除这个标签吗？"
              width="220"
              confirm-button-type="danger"
              @confirm="deleteComments(prop.row.id)"
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
          :total="commentsListPagination.count"
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
        v-if="dialogInfo.type === DType.RECOVER"
        label-position="top"
        :model="commentsForm"
        :rules="rules"
      >
        <el-form-item label="文章名">
          <el-input v-model="commentsFormView.article_name" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="commentsFormView.nickname" disabled />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="commentsFormView.content" disabled />
        </el-form-item>
        <el-form-item label="回复评论" prop="content">
          <el-input
            v-model="commentsForm.content"
            type="textarea"
            placeholder="请填写您回复的内容"
          />
        </el-form-item>
      </el-form>
      <el-form
        :model="commentsForm"
        v-else-if="dialogInfo.type === DType.PUBLISH"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="选择文章" prop="article_pk">
          <el-select
            v-model="commentsForm.article_pk"
            placeholder="请选择您对应的文章"
          >
            <el-option
              v-for="selected in blogSelectedData"
              :key="selected.id"
              :label="selected.title"
              :value="selected.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="回复评论" prop="content">
          <el-input
            v-model="commentsForm.content"
            type="textarea"
            placeholder="请填写您评论的内容"
          />
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
