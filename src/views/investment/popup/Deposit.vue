<template>
  <div class="deposit">
    <img class="close" @click="handleClose(false)" src="https://resource2.dfs.land/icon/close-black.png">
    <div class="title" v-if="actType === 'create'">{{ $t('invest.createIn') }}</div>
    <div class="title" v-else>{{ $t('invest.deposit') }}</div>

    <div class="coin">
      <div class="subTitle flexb">
        <span>{{ $t('invest.inCoin') }}</span>
      </div>
      <div class="sltCoin flexb">
        <van-popover
          v-model="showPopover"
          placement="bottom-start"
          trigger="click"
        >
          <div class="maxH">
            <div class="flexb sltAct sltMore"
              @click="handleSelect(v)"
              v-for="(v, i) in coins" :key="i">
              <div class="flexa slt" type="primary">
                <img class="logo" :src="v.logo">
                <span class="dinBold">{{ v.symbol }}</span>
              </div>
              <!-- <van-icon class="down" name="arrow-down" /> -->
            </div>
          </div>
          <template #reference>
            <div class="flexb sltAct">
              <div class="flexa slt" type="primary">
                <img class="logo" :src="sltCoin.logo">
                <span class="dinBold">{{ sltCoin.symbol }}</span>
              </div>
              <van-icon class="down" name="arrow-down" />
            </div>
          </template>
        </van-popover>
      </div>
    </div>

    <!-- 更多选项 -->
    <div class="other">
      <div>
        <van-field class="ipt dinBold"
          v-model="payNum"
          type="number"
          @blur="handleBlur('bal')"
          @focus="handleFocus('bal')"
          :placeholder="$t('invest.iptTip1')" />
      </div>
      <div class="oTitle flexb">
        <span>{{ $t('public.balance') }}：{{ bal }} USDT</span>
      </div>
      <div class="chexkBox flexb">
        <div class="din flexc" :class="{'act': balRate == 0.1}"
          @click="handleBalRate(0.1)">10%</div>
        <div class="din flexc" :class="{'act': balRate == 0.25}"
          @click="handleBalRate(0.25)">25%</div>
        <div class="din flexc" :class="{'act': balRate == 0.5}"
          @click="handleBalRate(0.5)">50%</div>
        <div class="din flexc" :class="{'act': balRate == 0.75}"
          @click="handleBalRate(0.75)">75%</div>
        <div class="din flexc" :class="{'act': balRate == 1}"
          @click="handleBalRate(1)">MAX</div>
      </div>
    </div>

    <div class="other">
      <div>
        <van-field class="ipt din"
          v-model="planBuyNum"
          type="number"
          @blur="handleBlur('plan')"
          @focus="handleFocus('plan')"
          :placeholder="$t('invest.iptTip2')" />
      </div>
      <div class="chexkBox flexb">
        <div class="din flexc" @click="planBuyNum = '10.0000'"
          :class="{'act': parseFloat(planBuyNum || 0) === 10}">$10</div>
        <div class="din flexc" @click="planBuyNum = '20.0000'"
          :class="{'act': parseFloat(planBuyNum || 0) === 20}">$20</div>
        <div class="din flexc" @click="planBuyNum = '50.0000'"
          :class="{'act': parseFloat(planBuyNum || 0) === 50}">$50</div>
        <div class="din flexc" @click="planBuyNum = '75.0000'"
          :class="{'act': parseFloat(planBuyNum || 0) === 75}">$75</div>
        <div class="din flexc" @click="planBuyNum = '100.0000'"
          :class="{'act': parseFloat(planBuyNum || 0) === 100}">$100</div>
      </div>
    </div>

    <div class="other">
      <div>
        <van-field class="ipt dinBold"
          type="number"
          @blur="handleBlur('days')"
          @focus="handleFocus('days')"
          v-model="nextDays"
          :placeholder="$t('invest.iptTip3')" />
      </div>
      <!-- <div class="oTitle flexb">
        <span>定投周期</span>
      </div> -->
      <div class="chexkBox flexb">
        <div class="din flexc" @click="nextDays = 1"
          :class="{'act': parseFloat(nextDays || 0) === 1}">{{ $t('invest.xDays', {x: 1}) }}</div>
        <div class="din flexc" @click="nextDays = 3"
          :class="{'act': parseFloat(nextDays || 0) === 3}">{{ $t('invest.xDays', {x: 3}) }}</div>
        <div class="din flexc" @click="nextDays = 5"
          :class="{'act': parseFloat(nextDays || 0) === 5}">{{ $t('invest.xDays', {x: 5}) }}</div>
        <div class="din flexc" @click="nextDays = 7"
          :class="{'act': parseFloat(nextDays || 0) === 7}">{{ $t('invest.xDays', {x: 7}) }}</div>
        <div class="din flexc" @click="nextDays = 15"
          :class="{'act': parseFloat(nextDays || 0) === 15}">{{ $t('invest.xDays', {x: 15}) }}</div>
      </div>
    </div>

    <div class="tip">{{ $t('invest.sptTip') }}</div>
    <div class="btn flexc" @click="handleCreate">{{ $t('public.confirm') }}</div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex'
