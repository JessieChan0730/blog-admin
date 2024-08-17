<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <span class="text-size-sm color-orange flex flex-row items-center mb-1">
    <el-icon class="mr-0.5">
      <slot name="icon"></slot>
    </el-icon>
    {{ title }}
  </span>
</template>

<style scoped lang="scss"></style>
