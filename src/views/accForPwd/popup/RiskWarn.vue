<template>
  <div class="risk">
    <img class="close"
      @click="handleClose"
      src="https://resource2.dfs.land/icon/close-black.png">
    <div class="title">{{ $t('newwallet.warmTip') }}</div>
    <img class="riskImg" src="https://resource2.dfs.land/dfs/risk.png">
    <div class="tips">
      <div>{{ $t('newwallet.warmTip1') }}</div>
      <div>{{ $t('newwallet.warmTip2') }}</div>
    </div>
    <div class="wallets">
      <div class="flexb">
        <img src="https://resource2.dfs.land/dfs/tp.png" alt="">
        <span class="down">{{ $t('newwallet.toDown') }}</span>
      </div>
      <div class="flexb">
        <img src="https://resource2.dfs.land/dfs/mykey.png" alt="">
        <span class="down">{{ $t('newwallet.toDown') }}</span>
      </div>
      <div class="flexb">
        <img src="https://resource2.dfs.land/dfs/start.png" alt="">
        <span class="down">{{ $t('newwallet.toDown') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'riskWarn',
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.risk{
  padding: 40px;
  border-radius: 20px;
  text-align: left;
  font-size: 30px;
  position: relative;
  .close{
    position: absolute;
    width: 25px;
    top: 30px;
    right: 30px;
  }
  .title{
    font-size: 40px;
    text-align: center;
    font-weight: 500;
  }
  .riskImg{
    width: 626px;
    margin: 30px 0;
  }
  .tips{
    line-height: 60px;
    margin: 30px 0;
  }
  .wallets{
    &>div{
      margin-bottom: 35px;
      &:last-child{
        margin-bottom: 0;
      }
    }
    img{
      width: 374px;
    }
    .down{
      color: #FFF;
      background: $color-main;
      border-radius: 16px;
      padding: 18px 28px;
    }
  }
}
</style>
