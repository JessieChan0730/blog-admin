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

const upload = ref<UploadInstance>();
const maxStepSize = 3;
const minStepSize = 1;
// 封面上传的URL
const coverUploadUrl = ref("http://127.0.0.1:8000/api/cover/");
// 当前的步骤数
const activeStep = ref(1);
// 选择的tag列表
const pickTags = ref<TagsVO[]>([]);
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
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

onMounted(async () => {
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
  const tag = searchTags.value.filter((tag) => id[0] === tag.id).pop();
  pickTags.value.push(tag as TagsVO);
  tagsSelectVisible.value = false;
};

const updateContent = (content: string) => {
  blogForm.content = content;
};

// 封面上传成功回调
const uploadSuccess = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log(response);
  const { code, data } = response;
  if (code === 201) {
    const { cover } = data;
    blogForm.cover_url = cover;
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
    await ArticleAPI.publishArticle(blogForm);
    ElNotification({
      title: "成功",
      message: "发布摆博客成功",
      type: "success",
    });
  } catch (e) {
    ElNotification({
      title: "失败",
      message: `发布摆博客失败，原因:${e}`,
      type: "error",
    });
  }
};
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
            </el-form-item>
            <el-form-item label="文章标签" class="mt-4">
              <div class="flex gap-2">
                <el-tag
                  v-for="tag in pickTags"
                  :key="tag"
                  closable
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
              <el-input
                v-model="blogForm.title"
                placeholder="请输入标题"
                size="large"
              />
            </el-form-item>
            <el-form-item label="简介">
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
              <editor
                class="h-full"
                :model-value="blogForm.content"
                @update:model-value="updateContent"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="step3" v-show="activeStep === 3">
          <div class="review">
            预览效果：
            <div v-dompurify-html="blogForm.content"></div>
          </div>
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
