<template>
  <div style="text-align: center">
    <svg style="margin: auto" :width="width" :height="height">
      <a
        class="fontA"
        v-for="(tag, index) in tags"
        :key="`tag-${index}`"
        :style="{ fill: tag.color }"
      >
        <text
          :id="tag.id"
          :x="tag.x"
          :y="tag.y"
          :font-size="16 * (600 / (600 - tag.z))"
          :fill-opacity="(400 + tag.z) / 600"
          @mousemove="listenerMove($event)"
          @mouseout="listenerOut($event)"
        >
          {{ tag.text }}
        </text>
      </a>
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: function () {
      return [];
    },
  },
});

const router = useRouter();

const width = ref(330); //svg宽度
const height = ref(305); //svg高度
const tagsNum = ref(0); //标签数
const RADIUS = ref(150); //球的半径
const speedX = ref(Math.PI / 360 / 1.5); //球一帧绕x轴旋转的角度
const speedY = ref(Math.PI / 360 / 1.5); //球-帧绕y轴旋转的角度
const tags = ref([]);

const dataVo = ref([]);

const timer = ref(null);
const CX = computed(function () {
  //球心x坐标
  return width.value / 2 - 40;
});
const CY = computed(function () {
  //球心y坐标
  return height.value / 2;
});

/**
 * 离开页面之前清除定时
 */
onBeforeRouteLeave(() => {
  clearInterval(timer.value);
  timer.value = null;
});

// 初始化数据
function initData() {
  //初始化标签位置
  let tagsa = [];
  tagsNum.value = dataVo.value.length;
  for (let i = 0; i < dataVo.value.length; i++) {
    let tag = {};
    let k = -1 + (2 * (i + 1) - 1) / tagsNum.value;
    let a = Math.acos(k);
    let b = a * Math.sqrt(tagsNum.value * Math.PI); //计算标签相对于球心的角度
    tag.text = dataVo.value[i].name;
    tag.x = CX.value + RADIUS.value * Math.sin(a) * Math.cos(b); //根据标签角度求出标签的x,y,z坐标
    tag.y = CY.value + RADIUS.value * Math.sin(a) * Math.sin(b);
    tag.z = RADIUS.value * Math.cos(a);
    tag.id = dataVo.value[i].id; // 给标签添加id
    tag.color = randomColor();
    tagsa.push(tag);
  }
  tags.value = tagsa; //让vue替我们完成视图更新
}

// 纵向旋转
const rotateX = (angleX) => {
  var cos = Math.cos(angleX);
  var sin = Math.sin(angleX);
  for (let tag of tags.value) {
    var y1 = (tag.y - CY.value) * cos - tag.z * sin + CY.value;
    var z1 = tag.z * cos + (tag.y - CY.value) * sin;
    tag.y = y1;
    tag.z = z1;
  }
};
// 横向旋转
const rotateY = (angleY) => {
  var cos = Math.cos(angleY);
  var sin = Math.sin(angleY);
  for (let tag of tags.value) {
    var x1 = (tag.x - CX.value) * cos - tag.z * sin + CX.value;
    var z1 = tag.z * cos + (tag.x - CX.value) * sin;
    tag.x = x1;
    tag.z = z1;
  }
};
// 运动函数
const runTags = () => {
  if (typeof timer.value === "number") {
    clearInterval(timer);
    timer.value = null;
  }
  let timera = setInterval(() => {
    rotateX(speedX.value);
    rotateY(speedY.value);
  }, 17);
  timer.value = timera;
};
// 监听移入事件
const listenerMove = (e) => {
  if (e.target.id) {
    clearInterval(timer.value);
  }
};
// 监听移出事件
const listenerOut = (e) => {
  if (e.target.id) {
    runTags();
  }
};
// 随机颜色
function randomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  do {
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (color === "#FFFFFF" || color === "#000000");
  return color;
}
// 获取标签
onMounted(() => {
  setTimeout(() => {
    dataVo.value = props.data;
    initData();
    runTags();
  }, 800);
});
</script>

<style scoped>
.fontA {
  font-weight: bold;
  fill: rgb(90 188 250);
}

.fontA:hover {
  cursor: pointer;
  fill: plum;
}
</style>
