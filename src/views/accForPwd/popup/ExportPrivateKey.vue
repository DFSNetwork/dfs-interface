<template>
  <div class="export">
    <img class="close" @click="handleClose"
      src="https://leafy-kataifi-c6d825.netlify.app/icon/close-black.png">
    <div class="title">{{ $t('newwallet.safeTip') }}</div>
    <div class="tips">
      {{ $t('newwallet.safeTip1') }}
    </div>
    <div class="private">
      <span>{{ privateKey }}</span>
      <div class="copyBtn flexa"
        v-clipboard:copy="privateKey"
        v-clipboard:success="onCopy"
        v-clipboard:error="onError">
        <span>{{ $t('newwallet.copy') }}</span>
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/copy.png">
      </div>
    </div>
    <div class="btn flexc" @click="handleClose">{{ $t('newwallet.known') }}</div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';

export default {
  name: 'exportPrivateKey',
  data() {
    return {
      privateKey: '',
    }
  },
  mounted() {
    this.privateKey = DApp.exportPrivateKey()
  },
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
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
.export{
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
  .tips{
    margin: 30px 0;
    background: #FFD5D5;
    // border: 2px solid #FF2A2A;
    color: #FF1717;
    border-radius: 12px;
    padding: 14px 34px;
  }
  .private{
    background: #F3F3F3;
    color: #333;
    padding: 34px;
    word-break: break-all;
    height: 300px;
    position: relative;
    box-sizing: border-box;

    .copyBtn{
      justify-content: flex-end;
      position: absolute;
      bottom: 35px;
      right: 40px;
      color: $color-main;
      img{
        width: 32px;
        margin-left: 20px;
      }
    }
  }
  .btn{
    height: 100px;
    border-radius: 20px;
    font-size: 36px;
    font-weight: 500;
    color: #FFF;
    background: $color-main;
    margin-top: 40px;
  }
}
</style>
