<template>
  <div>
    <transition name="fade" mode="out-in">
      <router-view class="content" @listenUpdate="handleUpdate"/>
    </transition>
    <!-- <PddexTab /> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { dealAreaArr } from '@/views/pddex/comp/appLogic';
import { getApyInfoByMid } from '@/utils/getApy'

export default {
  name: 'pddex',
  components: {
  },
  data() {
    return {
      dfsLists: [],
      allMarket: {},
    }
  },
  mounted() {
    this.handleGetMarkets()
  },
  computed: {
    ...mapState({
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
      marketLists: state => state.sys.marketLists, // 生产环境
      iArr: state => state.config.iArr, // 生产环境
    })
  },
  watch: {
    marketLists: {
      handler: function ml(newVal) {
        this.dfsLists = newVal
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleUpdate() {
      this.handleGetMarkets()
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
        arr.forEach(v => {
          const apyInfo = getApyInfoByMid(v.mid)
          v.apy = Number(apyInfo.count || 0).toFixed(2)
          v.apy_detail = apyInfo
        })
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

</style>
