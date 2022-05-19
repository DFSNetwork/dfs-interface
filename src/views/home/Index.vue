<template>
  <div class="home">
    <Banner />
    <Notice />
    <Tools />
    <MyFooter />
    <!-- <DfsInfo /> -->
    <Rank />
    <!-- <DfsCoin /> -->
    <div class="fullBtn" v-if="canFull" @click="handleFullScreen">
      <img v-if="fullScreen" src="https://leafy-kataifi-c6d825.netlify.app/icon/min.png">
      <img v-else src="https://leafy-kataifi-c6d825.netlify.app/icon/full.png">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
// import { DApp } from '@/utils/wallet';

import Banner from '@/views/home/comp/Banner';
import Notice from '@/views/home/comp/Notice';
import Tools from '@/views/home/comp/Tools';
import Rank from '@/views/home/comp/Rank';
import MyFooter from '@/components/Footer';
// import DfsCoin from '@/views/home/comp/DfsCoin'
// import DfsInfo from '@/views/home/comp/DfsInfo';

import { dealAreaArr } from '@/views/pddex/comp/appLogic';
import { walletConnected, fullScreen } from '@/utils/wallet/fullScreen';
export default {
  name: 'home',
  components: {
    Banner,
    Notice,
    Tools,
    Rank,
    MyFooter,
    // DfsCoin,
    // DfsInfo,
  },
  data() {
    return {
      allMarket: {},
      canFull: false,
      fullScreen: parseInt(localStorage.getItem('setFullScreen') || 0),
    }
  },
  mounted() {
    this.handleGetMarkets()
    // this.handleGetPddexMarketList();
    this.canFull = walletConnected()
  },
  computed: {
    ...mapState({
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
      coinPrices: state => state.sys.coinPrices,
      iArr: state => state.config.iArr, // 生产环境
    })
  },
  methods: {
    handleFullScreen() {
      this.fullScreen = (this.fullScreen + 1) % 2;
      fullScreen(this.fullScreen)
      localStorage.setItem('setFullScreen', this.fullScreen)
    },
    // 获取行情数据
    async handleGetMarkets() {
      const {status, result} = await this.$api.getPddexMarkets()
      if (!status) {
        return
      }
      const keys = Object.keys(result);
      const lists = {}
      keys.forEach(key => {
        let coin = key.split('_markets')[0].toUpperCase()
        if (coin === 'BTC' || coin.toLowerCase() === 'display_limit') {
          return
        }
        coin = coin === 'BTC' ? coin = 'PBTC' : coin;
        const arr = dealAreaArr(result[key] || [], coin)
        lists[coin] = arr;
      })
      this.allMarket = lists;
      this.handleDealAllMarket()
    },
    // 处理 allMarket 对应pid
    handleDealAllMarket() {
      const keys = Object.keys(this.allMarket) || []
      if (!keys.length) {
        return
      }
      let allMarket = []
      this.iArr.forEach(key => {
        allMarket.push(...this.allMarket[key])
      })
      this.$store.dispatch('setPddexMarketLists', allMarket)
    },
  }
}
</script>

<style lang="scss" scoped>
.home{
  // background: linear-gradient(to bottom, #FFF, #FFF 180px , #F9F9F9);
  background: #F9F9F9;
  min-height: 100vh;
  padding-bottom: 30px;
  .fullBtn{
    position: fixed;
    top: 49%;
    left: 0px;
    padding: 18px;
    background: rgba(#FFF, .8);
    border-radius: 4px;
    font-size: 20px;
    color: $color-tip;
    box-shadow: 3px 0 5px 2px rgba(#eee, .8);
    z-index: 2;
    img{
      opacity: .5;
      display: block;
      width: 40px;
      margin: auto;
    }
  }
}
</style>
