<script setup lang="ts">
import { onMounted } from 'vue';
import { createGame, builds } from './lib/game';

const handleChoose = (idx: number) => {
  builds.value.forEach((item, _idx) => item.active = idx === _idx);
}
onMounted(() => {
  createGame();
});
</script>

<template>
  <canvas class="webgl"></canvas>
  <div class="tools">
    <div
      v-for="(type, idx) in builds"
      :key="idx"
      class="type"
      :class="{ active: type.active }"
      :style="{ backgroundImage: `url(${type.url})` }"
      @click="handleChoose(idx)"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.tools {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 120px;
  background-color: rgba(0, 0, 0, .5);
  user-select: none;
  display: flex;
  align-items: center;
  padding: 0 16px;
  .type {
    width: 100px;
    height: 100px;
    background-size: cover;
    margin-right: 16px;
    &:hover,
    &.active {
      border: 4px solid #4d85ff;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
