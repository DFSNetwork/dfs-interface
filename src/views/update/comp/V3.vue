<template>
  <div class="vs">
    <div class="flexa">
      <img class="timeImg" src="https://leafy-kataifi-c6d825.netlify.app/icon/time.png" alt="">
      <div class="time dinBold tip">2021-06-21 18:00</div>
    </div>
    <div class="main">
      <div class="content">{{ $t('upRecord.v3_1') }}</div>
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
