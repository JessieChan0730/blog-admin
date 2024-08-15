<script setup lang="ts">
import { genFileId, UploadInstance, UploadRawFile } from "element-plus";
import type { UploadProps } from "element-plus";
import { Picture, Upload } from "@element-plus/icons-vue";
import { MetaForm, MetaAPI } from "@/api/meta";
import { TOKEN_KEY } from "@/enums/CacheEnum";

const metaForm = reactive<MetaForm>({});
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

const cover = ref<string>("");
const uploadUrl = ref("http://127.0.0.1:8000/api/meta");
const upload = ref<UploadInstance>();

onMounted(() => {
  getMeta();
});

// 获取当前页面信息
const getMeta = async () => {
  const response = await MetaAPI.getMeta();
  if (response) {
    cover.value = response.cover;
    metaForm.title = response.title;
  }
};

// 文件触发上限的钩子
const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

// 手动上传图片
const submitUpload = () => {
  upload.value!.submit();
};

const uploadSuccess = () => {
  upload.value!.clearFiles();
  getMeta();
};

const uploadError = () => {
  ElMessage.error("上传失败");
};

const commit = async () => {
  const { title } = await MetaAPI.updateMeta(metaForm);
  // 如果用户上传了文件，则一起提交
  if (upload.value) {
    upload.value!.submit();
  }
  metaForm.title = title;
  ElMessage.success("修改成功");
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <el-form ref="ruleFormRef" :model="metaForm">
        <el-form-item
          label="网站标题:"
          label-width="70px"
          label-position="top"
          prop="name"
        >
          <el-input v-model="metaForm.title" placeholder="请输入网站标题" />
        </el-form-item>
        <el-form-item
          label="网站封面:"
          label-width="70px"
          label-position="top"
          prop="cover"
        >
          <div class="cover-container">
            <el-image :src="'http://127.0.0.1:8000/' + cover" fit="contain" />
          </div>
          <el-upload
            :headers="uploadHeaders"
            ref="upload"
            :action="uploadUrl"
            :limit="1"
            name="cover"
            list-type="picture"
            accept=".jpg,.png,.jpeg"
            :multipl="false"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :on-success="uploadSuccess"
            :on-error="uploadError"
          >
            <template #trigger>
              <el-button class="mb-2" :icon="Picture">选择图片</el-button>
            </template>
            <el-button
              class="ml-3 mb-2"
              type="primary"
              :icon="Upload"
              @click="submitUpload"
            >
              上传到服务器
            </el-button>
            <template #tip>
              <div class="el-upload__tip text-red">
                最大支持上传一张图片，新的图片替换旧的图片
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="w-full flex flex-row justify-start">
          <el-button type="primary" @click="commit">提交修改</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.cover-container {
  width: 100%;

  el-image {
    display: block;
    min-height: 200px;
    margin-bottom: 10px;
  }
}
</style>