export default {
  name: 'inverstDeposit',
  props: {
    actType: {
      type: String,
      default: 'create',
    },
    item: {
      type: Object,
      default: function it() {
        return {}
      }
    }
  },
  data() {
    return {
      value: '',
      sltCoin: {
        mid: 17,
        symbol: 'EOS',
        contract: 'eosio.token',
        logo: 'https://resource2.dfs.land/coin/eosio.token-eos.svg',
      },
      showPopover: false,
      bal: '0.0000',

      payNum: '',
      balRate: 0,
      planBuyNum: '',
      nextDays: '',
    }
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
      allInvests: state => state.invest.allInvests,
      coins: state => state.invest.coins,
    }),
  },
  watch: {
    account: {
      handler: function at(val) {
        if (!val.name) {
          return
        }
        this.handleGetBal()
      },
      deep: true,
      immediate: true
    },
    item: {
      handler: function at(val) {
        if (!val.id) {
          return
        }
        this.planBuyNum = val.pay_quantity.split(' ')[0];
        this.nextDays = val.days;
        this.sltCoin = this.coins.find(v => v.symbol === val.sym)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleClose(status) {
      this.$emit('listenClose', status)
    },
    handleSelect(v) {
      this.sltCoin = v;
      this.showPopover = false;
    },
    async handleGetBal() {
      const name = this.account.name;
      const params = {
        code: 'tethertether',
        symbol: 'USDT',
        decimal: 4,
        account: name,
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      if (!result.length) {
        return
      }
      const bal = result.split(' ')[0];
      this.bal = bal;
    },
    handleBalRate(rate) {
      this.balRate = rate;
      const payNum = this.bal * rate;
      this.payNum = parseFloat(payNum || 0).toFixed(4)
    },
    handleFocus(type = 'bal') {
      if (type === 'bal') {
        const num = parseFloat(this.payNum || 0);
        !num ? this.payNum = '' : this.payNum = num;
        return
      }
      if (type === 'plan') {
        const num = parseFloat(this.planBuyNum || 0);
        !num ? this.planBuyNum = '' : this.planBuyNum = num;
        return
      }
      if (type === 'days') {
        const num = parseInt(this.nextDays || 0);
        !num ? this.nextDays = '' : this.nextDays = num;
      }
    },
    handleBlur(type = 'bal') {
      if (type === 'bal') {
        const num = parseFloat(this.payNum || 0);
        !num ? this.payNum = '' : this.payNum = num.toFixed(4)
        return
      }
      if (type === 'plan') {
        const num = parseFloat(this.planBuyNum || 0);
        !num ? this.planBuyNum = '' : this.planBuyNum = num.toFixed(4);
        return
      }
      if (type === 'days') {
        const num = parseInt(this.nextDays || 0);
        !num ? this.nextDays = '' : this.nextDays = num;
      }
    },
    handleReg() {
      if (!parseFloat(this.payNum || 0)) {
        this.$toast.fail(this.$t('invest.errTip3'))
        return false
      }
      if (parseFloat(this.payNum || 0) > parseFloat(this.bal || 0)) {
        this.$toast.fail(this.$t('invest.errTip4'))
        return false
      }
      if (parseFloat(this.payNum || 0) < 10) {
        this.$toast.fail(this.$t('invest.errTip5'))
        return false
      }
      if (!parseFloat(this.planBuyNum || 0)) {
        this.$toast.fail(this.$t('invest.errTip6'))
        return false
      }
      if (!parseFloat(this.planBuyNum || 0)) {
        this.$toast.fail(this.$t('invest.errTip7'))
        return false
      }
      if (!parseFloat(this.nextDays || 0)) {
        this.$toast.fail(this.$t('invest.errTip8'))
        return false
      }
      if (parseFloat(this.nextDays || 0) > 30) {
        this.$toast.fail(this.$t('invest.errTip9'))
        return false
      }
      return true
    },
    handleCreate() {
      if (!this.handleReg()) {
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const quantity = `${this.payNum} USDT`;
      const planBuyNum = parseInt(this.planBuyNum * 10000);
      const next = 86400 * parseFloat(this.nextDays);
      let memo = `${this.actType}:${this.sltCoin.symbol}:${planBuyNum}:${next}`;
      if (this.actType === 'deposit') {
        memo = `${this.actType}:${this.item.id}:${planBuyNum}:${next}`
      }
      const params = {
        actions: [{
          account: 'tethertether',
          name: 'transfer',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            from: formName,
            to: 'dfsdtservice',
            quantity,
            memo,
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
.maxH{
  max-height: 600px;
  overflow: auto;
}
.sltAct{
  border: 1px solid $color-border;
  border-radius: 16px;
  height: 100px;
  padding: 0 24px;
  // width: 630px;
  box-sizing: border-box;
  &.sltMore{
    width: 605px;
    border: 0px solid $color-border;
  }
  .down{
    color: #999;
    font-size: 30px;
  }
}
.slt{
  font-size: 30px;
  .logo{
    width: 60px;
    height: 60px;
    margin-right: 15px;
  }
}
.deposit{
  text-align: left;
  padding: 35px;
  position: relative;
  font-size: 30px;
  .close{
    width: 28px;
    position: absolute;
    top: 40px;
    right: 40px;
  }
  .title{
    margin: 0 0 15px 0;
    font-size: 40px;
    font-weight: 500;
    text-align: center;
  }
  .coin{
    margin-top: 20px;
    .subTitle{
      font-size: 36px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .sltCoin{
      :deep( .van-popover__wrapper){
        display: block;
        flex: 1;
      }
    }
  }
  .other{
    margin: 30px 0;
    .ipt{
      border: 1px solid $color-border;
      border-radius: 16px;
      margin-bottom: 20px;
      padding: 28px;
      height: 100px;
      box-sizing: border-box;
      :deep( .van-field__control){
        font-size: 32px;
      }
    }
    .oTitle{
      font-size: 28px;
      margin-bottom: 20px;
      padding-left: 18px;
    }
    .chexkBox{
      &>div{
        font-size: 26px;
        margin-right: 20px;
        text-align: center;
        border: 1px solid $color-border;
        width: 110px;
        height: 56px;
        border-radius: 8px;
        &:last-child{
          margin-right: 0;
        }
        &.act{
          color: $color-main;
          background: rgba($color-main, .2);
          border: 1px solid rgba(#11AE8D, .2);
        }
      }
    }
  }

  .tip{
    font-size: 24px;
    margin: 28px 0;
  }
  .btn{
    height: 100px;
    border-radius: 16px;
    background: $color-main;
    color: #FFF;
    font-size: 36px;
    font-weight: 500;
  }
}
</style>