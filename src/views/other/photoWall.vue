<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import {
  PhotoWall,
  PhotoWallAPI,
  PhotoWallCreateForm,
  QueryForm,
} from "@/api/photoWall";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions,
} from "element-plus";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { PaginationType, useGetPageSize } from "@/hooks/settings";

const search_content = ref("");
const photo_ids = ref<number[]>([]);
const pageSize = ref(5);
const loading = ref(false);
const disabled = ref(false);
const background = ref(true);
// 文件上传表单实例对象
const upload = ref<UploadInstance>();

enum DType {
  Add,
  Edit,
  NUll,
}

interface DrawerInfo {
  visible: boolean;
  title: string;
  type: DType;
}

const queryParams = reactive<QueryForm>({
  page: 1,
  description: "",
});

const photoForm = reactive<PhotoWallCreateForm>({
  description: "",
  image: null,
});

const drawerInfo = reactive<DrawerInfo>({
  visible: false,
  title: "",
  type: DType.NUll,
});

const photoWallPagination = reactive<Pagination<PhotoWall>>({
  count: 1,
  next: "",
  previous: "",
  results: [],
});

onMounted(async () => {
  await loadPhotos();
  pageSize.value = await useGetPageSize(PaginationType.PhotoWall);
});

watch([() => queryParams.page, () => queryParams.description], async () => {
  await loadPhotos(queryParams);
});

const loadPhotos = async (query?: QueryForm) => {
  loading.value = true;
  const response = await PhotoWallAPI.getAllPhoto(query);
  if (response) {
    photoWallPagination.count = response.count;
    photoWallPagination.next = response.next;
    photoWallPagination.previous = response.previous;
    photoWallPagination.results = response.results;
  }
  loading.value = false;
};

// 展示dialog
const showDialog = (type: DType, row?: any) => {
  if (type == DType.Edit) {
    drawerInfo.title = "编辑图片";
    // 初始化dialog中编辑框的内容
    photoForm.description = row.description;
    photoForm.id = row.id;
  } else if (type == DType.Add) {
    drawerInfo.title = "新增图片";
  }
  drawerInfo.type = type;
  drawerInfo.visible = true;
};

const closeDrawer = () => {
  drawerInfo.visible = false;
  photoForm.description = "";
  delete photoForm.id;
};

const handleSizeChange = (size: number) => {
  console.log(`pageSize is change ${size}`);
};
const handleCurrentChange = (currentPage: number) => {
  queryParams.page = currentPage;
};

// 文件上传需要认证身份信息
const uploadHeaders = reactive<Record<string, any>>({
  Authorization: localStorage.getItem(TOKEN_KEY),
});

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const buildRequest = (options: UploadRequestOptions) => {
  photoForm.image = options.file;
  return Promise.resolve(options.file);
};

const commit = async () => {
  const d_len = photoForm.description.trim().length;
  if (d_len == 0 || d_len > 255)
    return ElMessage.error("必须填写简介，且长度大于0，小于255");
  if (drawerInfo.type == DType.Add) {
    // TODO 新增
    if (!photoForm.image) return ElMessage.error("图片不能为空");
    const result = await PhotoWallAPI.uploadPhoto(photoForm);
    if (result && photoWallPagination.results.length < pageSize.value) {
      photoWallPagination.results.push(result);
    }
    photoWallPagination.count++;
    ElMessage.success("上传成功");
  } else if (drawerInfo.type == DType.Edit) {
    // TODO 编辑
    const result = await PhotoWallAPI.updatePhoto(photoForm.id as number, {
      description: photoForm.description,
    });
    photoWallPagination.results = photoWallPagination.results?.map((photo) => {
      if (photo.id == result.id) {
        photo.description = result.description;
      }
      return photo;
    });
  } else {
    ElNotification({
      title: "错误",
      message: "系统错误",
      type: "error",
    });
  }
  closeDrawer();
};

const changeVisible = async (row: PhotoWall) => {
  const { id, visible } = row;
  await PhotoWallAPI.updatePhoto(id as number, { visible });
};

