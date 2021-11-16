<template>
  <div class="vs">
    <div class="flexa">
      <img class="timeImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/time.png" alt="">
      <div class="time dinBold tip">2021-05-27 19:30</div>
    </div>
    <div class="main">
      <div class="content">{{ $t('upRecord.v1_1') }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'v1'
}
</script>

<style lang="scss" scoped>
@import url('./vs.css');
</style>
