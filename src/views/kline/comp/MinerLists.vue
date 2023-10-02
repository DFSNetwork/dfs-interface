<template>
  <div class="minerLists">
    <div class="title flexb">
      <span class="num">{{ $t('kline.countMks') }}: {{ allListsLen }}</span>
      <span class="flexa">
        <span>{{ $t('kline.rdTips') }}</span>
        <img class="tipImg" src="https://resource1.dfs.land/icon/tips_icon_btn.svg">
      </span>
    </div>
    <div class="lists">
      <div class="list" v-for="(v, i) in showLists" :key="i">
        <div class="flexb mb12">
          <span class="acc">{{ v.miner }}</span>
          <span class="reward dinReg">{{ $t('mine.earnings') }}：{{ v.showReward || '0.0000' }} DFS</span>
        </div>
        <div class="flexb pools">
          <span>{{ $t('dex.pools') }}</span>
          <span class="dinReg">{{ v.liq1 }} {{ v.symbol1 }} / {{ v.liq0 }} {{ v.symbol0 }}</span>
        </div>
      </div>

      <van-pagination
        class="page"
        v-if="showPage"
        v-model="currentPage"
        :total-items="allListsLen"
        :items-per-page="20"
        :show-page-size="4"
        :force-ellipses="true"
        :prev-text="''"
        :next-text="''"
        @change="handlePage"
      />
    </div>
  </div>
</template>

<script>
// import { dealRewardV3 } from '@/utils/logic';
import { dealMinerData } from '@/utils/public';
import { sellToken } from '@/utils/logic';

import { getReward } from '@/views/dfsMine/dfsMine'

