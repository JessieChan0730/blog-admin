<script setup lang="ts">
import SocialList from "@/views/blog/components/SocialMediaLink.vue";
import ModuleTitle from "@/views/blog/components/ModuleTitle.vue";
import { UserAPI, UserInfoVo } from "@/api/user";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { Document, Hide, Search, View } from "@element-plus/icons-vue";
import router from "@/router";
import { useBlogStore } from "@/store";
import { QueryParams } from "@/api/blog";
import { CategoryAPI, CategoryVo } from "@/api/category";

const blogStore = useBlogStore();

const orderOptions = [
  {
    value: "-create_data",
    label: "默认",
  },
  {
    value: "create_date",
    label: "时间正序",
  },
  {
    value: "-update_date",
    label: "更新时间",
  },
];

const categoryOptions = ref<CategoryVo[]>([]);

// keyword
const queryForm = reactive<QueryParams>({
  search: "",
  ordering: "",
  page: 1,
  category: 0,
});
const userInfo = reactive<UserInfoVo>({
  nickname: "",
  avatar: "",
  about_me: "",
  signature: "",
  more_info: {
    hobby: [
      {
        name: "",
        detail: "",
      },
    ],
    media: {
      github: "",
      bilibili: "",
      csdn: "",
      tiktok: "",
    },
  },
});
// 文件上传需要认证身份信息
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

// 解构
const keyword = toRef(queryForm, "search");
const orderBy = toRef(queryForm, "ordering");
const page = toRef(queryForm, "page");
const category = toRef(queryForm, "category");

// 页面大小
const pageSize = ref(2);
const disabled = ref(false);
const background = ref(true);
const activeNames = ref([]);
// 是否展示信息面板
const isShowInfo = ref(true);
// Dialog是否展示
const dialogFormVisible = ref(false);
// 文件上传表单实例对象
const upload = ref<UploadInstance>();
// 头像上传地址
const uploadUrl = ref("http://127.0.0.1:8000/api/user/change/");
// 临时的状态
const temp_search = ref("");
const temp_category = ref();
const temp_ordering = ref("");

onMounted(() => {
  getUserInfo();
  blogStore.init(queryForm);
  CategoryAPI.getAllCategory().then((data) => {
    categoryOptions.value.push(...data);
  });
});

watch([keyword, orderBy, page, category], () => {
  blogStore.init(queryForm);
});

