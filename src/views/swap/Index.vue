<template>
  <div class="swap">
    <div class="box">
      <Tabs />
      <SwapInfo @listenTradeInfo="handleTradeInfo"/>
    </div>
    <TradeInfo ref="tradeInfo" />
  </div>
</template>

<script>
import Tabs from '../index/components/Tabs';
import SwapInfo from '@/views/swap/comp/SwapInfo';
import TradeInfo from './comp/TradeInfo'

export default {
  name: 'newSwap',
  components: {
    Tabs,
    SwapInfo,
    TradeInfo,
  },
  data() {
    return {
      activeNames: ''
    }
  },
  mounted() {
  },
  methods: {
    handleTradeInfo(info) {
      if (!this.$refs.tradeInfo) {
        setTimeout(() => {
          this.handleTradeInfo(info)
        }, 50);
        return
      }
      this.$refs.tradeInfo.handleSetInfo(info)
    }
  }
}
</script>

<style lang="scss" scoped>
.swap{
  margin: 30px 30px 20px;
  .box{
    box-shadow: 2px 2px 6px 4px rgba(243,243,243,1);
    border-radius: 20px;
    background: #FFF;
    position: relative;
    z-index: 2;
  }
}
</style>