const deletePhoto = async (id: number | string) => {
  await PhotoWallAPI.deletePhoto(id);
  await loadPhotos();
};

const selectChange = (photos: PhotoWall[]) => {
  photo_ids.value = photos.map((photo) => {
    return photo.id;
  }) as number[];
};

// 删除多个标签
const deletePhotos = async () => {
  if (photo_ids.value.length !== 0) {
    await PhotoWallAPI.deleteMultiplePhotos(photo_ids.value);
    await loadPhotos();
  } else {
    ElMessage.error("请框选对应的链接");
  }
};

// 搜索
const search = () => {
  queryParams.description = search_content.value;
  queryParams.page = 1;
};

// 重置
const reset = () => {
  queryParams.description = "";
  queryParams.page = 1;
  search_content.value = "";
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :inline="true">
        <el-form-item prop="keywords" label="简介">
          <el-input
            placeholder="请输入图片简介"
            clearable
            v-model="search_content"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">
            <i-ep-search />
            搜索
          </el-button>
          <el-button @click="reset">
            <i-ep-refresh />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" :icon="Plus" @click="showDialog(DType.Add)">
          新增
        </el-button>
        <el-popconfirm
          confirm-button-text="确认"
          cancel-button-text="取消"
          :icon="InfoFilled"
          icon-color="#f40"
          title="你确定要删除这些图片吗？"
          width="220"
          confirm-button-type="danger"
          @confirm="deletePhotos"
        >
          <template #reference>
            <el-button type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <el-table
        v-loading="loading"
        border
        style="width: 100%"
        stripe
        :data="photoWallPagination.results"
        @selection-change="selectChange"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" property="id" label="ID" width="100" />
        <el-table-column
          align="center"
          property="image"
          label="图片"
          width="400"
        >
          <template #default="scope">
            <el-image
              :src="scope.row.image"
              class="w-full h-4rem"
              fit="contain"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[scope.row.image]"
              :initial-index="4"
              :preview-teleported="true"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="description"
          label="图片简介"
          width="full"
        />
        <el-table-column
          align="center"
          property="visible"
          label="是否可见"
          width="full"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.visible"
              :active-value="true"
              @change="changeVisible(scope.row)"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="prop">
            <el-button
              size="small"
              type="primary"
              @click="showDialog(DType.Edit, prop.row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              confirm-button-text="确认"
              cancel-button-text="取消"
              :icon="InfoFilled"
              icon-color="#f40"
              title="你确定要删除这个图片吗？"
              width="220"
              confirm-button-type="danger"
              @confirm="deletePhoto(prop.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-pagination
          :default-page-size="pageSize"
          v-model:current-page="queryParams.page"
          :page-size="pageSize"
          :total="photoWallPagination.count"
          :disabled="disabled"
          :background="background"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </el-card>
    <el-drawer
      v-model="drawerInfo.visible"
      direction="rtl"
      @close="closeDrawer"
      size="38%"
    >
      <template #header>
        <h4>{{ drawerInfo.title }}</h4>
      </template>
      <template #default>
        <el-form ref="ruleFormRef" label-position="top" :model="photoForm">
          <el-form-item
            label="上传图片:"
            prop="name"
            class="w-full"
            v-if="drawerInfo.type === DType.Add"
          >
            <el-upload
              :headers="uploadHeaders"
              method="post"
              :multiple="false"
              name="image"
              list-type="picture"
              accept=".jpg,.png,.jpeg"
              ref="upload"
              class="w-full"
              action="#"
              :limit="1"
              drag
              :http-request="buildRequest"
              :on-exceed="handleExceed"
              :auto-upload="true"
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
          <el-form-item label="图片简介:" prop="intro">
            <el-input
              :autosize="{ minRows: 4 }"
              v-model="photoForm.description"
              placeholder="请输入图片简介"
              type="textarea"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div class="drawer-footer flex flex-row justify-start">
          <el-button type="primary" @click="commit">确定</el-button>
          <el-button @click="closeDrawer">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss"></style>
