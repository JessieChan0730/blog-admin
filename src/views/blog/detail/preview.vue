<script setup lang="ts">
import { useBlogStore } from "@/store";
import { ArticleAPI, BLogPreview } from "@/api/blog";
import Editor from "@/components/WangEditor/index.vue";
import { ref } from "vue";

const route = useRoute();
const blogStore = useBlogStore();

const editMode = ref(false);

const has_error = ref(false);

const error_message = reactive({
  title: "",
  intro: "",
  content: "",
});

const blog = reactive<BLogPreview>({
  title: "",
  content: "",
  intro: "",
  tags: [],
  author: {
    id: 0,
    username: "",
  },
  create_date: "",
  update_date: "",
});

const remote = (id: string | number) => {
  ArticleAPI.getArticleById(id).then((data) => {
    blog.title = data.title;
    blog.content = data.content;
    blog.intro = data.intro;
    blog.tags = data.tags;
    blog.author = data.author;
    blog.create_date = data.create_date;
    blog.update_date = data.update_date;
  });
};

const init = () => {
  const id = route.params.id as string;
  const blogPreview = blogStore.articlePreviewVo(id);
  if (blogPreview) {
    blog.title = blogPreview.title;
    blog.content = blogPreview.content;
    blog.intro = blogPreview.intro;
    blog.tags = blogPreview.tags;
    blog.author = blogPreview.author;
    blog.create_date = blogPreview.create_date;
    blog.update_date = blogPreview.update_date;
  } else {
    remote(id);
  }
};

onMounted(() => {
  init();
});

const content_length = computed(() => {
  return blog.content.replace(/<[^>]+>/g, "").length;
});

const reading_time = computed(() => {
  const minutes = content_length.value / 250;
  if (minutes < 1) {
    return "<1";
  }
  return Math.round(minutes).toString();
});

const updateContent = (content: string) => {
  blog.content = content;
};

// 重设错误消息
const resetErrorMessage = () => {
  error_message.content = "";
  error_message.intro = "";
  error_message.title = "";
};

// 验证表单数据
const verify = () => {
  let errors_count = 0;
  resetErrorMessage();
  const title_length = blog.title.trim().length;
  const intro_length = blog.intro.trim().length;
  const content_length = blog.content.replace(/<[^>]+>/g, "").trim().length;
  if (title_length == 0 || title_length > 40) {
    error_message.title = "文章标题必填，且长度需大于0小于40";
    errors_count++;
  }
  if (intro_length == 0 || intro_length > 200) {
    error_message.intro = "文章简介为必填，且长度需大于0小于200";
    errors_count++;
  }
  if (content_length == 0) {
    error_message.content = "请编写一些内容";
    errors_count++;
  }
  has_error.value = errors_count !== 0;
  return has_error.value;
};

const save = async () => {
  const has_error = verify();
  if (!has_error) {
    // TODO 验证通过
    const response = await ArticleAPI.modifyArticle(route.params.id as string, {
      title: blog.title,
      content: blog.content,
      intro: blog.intro,
    });
    if (response) {
      blog.title = response.title;
      blog.content = response.content;
      blog.intro = response.intro;
      blog.update_date = response.update_date;
      ElNotification({
        title: "更新成功",
        message: `更新文章内容成功`,
        type: "success",
      });
      editMode.value = false;
    }
  } else {
    // TODO 验证不通过
    ElNotification({
      title: "更新失败",
      message: `请按照表单规则提交`,
      type: "error",
    });
  }
};

const cancel = () => {
  // 重新设置表单值
  init();
  editMode.value = false;
};
</script>

<template>
  <div class="w-full">
    <el-card class="">
      <div v-if="!editMode" class="review-container">
        <h2 class="blog-title">{{ blog.title }}</h2>
        <div class="blog-info">
          <div class="create-data">发表时间: {{ blog.create_date }}</div>
          <div class="words-num">字数: {{ content_length }}字</div>
          <div class="words-num">阅读时长: {{ reading_time }}分钟</div>
        </div>

        <div
          class="blog-content"
          id="content"
          v-dompurify-html="blog.content"
        ></div>
        <el-divider />
        <div class="blog-tags">
          <div class="flex gap-2 mb-4">
            <el-tag
              v-for="tag in blog.tags"
              :key="tag.id"
              effect="light"
              round
              type="primary"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </div>
        <div class="author-info">
          <ul>
            <!--TODO 请求用户信息-->
            <li>1 作者：{{ blog.author.username }}</li>
            <li>2 发表时间：{{ blog.create_date }}</li>
            <li>3 最后修改：{{ blog.update_date }}</li>
            <li>
              4 本站点采用 署名 4.0 国际 (CC BY 4.0)
              创作共享协议。可自由转载、引用，并且允许商业性使用。但需署名作者且注明文章出处。
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="edit-container">
        <el-form label-position="top">
          <el-form-item label="标题">
            <div class="tip" v-if="has_error">{{ error_message.title }}</div>
            <el-input
              v-model="blog.title"
              placeholder="请输入标题"
              size="large"
            />
          </el-form-item>
          <el-form-item label="简介">
            <div class="tip" v-if="has_error">{{ error_message.intro }}</div>
            <el-input
              v-model="blog.intro"
              :rows="3"
              type="textarea"
              placeholder="请输入简介内容"
            />
          </el-form-item>
          <el-form-item
            label="正文"
            style="height: calc(100vh - 200px); overflow-y: auto"
          >
            <div class="tip" v-if="has_error">{{ error_message.content }}</div>
            <editor
              class="h-full w-full"
              :model-value="blog.content"
              @update:model-value="updateContent"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button v-if="!editMode" type="primary" @click="editMode = true">
          编辑博客
        </el-button>
        <div class="btn-group" v-else>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