export default {
  props: {
    checkedMarket: {
      type: Object,
      default: function cmt() {
        return {}
      }
    }
  },
  data() {
    return {
      showPage: true,
      currentPage: 1,
      allLists: [],
      showLists: [],
      timerSec: null,
      timerRun: null,
      swapBal: {},
      allBal: {},
    }
  },
  mounted() {
    this.handleGetBalPools('dfs')
    this.handleGetBalPools('eos')
    this.handleGetBalPools('usdt')
    this.handleGetBal('dfs')
    this.handleGetBal('eos')
    this.handleGetBal('usdt')
  },
  beforeDestroy() {
    clearTimeout(this.timerSec)
    clearInterval(this.timerRun)
  },
  computed: {
    allListsLen() {
      return this.allLists.length
    }
  },
  watch: {
    checkedMarket: {
      handler: function cmt() {
        this.handleGetMiners()
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    async handleGetBalPools(type = "total") {
      const params = {
        code: 'minedfstoken',
        symbol: 'DFS',
        decimal: 4,
      }
      if (type === 'dfs') {
        params.account = 'dfspool11111'
      } else if (type === 'eos') {
        params.account = 'dfspool22222'
      } else if (type === 'usdt') {
        params.account = 'dfspool33333'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      if (type === 'dfs') {
        this.allBal.dfsPoolsBal = parseFloat(bal) + ''
      } else if (type === 'eos') {
        this.allBal.eosPoolsBal = parseFloat(bal) + ''
      } else if (type === 'usdt') {
        this.allBal.usdtPoolsBal = parseFloat(bal) + ''
      }
    },
    // 获取swap做市余额
    async handleGetBal(type = "dfs") {
      const params = {
        code: 'minedfstoken',
        symbol: 'DFS',
        decimal: 4,
        account: 'defisswapcnt'
      }
      if (type === 'eos') {
        params.code = 'eosio.token'
        params.symbol = 'EOS'
      } else if (type === 'usdt') {
        params.code = 'tethertether'
        params.symbol = 'USDT'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      if (type === 'dfs') {
        this.$set(this.swapBal, 'dfsSwapBal', parseFloat(bal) + '')
      } else if (type === 'eos') {
        this.$set(this.swapBal, 'eosSwapBal', parseFloat(bal) + '')
      } else if (type === 'usdt') {
        this.$set(this.swapBal, 'usdtSwapBal', parseFloat(bal) + '')
      }
    },
    async handleGetMiners() {
      if (!this.checkedMarket.mid) {
        return
      }
      let more = true;
      let next = '';
      let rows = [];
      while (more) {
        const params = {
          "code": "miningpool11",
          "scope": this.checkedMarket.mid,
          "table": "miners2",
          limit: 100,
          "json": true,
          lower_bound: next,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        if (!status) {
          more = false;
          continue
        }
        more = result.more;
        next = result.next_key;
        const rows1 = result.rows || [];
        rows.push(...rows1)
      }
      let newArr = []
      const item = this.checkedMarket
      rows.forEach(v => {
        const inData = {
          poolSym0: item.reserve0.split(' ')[0],
          poolSym1: item.reserve1.split(' ')[0],
          poolToken: item.liquidity_token,
          sellToken: `${v.token}`
        }
        const nowMarket = sellToken(inData);
        let liq0 = parseFloat(nowMarket.getNum1).toFixed(item.decimal0);
        let liq1 = parseFloat(nowMarket.getNum2).toFixed(item.decimal1);
        let symbol0 = item.symbol0;
        let symbol1 = item.symbol1;
        v.symbol0 = symbol0;
        v.symbol1 = symbol1;
        v.liq0 = liq0;
        v.liq1 = liq1;
        newArr.push(v)
      });
      newArr.sort((a, b) => {
        return parseFloat(b.liq0) - parseFloat(a.liq0)
      })
      this.allLists = newArr;
      this.handlePage();
    },
    handlePage() {
      const start = (this.currentPage - 1) * 20;
      const end = (this.currentPage) * 20;
      this.showLists = this.allLists.slice(start, end);
      this.handleGetReward()
    },
    handleGetReward() {
      clearTimeout(this.timerSec)
      this.timerSec = setTimeout(() => {
        this.handleGetReward()
      }, 1000);
      this.showLists.forEach(v => {
        dealMinerData(v)
        // const reward = dealRewardV3(v, this.checkedMarket.mid)
        // this.$set(v, 'reward', reward)

        if (!v.token) {
          return
        }
        const market = this.checkedMarket;
        let reward = 0
        if (market.contract0 === 'tethertether' || market.contract1 === 'tethertether') {
          const num = market.contract0 === 'tethertether' ? parseFloat(v.liq0) : parseFloat(v.liq1) 
          const reward0 = getReward({
            poolBal: this.allBal.usdtPoolsBal,
            swapBal: this.swapBal.usdtSwapBal
          }, {
            lastTime: v.lastTime,
            num
          })
          reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
        }
        if (market.contract0 === 'eosio.token' || market.contract1 === 'eosio.token') {
          const num = market.contract0 === 'eosio.token' ? parseFloat(v.liq0) : parseFloat(v.liq1) 
          const reward0 = getReward({
            poolBal: this.allBal.eosPoolsBal,
            swapBal: this.swapBal.eosSwapBal
          }, {
            lastTime: v.lastTime,
            num
          })
          reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
        }
        if (market.contract0 === 'minedfstoken' || market.contract1 === 'minedfstoken') {
          const num = market.contract0 === 'minedfstoken' ? parseFloat(v.liq0) : parseFloat(v.liq1) 
          const reward0 = getReward({
            poolBal: this.allBal.dfsPoolsBal,
            swapBal: this.swapBal.dfsSwapBal
          }, {
            lastTime: v.lastTime,
            num
          })
          reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
        }
        this.$set(v, 'reward', reward)
      })
      this.handleRun()
    },
    handleRun() {
      clearInterval(this.timerRun)
      this.timerRun = setInterval(() => {
        this.showLists.forEach(v => {
          const reward = v.reward;
          let showReward = v.showReward || reward;
          let tReward = v.tReward || showReward;
          const t = (reward - showReward) / 20;

          tReward = Number(tReward) + Number(t);
          showReward = tReward.toFixed(8)
          this.$set(v, 'showReward', showReward)
          this.$set(v, 'tReward', tReward)
        })
      }, 50);
    }
  }
}
</script>

<style lang="scss" scoped>
.minerLists{
  color: #333;
  .title{
    font-size: 28px;
    padding: 10px 28px;
    .tipImg{
      width: 30px;
      margin-left: 9px;
    }
  }
}
.lists{
  padding: 28px;
  font-size: 24px;
  .list{
    border: 1px solid #EAEAEA;
    border-radius: 12px;
    padding: 18px 26px;
    box-sizing: border-box;
    margin-bottom: 20px;
    .acc{
      font-size: 28px;
    }
    .mb12{
      margin-bottom: 12px;
    }
  }
}
.page{
  :deep( .van-pagination__item){
    color: #333;
    &::after{
      border: 0px;
    }
    &:active{
      color: #fff;
      background: #29D4B0;
    }
  }
  :deep( .van-pagination__item--active){
    color: #fff;
    background: #29D4B0;
  }
}
</style>
