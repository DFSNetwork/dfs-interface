<template>
  <div class="lists flexa" v-loading="loading">
    <div class="coinDiv flexc">
      <img class="coin" src="https://leafy-kataifi-c6d825.netlify.app/coin/yfctokenmain-yfc.png" alt="">
    </div>
    <div class="f1">
      <div class="projectName flexb">
        <span>YFC机枪池</span>
        <span class="claim green" v-loading="claiming || allClaiming" @click.stop="handleClaim">领取</span>
      </div>
      <div class="reward">
        <span>收益：</span>
        <span>{{ showRewardAll }} YFC</span>
      </div>
      <div class="about">
        <span>≈ {{ aboutEos }} EOS</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DApp } from '@/utils/wallet';
import { toFixed, toLocalTime, getMarketTimeLp } from '@/utils/public';

export default {
  name: 'guns',
  props: {
    allClaiming: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      priceArr: ['17', '329'],
      sym: [{
        contract: 'eosio.token',
        coin: 'EOS'
      }, {
        contract: 'tethertether',
        coin: 'USDT',
      }],
      linkPrice: {},
      args: {},
      getAccData: false,
      accMineData: {},
      runTimer: null,
      priceTimer: null,
      argsTimer: null,
      rewardTimer: null,
      loading: true,
      claiming: false,

      rewardAll: '0.00000000',
      showRewardAll: '0.00000000',
      mid: 329, // dfs: 39 | DMD: 326 | YFC: 329 | DBC: 346 | LOOP: 424
      marketData: {},
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
    }),
    aboutEos() {
      const price = parseFloat(this.marketData.reserve0) / parseFloat(this.marketData.reserve1) || 0;
      const num = price * this.showRewardAll;
      return toFixed(num, 4)
    },
  },
  watch: {
    marketLists: {
      handler: function ml(newVal) {
        this.marketData = newVal.find(v => v.mid === this.mid) || {}
      },
      deep: true,
      immediate: true,
    },
    account: {
      handler: function listen(newVal) {
        if (newVal.name) {
          this.handlerGetReward();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.handlerGetLinkPrice();
    this.handleGetArgs();
  },
  beforeDestroy() {
    clearTimeout(this.runTimer)
    clearTimeout(this.priceTimer)
    clearTimeout(this.argsTimer)
    clearInterval(this.rewardTimer)
  },
  methods: {
    handleClaim() {
      if (this.allClaiming || this.claiming) {
        return
      }
      const actions = this.handleGetActions()
      if (!actions.length) {
        return
      }
      this.claiming = true;
      const params = {
        actions,
      }
      DApp.toTransaction(params, (err) => {
        this.claiming = false;
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
        setTimeout(() => {
          this.handleGetUnclaim()
        }, 1000);
      })
    },
    handleGetActions() {
      const actions = [];
      const formName = this.account.name;
      const permission = this.account.permissions;
      const keys = Object.keys(this.accMineData);
      keys.forEach(v => {
        if (!this.accMineData[v].bal || !parseFloat(this.accMineData[v].bal)) {
          return
        }
        const action = {
          account: 'yfcyfcgarden',
          name: 'claim',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
            sym: v
          }
        }
        actions.push(action)
      })
      return actions;
    },

    // 获取5分钟均价
    handlerGetLinkPrice() {
      clearTimeout(this.priceTimer)
      this.priceArr.forEach(async v => {
        const params = {
          code: 'defislinkeos',
          scope: v,
          table: 'avgprices',
          json: true,
          limit: 3,
        }
        const {status, result} = await this.$api.get_table_rows(params)
        if (!status || !result.rows.length) {
          return
        }
        const rows = result.rows.find(vv => vv.key === 300) || []
        if (v === '17') {
          this.linkPrice.eosPrice = rows.price0_avg_price / 10000;
        } else {
          this.linkPrice.yfcPrice = rows.price1_avg_price;
        }
        this.handleDealAll();
      })
      this.priceTimer = setTimeout(() => {
        this.handlerGetLinkPrice();
      }, 300000);
    },
    // 获取args 计算收益
    async handleGetArgs() {
      clearTimeout(this.argsTimer)
      const params = {
        "code": "yfcyfcgarden",
        "scope": "yfcyfcgarden",
        "table": "args",
        "json": true,
        limit: 100
      }
      const {status, result} = await this.$api.get_table_rows(params)
      if (!status || !result.rows.length) {
        return
      }
      let rows = result.rows || []
      this.args = rows[0];
      this.handleDealAll();
      this.argsTimer = setTimeout(() => {
        this.handleGetArgs()
      }, 5000);
    },
    handlerGetReward() {
      if (!this.account || !this.account.name || this.getAccData) {
        return
      }
      this.getAccData = true;
      const formName = this.account.name;
      this.sym.forEach(async v => {
        const params = {
          code: 'yfcyfcgarden',
          scope: v.coin,
          table: 'miners',
          json: true,
          limit: 1000,
          lower_bound: ` ${formName}`,
          upper_bound: ` ${formName}`,
        }
        const {status, result} = await this.$api.get_table_rows(params)
        if (!status || !result.rows.length) {
          return
        }
        const rows = result.rows[0] || {}
        if (!rows.bal) {
          return
        }
        rows.lastDate = toLocalTime(`${rows.last_drip}.000+0000`)
        this.accMineData[v.coin] = rows;
        this.handleDealAll()
      })
    },
    handleDealAll() {
      clearTimeout(this.runTimer)
      if (!this.linkPrice.eosPrice || !this.linkPrice.yfcPrice || !this.args.aprs) {
        return '0.00000000';
      }
      this.loading = false;
      const keys = Object.keys(this.accMineData);
      let all = 0;
      keys.forEach(v => {
        const t = getMarketTimeLp(this.accMineData[v].lastDate)
        let toYfcNum = parseFloat(this.accMineData[v].bal) / this.linkPrice.yfcPrice;
        if (v === 'USDT') {
          toYfcNum = toYfcNum / this.linkPrice.eosPrice;
        }
        let reward = toYfcNum * (Math.pow(this.args.aprs, t.total / 1000) - 1)
        all += reward;
      })
      const old = this.rewardAll;
      this.rewardAll = toFixed(all, 8)

      const t = (this.rewardAll - old) / 50;
      let showRewardAll = old;
      clearInterval(this.rewardTimer)
      this.rewardTimer = setInterval(() => {
        if (Number(showRewardAll) < 0) {
          this.showRewardAll = '0.00000000';
          return;
        }
        showRewardAll = Number(showRewardAll) + t;
        if (showRewardAll > this.rewardAll) {
          clearInterval(this.rewardTimer)
          return;
        }
        this.showRewardAll = toFixed(showRewardAll, 8)
      }, 20);

      this.runTimer = setTimeout(() => {
        this.handleDealAll()
      }, 1000);
    },
  },
}
</script>

<style lang="scss" scoped>
@import './comp.scss';
</style>
