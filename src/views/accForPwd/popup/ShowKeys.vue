<template>
  <div class="keys">
    <img class="refresh" @click="handleRandom" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/refresh.png">
    <img class="close" @click="handleClose" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/close-black.png">
    <div class="title">{{ $t('newwallet.generator') }}</div>
    <div class="item">
      <div class="subTitle">{{ $t('newwallet.pubKey') }}</div>
      <div class="info">
        <span class="key">{{ pub }}</span>
        <div class="flexa copy"
          v-clipboard:copy="pub"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">
          <span>{{ $t('newwallet.clkCopuy') }}</span>
          <img class="copyImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
        </div>
      </div>
    </div>
    <div class="item">
      <div class="subTitle">{{ $t('newwallet.priKey') }}</div>
      <div class="info">
        <span class="key">{{ pri }}</span>
        <div class="flexa copy"
          v-clipboard:copy="pri"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">
          <span>{{ $t('newwallet.clkCopuy') }}</span>
          <img class="copyImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
        </div>
      </div>
    </div>

    <div class="red">{{ $t('newwallet.warnTip2') }}</div>
    <div class="flexc btn" @click="show = true">{{ $t('newwallet.toUse') }}</div>

    <van-popup class="popup_long"
      v-model="show"
      get-container="body">
      <UsePriTip @listenClose="listenClose"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import UsePriTip from '@/views/accForPwd/popup/UsePriTip'
export default {
  name: 'showKeys',
  components: {
    UsePriTip,
  },
  data() {
    return {
      pri: '',
      pub: '',
      show: false,
    }
  },
  mounted() {
    this.handleRandom()
  },
  methods: {
    listenClose(type) {
      this.show = false;
      if (type) {
        this.handleClose()
      }
    },
    handleClose() {
      this.$emit('listenClose', false)
    },
    handleRandom() {
      DApp.randomKey((pri, pub) => {
        this.pri = pri;
        this.pub = pub;
        this.$emit('update', pub)
        // console.log(pri, pub)
      })
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
.keys{
  padding: 40px;
  position: relative;
  font-size: 30px;
  color: #333;
  .refresh{
    width: 32px;
    position: absolute;
    top: 38px;
    right: 120px;
  }
  .close{
    width: 28px;
    position: absolute;
    top: 40px;
    right: 40px;
  }
  .title{
    font-size: 40px;
    font-weight: 500;
    text-align: center;
  }
  .item{
    font-size: 28px;
    margin: 30px 0;
    .subTitle{
      font-size: 36px;
      font-weight: 500;
      margin-bottom: 15px;
    }
    .info{
      padding: 28px;
      border-radius: 12px;
      background: #F3F3F3;
      font-size: 32px;
    }
    .key{
      word-break: break-all;
    }
    .copy{
      text-emphasis: right;
      color: $color-main;
      justify-content: flex-end;
      margin-top: 18px;
      font-size: 28px;
      .copyImg{
        width: 32px;
        margin-left: 20px;
      }
    }
  }
  .red{
    color: #FF1717;
    font-size: 28px;
  }
  .btn{
    background: $color-main;
    color: #FFF;
    font-size: 36px;
    font-weight: 500;
    border-radius: 16px;
    height: 100px;
    margin-top: 30px;
  }
}
</style>
