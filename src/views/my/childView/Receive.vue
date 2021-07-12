<template>
  <div class="transfer">
    <div class="title flexb">
      <span class="back flexa" @click="handleBack">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/back.png">
      </span>
      <span>{{ $t('newwallet.receive') }}</span>
      <span class="back"></span>
    </div>

    <div class="table">
      <div class="eos">
        <span>EOS</span>
        <img class="logo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/eosio.token-eos.svg">
      </div>
      <div class="qr">
        <canvas class="codeCanvas" id="codeShare"></canvas>
        <div class="info">
          <div class="name">{{ account.name || ''}}</div>
          <div class="copy flexc"
            v-clipboard:copy="account.name"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">{{ $t('invi.copy') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { QRcodeCode } from '@/utils/public';
export default {
  name: 'transfer',
  mounted() {
    if (!this.account.name) {
      this.$router.push({
        name: 'home'
      })
    }
    setTimeout(() => {
      this.handleGetPayCode(this.account.name)
      // this.handleGetPayCode('{"address":"myconfidence","amount":"0.1","symbol":"EOS","contract":"eosio.token","precision":4,"protocol":"ScanProtocol","blockchain":"EOS","action":"transfer","memo": "qwweerttt","dappData": "11111111"}')
    }, 100);
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
  methods: {
    handleBack() {
      this.$router.back()
    },
    // 二维码生成
    handleGetPayCode(imgUrl) {
      const canvas = document.getElementById('codeShare');
      if (canvas) {
        setTimeout(() => {
          QRcodeCode(imgUrl, canvas, 280, (err) => {
            this.codeLoading = false;
            if (err) {
              console.log(err)
              this.$toast.fail('二维码生成失败');
            }
          })
        }, 100)
      }
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
.transfer{
  background: #F5F5F5;
  font-size: 30px;
  min-height: 100vh;
  text-align: left;
  .title{
    background: #FFF;
    font-size: 32px;
    height: 90px;
    font-weight: 500;
    padding: 0 30px;
    .back{
      width: 80px;
      height: 80px;
      img{
        width: 18px;
      }
    }
  }
  .table{
    margin: 30px;
    background: #FFF;
    box-shadow: 0px 6px 10px 4px rgba(226,226,226,0.5);
    border-radius: 12px;
    overflow: hidden;
    text-align: center;
    .eos{
      position: relative;
      height: 182px;
      background: $color-main;
      color: #FFF;
      font-size: 40px;
      font-weight: 500;
      padding-top: 30px;
      .logo{
        position: absolute;
        bottom: 0px;
        left: 50%;
        height: 140px;
        width: 140px;
        transform: translate(-50%, 50%);
      }
    }
    .qr{
      padding: 80px 0 40px;
      .name{
        font-size: 44px;
        padding: 40px 0 40px;
        border-top: 1px solid $color-border;
      }
      .copy{
        font-size: 32px;
        color: $color-main;
        border: 1px solid $color-main;
        border-radius: 12px;
        height: 72px;
        padding: 0 32px;
        width: 320px;
        margin: auto;
      }
    }
    .codeCanvas{
      width: 360px !important;
      height: 360px !important;
      margin-bottom: 20px;
    }
  }
}
</style>
