<script setup lang="ts">
import {
  genFileId,
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadRawFile,
} from "element-plus";
import type { UploadProps } from "element-plus";
import { Picture, Upload } from "@element-plus/icons-vue";
import { FrontSetting, FrontSettingsAPI, Setting } from "@/api/settings";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { useFrontSettings } from "@/store";

const frontSettingStore = useFrontSettings();
const frontSetting = reactive<FrontSetting>(<FrontSetting>{
  website_title: {
    id: 0,
    value: "",
  },
  website_cover: {
    id: 0,
    value: "",
  },
  record_info: {
    id: 0,
    value: "",
  },
  copyright: {
    id: 0,
    value: "",
  },
  category: {
    visible_max_num: {
      id: 0,
      value: "",
    },
  },
  tags: {
    quote_max_num: {
      id: 0,
      value: "",
    },
  },
  blog: {
    page_size: {
      id: 0,
      value: "",
    },
    max_page_size: {
      id: 0,
      value: "",
    },
    recommend_max_num: {
      id: 0,
      value: "",
    },
  },
});

const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

const frontSettingForms = ref<Setting[]>([]);
const uploadUrl = ref("http://127.0.0.1:8000/api/settings/front/cover/");
const upload = ref<UploadInstance>();

onMounted(async () => {
  await init();
});

// 使用watchEffect来监听frontSetting的变化
watchEffect(() => {
  // 遍历frontSetting对象，找到所有value属性
  function traverse(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // 检查是否直接包含value属性
        if (
          key === "value" &&
          (typeof value === "string" || typeof value === "number")
        ) {
          frontSettingForms.value.push(obj);
        } else if (typeof value === "object" && value !== null) {
          // 递归检查对象
          traverse(value);
        }
      }
    }
  }
  frontSettingForms.value = [];
  traverse(frontSetting);
});

const init = async () => {
  const response = await frontSettingStore.get();
  if (response) {
    Object.assign(frontSetting, { ...response });
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

const uploadSuccess = (response: any) => {
  if (response) {
    upload.value!.clearFiles();
    frontSetting.website_cover.value = response.data.cover;
    ElMessage.success("上传成功");
  }
};

const uploadError = () => {
  ElMessage.error("上传失败");
};

const updateSetting = async () => {
  const response = await FrontSettingsAPI.putFrontSetting(
    frontSettingForms.value
  );
  if (response) {
    await frontSettingStore.refresh();
    ElMessage.success("修改成功");
  }
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <el-tabs type="border-card">
        <el-tab-pane label="基础设置">
          <el-form ref="ruleFormRef" :model="frontSetting">
            <el-form-item
              label="网站标题:"
              label-width="70px"
              label-position="top"
              prop="name"
            >
              <el-input
                v-model="frontSetting.website_title.value"
                placeholder="请输入网站标题"
              />
            </el-form-item>
            <el-form-item
              label="备案信息:"
              label-width="70px"
              label-position="top"
              prop="name"
            >
              <el-input
                v-model="frontSetting.record_info.value"
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
                v-model="frontSetting.copyright.value"
                placeholder="请输入网站的版权信息（@Copyright）"
              />
            </el-form-item>
            <el-form-item
              label="网站封面:"
              label-width="70px"
              label-position="top"
              prop="cover"
            >
              <div class="cover-container">
                <el-image
                  :src="frontSetting.website_cover.value"
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
                :model="frontSetting"
                label-position="left"
              >
                <el-form-item label="主页最多显示:" prop="name">
                  <el-input-number
                    v-model="frontSetting.category.visible_max_num.value"
                    :min="1"
                  />
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
                :model="frontSetting"
                label-position="left"
              >
                <el-form-item label="博客最多引用:" prop="name">
                  <el-input-number
                    v-model="frontSetting.tags.quote_max_num.value"
                    :min="1"
                  />
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
                :model="frontSetting"
                label-position="left"
              >
                <el-form-item label="博客每页展示:" prop="name">
                  <el-input-number
                    v-model="frontSetting.blog.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="博客最大分页:" prop="name">
                  <el-input-number
                    v-model="frontSetting.blog.max_page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="博客最多推荐:" prop="name">
                  <el-input-number
                    v-model="frontSetting.blog.recommend_max_num.value"
                    :min="1"
                  />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="w-full flex flex-row justify-start">
          <el-button type="primary" @click="updateSetting">更新配置</el-button>
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
