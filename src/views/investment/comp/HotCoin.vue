<template>
  <div class="hot">
    <div class="title">{{ $t('invest.hotCoin') }}</div>
    <div class="coins">
      <div class="coin flexb" v-for="(v, i) in dealCoins" :key="i">
        <div class="info flexa">
          <img class="logo" :src="v.logo">
          <div>
            <div class="dinBold name">{{ v.symbol }}</div>
            <div class="dinReg tip num">{{ $t('invest.howJoin', {num: v.holdNum}) }}</div>
          </div>
        </div>
        <div class="price">
          <div class="dinBold" :class="{
            'green': parseFloat(v.priceRate || 0) >= 0,
            'red': parseFloat(v.priceRate || 0) < 0,
            }">{{ v.price || '0.0000' }}</div>
          <div class="dinReg tip num" v-if="language === 'zh-CN'">¥{{ v.aboutPriceCNY || '0.00' }}</div>
          <div class="dinReg tip num" v-else>¥{{ v.aboutPriceU || '0.00' }}</div>
        </div>
        <div class="tools" @click="handleTo('myInverst')">{{ $t('invest.toInvest') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'hotCoin',
  data() {
    return {
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      language: state => state.app.language,
      marketLists: state => state.config.marketLists,
      allInvests: state => state.invest.allInvests,
      coins: state => state.invest.coins,
    }),
    dealCoins() {
      let arr = JSON.parse(JSON.stringify(this.coins))
      const markets = this.marketLists;
      const inversts = this.allInvests;
      arr.forEach(v => {
        const inFilter = inversts.filter(vv => vv.sym === v.symbol);
        v.holdNum = inFilter.length;
        const mk = markets.find(vv => vv.mid == v.mid);
        v.aboutPriceCNY = mk.aboutPriceCNY;
        v.aboutPriceU = mk.aboutPriceU;
        v.price = mk.price;
        v.priceRate = mk.priceRate;
      })
      return arr;
    }
  },
  methods: {
    handleTo(name) {
      this.$router.push({
        name
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.hot{
  text-align: left;
  padding: 35px 32px;
  font-size: 26px;
  .title{
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .coin{
    height: 120px;
    .info{
      flex: 4;
      .logo{
        width: 50px;
        height: 50px;
        margin-right: 15px;
      }
    }
    .num{
      font-size: 24px;
      margin-top: 3px;
    }
    .price{
      flex: 3;
      text-align: left;
      .green{
        color: $color-main;
      }
      .red{
        color: #FF4D4D;
      }
    }
    .tools{
      background: $color-main;
      border-radius: 16px;
      color: #FFF;
      padding: 12px 28px;
      line-height: 40px;
    }
  }
}
</style>
