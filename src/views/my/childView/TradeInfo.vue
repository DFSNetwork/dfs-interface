<template>
  <div class="transfer">
    <div class="success">
      <img src="@/assets/img/transfer.png">
      <div class="successTip">{{ $t('newwallet.transferSuccess') }}</div>
      <div class="flexe dinBold">
        <span class="num">-{{ quantity }}</span>
        <span class="sml">{{ coin }}</span>
      </div>
    </div>

    <div class="lists">
      <div class="item flexb">
        <span>{{ $t('newwallet.transferFrom') }}</span>
        <div class="flexa data dinReg">
          <span>{{ from }}</span>
          <img class="copy" src="@/assets/img/copy-black.png"
            v-clipboard:copy="from"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
        </div>
      </div>
      <div class="item flexb">
        <span>{{ $t('newwallet.transferToAcc') }}</span>
        <div class="flexa data dinReg">
          <span>{{ to }}</span>
          <img class="copy" src="@/assets/img/copy-black.png"
            v-clipboard:copy="to"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
        </div>
      </div>
      <div class="item flexb">
        <span>Memo</span>
        <div class="flexa data dinReg">
          <span>{{ memo }}</span>
          <img class="copy" src="@/assets/img/copy-black.png"
            v-clipboard:copy="memo"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
        </div>
      </div>
      <div class="item flexb">
        <span>{{ $t('newwallet.transferTrxid') }}</span>
        <div class="flexa data dinReg">
          <span class="hex">{{ trxId }}</span>
          <img class="copy" src="@/assets/img/copy-black.png"
            v-clipboard:copy="trxId"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
        </div>
      </div>
      <div class="item flexb">
        <span>{{ $t('newwallet.transferBlock') }}</span>
        <div class="flexa data dinReg">
          <span>{{ blockNum }}</span>
          <img class="copy" src="@/assets/img/copy-black.png"
            v-clipboard:copy="blockNum"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
        </div>
      </div>
      <div class="item flexb">
        <span>{{ $t('newwallet.transferTime') }}</span>
        <div class="flexa data dinReg">
          <span>{{ time }}</span>
        </div>
      </div>
    </div>

    <div class="detail">
      <div class="tip">{{ $t('newwallet.transferDetail') }}</div>
      <div class="flexb brows">
        <div @click="handleToTrxInfo('bloks.io')">
          <img src="@/assets/img/bloks.io.png">
          <div>Bloks.io</div>
        </div>
        <div @click="handleToTrxInfo('eosx')">
          <img src="@/assets/img/eosx.png">
          <div>Eosx</div>
        </div>
        <div @click="handleToTrxInfo('eosflare')">
          <img src="@/assets/img/eosflare.png">
          <div>Eosflare</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {toLocalTime} from '@/utils/public';
export default {
  name: 'transferInfo',
  data() {
    return {
      // info: sessionStorage.getItem('TRANSFERINFO') ? JSON.parse(sessionStorage.getItem('TRANSFERINFO')) : {},
      info: localStorage.getItem('TRANSFERINFO') ? JSON.parse(localStorage.getItem('TRANSFERINFO')) : {},
      blockNum: '',
      time: '',
      trxId: '',
      from: '',
      to: '',
      memo: '',
      quantity: '',
      coin: '',
    }
  },
  mounted() {
    this.handleDealInfo()
  },
  methods: {
    handleDealInfo() {
      if (!this.info.processed) {
        this.$router.push({
          name: 'home'
        })
        return
      }
      const acts = this.info.processed.action_traces;
      const actObj = acts.find(v => v.receiver !== "dfsfreecpu11")

      this.blockNum = actObj.block_num;
      this.time = toLocalTime(`${actObj.block_time}+0000`);
      this.trxId = actObj.trx_id;

      const tData = actObj.act.data;
      this.from = tData.from;
      this.to = tData.to;
      this.quantity = tData.quantity.split(' ')[0];
      this.coin = tData.quantity.split(' ')[1];
      this.memo = tData.memo;
    },
    onCopy() {
      this.$toast.success(this.$t('public.copySuccess'));
    },
    onError() {
      this.$toast.fail(this.$t('public.copyFail'));
    },
    handleToTrxInfo(type) {
      if (type === 'bloks.io') {
        location.href = `https://bloks.io/tx/${this.trxId}`;
      } else if (type === 'eosx') {
        location.href = `https://www.eosx.io/tx/${this.trxId}`;
      } else {
        location.href = `https://eosflare.io/tx/${this.trxId}`;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.transfer{
  font-size: 32px;
  .success{
    padding: 38px 0;
    font-size: 36px;
    border-bottom: 20px solid #F7F7F7;
    img{
      width: 120px;
    }
    .successTip{
      margin: 20px 0;
      color: $color-main;
    }
    .num{
      font-size: 60px;
    }
    .sml{
      font-size: 40px;
      margin-left: 12px;
    }
  }
  .lists{
    padding: 0 40px;
    .item{
      border-bottom: 1px solid $color-border;
      height: 138px;
      font-weight: 500;
      .copy{
        margin-left: 32px;
        width: 24px;
        display: block;
      }
      .data{
        font-weight: 400;
        font-size: 36px;
      }
      .hex{
        max-width: 300px;
        overflow: hidden;
        text-overflow:ellipsis; //溢出用省略号显示
        white-space:nowrap; //溢出不换行
      }
    }
  }
  .detail{
    background: #F7F7F7;
    padding: 38px 40px 70px;
    font-size: 28px;
    .brows{
      margin-top: 50px;
      &>div{
        flex: 1;
      }
      img{
        width: 66px;
        margin-bottom: 9px;
      }
    }
  }
}
</style>
