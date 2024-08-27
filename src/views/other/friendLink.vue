<script setup lang="ts">
import { Delete, InfoFilled, Plus } from "@element-plus/icons-vue";
import type { Pagination } from "@/api/pagination";
import {
  FLinkQueryParams,
  FriendLink,
  FriendLinkAPI,
  Status,
} from "@/api/friendLink";
import { FormInstance, type FormRules } from "element-plus";
import type { CategoryVo } from "@/api/category";

type selectStatus = {
  name: String;
  status: Status;
};

enum DType {
  Add,
  Edit,
  NUll,
}

interface DialogInfo {
  visible: boolean;
  title: string;
  type: DType;
}

const validate_email = (rule: any, value: any, callback: any) => {
  let emailRegExp = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  let emailRegExp1 = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  if (
    (!emailRegExp.test(value) && value != "") ||
    (!emailRegExp1.test(value) && value != "")
  ) {
    callback(new Error("请输入有效邮箱格式！"));
  } else {
    callback();
  }
};

const validate_url = (rule: any, value: any, callback: any) => {
  let urlReg =
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  if (!urlReg.test(value)) {
    callback(new Error("请输入有效的网站格式！"));
  } else {
    callback();
  }
};

const friendLinkFormRuler = reactive<FormRules<FriendLink>>({
  name: [
    { required: true, message: "网站名必须填写", trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "分类名长度最小为1，最大为50！",
      trigger: "blur",
    },
  ],
  intro: [
    { required: true, message: "网站简介必须填写", trigger: "blur" },
    {
      min: 1,
      max: 120,
      message: "分类名长度最小为1，最大为120！",
      trigger: "blur",
    },
  ],
  link: [
    { required: true, message: "网站链接必须填写", trigger: "blur" },
    {
      validator: validate_url,
      trigger: "blur",
    },
  ],
  avatar: [
    { required: true, message: "头像链接必须填写", trigger: "blur" },
    {
      validator: validate_url,
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "用户邮箱必须填写", trigger: "blur" },
    {
      validator: validate_email,
      trigger: "blur",
    },
  ],
});

const dialogInfo = reactive<DialogInfo>({
  visible: false,
  title: "",
  type: DType.NUll,
});

const friendLinkPagination = reactive<Pagination<FriendLink>>({
  count: 1,
  next: "",
  previous: "",
  results: [],
});

let queryParams = reactive<FLinkQueryParams>({
  page: 1,
  status: undefined,
  name: "",
});

// 添加或者编辑的表单
const linkForm = reactive<FriendLink>({
  name: "",
  intro: "",
  avatar: "",
  email: "",
  link: "",
});
// 表格加载数据
const loading = ref(false);

const searchName = ref("");
const searchStatus = ref<Status>();

const selectedLink = ref<FriendLink[]>([]);
// 表单实例
const ruleFormRef = ref<FormInstance>();
// 分页组件状态
const pageSize = ref(5);
const disabled = ref(false);
const background = ref(true);
const statuses = ref<selectStatus[]>([
  {
    name: "未审核",
    status: Status.PENDING,
  },
  {
    name: "上架",
    status: Status.ON_SHELF,
  },
  {
    name: "下架",
    status: Status.OFF_SHELF,
  },
]);
const page = toRef(queryParams, "page");

onMounted(() => {
  loadFriendLinks();
});

watch(
  [() => queryParams.name, () => queryParams.page, () => queryParams.status],
  async () => {
    await loadFriendLinks(queryParams);
  }
);

// TODO 此处的计算属性是否可以不需要
const ids = computed(() => {
  return selectedLink.value.map((link) => {
    return link.id;
  });
});

const loadFriendLinks = async (params?: FLinkQueryParams) => {
  loading.value = true;
  const response = await FriendLinkAPI.getALlLink(params);
  if (response) {
    friendLinkPagination.count = response.count;
    friendLinkPagination.next = response.next;
    friendLinkPagination.previous = response.previous;
    friendLinkPagination.results = response.results;
  }
  loading.value = false;
};

const handleCurrentChange = (currentPage: number) => {
  page.value = currentPage;
};

// 保留方法
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};

// 展示dialog
const showDialog = (type: DType, row?: any) => {
  if (type == DType.Edit) {
    dialogInfo.title = "编辑链接";
    // 初始化dialog中编辑框的内容
    linkForm.name = row.name;
    linkForm.avatar = row.avatar;
    linkForm.id = row.id;
    linkForm.link = row.link;
    linkForm.email = row.email;
    linkForm.intro = row.intro;
    linkForm.status = row.status;
  } else if (type == DType.Add) {
    dialogInfo.title = "新增链接";
  }
  dialogInfo.type = type;
  dialogInfo.visible = true;
};

// 关闭对话框
const closeDialog = () => {
  dialogInfo.visible = false;
  linkForm.name = "";
  linkForm.avatar = "";
  linkForm.link = "";
  linkForm.email = "";
  linkForm.intro = "";

  delete linkForm.id;
  delete linkForm.status;
};

