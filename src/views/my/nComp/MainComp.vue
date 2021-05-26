<template>
  <div class="mainComp">
    <div class="totalCount">
      <AccInfo :act="act" @listenAct="handlAct"/>
    </div>

    <div class="subView">
      <Assets v-if="act === 0" :allBals="allBals" :allCountCNY="allCountCNY" :allCount="allCount"/>
      <Markets v-else-if="act === 1" :liqs="liqs" :allBals="allBals"/>
      <More v-else />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { sellToken } from '@/utils/logic';
import { getCoin } from '@/utils/public';
import AccInfo from '@/views/my/nComp/AccInfo';
import Assets from '@/views/my/nComp/Assets';
import Markets from '@/views/my/nComp/Markets';
import More from '@/views/my/nComp/More'
export default {
  name: 'mainComp',
  components: {
    AccInfo,
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
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
      mkFilterConf: state => state.config.mkFilterConf,
      coinPrices: state => state.sys.coinPrices,
    }),
    allCount() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.countUsdt || 0)
      })
      return count.toFixed(4)
    },
    allCountCNY() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.countCNY || 0)
      })
      return count.toFixed(4)
    }
  },
  watch: {
    account: {
      handler: function at() {
        this.handleGetAllAssets()
        this.handleGetMarkets()

        this.handleGetDss()
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
    handlAct(act) {
      this.act = act;
    },
    // 获取账户余额
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
      this.handleDealBals()
    },
    // 获取做市流动池
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
      this.liqs = rows;
      this.handleDealLiqs()
    },
    // 做市流动性处理
    handleDealLiqs() {
      if (!this.marketLists.length) {
        return
      }
      const rows = this.liqs;
      const mkBals = [];
      rows.forEach(v => {
        const market = this.marketLists.find(vv => vv.mid === v.mid);
        if (!market) {
          return
        }
        market.token = v.token;
        const nowMarket = this.handleGetNowMarket(market)
        this.$set(v, 'nowMarket0', nowMarket.getNum1)
        this.$set(v, 'nowMarket1', nowMarket.getNum2)

        const balArr = this.handleDealMksBals(market, v);
        balArr.forEach(mv => {
          const index = mkBals.findIndex(vv => vv.contract === mv.contract && vv.symbol === mv.symbol)
          if (index === -1) {
            mkBals.push(mv);
          } else {
            const has = mkBals[index];
            const bal = parseFloat(has.bal || 0) + parseFloat(mv.bal || 0)
            mkBals[index].bal = parseFloat(bal || 0).toFixed(mv.decimal);
          }
        })
      });
      this.markets = rows;
      this.marketBals = mkBals;
      // console.log(this.marketBals)
      this.handleDealBals()
    },
    // 获取用户做市余额
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
    // 获取DFS DSS余额
    async handleGetDss() {
      const name = this.account.name;
      if (!name) {
        return
      }
      const params = {
        "code": "dfsdsrsystem",
        "scope": "dfsdsrsystem",
        "table": "holders",
        "lower_bound": ` ${name}`,
        "upper_bound": ` ${name}`,
        "json": true,
      }
      const { status, result } = await this.$api.get_table_rows(params);
      console.log(result)
      if (!status || !result.rows.length) {
        return
      }
    },
    // 获取TAG DSS余额
    // 获取YFC DSS余额
    // 做市 & 余额整合
    handleDealBals() {
      if (!this.bals.length && !this.marketBals.length) {
        return
      }
      const arr = [];
      this.bals.forEach(v => {
        const has = this.marketLists.find(vv => {
          return (v.contract === vv.contract0 && v.currency === vv.symbol0)
              || (v.contract === vv.contract1 && v.currency === vv.symbol1)
        })
        if (!has) {
          return
        }
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
      this.allBals = this.handleGetTokenAmt(arr);
    },
    // 获取币种对USDT的估值
    handleGetTokenAmt(allBals) {
      allBals.forEach(token => {
        const count = parseFloat(token.amount || 0) + parseFloat(token.bal || 0);
        this.$set(token, 'count', parseFloat(count).toFixed(4))
        // 获取EOS的价格
        const EosPrice = this.coinPrices.find(v => 'EOS' === v.coin) || {}
        const eosPriceU = EosPrice.price || 0;
        // 计价币种价格计算
        const isBaseCoin = this.coinPrices.find(v => v.contract === token.contract && token.symbol === v.coin)
        if (isBaseCoin) {
          const tokenCount = parseFloat(token.amount || 0) + parseFloat(token.bal || 0); // 总余额
          const uPrice = isBaseCoin.price || 0; // 对USDT价格
          const amtUsdt = parseFloat(token.amount || 0) * uPrice; // 余额估值 USDT
          this.$set(token, 'amtUsdt', parseFloat(amtUsdt).toFixed(4))
          const balUsdt = parseFloat(token.bal || 0) * uPrice; // 做市余额估值 USN
          this.$set(token, 'balUsdt', parseFloat(balUsdt).toFixed(4))
          const countUsdt = uPrice * tokenCount;
          this.$set(token, 'countUsdt', parseFloat(countUsdt).toFixed(4))

          const price = isBaseCoin.CNY || 0; // 对CNY价格
          const amtCNY = parseFloat(token.amount || 0) * price;
          this.$set(token, 'amtCNY', parseFloat(amtCNY).toFixed(2))
          const balCNY = parseFloat(token.bal || 0) * price;
          this.$set(token, 'balCNY', parseFloat(balCNY).toFixed(2))
          const countCNY = price * tokenCount;
          this.$set(token, 'countCNY', parseFloat(countCNY).toFixed(2))

          const priceEos = (isBaseCoin.price || 0) / (eosPriceU); // 对EOS价格
          const amtEos = parseFloat(token.amount || 0) * priceEos;
          this.$set(token, 'amtEos', parseFloat(amtEos).toFixed(4))
          const balEos = parseFloat(token.bal || 0) * priceEos;
          this.$set(token, 'balEos', parseFloat(balEos).toFixed(4))
          const countEos = priceEos * tokenCount;
          this.$set(token, 'countEos', parseFloat(countEos).toFixed(4))
          return
        }
        // 非计价币种价格计算
        let fltArrToken = this.marketLists.filter(v => {
          const hasToken = (v.contract0 === token.contract && v.symbol0 === token.symbol)
            || (v.contract1 === token.contract && v.symbol1 === token.symbol)
          const hasPrice = this.coinPrices.find(vv => 
            (v.contract0 === vv.contract && v.symbol0 === vv.coin)
            || (v.contract1 === vv.contract && v.symbol1 === token.coin))
          return hasToken && hasPrice
        })
        if (!fltArrToken.length) {
          return
        }
        fltArrToken.sort((a, b) => {
          const isA = a.contract0 === token.contract && a.symbol0 === token.symbol;
          let aR = isA ? parseFloat(a.reserve0) : parseFloat(a.reserve1);
          const isB = b.contract0 === token.contract && b.symbol0 === token.symbol;
          let bR = isB ? parseFloat(b.reserve0) : parseFloat(b.reserve1);
          return bR - aR;
        })
        const pMarket = fltArrToken[0];
        const isA = token.contract === pMarket.contract0 && token.symbol === pMarket.symbol0;
        const tokenA = isA ? pMarket.reserve0 : pMarket.reserve1;
        const tokenB = isA ? pMarket.reserve1 : pMarket.reserve0;
        const price = parseFloat(tokenB) / parseFloat(tokenA)
        const tokenBPrice = this.coinPrices.find(v => 
          isA ? v.contract === pMarket.contract1 && pMarket.symbol1 === v.coin
              : v.contract === pMarket.contract0 && pMarket.symbol0 === v.coin
        )
        if (!tokenBPrice) {
          return
        }
        const tbUprice = tokenBPrice.price || 0;
        const tbCNYprice = tokenBPrice.CNY || 0;

        const tokenCount = parseFloat(token.amount || 0) + parseFloat(token.bal || 0); // 总余额
        const uPrice = tbUprice * (price || 0); // 对USDT价格
        const amtUsdt = parseFloat(token.amount || 0) * uPrice; // 余额估值 USDT
        this.$set(token, 'amtUsdt', parseFloat(amtUsdt).toFixed(4))
        const balUsdt = parseFloat(token.bal || 0) * uPrice; // 做市余额估值 USN
        this.$set(token, 'balUsdt', parseFloat(balUsdt).toFixed(4))
        const countUsdt = uPrice * tokenCount;
        this.$set(token, 'countUsdt', parseFloat(countUsdt).toFixed(4))

        const cnyPrice = tbCNYprice * (price || 0); // 对CNY价格
        const amtCNY = parseFloat(token.amount || 0) * cnyPrice;
        this.$set(token, 'amtCNY', parseFloat(amtCNY).toFixed(2))
        const balCNY = parseFloat(token.bal || 0) * cnyPrice;
        this.$set(token, 'balCNY', parseFloat(balCNY).toFixed(2))
        const countCNY = cnyPrice * tokenCount;
        this.$set(token, 'countCNY', parseFloat(countCNY).toFixed(2))

        const eosPrice = tbUprice * (price || 0) / (eosPriceU); // 对USDT价格
        const amtEos = parseFloat(token.amount || 0) * eosPrice; // 余额估值 USDT
        this.$set(token, 'amtEos', parseFloat(amtEos).toFixed(4))
        const balEos = parseFloat(token.bal || 0) * eosPrice; // 做市余额估值 USN
        this.$set(token, 'balEos', parseFloat(balEos).toFixed(4))
        const countEos = eosPrice * tokenCount;
        this.$set(token, 'countEos', parseFloat(countEos).toFixed(4))
      })
      const sortArr = allBals.sort((a, b) => {
        return parseFloat(b.countCNY || 0) - parseFloat(a.countCNY || 0)
      })
      return sortArr;
    }
  }
}
</script>

<style lang="scss" scoped>
.totalCount{
  color: #FFF;
  height: 420px;
  // background: linear-gradient(to right bottom, #49D7C4, #28C5A3);
  font-size: 28px;
  // padding: 38px 30px;
  text-align: left;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  .amtTitle{
    margin-bottom: 15px;
    height: 40px;
  }
  .number{
    height: 60px;
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
    height: 48px;
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
  margin-top: -110px;
  position: relative;
  box-shadow: 0px 4px 8px 0px rgba(226,226,226,0.5);
  z-index: 1;
  background: #FFF;
  border-radius: 12px;
  // padding: 28px;
}
</style>