const getUserInfo = async () => {
  const response = await UserAPI.getInfo();
  if (response) {
    userInfo.nickname = response.nickname;
    userInfo.avatar = response.avatar;
    userInfo.about_me = response.about_me;
    userInfo.signature = response.signature;
    userInfo.more_info = response.more_info;
  }
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const submitUpload = () => {
  // 提交文件
  upload.value!.submit();
};

const showDialog = () => {
  dialogFormVisible.value = true;
};

const uploadSuccess = () => {
  upload.value!.clearFiles();
  getUserInfo();
  dialogFormVisible.value = false;
};

const uploadError = () => {
  ElMessage.error("上传失败");
};

// 推出编辑模式
const exitEdit = () => {
  isShowInfo.value = true;
  // 重新同步数据
  getUserInfo();
};
// 进入编辑模式
const intoEdit = () => {
  isShowInfo.value = false;
};
// 提交表单信息
const commitInfo = async () => {
  const response = await UserAPI.updateUserInfo({
    nickname: userInfo.nickname,
    signature: userInfo.signature,
    more_info: userInfo.more_info,
  });
  if (response) {
    userInfo.nickname = response.nickname;
    userInfo.signature = response.signature;
    userInfo.more_info.hobby = response.more_info.hobby;
    userInfo.more_info.media = response.more_info.media;
    ElMessage.success("添加成功");
    isShowInfo.value = true;
  }
};
// 添加爱好
const addHobby = () => {
  if (userInfo.more_info.hobby.length < 3) {
    userInfo.more_info.hobby.push({
      name: "",
      detail: "",
    });
  } else {
    ElMessage.error("爱好最多添加三个");
  }
};
// 删除爱好
const removeHobby = () => {
  if (userInfo.more_info.hobby.length > 1) {
    userInfo.more_info.hobby.pop();
  } else {
    ElMessage.error("爱好最少需要一个");
  }
};
// 进入文章详情编辑页
const intoDetail = (id: number) => {
  router.push({ name: "blog_detail", params: { id } });
};
// 开始搜索
const search = () => {
  queryForm.page = 1;
  queryForm.search = temp_search.value;
  queryForm.category = temp_category.value;
  queryForm.ordering = temp_ordering.value;
};
const reset = () => {
  temp_ordering.value = "";
  temp_category.value = null;
  temp_search.value = "";
  queryForm.page = 1;
  queryForm.search = "";
  queryForm.category = 0;
  queryForm.ordering = "-create_date";
};
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--左侧-->
      <el-col :lg="6" :sm="12">
        <el-card>
          <template #header>
            <div class="avatar-container">
              <el-avatar
                class="mb-1.5"
                :size="200"
                fit="fill"
                :src="userInfo.avatar"
              />
              <el-button type="text" size="small" @click="showDialog">
                修改头像
              </el-button>
            </div>
          </template>
          <template #default>
            <!--信息面板-->
            <div v-if="isShowInfo" class="info-panel">
              <div class="info-container">
                <span id="username" class="text-size-xl mb-2">
                  {{ userInfo.nickname }}
                </span>
                <span id="signature" class="text-size-xs mb-2 color-gray-500">
                  {{ userInfo.signature }}
                </span>
              </div>
              <div class="other-info">
                <ModuleTitle title="我的爱好">
                  <template #icon>
                    <MagicStick />
                  </template>
                </ModuleTitle>
                <el-collapse class="my-2 color-gray" v-model="activeNames">
                  <el-collapse-item
                    v-for="(hobby, index) in userInfo.more_info.hobby"
                    :title="hobby.name"
                    :name="index"
                    :key="index"
                  >
                    <div class="color-gray">
                      {{ hobby.detail }}
                    </div>
                  </el-collapse-item>
                </el-collapse>
                <ModuleTitle title="社交媒体">
                  <template #icon>
                    <Link />
                  </template>
                </ModuleTitle>
                <SocialList :mediaLink="userInfo.more_info.media" />
              </div>
            </div>
            <!--编辑信息面板-->
            <div v-else class="edit-panel">
              <el-form
                label-position="top"
                label-width="auto"
                :model="userInfo"
                style="max-width: 600px"
              >
                <el-form-item label="昵称">
                  <el-input
                    placeholder="请输昵称"
                    v-model="userInfo.nickname"
                  />
                </el-form-item>
                <el-form-item label="个性签名">
                  <el-input type="textarea" v-model="userInfo.signature" />
                </el-form-item>
                <el-form-item label="个人爱好">
                  <div
                    class="w-full"
                    v-for="(hobby, index) in userInfo.more_info.hobby"
                    :key="index"
                  >
                    <el-input
                      class="mb-1"
                      placeholder="爱好名"
                      size="small"
                      v-model="hobby.name"
                    />
                    <el-input
                      class="mb-1"
                      type="textarea"
                      v-model="hobby.detail"
                    />
                  </div>
                  <div class="w-full flex flex-row justify-end">
                    <el-button
                      class="left"
                      type="primary"
                      size="small"
                      @click="addHobby"
                    >
                      添加
                    </el-button>
                    <el-button
                      class="left"
                      type="danger"
                      size="small"
                      @click="removeHobby"
                    >
                      删除
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item label="社交媒体">
                  <div
                    class="link-input w-full flex flex-row justify-between items-center mb-2"
                    v-for="(index, media) in userInfo.more_info.media"
                    :key="media"
                  >
                    <SvgIcon size="1.2rem" class="mr-1.5" :icon-class="media" />
                    <el-input
                      size="small"
                      placeholder="link...."
                      v-model="userInfo.more_info.media[media]"
                    />
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </template>
          <template #footer>
            <div v-if="isShowInfo" class="show-info">
              <el-button class="w-full" @click="intoEdit">
                编辑用户信息
              </el-button>
            </div>
            <div v-else class="edit-info">
              <el-button type="primary" @click="commitInfo">保存</el-button>
              <el-button @click="exitEdit">取消</el-button>
            </div>
          </template>
        </el-card>
      </el-col>
      <!--右侧-->
      <el-col :lg="18" :sm="12">
        <el-card>
          <template #header>
            <el-form
              :model="queryForm"
              :inline="true"
              class="flex flex-row justify-end"
            >
              <el-form-item label="关键字">
                <el-input
                  v-model="temp_search"
                  style="width: 200px"
                  placeholder="请输入关键字"
                  :suffix-icon="Search"
                />
              </el-form-item>
              <el-form-item label="分类">
                <el-select
                  v-model="temp_category"
                  placeholder="分类名"
                  size="default"
                  style="width: 100px"
                >
                  <el-option
                    v-for="category in categoryOptions"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="排序规则">
                <el-select
                  v-model="temp_ordering"
                  placeholder="排序"
                  size="default"
                  style="width: 100px"
                >
                  <el-option
                    v-for="item in orderOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
                <el-button @click="reset">重置</el-button>
              </el-form-item>
            </el-form>
          </template>
          <template #default>
            <!--TODO 博客列表-->
            <el-row>
              <el-col
                :lg="24"
                v-if="
                  blogStore.articleListVo.results &&
                  blogStore.articleListVo.results.length === 0
                "
              >
                <el-empty :image-size="200" description="暂无数据" />
              </el-col>
              <el-col
                v-else
                :lg="12"
                class="px-1 mb-1"
                v-for="blog in blogStore.articleListVo.results"
                :key="blog.id"
              >
                <el-card shadow="hover">
                  <template #header>
                    <div
                      class="title flex flex-row justify-between items-center"
                    >
                      <el-link type="primary" @click="intoDetail(blog.id)">
                        <el-icon class="mx-0.5" :size="14">
                          <Document />
                        </el-icon>
                        {{ blog.title }}
                      </el-link>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content="blog.visible ? `文章可见` : `文章不可见`"
                        placement="top"
                      >
                        <el-icon v-if="blog.visible" class="mx-0.5" :size="14">
                          <View />
                        </el-icon>
                        <el-icon v-else class="mx-0.5" :size="14">
                          <Hide />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                  <template #default>
                    <div class="cover intro">
                      <el-image
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        :preview-src-list="[blog.cover_url]"
                        :initial-index="4"
                        class="w-full mb-2 h-220px"
                        :src="blog.cover_url"
                        fit="fill"
                      />
                      <el-text
                        class="mx-1"
                        size="small"
                        type="info"
                        line-clamp="2"
                      >
                        {{ blog.intro }}
                      </el-text>
                    </div>
                  </template>
                  <template #footer>
                    <div class="flex gap-2">
                      <el-tag
                        size="small"
                        v-for="tags in blog.tags"
                        :key="tags.id"
                        type="primary"
                        effect="light"
                      >
                        {{ tags.name }}
                      </el-tag>
                    </div>
                  </template>
                </el-card>
              </el-col>
            </el-row>
          </template>
          <template #footer>
            <div class="pagination-container flex flex-row justify-center">
              <el-pagination
                :default-page-size="pageSize"
                v-model:current-page="queryForm.page"
                :page-size="pageSize"
                :total="blogStore.articleListVo.count"
                :disabled="disabled"
                :background="background"
                layout="total, prev, pager, next, jumper"
              />
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
    <!--文件上传对话框-->
    <el-dialog v-model="dialogFormVisible" title="请选择上传的文件" width="500">
      <el-upload
        :headers="uploadHeaders"
        method="put"
        :multiple="false"
        name="avatar"
        list-type="picture"
        accept=".jpg,.png,.jpeg"
        ref="upload"
        class="upload-demo"
        :action="uploadUrl"
        :limit="1"
        drag
        :on-exceed="handleExceed"
        :on-success="uploadSuccess"
        :on-error="uploadError"
        :auto-upload="false"
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
