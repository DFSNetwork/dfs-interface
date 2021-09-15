<template>
  <div class="warn">
    <div class="title">{{ $t('sys.warnTip') }}</div>
    <div>{{ $t('sys.warnTipCnt') }}</div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="scss" scoped>
.warn{
  padding: 30px;
  font-size: 30px;
  line-height: 54px;
  .title{
    font-size: 36px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
  }
}
</style>
