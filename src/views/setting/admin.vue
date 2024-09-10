<script setup lang="ts">
import {
  FormInstance,
  FormRules,
  genFileId,
  UploadInstance,
  UploadRawFile,
} from "element-plus";
import type { UploadProps } from "element-plus";
import { Picture, Upload } from "@element-plus/icons-vue";
import { AdminSetting, AdminSettingsAPI, Setting } from "@/api/settings";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { useAdminSettings } from "@/store";
import { showValidateErrorMessage } from "@/utils/error";

const adminSettingStore = useAdminSettings();

const adminSetting = reactive<AdminSetting>(<AdminSetting>{
  website_title: {
    id: 0,
    value: "",
  },
  website_logo: {
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
    page_size: {
      id: 0,
      value: "",
    },
    max_page_size: {
      id: 0,
      value: "",
    },
  },
  tags: {
    page_size: {
      id: 0,
      value: "",
    },
    max_page_size: {
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
  },
  friend_link: {
    page_size: {
      id: 0,
      value: "",
    },
    max_page_size: {
      id: 0,
      value: "",
    },
  },
  photo_wall: {
    page_size: {
      id: 0,
      value: "",
    },
    max_page_size: {
      id: 0,
      value: "",
    },
  },
});

const rules = reactive<FormRules<AdminSetting>>({
  "website_title.value": [
    { required: true, message: "请输入网站备案信息", trigger: "blur" },
  ],
  "record_info.value": [
    { required: true, message: "请输入网站备案信息", trigger: "blur" },
  ],
  "copyright.value": [
    { required: true, message: "请输入网站版权信息", trigger: "blur" },
  ],
  "website_logo.value": [
    { required: true, message: "请上传网站LOGO", trigger: "blur" },
  ],
});

const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

const ruleFormRef = ref<FormInstance>();
const adminSettingForms = ref<Setting[]>([]);
const uploadUrl = ref("http://127.0.0.1:8000/api/settings/admin/logo/");
const upload = ref<UploadInstance>();

onMounted(async () => {
  await init();
});

const init = async () => {
  const response = await adminSettingStore.get();
  if (response) {
    Object.assign(adminSetting, { ...response });
  }
};

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
          adminSettingForms.value.push(obj);
        } else if (typeof value === "object" && value !== null) {
          // 递归检查对象
          traverse(value);
        }
      }
    }
  }
  adminSettingForms.value = [];
  traverse(adminSetting);
});

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
    adminSetting.website_logo.value = response.data.logo;
    ElMessage.success("上传成功");
  }
};

const uploadError = () => {
  ElMessage.error("上传失败");
};

const updateSetting = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const response = await AdminSettingsAPI.putAdminSetting(
        adminSettingForms.value
      );
      if (response) {
        await adminSettingStore.refresh();
        ElMessage.success("更新成功，刷新生效");
      }
    } else {
      showValidateErrorMessage(fields);
    }
  });
};
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <el-tabs type="border-card">
        <el-tab-pane label="基础设置">
          <el-form ref="ruleFormRef" :rules="rules" :model="adminSetting">
            <el-form-item
              label="网站标题:"
              label-width="70px"
              label-position="top"
              prop="website_title.value"
            >
              <el-input
                v-model="adminSetting.website_title.value"
                placeholder="请输入网站标题"
              />
            </el-form-item>
            <el-form-item
              label="备案信息:"
              label-width="70px"
              label-position="top"
              prop="record_info.value"
            >
              <el-input
                v-model="adminSetting.record_info.value"
                placeholder="请输入网站的备案信息"
              />
            </el-form-item>
            <el-form-item
              label="版权信息:"
              label-width="70px"
              label-position="top"
              prop="copyright.value"
            >
              <el-input
                v-model="adminSetting.copyright.value"
                placeholder="请输入网站的版权信息（@Copyright）"
              />
            </el-form-item>
            <el-form-item
              label="网站 Logo:"
              label-width="70px"
              label-position="top"
              prop="website_logo.value"
            >
              <div class="logo-container">
                <el-image
                  :src="adminSetting.website_logo.value"
                  fit="contain"
                />
              </div>
            </el-form-item>
            <el-form-item>
              <el-upload
                :headers="uploadHeaders"
                ref="upload"
                :action="uploadUrl"
                :limit="1"
                name="logo"
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
              <el-form :model="adminSetting" label-position="left">
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number
                    v-model="adminSetting.category.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number
                    v-model="adminSetting.category.max_page_size.value"
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
              <el-form :model="adminSetting" label-position="left">
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number
                    v-model="adminSetting.tags.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number
                    v-model="adminSetting.tags.max_page_size.value"
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
              <el-form :model="adminSetting" label-position="left">
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number
                    v-model="adminSetting.blog.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number
                    v-model="adminSetting.blog.max_page_size.value"
                    :min="1"
                  />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">友链模块</span>
            </template>
            <template #default>
              <el-form :model="adminSetting" label-position="left">
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number
                    v-model="adminSetting.friend_link.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number
                    v-model="adminSetting.friend_link.max_page_size.value"
                    :min="1"
                  />
                </el-form-item>
              </el-form>
            </template>
          </el-card>
          <el-card class="mb-1" shadow="never">
            <template #header>
              <span class="module-title">照片墙模块</span>
            </template>
            <template #default>
              <el-form :model="adminSetting" label-position="left">
                <el-form-item label="每页展示:" prop="name">
                  <el-input-number
                    v-model="adminSetting.photo_wall.page_size.value"
                    :min="1"
                  />
                </el-form-item>
                <el-form-item label="最大分页:" prop="name">
                  <el-input-number
                    v-model="adminSetting.photo_wall.max_page_size.value"
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
          <el-button type="primary" @click="updateSetting(ruleFormRef)">
            更新配置
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.module-title {
  font-size: 0.9rem;
}

.logo-container {
  width: 6rem;

  el-image {
    display: block;
    min-height: 200px;
    margin-bottom: 10px;
  }
}
</style>
