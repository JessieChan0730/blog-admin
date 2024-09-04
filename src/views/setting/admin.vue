<script setup lang="ts">
import { genFileId, UploadInstance, UploadRawFile } from "element-plus";
import type { UploadProps } from "element-plus";
import { Picture, Upload } from "@element-plus/icons-vue";
import { MetaForm, MetaAPI } from "@/api/settings";
import { TOKEN_KEY } from "@/enums/CacheEnum";

const metaForm = reactive<MetaForm>({});
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

const cover = ref<string>("");
const uploadUrl = ref("http://127.0.0.1:8000/api/settings");
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
      <el-tabs type="border-card">
        <el-tab-pane label="基础设置">
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
              label="备案信息:"
              label-width="70px"
              label-position="top"
              prop="name"
            >
              <el-input
                v-model="metaForm.title"
                placeholder="请输入网站的备案信息"
              />
            </el-form-item>
            <el-form-item
              label="版权信息:"
              label-width="70px"
              label-position="top"
              prop="name"
            >
              <el-input
                v-model="metaForm.title"
                placeholder="请输入网站的版权信息（@Copyright）"
              />
            </el-form-item>
            <el-form-item
              label="网站 Logo:"
              label-width="70px"
              label-position="top"
              prop="cover"
            >
              <div class="cover-container">
                <el-image
                  :src="'http://127.0.0.1:8000/' + cover"
                  fit="contain"
                />
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
        </el-tab-pane>
        <el-tab-pane label="其他设置">
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">分类模块</span>
            </template>
            <template #default>
              <el-form
                ref="ruleFormRef"
                :model="metaForm"
                label-position="left"
              >
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">标签模块</span>
            </template>
            <template #default>
              <el-form
                ref="ruleFormRef"
                :model="metaForm"
                label-position="left"
              >
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">博客模块</span>
            </template>
            <template #default>
              <el-form
                ref="ruleFormRef"
                :model="metaForm"
                label-position="left"
              >
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">友链模块</span>
            </template>
            <template #default>
              <el-form
                ref="ruleFormRef"
                :model="metaForm"
                label-position="left"
              >
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">照片墙模块</span>
            </template>
            <template #default>
              <el-form
                ref="ruleFormRef"
                :model="metaForm"
                label-position="left"
              >
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number v-model="num" :min="1" :max="10" />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="w-full flex flex-row justify-start">
          <el-button type="primary" @click="commit">更新配置</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.module-title {
  font-size: 0.9rem;
}

.cover-container {
  width: 100%;

  el-image {
    display: block;
    min-height: 200px;
    margin-bottom: 10px;
  }
}
</style>
