<template>
  <div class="leaseCpu">
    <div class="title">{{ $t('resource.manage') }}</div>
    <div class="info">
      <div class="flexb">
        <span class="label">CPU</span>
        <span class="price">{{ $t('resource.curPrice') }} {{ nowInfo.cpuPrice }} EOS/ms/Day</span>
      </div>
      <div class="percentDiv flexc">
        <div class="bgRate" :style="`width: ${nowInfo.cpuRate}%`"></div>
        <div class="able">{{ $t('resource.abled') }} {{ nowInfo.cpuAbled }}ms / {{ nowInfo.cpuMax }}ms</div>
      </div>
      <div class="stake flexb">
        <div>
          <div class="total">{{ $t('resource.total') }}</div>
          <div>{{ nowInfo.cpuTotal }}</div>
        </div>
        <div>
          <div>{{ $t('resource.selfStaked') }} {{ nowInfo.cpuSelf }}</div>
          <div>{{ $t('resource.otherStaked') }} {{ nowInfo.cpuOther }} EOS</div>
        </div>
      </div>
    </div>
    <div class="info">
      <div class="flexb">
        <span class="label">NET</span>
        <span class="price">{{ $t('resource.curPrice') }} {{ nowInfo.netPrice }} EOS/KB/Day</span>
      </div>
      <div class="percentDiv flexc">
        <div class="bgRate" :style="`width: ${nowInfo.netRate}%`"></div>
        <div class="able">{{ $t('resource.abled') }} {{ nowInfo.netAbled }}KB / {{ nowInfo.netMax }}KB</div>
      </div>
      <div class="stake flexb">
        <div>
          <div class="total">{{ $t('resource.total') }}</div>
          <div>{{ nowInfo.netTotal }}</div>
        </div>
        <div>
          <div>{{ $t('resource.selfStaked') }} {{ nowInfo.netSelf }}</div>
          <div>{{ $t('resource.otherStaked') }} {{ nowInfo.netOther }} EOS</div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="flexb bals">
        <div>{{ $t('resource.bal') }}：{{ balEos }} EOS</div>
        <div>{{ $t('resource.abtPay') }}：{{ fee }} EOS</div>
      </div>
      <div class="iptDiv flexb">
        <div class="iptLabal">CPU</div>
        <van-field class="ipt dinBold"
          type="number"
          @input="handleIpt('cpu')"
          @blur="handleBlur('cpu')" v-model="cpu" placeholder="0.0" />
      </div>
      <div class="iptDiv flexb">
        <div class="iptLabal">NET</div>
        <van-field class="ipt dinBold"
          type="number"
          @input="handleIpt('net')"
          @blur="handleBlur('net')" v-model="net" placeholder="0.0" />
      </div>
      <div class="iptDiv flexb">
        <div class="iptLabal">{{ $t('resource.receiver') }}</div>
        <van-field class="ipt din" v-model="receiver" placeholder="" />
      </div>
      <div class="pos">
        <div class="myLoading flexc" v-if="loading"><van-loading type="spinner" color="#29D4B0"/></div>
        <div class="flexc btn sell" @click="handleLease">{{ $t('resource.lease') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DApp } from '@/utils/wallet';
export default {
  name: 'leaseCpu',
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
      cpu: '',
      net: '',
      receiver: '',
      loading: false,
      balEos: '0.0000',
      stateInfo: {},
      cpuFrac: 0,
      netFrac: 0,
      fee: '0.0000',
    }
  },
  mounted() {
    this.handleGetPowerUpState()
  },
  computed: {
    ...mapState({
      account: (state) => state.app.account,
      lang: (state) => state.app.language,
    }),
    nowInfo() {
      const res = this.resInfo || {};
      if (!res.account_name || !res.total_resources || !res.self_delegated_bandwidth) {
        return {
          cpuTotal: '0.0000 EOS', netTotal: '0.0000 EOS',
          cpuSelf: '0.0000 EOS', netSelf: '0.0000 EOS',
          cpuOther: '0.0000', netOther: '0.0000',
          cpuMax: '0', cpuAbled: '0', cpuRate: '100', cpuPrice: '0.0000',
          netMax: '0', netAbled: '0', netRate: '100', netPrice: '0.0000'
        }
      }
      const cpuTotal = res.total_resources.cpu_weight;
      const netTotal = res.total_resources.net_weight;
      const cpuSelf = res.self_delegated_bandwidth.cpu_weight;
      const netSelf = res.self_delegated_bandwidth.net_weight;
      const cpuOther = (parseFloat(cpuTotal) - parseFloat(cpuSelf)).toFixed(4)
      const netOther = (parseFloat(netTotal) - parseFloat(netSelf)).toFixed(4)

      const cpuMax = (res.cpu_limit.max / 1000).toFixed(2)
      const cpuAbled = (res.cpu_limit.available / 1000).toFixed(2)
      let cpuRate = cpuAbled / (parseFloat(cpuMax) || 1) * 100;
      if (cpuRate > 100) {
        cpuRate = 0
      }
      const netMax = (res.net_limit.max / 1024).toFixed(2)
      const netAbled = (res.net_limit.available / 1024).toFixed(2)
      let netRate = netAbled /  (parseFloat(netMax) || 1) * 100;
      if (netRate > 100) {
        netRate = 0
      }
      const cpuPrice = parseFloat(cpuMax) ? (parseFloat(cpuTotal) / parseFloat(cpuMax)).toFixed(4) : 0;
      const netPrice = parseFloat(netMax) ? (parseFloat(netTotal) / parseFloat(netMax)).toFixed(4) : 0
      return {
        cpuTotal, netTotal,
        cpuSelf, netSelf,
        cpuOther, netOther,
        cpuMax, cpuAbled, cpuRate, cpuPrice,
        netMax, netAbled, netRate, netPrice,
      }
    }
  },
  watch: {
    account: {
      handler: function at(newVal) {
        if (!newVal.name) {
          return
        }
        if (!this.receiver) {
          this.receiver = newVal.name
        }
        this.handleGetBalance()
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    async getPowerUpState() {
      const params = {
        "code":"eosio",
        "scope":"0",
        "table":"powup.state",
        "json":true,
        "limit":10,
      }
      const {status, result} = await this.$api.get_table_rows(params);
      const arr = result.rows || []
      if (!status || !arr.length) {
        return {}
      }
      return arr[0]
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
      this.balEos = bal
    },
    async handleGetPowerUpState() {
      const stateInfo = await this.getPowerUpState()
      this.stateInfo = stateInfo;
      console.log(stateInfo)
    },
    handleDealFrac(state, num) {
      const powerup_frac = Math.pow(10, 15);
      const weight = state.weight;
      const amount = parseInt((num || 0) * 10000);
      const frac = parseInt(amount * powerup_frac / weight)
      return frac
    },
    handleDealCost(state, num) {
      const amount = parseInt((num || 0) * 10000);
      let start_utilization = parseFloat(state.utilization);
      const end_utilization = parseFloat(start_utilization) + parseFloat(amount);
      let fee = 0;

      const price_integral_delta = (start, end) => {
        const coefficient = (parseFloat(state.max_price) - parseFloat(state.min_price)) / state.exponent;
        const start_u     = parseFloat(start) / state.weight;
        const end_u       = parseFloat(end) / state.weight;
        return parseFloat(state.min_price) * end_u - parseFloat(state.min_price) * start_u +
                  coefficient * Math.pow(end_u, state.exponent) - coefficient * Math.pow(start_u, state.exponent);
      };
      const price_function = (utilization) => {
        let price = parseFloat(state.min_price);
        const new_exponent = state.exponent - 1.0;
        if (new_exponent <= 0.0) {
          return parseFloat(state.max_price);
        } else {
          price += (parseFloat(state.max_price) - parseFloat(state.min_price))
                * Math.pow(parseFloat(utilization) / state.weight, new_exponent);
        }
        return price;
      };
      if (start_utilization < state.adjusted_utilization) {
        fee += price_function(state.adjusted_utilization) *
               Math.min(amount, state.adjusted_utilization - start_utilization) / state.weight;
        start_utilization = state.adjusted_utilization;
      }
      if (start_utilization < end_utilization) {
        fee += price_integral_delta(start_utilization, end_utilization);
      }
      return (Math.ceil(fee * 10000) / 10000).toFixed(4);
    },

    handleIpt(type = 'cpu') {
      const num = type === 'cpu' ? this.cpu : this.net;
      const state = this.stateInfo[type];
      const frac = this.handleDealFrac(state, num)
      type === 'cpu' ? this.cpuFrac = frac : this.netFrac = frac;

      // 计算手续费
      let feeCpu = this.handleDealCost(this.stateInfo.cpu, this.cpu || 0)
      let feeNet = this.handleDealCost(this.stateInfo.net, this.net || 0)
      this.fee = (parseFloat(feeCpu) + parseFloat(feeNet)).toFixed(4)
    },
    handleBlur(type) {
      if (type === 'cpu') {
        let num = parseFloat(this.cpu || 0)
        num ? this.cpu = num.toFixed(4) : this.cpu = ''
        return
      }
      let num = parseFloat(this.net || 0)
      num ? this.net = num.toFixed(4) : this.net = ''
    },
    handleLease() {
      if (this.loading || !Number(this.fee || 0)) {
        return
      }
      if (Number(this.fee) > Number(this.balEos)) {
        this.$toast.fail(this.$t('resource.balLow'))
        return
      }
      this.loading = true;
      const account = this.account;
      const name = account.name;
      const permission = account.permissions;
      const params = {
        actions: [{ // 买入RAM
          account: 'eosio',
          name: 'powerup',
          authorization: [{
            actor: name,
            permission,
          }],
          data: {
            payer: name,
            receiver: this.receiver,
            days: 1,
            net_frac: `${this.netFrac}`,
            cpu_frac: `${this.cpuFrac}`,
            max_payment: `${this.fee} EOS`
          },
        }]
      }
      console.log(params)
      DApp.toTransaction(params, (err) => {
        this.loading = false;
        console.log(JSON.stringify(err))
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
        this.$toast({
          type: 'success',
          message: 'Success'
        })
        setTimeout(() => {
          this.$emit('listenUpdate', true)
        }, 1500);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.leaseCpu{
  font-size: 28px;
  padding: 20px 40px 30px;
  .title{
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .info{
    margin: 20px 0;
    font-size: 26px;
    padding-bottom: 20px;
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
    .stake{
      text-align: left;
      &>div:last-child{
        text-align: right;
      }
      &>div>div{
        margin-bottom: 10px;
      }
    }
  }
  .main{
    text-align: left;
    .bals{
      font-size: 24px;
    }
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
    }
    .tip{
      color: #999;
      font-size: 20px;
      margin-top: 30px;
    }
  }
}
</style>