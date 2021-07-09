<template>
  <div class="inviter">
    <img class="banner" src="https://cdn.jsdelivr.net/gh/defis-net/material2/banner/inviter.png">
    <div class="main">
      <div class="card">
        <div class="title flexa">
          <span>邀请好友</span>
          <img class="tips" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/tips_icon_btn.svg">
        </div>
        <div class="flexb item">
          <span class="label">邀请链接</span>
          <div class="flexa">
            <span class="dinReg link">https://apps.defis.network/wallet/create-wallet</span>
            <img class="copyImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
          </div>
        </div>
        <div class="btnDiv flexb">
          <div class="flexc btn">面对面邀请</div>
          <div class="flexc btn">链接邀请</div>
        </div>
      </div>
    </div>

    <Claim />
    <InvLists />
  </div>
</template>

<script>
import Claim from '@/views/inviteNewAcc/comp/Claim';
import InvLists from '@/views/inviteNewAcc/comp/InvLists'
export default {
  name: 'inviteNewAcc',
  components: {
    Claim,
    InvLists,
  },
  data() {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
.inviter{
  background: #F9F9F9;
  min-height: 100vh;
  padding-bottom: 40px;
  .banner{
    height: 320px;
  }
  .main{
    margin: -60px 30px 30px;
    position: relative;
    border-radius: 12px;
    background: #FFF;
    padding: 26px;
    font-size: 28px;
  }
  .card{
    .title{
      font-size: 32px;
      font-weight: 500;
      padding-left: 24px;
      position: relative;
      &::after{
        content: '';
        position: absolute;
        width: 8px;
        height: 36px;
        background: $color-main;
        border-radius: 6px;
        left: 0px;
        top: 50%;
        transform: translate(0, -50%);
      }
      .tips{
        width: 30px;
        margin-left: 18px;
      }
    }
    .item{
      height: 100px;
    }
    .label{
      color: #999;
      line-height: 48px;
    }
    .link{
      display: block;
      max-width: 400px;
      overflow: hidden;
      text-overflow:ellipsis; //溢出用省略号显示
      white-space:nowrap; //溢出不换行
    }
    .copyImg{
      width: 28px;
      margin-left: 24px;
    }
    .btnDiv{
      margin-top: 10px;
      .btn{
        height: 90px;
        font-weight: 500;
        font-size: 36px;
        color: $color-main;
        flex: 1;
        border: 1px solid $color-main;
        margin-right: 30px;
        border-radius: 12px;
        &:last-child{
          margin-right: 0;
          border: 0px solid $color-main;
          color: #FFF;
          background: $color-main;
        }
      }
    }
  }
}
</style>
