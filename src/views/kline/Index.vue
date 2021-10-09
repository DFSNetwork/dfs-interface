<template>
  <div class="chartDiv" >
    <!-- <div class="title">市场详情</div> -->
    <MarketInfo :checkedMarket="checkedMarket"/>
    <div class="kline">
      <div class="kTitle flexb">
        <span>{{ $t('kline.klinePrice') }}</span>
        <div class="flexa warn" @click="showWarn = true">
          <img class="warnImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/warn.png" >
          <span>{{ $t('sys.tip') }}</span>
        </div>
      </div>
      <ChardingView :checkedMarket="checkedMarket"/>
    </div>
    <TokenInfo :checkedMarket="checkedMarket"/>

    <div class="nullDiv"></div>
    <div class="btnDiv flexb">
      <div class="btn flexc" @click="handleTo('index')">{{ $t('tab.dex') }}</div>
      <div class="btn market flexc" @click="handleTo('market')">{{ $t('tab.pools') }}</div>
    </div>

    <van-popup class="popup_p" v-model="showWarn">
      <WarnCoin />
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ChardingView from './ChardingView';
import MarketInfo from './comp/MarketInfo';
// import MinerLists from './comp/MinerLists';
import TokenInfo from './comp/TokenInfo';
import WarnCoin from '@/views/kline/popup/WarnCoin'

export default {
  name: 'kLine',
  components: {
    ChardingView,
    MarketInfo,
    // MinerLists,
    TokenInfo,
    WarnCoin,
  },
  data() {
    return {
      showWarn: false,
      checkedMarket: {
        // mid: 17,
        symbol0: 'EOS',
        symbol1: 'USDT',
        imgUrl0: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/eosio.token-eos.svg',
        imgUrl1: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/tethertether-usdt.png',
      }
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.config.marketLists,
      tradeInfo: state => state.sys.tradeInfo,
      baseConfig: state => state.config.baseConfig,
    }),
  },
  watch: {
    marketLists: {
      handler: function ml() {
        this.handleGetMarket()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleTo(name) {
      const params = {
        name,
        params: {
          mid: this.checkedMarket.mid,
        }
      }
      if (name === 'index') {
        const query = {
          in: `${this.checkedMarket.contract0}-${this.checkedMarket.symbol0}`,
          out: `${this.checkedMarket.contract1}-${this.checkedMarket.symbol1}`,
        }
        params.query = query;
      }
      this.$router.push(params)
    },
    handleToTrade() {
      let symbol = 'eosio.token-eos-minedfstoken-dfs';
      const li = this.checkedMarket;
      if (li) {
        symbol = `${li.contract1}-${li.symbol1}-${li.contract0}-${li.symbol0}`
      }
      this.$router.push({
        name: 'pddexTrade',
        params: {
          symbol,
        }
      })
    },
    handleGetMarket() {
      const params = this.$route.params;
      const arr = params.symbol.split('-')
      try {
        const checkedMarket = this.marketLists.find(v => {
          return v.symbol1 === arr[1].toUpperCase() && v.symbol0 === arr[3].toUpperCase()
              && v.contract1 === arr[0] && v.contract0 === arr[2] 
        })
        // console.log(this.marketLists)
        if (checkedMarket) {
          this.checkedMarket = checkedMarket;
        }
      } catch (error) {
        return
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.chartDiv{
  color: #333;
  font-size: 28px;
  text-align: left;
  .title{
    font-size: 32px;
    text-align: center;
    padding: 26px;
    border-bottom: 10px solid #f5f5f5;
  }
  .kline{
    .kTitle{
      background: #FFF;
      color: #333;
      font-size: 30px;
      font-weight: 500;
      padding: 0 28px;
      margin-bottom: 20px;
      .warn{
        font-size: 28px;
        color: $color-main;
        .warnImg{
          display: block;
          width: 32px;
          margin-right: 14px;
        }
      }
    }
  }
  .nullDiv{
    height: 130px;
  }
  .btnDiv{
    position: fixed;
    bottom: 0px;
    padding: 12px 28px 32px;
    background: #FFF;
    width: 100%;
    box-sizing: border-box;
    max-width: 750px;
    .btn{
      flex: 1;
      height: 85px;
      border-radius: 8px;
      background: #29D4B0;
      color: #FFF;
      font-size: 34px;
      &.market{
        background: #FFF;
        color: #29D4B0;
        border: 2px solid #29D4B0;
        margin-left: 28px;
      }
    }
  }
}
</style>
