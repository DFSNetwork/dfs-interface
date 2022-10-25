<template>
  <div class="buyRam">
    <div class="title">{{ $t('resource.manage') }}</div>
    <div class="info">
      <div class="flexb">
        <span class="label">RAM</span>
        <span class="price">{{ $t('resource.curPrice') }} {{ ramPrice.toFixed(6) }} EOS/KB</span>
      </div>
      <div class="percentDiv flexc">
        <div class="bgRate" :style="`width: ${ramRate}%`"></div>
        <div class="able">{{ $t('resource.abled') }} {{ abledRam.toFixed(2) }}KB / {{ totalRam.toFixed(2) }}KB</div>
      </div>
    </div>
    <div class="checkboxes flexc">
      <div class="check flexc" :class="{'act': act == 0}" @click="act = 0">
        <div class="box flexc">
          <img class="checkedImg" src="https://storied-crepe-e5e65c.netlify.app/icon/checked.png" alt="">
        </div>
        <div>{{ $t('resource.buy') }}</div>
      </div>
      <div class="check flexc" :class="{'act': act == 1}" @click="act = 1">
        <div class="box flexc">
          <img class="checkedImg" src="https://storied-crepe-e5e65c.netlify.app/icon/checked.png" alt="">
        </div>
        <div>{{ $t('resource.sell') }}</div>
      </div>
    </div>

    <div class="buy" v-if="act === 0">
      <div class="bal din" @click="handleClickEosBal">{{ $t('resource.bal') }}: {{ eosBal }} EOS</div>
      <div class="iptDiv flexb">
        <div class="iptLabal">{{ $t('resource.buyNum') }}</div>
        <van-field class="ipt dinBold" type="number" @blur="handleBlur" v-model="buyNum" placeholder="0.0" />
      </div>
      <div class="abt din">≈ {{ abtBuy.toFixed(2) }} KB</div>
      <div class="iptDiv flexb">
        <div class="iptLabal">{{ $t('resource.receiver') }}</div>
        <van-field class="ipt din" v-model="receiver" placeholder="0.0" />
      </div>
      <div class="pos">
        <div class="myLoading flexc" v-if="buyLoading"><van-loading type="spinner" color="#29D4B0"/></div>
        <div class="flexc btn" @click="handleBuyRam">{{ $t('resource.buy') }}</div>
      </div>
    </div>
    <div class="buy" v-else>
      <div class="bal din" @click="handleClickSellBal">{{ $t('resource.bal') }}: {{abledRam.toFixed(2)}} KB</div>
      <div class="iptDiv flexb">
        <div class="iptLabal">{{ $t('resource.sellRam') }}</div>
        <van-field class="ipt dinBold" v-model="sellNum" placeholder="0.0" />
      </div>
      <div class="abt din">≈ {{ abtSell.toFixed(4) }} EOS</div>
      <div class="pos">
        <div class="myLoading flexc" v-if="loading"><van-loading type="spinner" color="#29D4B0"/></div>
        <div class="flexc btn sell" @click="handleSellRam">{{ $t('resource.sell') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DApp } from '@/utils/wallet';
export default {
  name: 'buyRam',
  props: {
    resInfo: {
      type: Object,
      default: function ri() {
        return {}
      }
    }
  },
  data() {
    return {
      act: 0,
      eosBal: '0.0000',
      buyNum: '',
      receiver: '',
      sellNum: '',
      ramInfo: {},
      loading: false,
      buyLoading: false,
    }
  },
  mounted() {
    this.handleGetRamInfo()
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
    ramPrice() {
      return parseFloat(this.ramInfo.price || 0)
    },
    totalRam() {
      const total =  this.resInfo.ram_quota;
      return parseFloat(total || 0) / 1024
    },
    abledRam() {
      const abled = (parseFloat(this.resInfo.ram_quota || 0) - parseFloat(this.resInfo.ram_usage || 0)) / 1024
      return abled
    },
    ramRate() {
      let rate = this.abledRam / this.totalRam * 100;
      if (rate < 0) {
        rate = 0;
      }
      if (rate > 100) {
        rate = 100
      }
      return rate
    },
    abtBuy() {
      const abt = parseFloat(this.buyNum || 0) / (this.ramPrice || 1)
      return abt
    },
    abtSell() {
      const abt = parseFloat(this.sellNum || 0) * this.ramPrice
      return abt
    }
  },
  watch: {
    account: {
      handler: function acc(newVal) {
        if (!newVal.name) {
          return
        }
        if (!this.receiver) {
          this.receiver = newVal.name;
        }
        this.handleGetBalance()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async handleGetRamInfo() {
      const res = await this.getRamData()
      this.ramInfo = res || {};
    },
    async getRamData() {
      const params = {
        code: 'eosio',
        json: true,
        scope: 'eosio',
        table: 'rammarket',
      }
      const {status, result} = await this.$api.get_table_rows(params)
      const lists = result.rows;
      if(!status || !lists.length) {
        return
      }
      let arr = []
      lists.forEach(v => {
        const cbData = v;
        const allEos = parseFloat(cbData.quote.balance, 0).toFixed(4)
        const allRam = (parseFloat(cbData.base.balance, 0) / 1024).toFixed(2)
        const price = parseFloat(allEos / allRam)
        cbData.allEos = allEos
        cbData.allRam = allRam
        cbData.price = price
        arr.push(cbData)
      })
      return arr[0]
    },
    handleClickEosBal() {
      this.buyNum = this.eosBal
    },
    handleBlur() {
      let num = parseFloat(this.buyNum || 0)
      num ? this.buyNum = num.toFixed(4) : this.buyNum = ''
    },
    handleClickSellBal() {
      this.sellNum = this.abledRam
    },
    async handleGetBalance() {
      const name = this.account.name;
      if (!name) {
        return
      }
      let params = {
        code: 'eosio.token',
        symbol: 'EOS',
        decimal: 4,
        account: name
      };
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result.split(' ')[0];
      this.eosBal = bal;
    },

    handleSellRam() {
      if (this.loading || !Number(this.sellNum || 0)) {
        return
      }
      if (this.sellNum > this.abledRam) {
        this.$toast.fail(this.$t('resource.balLow'))
        return
      }
      const account = this.account;
      const name = account.name;
      const permission = account.permissions;
      const bytes = (this.sellNum * 1024).toFixed(0)
      const params = {
        actions: [{ // 卖出RAM
          account: 'eosio',
          name: 'sellram',
          authorization: [{
            actor: name,
            permission,
          }],
          data: {
            account: name,
            bytes,
          },
        }]
      }
      this.loading = true;
      DApp.toTransaction(params, (err) => {
        this.loading = false;
        if (err) {
          this.$toast({
            type: 'fail',
            message: err.message,
          })
          return;
        }
        this.sellNum = ''
        this.$toast({
          type: 'success',
          message: 'Success'
        })
        setTimeout(() => {
          this.$emit('listenUpdate', true)
        }, 1500);
      })
    },
    handleBuyRam() {
      if (this.buyLoading || !Number(this.buyNum || 0)) {
        return
      }
      if (Number(this.buyNum) > Number(this.eosBal)) {
        this.$toast.fail('余额不足')
        return
      }
      const account = this.account;
      const name = account.name;
      const permission = account.permissions;
      const quant = `${this.buyNum} EOS`
      const params = {
        actions: [{ // 买入RAM
          account: 'eosio',
          name: 'buyram',
          authorization: [{
            actor: name,
            permission,
          }],
          data: {
            payer: name,
            receiver: this.receiver,
            quant,
          },
        }]
      }
      this.buyLoading = true;
      DApp.toTransaction(params, (err) => {
        this.buyLoading = false;
        if (err) {
          if (err.code == 402 || err.code == 3080004 || err.code == 3080002 || err.code == 3080001) {
            return;
          }
          this.$toast({
            type: 'fail',
            message: err.message,
          })
          return;
        }
        this.buyNum = ''
        this.$toast({
          type: 'success',
          message: 'Success'
        })
        setTimeout(() => {
          this.$emit('listenUpdate', true)
          this.handleGetBalance()
        }, 1500);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.buyRam{
  font-size: 28px;
  padding: 20px 40px 30px;
  .title{
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .info{
    font-size: 26px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(#aaa, .2);
    .label{
      color: #000;
      font-weight: 600;
    }
    .percentDiv{
      margin: 20px 0;
      position: relative;
      background: rgba($color-main, .2);
      border-radius: 20px;
      height: 28px;
      color: #FFF;
      font-size: 20px;
      overflow: hidden;
      .bgRate{
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        height: 100%;
        width: 50%;
        background:rgba($color-main, 1);
        border-radius: 20px;
        z-index: 0;
      }
      .able{
        position: relative;
        z-index: 1;
        color: #333;
      }
    }
  }
  .checkboxes{
    margin: 30px 60px 20px;
    .check{
      flex: 1;
      &.act{
        font-weight: 600;
        .box{
          border: 0px;
          .checkedImg{
            opacity: 1;
          }
        }
      }
      .box{
        width: 45px;
        margin-right: 12px;
        border: 1px solid rgba(#aaa, .3);
        border-radius: 30px;
        box-sizing: border-box;
        img{
          width: 100%;
          display: block;
        }
        .checkedImg{
          opacity: 0;
        }
      }
    }
  }
  .buy{
    text-align: left;
    .iptDiv{
      margin: 18px 0;
      height: 70px;
      border: 1px solid rgba(#aaa, .2);
      border-radius: 8px;
      padding: 0 18px;
      .ipt{
        height: 70px;
        padding: 0 0 0 16px;
        flex: 1;
        :deep(.van-field__body),
        :deep(.van-field__control){
          height: 100%;
          text-align: right;
          font-size: 32px;
        }
      }
      .iptLabal{
        font-size: 24px;
        // color: #333;
      }
    }
    .abt{
      text-align: right;
      color: #333;
    }
    .pos{
      position: relative;
    }
    .btn{
      color: #FFF;
      background: $color-main;
      border-radius: 12px;
      height: 80px;
      margin-top: 40px;
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 10px;
      &.sell{
        background: $color-red;
      }
    }
    .tip{
      color: #999;
      font-size: 20px;
      margin-top: 30px;
    }
  }
}
</style>