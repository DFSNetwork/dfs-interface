<template>
  <div class="vs">
    <div class="flexa">
      <img class="timeImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/time.png" alt="">
      <div class="time dinBold tip">2021-11-12 18:00</div>
    </div>
    <div class="main">
      <div class="content">{{ $t('upRecord.v5_1') }}</div>
      <div class="content">{{ $t('upRecord.v5_2') }}</div>
      <div class="content">{{ $t('upRecord.v5_3') }}</div>
      <div class="content">{{ $t('upRecord.v5_4') }}</div>
      <div class="content">{{ $t('upRecord.v5_5') }}</div>
      <div class="content">{{ $t('upRecord.v5_6') }}</div>
      <div class="content">{{ $t('upRecord.v5_7') }}
        <a class="link" href="https://mixin.one/messenger">https://mixin.one/messenger</a>。
      </div>
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
.link{
  color: $color-main;
}
</style>
