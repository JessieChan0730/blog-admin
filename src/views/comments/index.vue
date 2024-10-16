<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import { CommentsAPI, CommentsVo } from "@/api/comments";
import router from "@/router";
import { formatDate } from "@/utils";
const commentsListPagination = reactive<Pagination<CommentsVo>>({
  count: 1,
  next: "",
  previous: "",
  results: [],
});

onMounted(async () => {
  const response = await CommentsAPI.getComments();
  if (response) {
    Object.assign(commentsListPagination, { ...response });
  }
});

const reviewArticle = (id: number) => {
  router.push(`/blog/${id}`);
};

const changeVisible = (notification: boolean) => {
  console.log(notification);
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :inline="true">
        <el-form-item label="所属文章" prop="region">
          <el-select placeholder="请选择的相关的文章">
            <el-option label="hell world" value="world" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" :icon="Plus">评论</el-button>
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
        row-key="id"
        border
        style="width: 100%"
        stripe
        :data="commentsListPagination.results"
        :tree-props="{ children: 'reply_comments' }"
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
              @click="showDialog(DType.Edit, prop.row)"
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
              @confirm="deleteCategory(prop.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <template #footer></template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
