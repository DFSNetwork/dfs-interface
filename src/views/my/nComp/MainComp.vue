<template>
  <div class="mainComp">
    <div class="totalCount">
      <div class="amtTitle flexa dinReg">
        <span>总资产 (USDT)</span>
      </div>
      <div class="din">
        <span class="amt">1.2345</span>
        <span class="small dinReg">≈ 9.91 CNY</span>
      </div>

      <div class="tools flexb">
        <span :class="{'act': act === 0}" @click="act = 0">资产管理</span>
        <span :class="{'act': act === 1}" @click="act = 1">做市管理</span>
        <span :class="{'act': act === 2}" @click="act = 2">更多服务</span>
      </div>
    </div>

    <div class="subView">
      <Assets v-if="act === 0"/>
      <Markets v-else-if="act === 1" />
      <More v-else />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { sellToken } from '@/utils/logic';
import { getCoin } from '@/utils/public';
import Assets from '@/views/my/nComp/Assets';
import Markets from '@/views/my/nComp/Markets';
import More from '@/views/my/nComp/More'
export default {
  name: 'mainComp',
  components: {
    Assets, Markets, More,
  },
  data() {
    return {
      act: 0,
      bals: [], // 账户币种余额
      liqs: [], // 做市资金 - 未处理
      markets: [], // 做市资金
      marketBals: [], // 做市对应币种余额

      allBals: [], // 全部的Bals列表
      showBals: [], // 展示的Bals列表
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
      mkFilterConf: state => state.config.mkFilterConf,
      coinPrices: state => state.sys.coinPrices,
    }),
  },
  watch: {
    account: {
      handler: function at() {
        this.handleGetAllAssets()
        this.handleGetMarkets()
      },
      immediate: true,
      deep: true,
    },
    marketLists: {
      handler: function mls(newVal) {
        if (!newVal.length) {
          return
        }
        this.handleDealLiqs()
      }
    }
  },
  methods: {
    async handleGetAllAssets() {
      const name = this.account.name;
      if (!name) {
        return
      }
      const {status, result} = await this.$api.get_acc_bals(name)
      if (!status) {
        return
      }
      const bals = result.balances || [];
      this.bals = bals;
      // console.log(this.bals)
      this.handleDealBals()
    },
    async handleGetMarkets() {
      const name = this.account.name;
      if (!name) {
        return
      }
      const params = {
        "code":"defislogsone",
        "scope": name,
        "table":"liqs2",
        "json":true,
        limit: 1000,
      }
      const {status, result} = await this.$api.get_table_rows(params)
      if (!status) {
        return
      }
      const rows = result.rows || []
      this.markets = rows;
      this.handleDealLiqs()
    },
    handleDealLiqs() {
      if (!this.marketLists.length) {
        return
      }
      const rows = this.markets;
      const mkBals = [];
      rows.forEach(v => {
        const market = this.marketLists.find(vv => vv.mid === v.mid);
        if (!market) {
          return
        }
        market.token = v.token;
        const nowMarket = this.handleGetNowMarket(market)
        v.nowMarket0 = nowMarket.getNum1;
        v.nowMarket1 = nowMarket.getNum2;

        const balArr = this.handleDealMksBals(market, v);
        balArr.forEach(mv => {
          const index = mkBals.findIndex(vv => vv.contract === mv.contract && vv.symbol === mv.symbol)
          if (index === -1) {
            mkBals.push(mv);
          } else {
            const has = mkBals[index];
            const bal = parseFloat(has.bal || 0) + parseFloat(mv.bal || 0)
            mkBals[index].bal = bal;
          }
        })
      });
      this.markets = rows;
      this.marketBals = mkBals;
      this.handleDealBals()
      // console.log(this.markets, mkBals)
    },
    handleGetNowMarket(item) {
      const inData = {
        poolSym0: item.reserve0.split(' ')[0],
        poolSym1: item.reserve1.split(' ')[0],
        poolToken: item.liquidity_token,
        sellToken: `${item.token}`
      }
      const nowMarket = sellToken(inData);
      nowMarket.getNum1 = parseFloat(nowMarket.getNum1).toFixed(4)
      nowMarket.getNum2 = parseFloat(nowMarket.getNum2).toFixed(4)
      return nowMarket;
    },
    handleDealMksBals(market, liq) {
      const sym0 = market.sym0Data;
      const sym1 = market.sym1Data;
      sym0.bal = liq.nowMarket0;
      sym1.bal = liq.nowMarket1;
      return [sym0, sym1]
    },
    // 做市 & 余额整合
    handleDealBals() {
      if (!this.bals.length && !this.marketBals.length) {
        return
      }
      const arr = [];
      this.bals.forEach(v => {
        const has = this.marketLists.find(vv => {
          return (v.contract === vv.contract0 && v.symbol === vv.symbol0)
              || (v.contract === vv.contract1 && v.symbol === vv.symbol1)
        })
        const imgUrl = getCoin(v.contract, v.currency.toLowerCase());
        v.imgUrl = imgUrl;
        v.symbol = v.currency;
        arr.push(v)
      })
      this.marketBals.forEach(v => {
        const index = arr.findIndex(vv => vv.contract === v.contract && vv.symbol === v.symbol);
        if (index === -1) {
          arr.push(v)
          return
        }
        arr[index].bal = v.bal;
      })
      this.allBals = arr;
      this.handleGetTokenAmt()
    },
    // 获取币种对USDT的估值
    handleGetTokenAmt() {
      this.allBals.forEach(token => {
        let fltArrToken = this.marketLists.filter(v => {
          return (v.contract0 === token.contract && v.symbol0 === token.symbol)
              || (v.contract1 === token.contract && v.symbol1 === token.symbol)
        })
        fltArrToken = fltArrToken.filter(v => parseFloat(v.reserve0))
        let pArr = [];
        // this.mkFilterConf.forEach(v => {
        //   const arr = fltArrToken.filter(vv => {
        //     return (vv.contract0 === v.contract && vv.symbol0 === v.symbol)
        //         || (vv.contract1 === v.contract && vv.symbol1 === v.symbol)
        //   })
        //   pArr.push(...arr)
        // })

        const arr = fltArrToken.filter(v => {
          return ('tethertether' === v.contract0 && 'USDT' === v.symbol0)
              || ('tethertether' === v.contract1 && 'USDT' === v.symbol1)
        })
        pArr.push(...arr)
        if (!pArr.length) {
          return
        }
        const pMarket = pArr[0];
        const tokenA = token.contract === pMarket.contract0 ? pMarket.reserve0 : pMarket.reserve1;
        const tokenB = token.contract === pMarket.contract0 ? pMarket.reserve1 : pMarket.reserve0;
        const price = parseFloat(tokenB) / parseFloat(tokenA)
        this.$set(token, 'price', price)
      })
      console.log(this.allBals)
    }
  }
}
</script>

<style lang="scss" scoped>
.totalCount{
  color: #FFF;
  height: 420px;
  background: linear-gradient(right bottom, #49D7C4, #28C5A3);
  font-size: 28px;
  padding: 38px 30px;
  text-align: left;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  .amtTitle{
    margin-bottom: 15px;
  }
  .amt{
    font-size: 48px;
  }
  .small{
    margin-left: 15px;
    font-size: 24px;
  }
  .tools{
    margin-top: 20px;
    font-size: 32px;
    color: rgba(#FFF, .8);
    position: relative;
    &>span{
      position: relative;
    }
    .act{
      color: #FFF;
      font-weight: 500;

      &::after{
        content: '';
        position: absolute;
        left: 50%;
        bottom: -50px;
        width: 20px;
        height: 20px;
        background: #FFF;
        transform: translate(-50%, 0) rotate(-45deg);
      }
    }
  }
}
.subView{
  margin: 30px;
  margin-top: -165px;
  position: relative;
  box-shadow: 0px 4px 8px 0px rgba(226,226,226,0.5);
  z-index: 1;
  background: #FFF;
  border-radius: 12px;
  // padding: 28px;
}
</style>
