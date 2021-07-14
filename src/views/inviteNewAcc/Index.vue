<template>
  <div class="inviter">
    <img class="banner" src="https://cdn.jsdelivr.net/gh/defis-net/material2/banner/inviter.png">
    <div class="main">
      <div class="card">
        <div class="title flexa">
          <span>{{ $t('newwallet.invite') }}</span>
          <img class="tips" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/tips_icon_btn.svg">
        </div>
        <div class="flexb item">
          <span class="label">{{ $t('newwallet.inviLink') }}</span>
          <div class="flexa"
            v-clipboard:copy="link"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
            <span class="dinReg link">{{ link }}</span>
            <img class="copyImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
          </div>
        </div>
        <div class="btnDiv flexb">
          <div class="flexc btn" @click="showInvite = true">{{ $t('newwallet.faceToInvi') }}</div>
          <div class="flexc btn"
            v-clipboard:copy="link"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">{{ $t('newwallet.linkInvi') }}</div>
        </div>
      </div>
    </div>

    <Claim />
    <InvLists />

    <van-popup class="popup_p"
      v-model="showInvite">
      <ShowInvite :memo="link" @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import Claim from '@/views/inviteNewAcc/comp/Claim';
import InvLists from '@/views/inviteNewAcc/comp/InvLists'
import ShowInvite from '@/views/inviteNewAcc/popup/ShowInvite';
export default {
  name: 'inviteNewAcc',
  components: {
    Claim,
    InvLists,
    ShowInvite,
  },
  data() {
    return {
      // link: 'https://apps.defis.network/wallet/create-wallet?wallet=newwallet',
      link: 'http://192.168.31.28:8888/wallet/create-wallet?wallet=newwallet',
      showInvite: false,
    }
  },
  methods: {
    handleClose() {
      this.showInvite = false;
    },
    onCopy() {
      this.$toast.success(this.$t('public.copySuccess'));
    },
    onError() {
      this.$toast.fail(this.$t('public.copyFail'));
    },
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
