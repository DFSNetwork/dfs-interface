<template>
  <div>
    <div class="list" v-for="(v, i) in pools" :key="i" @click="handleToDetail(v)">
      <div class="info flexb">
        <div class="token flexa">
          <img class="coinImg" :src="v.imgUrl1">
          <div>
            <div class="dinReg">{{ v.symbol0 }}/{{ v.symbol1 }}</div>
            <div class="din num">{{ v.showReward || '0.00000000' }}</div>
          </div>
        </div>
        <div class="apy din">APY: {{ dfsApy }}%</div>
      </div>
      <!-- <div class="liqs tip">资金池：{{ v.symbol0 }} / 3460994.26 {{ v.symbol1 }}</div> -->
      <div class="liqs flexa tip">
        <div>{{ $t('dex.pools') }}：</div>
        <div>{{ parseInt(v.reserve1) }} {{ v.symbol1 }} / {{ parseInt(v.reserve0) }} {{ v.symbol0 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

import { sellToken } from '@/utils/logic';
import { toLocalTime, toFixed } from '@/utils/public';
export default {
  name: 'dfsPools',
  data() {
    return {
      swapBal: '0.0000',
      poolsBal: '0.0000',
      pools: [{
        mid: 602,
      }, {
        mid: 665,
      }],
      accLiqs: [],
      listsTimer: null,
      runTimer: null,
    }
  },
  mounted() {
    this.handleGetBal()
    this.handleGetBalPools()
  },
  beforeDestroy() {
    clearTimeout(this.listsTimer)
    clearInterval(this.runTimer)
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
    }),
    dfsApy() {
      const num = 0.1;
      const rate = num / this.swapBal;
      const lpBal = this.poolsBal;
      const t = 86400 * 365;
      const weight = 1
      const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
      const apy = reward / num * 100
      return parseFloat(apy || 0).toFixed(2)
    },
  },
  watch: {
    marketLists: {
      handler: function mls(newVal) {
        if (!newVal.length) {
          return
        }
        this.handleGetMarkets()
      },
      deep: true,
      immediate: true
    },
    account: {
      handler: function at(newVal) {
        if (newVal.name) {
          this.handleGetLiqs()
        }
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    handleToDetail(item) {
      this.$router.push({
        name: 'dfsMinePool',
        params: {
          mid: item.mid
        }
      })
    },
    // 获取swap做市余额
    async handleGetBal() {
      const params = {
        code: 'tagtokenmain',
        symbol: 'TAG',
        decimal: 8,
        account: 'defisswapcnt'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      this.swapBal = parseFloat(bal);
    },
    // 获得待分发池子余额
    async handleGetBalPools() {
      const params = {
        code: 'tagtokenmain',
        symbol: 'TAG',
        decimal: 8,
        account: 'tageosmining'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      this.poolsBal = parseFloat(bal) + ''
    },
    // 获得交易对信息
    handleGetMarkets() {
      if (!this.marketLists.length) {
        return
      }
      this.pools.forEach(v => {
        const market = this.marketLists.find(vv => vv.mid === v.mid) || {};
        this.$set(v, 'reserve0', market.reserve0)
        this.$set(v, 'reserve1', market.reserve1)
        this.$set(v, 'liquidity_token', market.liquidity_token)
        this.$set(v, 'imgUrl0', market.imgUrl0)
        this.$set(v, 'imgUrl1', market.imgUrl1)
        this.$set(v, 'symbol0', market.symbol0)
        this.$set(v, 'symbol1', market.symbol1)
        this.$set(v, 'decimal0', market.decimal0)
        this.$set(v, 'decimal1', market.decimal1)
        this.$set(v, 'contract0', market.contract0)
        this.$set(v, 'contract1', market.contract1)
      })
      this.handleRunRewardTimer()
    },

    // 获取用户做市信息
    async handleGetLiqs() {
      const name = this.account.name;
      const params = {
        "code":"defislogsone",
        "scope": ` ${name}`,
        "table":"liqs2",
        "json":true,
        limit: 1000,
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const list = result.rows || [];
      this.accLiqs = list;
      // console.log('this.accLiqs', this.accLiqs)
      this.handleDealReward()
    },
    handleDealReward() {
      if (!this.accLiqs.length || !this.pools.length) {
        return
      }
      this.pools.forEach(async v => {
        const hasLiq = this.accLiqs.find(vv => vv.mid === v.mid);
        if (!hasLiq) {
          return
        }
        const name = this.account.name;
        // 获取DFS
        const params = {
          code: 'miningpool11',
          scope: v.mid,
          table: 'miners2',
          lower_bound: ` ${name}`,
          upper_bound: ` ${name}`,
          json: true,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        if (!status || !result.rows.length) {
          return
        }
        const row = result.rows[0];
        const item = this.pools.find(vv => vv.mid === v.mid) || {}
        const inData = {
          poolSym0: parseFloat(item.reserve0 || 0),
          poolSym1: parseFloat(item.reserve1 || 0),
          poolToken: item.liquidity_token || 0,
          sellToken: `${row.token}`
        }
        const nowMarket = sellToken(inData);
        row.liq_bal0 = `${parseFloat(nowMarket.getNum1).toFixed(item.decimal0)} ${item.symbol0}`
        row.liq_bal1 = `${parseFloat(nowMarket.getNum2).toFixed(item.decimal1)} ${item.symbol1}`
        let lastTime = toLocalTime(`${row.last_drip}.000+0000`);
        row.lastTime = moment(lastTime).valueOf();
        this.$set(v, 'minnerData', row)
      })
      this.handleRunRewardTimer()
    },

    handleGetReward(accData) {
      const num = accData.num;
      const rate = num / this.swapBal;
      const lpBal = this.poolsBal;
      const lastTime = accData.lastTime;
      const nowTime = moment().valueOf()
      const t = (nowTime - lastTime) / 1000;
      const weight = 1
      const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
      return reward
    },
    handleRunRewardTimer() {
      clearTimeout(this.listsTimer)
      this.listsTimer = setTimeout(() => {
        this.handleRunRewardTimer()
      }, 1000);
      this.pools.forEach(v => {
        if (!v.minnerData || !v.minnerData.token) {
          return
        }
        let reward = 0
        const num = v.contract0 === 'minedfstoken' ? parseFloat(v.minnerData.liq_bal0) : parseFloat(v.minnerData.liq_bal1) 
        const reward0 = this.handleGetReward({
          lastTime: v.minnerData.lastTime,
          num
        })
        reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
        this.$set(v, 'reward', reward)
      })
      this.handleRun()
    },
    handleRun() {
      clearInterval(this.runTimer)
      this.runTimer = setInterval(() => {
        let total = 0;
        this.pools.forEach(v => {
          if (!v.minnerData || !v.minnerData.token || !parseFloat(v.reward)) {
            return
          }
          const reward = v.reward;
          let showReward = v.showReward || reward;
          let tReward = v.tReward || showReward;
          const t = (reward - showReward) / 20;

          tReward = Number(tReward) + Number(t);
          showReward = toFixed(tReward, 8)
          this.$set(v, 'showReward', showReward)
          this.$set(v, 'tReward', tReward)
          total = parseFloat(total || 0) + parseFloat(showReward || 0)
          this.$emit('totalClaim', total)
        })
      }, 50);
    },
  }
}
</script>

<style lang="scss" scoped>
.list{
  padding: 26px 36px;
  box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
  border-radius: 20px;
  text-align: left;
  font-size: 32px;
  margin-bottom: 30px;
  .coinImg{
    width: 80px;
    margin-right: 20px;
  }
  .num{
    font-size: 44px;
  }
  .apy{
    color: $color-main;
    font-size: 32px;
  }
  .liqs{
    font-size: 26px;
    margin-top: 15px;
  }
}
</style>