// 提交对话框数据
const commit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  let result: FriendLink;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (dialogInfo.type == DType.Add) {
        result = await FriendLinkAPI.addALlLink(linkForm);
        if (friendLinkPagination.results.length < pageSize.value) {
          friendLinkPagination.results.push(result);
        }
        friendLinkPagination.count++;
      } else if (dialogInfo.type == DType.Edit) {
        result = await FriendLinkAPI.updateLink(linkForm);
        if (!result) return;
        friendLinkPagination.results = friendLinkPagination.results?.map(
          (flink) => {
            if (flink.id == result.id) {
              flink.name = result.name;
              flink.intro = result.intro;
              flink.email = result.email;
              flink.link = result.link;
              flink.avatar = result.avatar;
              flink.status = result.status;
            }
            return flink;
          }
        );
      } else {
        ElNotification({
          title: "错误",
          message: "系统错误",
          type: "error",
        });
      }
      closeDialog();
    } else {
      ElNotification({
        title: "错误",
        message: "请按照表单规则提交",
        type: "error",
      });
    }
  });
};
// 删除当个链接
const deleteLink = async (id: number | string) => {
  await FriendLinkAPI.deleteLink(id);
  await loadFriendLinks();
};

// 删除多个标签
const deleteFriendLinks = async () => {
  if (ids.value.length !== 0) {
    await FriendLinkAPI.deleteMultipleLinks(ids.value as number[]);
    await loadFriendLinks();
  } else {
    ElMessage.error("请框选对应的链接");
  }
};

// 表格选择改变
const selectChange = (newSelection: FriendLink[]) => {
  selectedLink.value = newSelection;
};

// 搜索
const search = () => {
  queryParams.name = searchName.value;
  queryParams.status = searchStatus.value;
  queryParams.page = 1;
};

// 重置
const reset = () => {
  queryParams.name = "";
  queryParams.status = undefined;
  queryParams.page = 1;
  searchName.value = "";
  searchStatus.value = undefined;
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :inline="true">
        <el-form-item prop="keywords" label="友链名">
          <el-input
            placeholder="请输入友链名称"
            clearable
            v-model="searchName"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            placeholder="友链状态"
            size="default"
            style="width: 100px"
            v-model="searchStatus"
          >
            <el-option
              v-for="(status, index) in statuses"
              :key="index"
              :label="status.name"
              :value="status.status"
            />
          </el-select>
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
          title="你确定要删除这些链接吗？"
          width="220"
          confirm-button-type="danger"
          @confirm="deleteFriendLinks"
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
        :data="friendLinkPagination.results"
        @selection-change="selectChange"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" property="id" label="ID" width="60" />
        <el-table-column
          align="center"
          property="name"
          label="友链名"
          width="full"
        />
        <el-table-column
          align="center"
          property="avatar"
          label="头像"
          width="full"
        >
          <template #default="scope">
            <el-image :src="scope.row.avatar" class="h-3em" fit="contain" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="intro"
          label="简介"
          width="full"
        />
        <el-table-column
          align="center"
          property="link"
          label="链接"
          width="full"
        >
          <template #default="scope">
            <el-link>{{ scope.row.link }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          property="email"
          label="邮箱"
          width="full"
        />
        <el-table-column
          align="center"
          property="status"
          label="状态"
          width="100"
          prop="display"
        >
          <template #default="scope">
            <el-tag
              v-if="scope.row.status === Status.PENDING"
              type="danger"
              disable-transitions
            >
              未审核
            </el-tag>
            <el-tag
              v-else-if="scope.row.status === Status.OFF_SHELF"
              type="warning"
              disable-transitions
            >
              下架
            </el-tag>
            <el-tag v-else type="success" disable-transitions>上架</el-tag>
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
              title="你确定要删除这个链接吗？"
              width="220"
              confirm-button-type="danger"
              @confirm="deleteLink(prop.row.id)"
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
          :total="friendLinkPagination.count"
          :disabled="disabled"
          :background="background"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </el-card>
    <!--    Dialog-->
    <el-dialog
      @close="closeDialog"
      v-model="dialogInfo.visible"
      :title="dialogInfo.title"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        label-position="left"
        :model="linkForm"
        :rules="friendLinkFormRuler"
      >
        <el-form-item label="网站名称:" prop="name">
          <el-input v-model="linkForm.name" placeholder="请输入网站名" />
        </el-form-item>
        <el-form-item label="网站简介:" prop="intro">
          <el-input v-model="linkForm.intro" placeholder="请输入网站简介" />
        </el-form-item>
        <el-form-item label="网站链接:" prop="link">
          <el-input v-model="linkForm.link" placeholder="请输入网站链接" />
        </el-form-item>
        <el-form-item label="网站头像:" prop="avatar">
          <el-input
            v-model="linkForm.avatar"
            placeholder="请输入网站头像链接"
          />
        </el-form-item>
        <el-form-item label="用户邮箱:" prop="email">
          <el-input v-model="linkForm.email" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="网站状态:" v-if="dialogInfo.type === DType.Edit">
          <el-radio-group v-model="linkForm.status">
            <el-radio :value="Status.PENDING">未审核</el-radio>
            <el-radio :value="Status.ON_SHELF">上架</el-radio>
            <el-radio :value="Status.OFF_SHELF">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="commit(ruleFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
