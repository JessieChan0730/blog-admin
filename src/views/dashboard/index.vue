<template>
  <div class="dashboard-container">
    <github-corner class="github-corner" />

    <el-card shadow="never">
      <el-row justify="space-between">
        <el-col :span="18" :xs="24">
          <div class="flex h-full items-center">
            <img
              class="w-20 h-20 mr-5 rounded-full"
              :src="`${static_url}/${userStore.user.avatar}`"
            />
            <div>
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">
                你好啊，管理员！欢迎来到博客管理后台
              </p>
            </div>
          </div>
        </el-col>

        <el-col :span="6" :xs="24">
          <div class="flex h-full items-center justify-around">
            <el-statistic
              v-for="item in statisticData"
              :key="item.key"
              :value="item.value"
            >
              <template #title>
                <div class="flex items-center">
                  <svg-icon :icon-class="item.iconClass" size="20px" />
                  <span class="text-[16px] ml-1">{{ item.title }}</span>
                </div>
              </template>
              <template v-if="item.suffix" #suffix>/100</template>
            </el-statistic>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-row class="mt-3">
      <el-card style="width: 100%">
        <div id="container" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-row>

    <el-row :gutter="10" class="mt-3">
      <el-col :sm="24" :lg="8" class="mb-2">
        <el-card>
          <div class="e-title">最近发布文章</div>
          <el-table
            :data="articles"
            style="padding-top: 24px; padding-bottom: 4px"
            fit
          >
            <el-table-column label="标题">
              <template #default="scope">
                <el-link
                  style="
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                  :underline="false"
                  :href="url + 'article/' + scope.row.id"
                  target="_blank"
                >
                  {{ scope.row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              label="发布时间"
              prop="create_date"
              align="center"
            />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-2">
        <el-card>
          <div class="e-title">文章分类统计</div>
          <div class="chart-wrapper">
            <div
              id="categoryChart"
              class="chart"
              style="width: 100%; height: 310px"
            ></div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-2">
        <el-card>
          <div class="e-title">文章标签</div>
          <TagCloud :data="tagsList" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import TagCloud from "@/views/dashboard/components/TagCloud.vue";

const tagsList = ref<any>([]);
const articles = ref<any>([]);

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";
import * as echarts from "echarts";
import { SumUpAPI } from "@/api/sumup";

const userStore = useUserStore();
const static_url = import.meta.env.VITE_APP_STATIC_URL;
const date: Date = new Date();
const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好，" + userStore.user.nickname + "！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好，" + userStore.user.nickname + "！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好，" + userStore.user.nickname + "！";
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

// 右上角数量
const statisticData = ref([
  {
    value: 100,
    iconClass: "project",
    title: "博客总数",
    key: "project",
  },
]);

const initContributeDate = (data: any) => {
  let chart = markRaw(echarts.init(document.getElementById("container")));
  const option = {
    title: {
      top: 30,
      left: "center",
      text: "文章贡献度",
      subtext: "一年文章提交的数量",
    },
    tooltip: {
      formatter: "文章数：{c0}篇",
    },
    visualMap: {
      min: 0,
      max: 20,
      type: "piecewise",
      orient: "horizontal",
      left: "center",
      top: 85,
    },
    calendar: {
      top: 140,
      left: 30,
      right: 30,
      cellSize: ["auto", 13],
      range: "2025",
      itemStyle: {
        borderWidth: 0.5,
      },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月",
        ],
      },
      dayLabel: {
        firstDay: 1,
        nameMap: ["日", "一", "二", "三", "四", "五", "六"],
      },
    },
    series: {
      type: "heatmap",
      coordinateSystem: "calendar",
      data: data,
    },
  };
  chart.setOption(option);
  window.addEventListener("resize", function () {
    chart.resize();
  });
};

const initCategoryPie = (data: any) => {
  let chart = markRaw(echarts.init(document.getElementById("categoryChart")));
  const option = {
    legend: {
      top: "bottom",
    },
    tooltip: {
      formatter: "文章数：{c0}篇",
    },
    toolbox: {
      show: false,
    },
    series: [
      {
        name: "文章分类统计",
        type: "pie",
        radius: [20, 100],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        data: data,
      },
    ],
  };
  chart.setOption(option);
};

/** 加载访问统计数据 */
onMounted(async () => {
  const response = await SumUpAPI.getAllSumUpInfo();
  await useUserStore().getUserInfo();
  initContributeDate([["2025-02-10", 10]]);
  initCategoryPie(response.category_per_name);
  statisticData.value[0].value = response.article_num;
  tagsList.value = response.tags;
  articles.value = response.latest_articles;
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }
}
</style>
