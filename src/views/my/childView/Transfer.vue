<template>
  <div class="transfer">
    <div class="title flexb">
      <span class="back flexa" @click="handleBack">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/back.png">
      </span>
      <span>转账</span>
      <span class="back"></span>
    </div>

    <div class="form">
      <div class="item">
        <div class="label">收款账户</div>
        <div>
          <van-field class="ipt" v-model="toAcc" maxlength="12"
            placeholder="请输入收款账户" />
        </div>
      </div>
      <div class="item">
        <div class="label flexb">
          <span>转账数量</span>
          <span class="flexa coin" @click="showMarketList = true">
            <span>{{ tokenInfo.symbol }}</span>
            <img class="toRight" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/back.png">
          </span>
        </div>
        <div class="flexb">
          <van-field class="ipt" v-model="pay"
            @focus="handlePayFocus"
            @blur="handlePayBlur"
            type="number"
            placeholder="请输入转账数量" />
          <span class="max flexc" @click="handleMax">全部</span>
        </div>
      </div>
      <div class="item paddbm">
        <div class="label flexb">
          <span>余额</span>
          <span class="green">{{ bal }} {{ tokenInfo.symbol }}</span>
        </div>
      </div>
      <div class="item">
        <div class="label">备注</div>
        <div>
          <van-field class="ipt" v-model="memo" placeholder="备注" />
        </div>
      </div>
    </div>
    <div class="btn flexc" @click="handleTransfer">确认</div>

    <!-- 币种列表 -->
    <van-popup
      class="newMarket"
      v-model="showMarketList"
      position="left">
      <MarketArea v-if="showMarketList"
        :marketLists="marketLists" :type="'start'"
        @listenMarketChange="handleMarketChange"
        @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import MarketArea from '@/components/MarketArea'
export default {
  name: 'transfer',
  components: {
    MarketArea
  },
  data() {
    return {
      toAcc: '',
      pay: '',
      bal: '0.0000',
      memo: '',
      tokenInfo: {
        contract: 'eosio.token',
        symbol: 'EOS',
        decimal: 4
      },

      showMarketList: false,
      showType: 'start',
    }
  },
  mounted() {
    this.handleGetBal()
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
    }),
  },
  methods: {
    handleBack() {
      this.$router.back()
    },
    async handleGetBal() {
      const params = {
        code: this.tokenInfo.contract,
        symbol: this.tokenInfo.symbol,
        decimal: this.tokenInfo.decimal,
        account: this.account.name || 'myconfidence',
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const balance = result.split(' ')[0]
      this.bal = balance;
    },
    handleMax() {
      this.pay = this.bal;
    },
    handleClose() {
      this.showMarketList = false
    },
    handleMarketChange(data) {
      this.tokenInfo = data
      this.handleClose()
      this.handleGetBal()
    },
    handlePayFocus() {
      const num = this.pay;
      if (!num) {
        return
      }
      this.pay = parseFloat(num || 0)
    },
    handlePayBlur() {
      const num = this.pay;
      if (!num) {
        return
      }
      this.pay = parseFloat(num || 0).toFixed(this.tokenInfo.decimal)
    },
    handleReg() {
      if (!this.toAcc) {
        this.$toast.fail('请输入收款账户')
        return false
      }
      if (!parseFloat(this.pay || 0)) {
        this.$toast.fail('请输入转账数量')
        return false
      }
      if (parseFloat(this.pay || 0) > parseFloat(this.bal || 0)) {
        this.$toast.fail('余额不足')
        return false
      }
      return true
    },
    handleTransfer() {
      if (!this.handleReg()) {
        return
      }
      const quantity = `${this.pay} ${this.tokenInfo.symbol}`
      const params = {
        code: this.tokenInfo.contract,
        toAccount: this.toAcc,
        memo: this.memo,
        quantity
      }
      DApp.transfer(params, (err) => {
        if (err && err.code == 402) {
          return;
        }
        if (err) {
          this.$toast({
            type: 'fail',
            message: err.message,
          })
          return;
        }
        this.$toast({
          message: this.$t('public.success'),
          type: 'success'
        });
      })
    }
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
  .form{
    border-radius: 12px;
    box-shadow: 0px 4px 8px 0px rgba(213,213,213,0.5);
    padding: 30px;
    margin: 30px;
    background: #FFF;
    .item{
      margin-top: 25px;
      border-bottom: 1px solid $color-border;
      padding-bottom: 12px;
      &:last-child{
        border-bottom: 0px solid $color-border;
      }
      &.paddbm{
        margin-top: 40px;
        padding-bottom: 30px;
      }
    }
    .label{
      font-size: 32px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .coin{
      color: #333;
      font-size: 28px;
      font-weight: 400;
      .toRight{
        width: 14px;
        transform: rotate(180deg);
        margin-left: 15px;
      }
    }
    .max{
      font-size: 26px;
      color: $color-tip;
      height: 60px;
      // padding: 0 30px;
      width: 120px;
      border: 1px solid $color-border;
      border-radius: 30px;
    }
    .green{
      color: $color-main;
      font-weight: 400;
      font-size: 30px;
    }
    .ipt{
      flex: 1;
      padding: 18px 0 0;
      &::after{
        display: none;
      }
      /deep/ .van-field__control{
        font-size: 28px;
      }
    }
  }
  .btn{
    margin: 60px 30px 30px;
    height: 90px;
    border-radius: 12px;
    font-size: 36px;
    font-weight: 500;
    color: #FFF;
    background: $color-main;
  }
}
</style>
