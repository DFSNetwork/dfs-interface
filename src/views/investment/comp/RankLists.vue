<template>
  <div class="lits flexa">
    <div class="rank flexc">
      <img v-if="item.rank === 1" class="rankImg" src="@/assets/img/investRank1.png">
      <img v-else-if="item.rank === 2" class="rankImg" src="@/assets/img/investRank2.png">
      <img v-else-if="item.rank === 3" class="rankImg" src="@/assets/img/investRank3.png">
      <span v-else>{{ item.rank }}</span>
    </div>
    <div style="flex:1">
      <div class="flexb item">
        <span class="din name">{{ item.owner }}</span>
        <span class="ined">{{ $t('invest.howTimes', {num: item.buy_count}) }}</span>
      </div>
      <div class="flexb item">
        <span class="dinReg">{{ $t('invest.totalAssets') }}：{{ item.buy_fund_sum }}</span>
        <span class="flexe">
          <span class="tip">{{ $t('invest.rate') }}：</span>
          <span class="din num" :class="{
            'green': parseFloat(rate || 0) >= 0,
            'red': parseFloat(rate || 0) < 0,
          }">{{ rate }}%</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    item: {
      style: Object,
      default: function it() {
        return {}
      }
    }
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      allInvests: state => state.invest.allInvests,
      // coinPrices: state => state.sys.coinPrices,
      marketLists: state => state.config.marketLists,
    }),
    rate() {
      const useU = parseFloat(this.item.total_pay_quantity || 0);
      const buyNum = parseFloat(this.item.total_buy_quantity || 0);
      const coinPrices = this.marketLists.find(v => v.mid === this.item.mid) || {}
      const abtUprice = coinPrices.price || 0;
      const assetsPrice = buyNum * abtUprice;
      let r = (assetsPrice - useU) / useU * 100;
      r = parseFloat(r || 0).toFixed(2)
      if (parseFloat(r) >= 0) {
        r = `+${r}`
      }
      return r
    }
  }
}
</script>

<style lang="scss" scoped>
.lits{
  margin: 30px;
  border: 2px solid #EAEAEA;
  padding: 18px 28px;
  border-radius: 16px;
  .rank{
    width: 52px;
    font-size: 32px;
    color: #A9A9A9;
    margin-right: 28px;
    .rankImg{
      width: 52px;
    }
  }
  .item{
    margin-bottom: 10px;
    font-size: 24px;
    .name{
      font-size: 30px;
    }
    .ined{
      background: rgba(#C4C4C4, .15);
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 22px;
    }
    .num{
      font-size: 28px;
      &.green{
        color: $color-main;
      }&.red{
        color: #F14444;
      }
    }
  }
}
</style>
