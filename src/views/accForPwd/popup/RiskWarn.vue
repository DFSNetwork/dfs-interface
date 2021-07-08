<template>
  <div class="risk">
    <img class="close"
      @click="handleClose"
      src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/close-black.png">
    <div class="title">风险提示</div>
    <img class="riskImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/risk.png">
    <div class="tips">
      <div>检测到您账户已超出当前最大限额，为了您的账户安全。</div>
      <div>建议您前往下载钱包，成为真正钱包用户。</div>
    </div>
    <div class="wallets">
      <div class="flexb">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/tp.png" alt="">
        <span class="down">前往下载</span>
      </div>
      <div class="flexb">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/mykey.png" alt="">
        <span class="down">前往下载</span>
      </div>
      <div class="flexb">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/start.png" alt="">
        <span class="down">前往下载</span>
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
