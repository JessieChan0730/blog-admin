<script setup lang="ts">
import {
  genFileId,
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import { ArticleAPI, BLogManage } from "@/api/blog";
import { useBlogStore } from "@/store";
import { CategoryAPI, CategoryVo } from "@/api/category";
import { TagsAPI, TagsVO } from "@/api/tags";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { ref } from "vue";
import router from "@/router";

const route = useRoute();
const blogStore = useBlogStore();
// 对话框是否展示
const dialogVisible = ref(false);
// 封面上传的URL
const coverUploadUrl = ref("http://127.0.0.1:8000/api/cover/");
// search 加载状态
const loading = ref(false);
// 分类
const categories = ref<CategoryVo[]>([]);
const upload = ref<UploadInstance>();
// 已经选择的tag列表
const pickTags = ref<number[]>([]);
// 查询的出来的tags列表
const searchTags = ref<TagsVO[]>([]);
// 是否展示选择框
const tagsSelectVisible = ref(false);
const has_error = ref(true);
// 确认标题
const confirmTitle = ref("");

const error_message = reactive({
  tags_ids: "",
  category_id: "",
});

const setting = reactive<BLogManage>({
  title: "",
  cover_url: "",
  recommend: false,
  visible: true,
  category: -1,
  tags: [],
});
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

onMounted(async () => {
  const response = await CategoryAPI.getAllCategory();
  categories.value.push(...response);
  init();
});

// 监听器，根据用户所选的tags来得到id列表
watch(
  () => [...setting.tags],
  (newVal, oldVal) => {
    pickTags.value = [...newVal.map((tag) => tag.id)];
  }
);

const remote = (id: string | number) => {
  ArticleAPI.getArticleById(id).then((data) => {
    setting.title = data.title;
    setting.cover_url = data.cover_url;
    setting.category = data.category.id;
    setting.tags = data.tags;
    setting.visible = data.visible;
    setting.recommend = data.recommend;
  });
};

const init = () => {
  const id = route.params.id as string;
  const blogManage = blogStore.articleManageVo(id);
  if (blogManage) {
    setting.title = blogManage.title;
    setting.cover_url = blogManage.cover_url;
    setting.category = blogManage.category;
    setting.tags = blogManage.tags;
    setting.visible = blogManage.visible;
    setting.recommend = blogManage.recommend;
  } else {
    remote(id);
  }
};
// 重设错误消息
const resetErrorMessage = () => {
  error_message.tags_ids = "";
  error_message.category_id = "";
};

// 验证表单数据
const verify = () => {
  let errors_count = 0;
  resetErrorMessage();
  if (pickTags.value.length == 0) {
    error_message.tags_ids = "请为文章至少选择一个标签";
    errors_count++;
  }
  if (!setting.category || setting.category === -1) {
    error_message.category_id = "请为文章选择分类";
    errors_count++;
  }
  has_error.value = errors_count !== 0;
  return has_error.value;
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const submitUpload = () => {
  upload.value!.submit();
};
// 删除tags
const handleClose = (tag: TagsVO) => {
  setting.tags = setting.tags.filter((dynamicTag) => {
    return dynamicTag.id !== tag.id;
  });
};
// 远程搜索tags
const searchTag = async (name: string) => {
  if (name) {
    loading.value = true;
    searchTags.value = await TagsAPI.searchTags(name);
    loading.value = false;
  } else {
    searchTags.value = [];
  }
};
// 远程搜索到后，选择tag
const selectTags = (id: number[]) => {
  if (setting.tags.map((dynamicTag) => dynamicTag.id).includes(id[0])) {
    ElNotification({
      title: "提示",
      message: "同一个标签只能选择一次",
      type: "error",
    });
    tagsSelectVisible.value = false;
    return;
  }
  const tag = searchTags.value.filter((tag) => id[0] === tag.id).pop();
  setting.tags.push(tag as TagsVO);
  tagsSelectVisible.value = false;
};
// 展示选择框
const showTagsSelect = () => {
  tagsSelectVisible.value = true;
};

// 封面上传成功回调
const uploadSuccess = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  const { code, data } = response;
  if (code === 201) {
    const { cover } = data;
    setting.cover_url = cover;
  } else {
    ElNotification({
      title: "错误",
      message: "文件上传失败",
      type: "error",
    });
  }
};

const uploadError = () => {
  ElMessage.error("上传失败");
};

const save = async () => {
  const has_error = verify();
  if (!has_error) {
    const response = await ArticleAPI.modifyArticle(route.params.id as string, {
      category_id: setting.category,
      cover_url: setting.cover_url,
      tags_ids: pickTags.value,
      recommend: setting.recommend,
      visible: setting.visible,
    });
    if (response) {
      setting.category = response.category.id;
      setting.cover_url = response.cover_url;
      setting.tags = response.tags;
      setting.visible = response.visible;
      setting.recommend = response.recommend;
      upload.value?.clearFiles();
      ElMessage.success("更新配置成功");
    }
  } else {
    ElNotification({
      title: "配置失败",
      message: `请按照表单规则提交`,
      type: "error",
    });
  }
};
const showDialog = () => {
  dialogVisible.value = true;
};

const remove = async () => {
  if (confirmTitle.value === setting.title) {
    // TODO 验证通过
    await ArticleAPI.deleteArticle(route.params.id as string);
    dialogVisible.value = false;
    // 返回列表页
    await router.replace("/blog/home");
  } else {
    ElMessage.error("输入的标题不正确，请重新确认");
    confirmTitle.value = "";
  }
};

const cancel = () => {
  dialogVisible.value = false;
  confirmTitle.value = "";
};
</script>

<template>
  <div class="w-full">
    <el-form label-position="top">
      <el-form-item label="博客封面">
        <div class="flex flex-col justify-between">
          <el-image
            class="w-35rem bg-active mb-4"
            :src="setting.cover_url"
            fit="fill"
          />
          <el-upload
            :headers="uploadHeaders"
            :action="coverUploadUrl"
            method="post"
            name="cover"
            list-type="picture"
            accept=".jpg,.png,.jpeg"
            :multipl="false"
            ref="upload"
            class="upload-demo"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :on-success="uploadSuccess"
            :on-error="uploadError"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <el-button class="ml-3" type="success" @click="submitUpload">
              上传到服务器
            </el-button>
            <template #tip>
              <div class="el-upload__tip text-red">
                最大支持上传一张图片，新的图片替换旧的图片
              </div>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="文章分类" class="mt-4">
        <div class="flex flex-col justify-between">
          <div class="tip" v-if="has_error">
            {{ error_message.category_id }}
          </div>
          <el-select
            v-model="setting.category"
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
              v-for="tag in setting.tags"
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
        </div>
      </el-form-item>
      <el-form-item label="是否推荐" class="mt-4">
        <el-radio-group v-model="setting.recommend">
          <el-radio :value="true">推荐</el-radio>
          <el-radio :value="false">暂时不推荐</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否可见">
        <el-switch size="small" v-model="setting.visible" />
      </el-form-item>
    </el-form>
    <el-divider />
    <div>
      <el-button type="success" @click="save">保存配置</el-button>
      <el-button type="danger" @click="showDialog">删除博客</el-button>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="删除文章"
      width="500"
      :before-close="handleClose"
    >
      <el-alert
        title="警告：文章删除无法撤消！请慎重操作！"
        type="error"
        :closable="false"
        show-icon
      />
      <el-alert
        class="text-0.5rem"
        :closable="false"
        :title="`为防止意外，请输文章标题：“${setting.title}”`"
        type="error"
      />
      <el-input
        class="mt-4"
        :placeholder="`请输入：${setting.title}`"
        v-model="confirmTitle"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="danger" @click="remove">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
