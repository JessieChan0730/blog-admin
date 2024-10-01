<script setup lang="ts">
import { Edit, Picture, Upload } from "@element-plus/icons-vue";
import { ref } from "vue";
import { genFileId, UploadFile, UploadFiles } from "element-plus";
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import { CategoryAPI, CategoryVo } from "@/api/category";
import { TagsAPI, TagsVO } from "@/api/tags";
import { ArticleAPI, BlogForm } from "@/api/blog";
import Editor from "@/components/WangEditor/index.vue";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { useFrontSettings } from "@/store";
import { textColor } from "@/utils/textcolor";

const frontSettingStore = useFrontSettings();

const upload = ref<UploadInstance>();
const maxStepSize = 3;
const minStepSize = 1;
// 封面上传的URL
const coverUploadUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/api/cover/`);
// 当前的步骤数
const activeStep = ref(1);
// 选择的tag列表
const pickTags = ref<TagsVO[]>([]);
// 最大选择
const maxPickNumber = ref(4);
// 已经选择
const pickNumber = ref(1);
// 查询的出来的tags列表
const searchTags = ref<TagsVO[]>([]);
// 分类
const categories = ref<CategoryVo[]>([]);
// 是否展示选择框
const tagsSelectVisible = ref(false);
// search 加载状态
const loading = ref(false);
// 提交表单
const blogForm = reactive<BlogForm>({
  cover_url: "",
  title: "",
  intro: "",
  content: "",
  recommend: false,
  visible: true,
  category_id: null,
  tags_ids: [],
});

const has_error = ref(true);

const error_message = reactive({
  cover_url: "",
  tags_ids: "",
  category_id: "",
  title: "",
  intro: "",
  content: "",
});
// 重设错误消息
const resetErrorMessage = () => {
  error_message.content = "";
  error_message.intro = "";
  error_message.title = "";
  error_message.category_id = "";
  error_message.tags_ids = "";
  error_message.cover_url = "";
};

// 重新设置表单
const resetForm = () => {
  blogForm.cover_url = "";
  blogForm.title = "";
  blogForm.intro = "";
  blogForm.content = "";
  blogForm.recommend = false;
  blogForm.category_id = null;
  blogForm.tags_ids = [];
  blogForm.visible = true;
  pickTags.value = [];
  // 清除已经上传的文件
  upload.value!.clearFiles();
  // 退回到第一步
  activeStep.value = 1;
};

const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

onMounted(async () => {
  const frontSetting = await frontSettingStore.get();
  maxPickNumber.value = Number(frontSetting.tags.quote_max_num.value);
  const response = await CategoryAPI.getAllCategory();
  categories.value.push(...response);
});

// 监听器，根据用户所选的tags来得到id列表
watch(
  () => [...pickTags.value],
  (newVal, oldVal) => {
    blogForm.tags_ids = [...newVal.map((tag) => tag.id)];
  }
);

const content_length = computed(() => {
  return blogForm.content?.replace(/<[^>]+>/g, "").length || 0;
});

const reading_time = computed(() => {
  const minutes = content_length.value / 250;
  if (minutes < 1) {
    return "<1";
  }
  return Math.round(minutes).toString();
});

// 验证表单数据
const verify = () => {
  let errors_count = 0;
  resetErrorMessage();
  const title_length = blogForm.title?.trim().length || 0;
  const intro_length = blogForm.intro?.trim().length || 0;
  const content_length = blogForm.content?.trim().length || 0;
  if (blogForm.cover_url === "") {
    error_message.cover_url = "必须选择一个封面";
    errors_count++;
  }
  if (blogForm.tags_ids?.length == 0) {
    error_message.tags_ids = "请为文章选择一些标签";
    errors_count++;
  }
  if (!blogForm.category_id) {
    error_message.category_id = "请为文章选择分类";
    errors_count++;
  }
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

// 文件超出限制
const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const showTagsSelect = () => {
  tagsSelectVisible.value = true;
};

const next = () => {
  if (activeStep.value < maxStepSize) {
    activeStep.value++;
  }
};

const pre = () => {
  if (activeStep.value > minStepSize) {
    activeStep.value--;
  }
};

const searchTag = async (name: string) => {
  if (name) {
    loading.value = true;
    searchTags.value = await TagsAPI.searchTags(name);
    loading.value = false;
  } else {
    searchTags.value = [];
  }
};

const handleClose = (tag: TagsVO) => {
  pickTags.value = pickTags.value.filter((dynamicTag) => {
    return dynamicTag.id !== tag.id;
  });
  pickNumber.value--;
};

const selectTags = (id: number[]) => {
  if (pickTags.value.map((dynamicTag) => dynamicTag.id).includes(id[0])) {
    ElNotification({
      title: "提示",
      message: "同一个标签只能选择一次",
      type: "error",
    });
    tagsSelectVisible.value = false;
    return;
  }
  if (pickNumber.value > maxPickNumber.value) {
    ElNotification({
      title: "提示",
      message: "最多可选择四个标签",
      type: "error",
    });
    tagsSelectVisible.value = false;
    return;
  }
  const tag = searchTags.value.filter((tag) => id[0] === tag.id).pop();
  pickTags.value.push(tag as TagsVO);
  pickNumber.value++;
  tagsSelectVisible.value = false;
};

const updateContent = (content: string) => {
  blogForm.content = content;
};

// 封面上传成功回调
const uploadSuccess = (response: any) => {
  const { code, data } = response;
  if (code === 201) {
    const { cover } = data;
    blogForm.cover_url = `${import.meta.env.VITE_APP_STATIC_URL}/${cover}`;
  } else {
    ElNotification({
      title: "错误",
      message: "文件上传失败",
      type: "error",
    });
  }
};

const publish = async () => {
  try {
    const is_verify = verify();
    if (!is_verify) {
      const response = await ArticleAPI.publishArticle(blogForm);
      if (response) {
        ElNotification({
          title: "发布成功",
          message: "发布博客成功",
          type: "success",
        });
        pickNumber.value = 0;
        // 重新设置表单
        resetForm();
      }
    } else {
      ElNotification({
        title: "发布失败",
        message: `请按照表单规则提交`,
        type: "error",
      });
    }
  } catch (e) {
    ElNotification({
      title: "请求失败",
      message: `请求服务器失败，原因:${e}`,
      type: "error",
    });
  }
};
// 获取当前格式化数据
function formatDate(date = new Date()) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的
  let day = String(date.getDate()).padStart(2, "0");
  let hours = String(date.getHours()).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
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
      <template #default>
        <div class="step1" v-show="activeStep === 1">
          <el-form label-position="top" v-model="blogForm">
            <el-form-item class="w-full" label="博客封面">
              <div class="tip" v-if="has_error">
                {{ error_message.cover_url }}
              </div>
              <el-upload
                :action="coverUploadUrl"
                method="post"
                name="cover"
                :headers="uploadHeaders"
                :multiple="false"
                list-type="picture"
                accept=".jpg,.png,.jpeg"
                ref="upload"
                class="w-full"
                :limit="1"
                drag
                :on-exceed="handleExceed"
                :auto-upload="true"
                :on-success="uploadSuccess"
              >
                <el-icon class="el-icon--upload">
                  <upload-filled />
                </el-icon>
                <div class="el-upload__text">
                  拖拽到这里，或者
                  <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">只支持 jpg/png 文件格式</div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item label="文章分类" class="mt-4">
              <div class="flex flex-col justify-between">
                <div class="tip" v-if="has_error">
                  {{ error_message.category_id }}
                </div>
                <el-select
                  v-model="blogForm.category_id"
                  clearable
                  placeholder="请选择分类"
                  style="width: 240px"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="文章标签" class="mt-4">
              <div class="flex flex-col justify-between">
                <div class="tip" v-if="has_error">
                  {{ error_message.tags_ids }}
                </div>
                <div class="flex gap-2">
                  <el-tag
                    v-for="tag in pickTags"
                    :key="tag"
                    closable
                    :color="tag.color"
                    :style="{ color: textColor(tag.color as string) }"
                    :disable-transitions="false"
                    @close="handleClose(tag)"
                  >
                    {{ tag.name }}
                  </el-tag>
                  <el-select
                    v-if="tagsSelectVisible"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入标签名"
                    :remote-method="searchTag"
                    @change="selectTags"
                    :loading="loading"
                    size="small"
                    style="width: 140px"
                  >
                    <el-option
                      v-for="tag in searchTags"
                      :key="tag.id"
                      :label="tag.name"
                      :value="tag.id"
                    />
                  </el-select>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showTagsSelect"
                  >
                    + 新标签
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="是否推荐" class="mt-4">
              <el-radio-group v-model="blogForm.recommend">
                <el-radio :value="true">推荐</el-radio>
                <el-radio :value="false">暂时不推荐</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否可见">
              <el-switch size="small" v-model="blogForm.visible" />
            </el-form-item>
          </el-form>
        </div>
        <div class="step2" v-show="activeStep === 2">
          <el-form label-position="top">
            <el-form-item label="标题">
              <div class="tip" v-if="has_error">{{ error_message.title }}</div>
              <el-input
                v-model="blogForm.title"
                placeholder="请输入标题"
                size="large"
              />
            </el-form-item>
            <el-form-item label="简介">
              <div class="tip" v-if="has_error">{{ error_message.intro }}</div>
              <el-input
                v-model="blogForm.intro"
                :rows="3"
                type="textarea"
                placeholder="请输入简介内容"
              />
            </el-form-item>
            <el-form-item
              label="正文"
              style="height: calc(100vh - 200px); overflow-y: auto"
            >
              <div class="tip" v-if="has_error">
                {{ error_message.content }}
              </div>
              <editor
                class="h-full w-full"
                :model-value="blogForm.content"
                @update:model-value="updateContent"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="step3" v-show="activeStep === 3">
          <div
            class="review"
            v-if="blogForm.title !== '' && blogForm.content !== ''"
          >
            <div class="mb-2">预览效果：</div>
            <el-card>
              <div class="review-container">
                <h2 class="blog-title">{{ blogForm.title }}</h2>
                <div class="blog-info">
                  <div class="create-data">发表时间: {{ formatDate() }}</div>
                  <div class="words-num">字数: {{ content_length }}字</div>
                  <div class="words-num">阅读时长: {{ reading_time }}分钟</div>
                </div>

                <div
                  class="blog-content w-full editor-content-view"
                  id="content"
                  v-if="true"
                  v-dompurify-html="blogForm.content"
                  v-highlight
                ></div>
                <el-divider />
                <div class="blog-tags">
                  <div class="flex gap-2 mb-4">
                    <el-tag
                      v-for="tag in pickTags"
                      :key="tag.id"
                      effect="light"
                      :color="tag.color"
                      :style="{ color: textColor(tag.color as string) }"
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
                    <li>1 作者：xxx （联系作者）</li>
                    <li>2 发表时间：{{ formatDate() }}</li>
                    <li>3 最后修改：{{ formatDate() }}</li>
                    <li>
                      4 本站点采用 署名 4.0 国际 (CC BY 4.0)
                      创作共享协议。可自由转载、引用，并且允许商业性使用。但需署名作者且注明文章出处。
                    </li>
                  </ul>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无可预览效果" />
        </div>
      </template>
      <template #footer>
        <div class="btn-group flex flex-row justify-end">
          <el-button @click="pre">上一步</el-button>
          <el-button type="primary" v-if="activeStep != 3" @click="next">
            下一步
          </el-button>
          <el-button type="primary" v-else @click="publish">上传</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
