<script setup lang="ts">
import Editor from "@/components/WangEditor/index.vue";
import { SiteInfo, SiteInfoAPI, SiteInfoForm } from "@/api/siteinfo";
import { FormInstance, FormRules } from "element-plus";
import { showValidateErrorMessage } from "@/utils/error";

const ruleFormRef = ref<FormInstance>();

const siteInfo = reactive<SiteInfo>({
  title: "",
  content: "",
});

const siteInfoForm = reactive<SiteInfoForm>({});

const checkContent = () => {
  console.log(siteInfoForm.content);
  if (
    !siteInfoForm.content ||
    siteInfoForm.content.replace(/<\/?[^>]*>/g, "").trim() === ""
  ) {
    ElMessage.error("内容必须填写");
    return false;
  } else {
    return true;
  }
};

const rules = reactive<FormRules<SiteInfo>>({
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [
    {
      required: true,
      trigger: "blur",
    },
  ],
});

const loadSiteInfo = async () => {
  const response = await SiteInfoAPI.getSiteInfo();
  if (response) {
    siteInfo.title = response.title;
    siteInfo.content = response.content;
    siteInfoForm.title = response.title;
  }
};
onMounted(async () => {
  await loadSiteInfo();
});

const updateContent = (content: string) => {
  siteInfoForm.content = content;
};

const saveSiteInfo = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid && checkContent()) {
      const response = await SiteInfoAPI.updateSiteInfo(siteInfoForm);
      if (response) {
        siteInfo.title = response.title;
        siteInfo.content = response.content;
        ElMessage.success("更新成功");
      }
    } else {
      showValidateErrorMessage(fields);
    }
  });
};
</script>

<template>
  <div class="app-container">
    <el-card>
      <el-tabs type="border-card" class="my-2">
        <el-tab-pane>
          <template #label>
            <span class="flex flex-row items-center">
              <el-icon class="mr-1"><View /></el-icon>
              <span>预览</span>
            </span>
          </template>
          <h1 class="title">{{ siteInfo.title }}</h1>
          <div
            class="editor-content-view"
            v-if="siteInfo.content"
            v-dompurify-html="siteInfo.content"
            v-highlight
          ></div>
        </el-tab-pane>
        <el-tab-pane>
          <template #label>
            <span class="flex flex-row items-center">
              <el-icon class="mr-1"><Edit /></el-icon>
              <span>编辑</span>
            </span>
          </template>
          <el-form
            :rules="rules"
            label-position="top"
            size="large"
            :model="siteInfoForm"
            ref="ruleFormRef"
          >
            <el-form-item label="标题" prop="title">
              <el-input placeholder="请输入标题" v-model="siteInfoForm.title" />
            </el-form-item>
            <el-form-item label="正文" prop="content">
              <editor
                class="h-full w-full"
                :model-value="siteInfo.content"
                @update:model-value="updateContent"
              />
            </el-form-item>
          </el-form>
          <el-divider />
          <el-button type="primary" @click="saveSiteInfo(ruleFormRef)">
            更新
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.title {
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
}
</style>
