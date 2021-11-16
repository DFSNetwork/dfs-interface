<template>
  <div class="inverst">
    <div class="tools flexb">
      <div class="flexa">
        <img class="logo" :src="item.logo">
        <span class="dinBold">{{ item.sym }}</span>

        <span class="count dinBold">{{ $t('my.count') }}: ${{ parseFloat(item.total_pay_quantity || 0) | numberTofixed }}</span>
      </div>
      <div class="flexa">
        <div class="btn flexc clRed" v-if="!parseFloat(item.buy_fund_balance || 0)" @click="handleDel">删除</div>
        <div class="btn flexc clRed" v-else @click="showWith = true">{{ $t('invest.withdraw') }}</div>
        <div class="btn flexc" @click="showDeposit = true">{{ $t('invest.deposit') }}</div>
      </div>
    </div>

    <div class="info flexb">
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.inAssets') }}(USDT)</div>
        <div class="dinReg">{{ parseFloat(item.buy_fund_sum || 0) | numberTofixed }}</div>
      </div>
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.inJoinNum') }}</div>
        <div class="dinReg">{{ item.buy_count }}</div>
      </div>
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.rate') }}</div>
        <div class="dinBold"
          :class="{
            'green': parseFloat(item.rate || 0) >= 0,
            'red': parseFloat(item.rate || 0) < 0,
          }"
          >{{ item.rate }}%</div>
      </div>
    </div>
    <div class="info flexb">
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.inBal') }}(USDT)</div>
        <div class="dinReg">{{ parseFloat(item.buy_fund_balance || 0) | numberTofixed }}</div>
      </div>
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.inUsdtNum') }}({{ item.sym }})</div>
        <div class="dinReg">{{ parseFloat(item.total_buy_quantity || 0) | numberTofixed }}</div>
      </div>
      <div class="item">
        <div class="label tip dinReg">{{ $t('invest.nextDays') }}</div>
        <div class="dinReg">{{ item.nextTime.substr(0, 10) }}</div>
      </div>
    </div>

    <van-popup class="popup_long" v-model="showDeposit">
      <Deposit v-if="showDeposit"
        :actType="'deposit'"
        :item="item"
        @listenClose="handleClose"/>
    </van-popup>
    <van-popup class="popup_p" v-model="showWith">
      <Withdraw v-if="showWith" @listenClose="handleClose" :item="item"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex'
import Deposit from '@/views/investment/popup/Deposit'
import Withdraw from '@/views/investment/popup/Withdraw'
export default {
  name: 'inverst',
  components: {
    Withdraw,
    Deposit,
  },
  props: {
    item: {
      type: Object,
      default: function it() {
        return {}
      }
    }
  },
  data() {
    return {
      showWith: false,
      showDeposit: false,
    }
  },
  mounted() {
    // console.log(this.item)
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
    }),
  },
  methods: {
    handleClose(status) {
      this.showWith = false;
      this.showDeposit = false
      if (status) {
        this.$emit('updateInfo', true)
      }
    },
    handleDel() {
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: [{
          account: 'dfsdtservice',
          name: 'del',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            id: this.item.id
          }
        }]
      }
      DApp.toTransaction(params, (err) => {
        this.loading = false;
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
        this.handleClose(true)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.inverst{
  height: 360px;
  border-bottom: 1px solid $color-border;
  padding: 32px 0;
  box-sizing: border-box;
  font-size: 28px;
  text-align: left;
  .tools{
    font-size: 28px;
    margin-bottom: 30px;
    .logo{
      width: 52px;
      height: 52px;
      margin-right: 12px;
    }
    .count{
      font-size: 24px;
      background: #F6F6F6;
      border-radius: 6px;
      padding: 6px 14px;
      margin-left: 15px;
    }
    .btn{
      padding: 12px 30px;
      border-radius: 16px;
      border: 1px solid $color-border;
      margin-left: 26px;
      color: $color-main;
      line-height: 42px;
      // &:first-child{
      //   margin-left: 0;
      // }
      &.clRed{
        color: #FF4D4D;
      }
    }
  }
  .info{
    .item{
      padding-bottom: 30px;
      flex: 1;
      &:last-child{
        text-align: right;
      }
      &:nth-child(2){
        padding-left: 80px;
      }
      .label{
        font-size: 24px;
        margin-bottom: 16px;
      }
      .green{
        color: $color-main;
      }
      .red{
        color: #FF4D4D;
      }
    }
  }
}
</style>
