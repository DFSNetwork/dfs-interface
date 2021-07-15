<template>
  <div class="info">
    <img class="close" @click="handleClose" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/close-white.png">
    <div class="title">{{ $t('newwallet.scanTip') }}</div>
    <div class="bg">
      <div class="qrCode">
        <canvas id="codeShare"></canvas>
      </div>

      <div class="memo">
        <span class="bg-left"></span>
        <span class="bg-right"></span>

        <!-- 创建账户 -->
        <div class="createAcc flexa">
          <span>创建账户：</span>
          <span class="accNAme dinBold">{{ shortName }}</span>
        </div>

        <!-- 转入地址 -->
        <div class="memoDiv">
          <div class="subTitle flexb">
            <span>转入地址</span>
            <img class="copyImg"
              v-clipboard:copy="'dfsacmanager'"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
          </div>
          <div class="dinReg">dfsacmanager</div>
        </div>

        <!-- Memo -->
        <div class="memoDiv">
          <div class="subTitle flexb">
            <span>EOS MEMO</span>
            <img class="copyImg"
              v-clipboard:copy="memo"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png">
          </div>
          <div class="dinReg">{{ memo }}</div>
        </div>
      </div>

      <div class="tipsDiv">
        <div>注意：</div>
        <div>1. 通过钱包转账并备注或通过交易所提币并备注的方式向以上智能合约地址转入至少0.1个EOS。多于0.1EOS的部分将自动转入新创建的账号。</div>
        <div>2. 请确保转入地址和备注同时正确。</div>
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
    shortName: {
      type: String,
      default: ''
    }
  },
  mounted() {
    setTimeout(() => {
      const params = {
        "address":"dfsacmanager",
        "amount":"0.1",
        "symbol":"EOS",
        "contract":"eosio.token",
        "precision":4,
        "protocol":"ScanProtocol",
        "blockchain":"EOS",
        "action":"transfer",
        "memo": this.memo,
      }
      this.handleGetPayCode(JSON.stringify(params))
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
          QRcodeCode(imgUrl, canvas, 160, (err) => {
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
  padding: 35px;
  position: relative;
  font-size: 30px;
  background: $color-main;
  .close{
    width: 28px;
    position: absolute;
    top: 40px;
    right: 40px;
  }
  .title{
    margin: 0 0 30px 0;
    font-size: 40px;
    font-weight: 500;
    text-align: center;
    color: #FFF;
  }
  .bg{
    background: #FFF;
    border-radius: 12px;
    padding: 30px 18px;
    position: relative;
    .qrCode{
      text-align: center;
    }

    .memo{
      margin-top: 20px;
      color: #333;
      word-break: break-all;
      line-height: 40px;
      font-size: 28px;
      // font-weight: 600;
      padding: 30px 10px 20px;
      position: relative;
      border-top: 1px dashed $color-border;
      .bg-right,
      .bg-left{
        width: 40px;
        border-radius: 20px;
        background: $color-main;
        height: 40px;
        position: absolute;
        top: -20px;
      }
      .bg-left{
        left: -50px;
      }
      .bg-right{
        right: -50px;
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
    .createAcc{
      font-size: 28px;
      padding: 0 18px;
      .accNAme{
        color: $color-main;
      }
    }
    .memoDiv{
      background: rgba($color-main, .08);
      padding: 18px;
      border-radius: 12px;
      font-size: 28px;
      margin: 27px 0;
      &:last-child{
        margin-bottom: 0px;
      }
      .subTitle{
        font-weight: 600;
        margin-bottom: 9px;
        img{
          width: 30px;
          margin-right: 12px;
        }
      }
    }
  }
  .tipsDiv{
    padding: 0 28px;
    font-size: 24px;
    line-height: 44px;
  }
}
</style>
