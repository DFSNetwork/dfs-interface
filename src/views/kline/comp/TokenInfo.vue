<template>
  <div class="tokenInfo">
    <div class="navTabs flexa">
      <van-tabs color="#29D4B0"
        v-model="area"
        title-active-color="#333"
        title-inactive-color="#999">
        <van-tab :title="$t('kline.mksInfo')"></van-tab>
        <van-tab :title="$t('kline.swapLaster')"></van-tab>
        <van-tab :title="$t('kline.coinInfo')"></van-tab>
      </van-tabs>
    </div>
    <div v-if="area === 0">
      <PoolInfo :checkedMarket="checkedMarket"/>
      <MinerLists :checkedMarket="checkedMarket"/>
    </div>
    <SwapLaster v-else-if="area === 1" :checkedMarket="checkedMarket"/>
    <CoinInfo v-else-if="area === 2" :checkedMarket="checkedMarket"/>
  </div>
</template>

<script>
import PoolInfo from './PoolInfo'
import MinerLists from './MinerLists';
import SwapLaster from './SwapLaster'
import CoinInfo from './CoinInfo'
export default {
  name: 'tokenInfo',
  components: {
    PoolInfo,
    MinerLists,
    SwapLaster,
    CoinInfo,
  },
  props: {
    checkedMarket: {
      type: Object,
      default: function cm() {
        return {}
      }
    }
  },
  data() {
    return {
      area: 0,
    }
  },
}
</script>

<style lang="scss" scoped>
.tokenInfo{
  .navTabs{
    margin-top: 1px;
    padding: 0 80px;
    height: 116px;
    border-top: 1px solid $color-border;
    border-bottom: 1px solid $color-border;
    /deep/ .van-tabs{
      flex: 1;
    }
    /deep/ .van-tab--active{
      font-weight: 500;
    }
    /deep/ .van-tabs__wrap{
      height: auto;
    }
    /deep/ .van-tabs__nav{
      padding: 0;
      height: 116px;
      justify-content: space-between;
      .van-tab{
        height: 116px;
        padding: 0;
        flex: none;
        font-size: 32px;
      }
      .van-tabs__line{
        height: 4px;
        width: 60px;
        bottom: 0px;
      }
    }
  }
}
</style>
