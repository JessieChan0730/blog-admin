<script setup lang="ts">
import "@/components/SvgIcon/index.vue";
import { MediaLink } from "@/api/user";
defineProps<{
  mediaLink: MediaLink;
}>();
</script>

<template>
  <div class="list-container">
    <ul class="list" v-for="(index, media) in mediaLink" :key="index">
      <li class="item">
        <SvgIcon class="mr-1.5" :icon-class="media" />
        <span class="pre">
          {{ media }}：
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="mediaLink[media]"
            placement="top-start"
          >
            <el-text class="w-40" truncated>
              {{ mediaLink[media] }}
            </el-text>
          </el-tooltip>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.list-container {
  width: 100%;

  .list {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    list-style: none;

    .item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.88rem;

      .pre {
        display: flex;
        flex-direction: row;
      }
    }
  }
}
</style>
