<template>
  <div class="use">
    <div class="title">{{ $t('newwallet.warnTip') }}</div>
    <div class="tips">{{ $t('newwallet.warnTip1') }}</div>
    <div class="flexc btn" @click="handleClose(true)">{{ $t('public.confirm') }}</div>
    <div class="flexc btn cancel" @click="handleClose(false)">{{ $t('public.cancel') }}</div>
  </div>
</template>

<script>
export default {
  name: 'useConfirm',
  methods: {
    handleClose(type) {
      this.$emit('listenClose', type)
    },
  }
}
</script>

<style lang="scss" scoped>
.use{
  padding: 40px 40px 10px;
  position: relative;
  font-size: 30px;
  color: #333;

  .title{
    font-size: 40px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
  }
  .tips{
    font-size: 32px;
    margin: 20px 0;
    text-align: center;
  }
  .btn{
    height: 100px;
    color: #FFF;
    background: $color-main;
    border-radius: 16px;
    font-size: 36px;
    font-weight: 500;
    &.cancel{
      background: #FFF;
      color: #999;
    }
  }
}
</style>
