<template>
  <div class="wthdraw">
    <img class="close" @click="handleClose(false)" src="https://leafy-kataifi-c6d825.netlify.app/icon/close-black.png">
    <div class="title">{{ $t('invest.withdraw') }}</div>
    <div class="main">
      <div class="flexb balDiv">
        <span>{{ $t('invest.coin') }}</span>
        <span class="bal tip dinReg" @click="handleMax">{{ $t('invest.inBal') }}：{{ item.buy_fund_balance }}</span>
      </div>
      <div class="coin flexb">
        <div class="flexa">
          <img class="logo" src="https://leafy-kataifi-c6d825.netlify.app/coin/tethertether-usdt.png">
          <div>
            <div class="name dinBold">USDT</div>
            <div class="dinReg tip cts">tethertether</div>
          </div>
        </div>
        <div>
          <van-field v-model="num"
            @focus="handleFocus"
            @blur="handleBlur"
            class="ipt dinBold"
            placeholder="0.0" />
        </div>
      </div>
    </div>
    <div class="btn flexc" @click="handlSure">{{ $t('public.confirm') }}</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DApp } from '@/utils/wallet';
export default {
  name: 'inverstWithdraw',
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
      num: '',
      bal: '',
    }
  },
  computed: {
    ...mapState({
      account: (state) => state.app.account,
    }),
  },
  methods: {
    handleClose(status) {
      this.$emit('listenClose', status)
    },
    handleMax() {
      this.num = this.item.buy_fund_balance.split(' ')[0]
    },
    handleFocus() {
      const num = parseFloat(this.num || 0);
      if (!num) {
        this.num = ''
        return
      }
      this.num = num
    },
    handleBlur() {
      const num = parseFloat(this.num || 0);
      if (!num) {
        this.num = ''
        return
      }
      this.num = num.toFixed(4)
    },
    handlSure() {
      if (!parseFloat(this.num || 0)) {
        this.$toast.fail(this.$t('invest.errTip1'))
        return
      }
      if (parseFloat(this.num || 0) > parseFloat(this.item.buy_fund_balance || 0)) {
        this.$toast.fail(this.$t('invest.errTip2'))
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const quantity = `${this.num} USDT`;
      const params = {
        actions: [{
          account: 'dfsdtservice',
          name: 'withdraw',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            quantity,
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
.wthdraw{
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
    margin: 0 0 30px 0;
    font-size: 40px;
    font-weight: 500;
    text-align: center;
  }
  .main{
    border: 1px solid $color-border;
    border-radius: 16px;
    padding: 26px 30px;
    .balDiv{
      font-size: 32px;
      font-weight: 500;
      .bal{
        font-size: 26px;
      }
    }
    .coin{
      margin-top: 20px;
      .logo{
        width: 60px;
        height: 60px;
        margin-right: 15px;
      }
      .cts{
        font-size: 24px;
      }
    }
    .ipt{
      padding: 0px 0 0 18px;
      /deep/ .van-field__control{
        text-align: right;
        font-size: 50px;
      }
    }
  }
  .btn{
    background: #F94444;
    height: 100px;
    color: #FFF;
    font-size: 36px;
    font-weight: 500;
    margin-top: 30px;
    border-radius: 16px;
  }
}
</style>
