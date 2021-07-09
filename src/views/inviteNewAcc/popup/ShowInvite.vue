<template>
  <div class="info">
    <img class="close" @click="handleClose" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/close-white.png">
    <img class="logo" src="@/assets/img/logo.png">
    <div class="title">扫码注册·加入大丰收</div>
    <div class="bg">
      <div class="qrCode">
        <canvas id="codeShare"></canvas>
      </div>
      <!-- <div class="label">注册memo</div> -->
      <div class="memo">
        <span class="bg-left"></span>
        <span class="bg-right"></span>
        <span>{{ memo }}</span>
        <span class="copy flexc">
          <span
            v-clipboard:copy="memo"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">复制链接</span>
          <!-- <img src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png"> -->
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { QRcodeCode } from '@/utils/public';
export default {
  name: '',
  props: {
    memo: {
      type: String,
      default: ''
    },
  },
  mounted() {
    setTimeout(() => {
      const params = this.memo
      this.handleGetPayCode(params)
    }, 100);
  },
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
    },
    handleGetPayCode(imgUrl) {
      const canvas = document.getElementById('codeShare');
      if (canvas) {
        setTimeout(() => {
          QRcodeCode(imgUrl, canvas, 250, (err) => {
            this.codeLoading = false;
            if (err) {
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
.info{
  padding: 40px;
  position: relative;
  font-size: 30px;
  background: $color-main;
  text-align: left;
  .close{
    width: 28px;
    position: absolute;
    top: 40px;
    right: 40px;
  }
  .logo{
    width: 180px;
  }
  .title{
    margin: 30px 0;
    font-size: 40px;
    font-weight: 500;
    text-align: center;
    color: #FFF;
  }
  .bg{
    background: #FFF;
    border-radius: 12px;
    padding: 38px 50px;
    position: relative;

    .memo{
      color: #333;
      word-break: break-all;
      line-height: 40px;
      font-size: 28px;
      font-weight: 600;
      padding: 6px 20px;
      position: relative;
      .bg-right,
      .bg-left{
        width: 40px;
        border-radius: 20px;
        background: $color-main;
        height: 40px;
        position: absolute;
      }
      .bg-left{
        left: -68px;
      }
      .bg-right{
        right: -68px;
      }
      .copy{
        margin: 30px auto 0;
        width: 200px;
        height: 60px;
        border-radius: 12px;
        border: 1px solid $color-main;
        color: $color-main;
        font-size: 28px;
        font-weight: 400;
      }
    }
  }
}
</style>
