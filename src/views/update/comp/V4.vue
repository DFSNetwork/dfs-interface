<template>
  <div class="vs">
    <div class="flexa">
      <img class="timeImg" src="https://resource2.dfs.land/icon/time.png" alt="">
      <div class="time dinBold tip">2021-07-18 19:30</div>
    </div>
    <div class="main">
      <div class="content">{{ $t('upRecord.v4_1') }}</div>
      <div class="content">{{ $t('upRecord.v4_2') }}</div>
      <div class="content">{{ $t('upRecord.v4_3') }}</div>
      <div class="content">{{ $t('upRecord.v4_4') }}</div>
      <div class="content">{{ $t('upRecord.v4_5') }}</div>
      <div class="content">{{ $t('upRecord.v4_6') }}</div>
      <div class="content">{{ $t('upRecord.v4_7') }}</div>
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
