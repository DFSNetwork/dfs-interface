<template>
  <div class="rank">
    <van-tabs v-model="coinName"
      animated
      class="subTab"
      title-inactive-color="#999"
      title-active-color="#29D4B0"
      color="#29D4B0">
      <van-tab name="vol" :title="$t('home.rankVol')"></van-tab>
      <van-tab name="deep" :title="$t('home.rankDeep')"></van-tab>
      <van-tab name="apy" :title="$t('home.rankApy')"></van-tab>
    </van-tabs>

    <div class="lists">
      <div class="tools tip flexb">
        <span>{{ $t('home.symbol') }}</span>
        <span>{{ $t('home.newPrice') }}</span>
        <span>{{ $t('home.rate24') }}</span>
      </div>
      <div class="list flexb" v-for="(v, i) in rankArr" :key="`rank-${i}`"
        @click="handleToTrade(v)">
        <div class="flexa dinReg">
          <img class="symCoin" :src="v.imgUrl1" :onerror="$errorImg">
          <div>
            <div class="symName din">
              <span>{{ v.symbol1 }}</span>
              <span class="small tip">/{{ v.symbol0 }}</span>
            </div>
            <div v-if="coinName === 'deep'" class="symPools tip">{{ $t('pddex.pools') }} {{ handleDealNum(v.poolsNum) }} {{ v.symbol0 }}</div>
            <div v-else-if="coinName === 'apy'" class="symPools tip">{{ $t('pddex.apys1') }} {{ v.apy }}%</div>
            <div v-else class="symPools tip">{{ $t('pddex.amt1') }} {{ parseInt(v.volume24H) }} {{ v.symbol0 }}</div>
          </div>
        </div>
        <div class="dinBold">
          <div class="num "
            >{{ v.price }}</div>
          <div class="dinReg">
            <div class="tip smallTip" v-if="language === 'en'">
              <span>$</span>
              <span>{{ v.aboutPriceU }}</span>
            </div>
            <div class="tip smallTip" v-else>
              <span>¥</span>
              <span>{{ v.aboutPriceCNY }}</span>
            </div>
          </div>
        </div>
        <div>
          <span class="changeBtn din flexc"
          :class="{
            'red_p': parseFloat(v.priceRate) < 0,
          }">{{ v.priceRate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
// import { dealNum } from '@/utils/public'
export default {
  name: 'homeRank',
  data() {
    return {
      coinName: 'vol',
      rankArr: [],
    }
  },
  computed: {
    ...mapState({
      language: state => state.app.language,
      marketLists: state => state.config.marketLists,
    })
  },
  watch: {
    marketLists: {
      handler: function mls(newVal) {
        if (!newVal.length) {
          return
        }
        this.handleDealRank();
      },
      deep: true,
      immediate: true,
    },
    coinName() {
      this.handleDealRank();
    }
  },
  methods: {
    handleDealNum(num) {
      return parseInt(num)
    },
    handleDealRank() {
      let nMarkets = JSON.parse(JSON.stringify(this.marketLists))
      if (this.coinName === 'deep') {
        nMarkets = this.dealArr(nMarkets);
        nMarkets.sort((a, b) => {
          return parseFloat(b.usdt_value || 0) - parseFloat(a.usdt_value || 0)
        })
      } else if (this.coinName === 'vol') {
        nMarkets = this.dealArr(nMarkets);
        nMarkets.sort((a, b) => {
          return parseFloat(b.volume24HToUsdt || 0) - parseFloat(a.volume24HToUsdt || 0)
        })
      } else {
        nMarkets = this.dealArr(nMarkets);
        nMarkets.sort((a, b) => {
          return parseFloat(b.apy || 0) - parseFloat(a.apy || 0)
        })
      }
      const rankArr = nMarkets.slice(0, 10);
      this.rankArr = rankArr;
    },
    dealArr(arr) {
      let tArr = [];
      arr.forEach(v => {
        const has = tArr.find(vv => vv.mid === v.mid);
        if (has) {
          return
        }
        tArr.push(v)
      });
      return tArr
    },
    // 交易页面跳转
    handleToTrade(li) {
      let symbol = 'eosio.token-eos-minedfstoken-dfs';
      if (li) {
        symbol = `${li.contract1}-${li.symbol1}-${li.contract0}-${li.symbol0}`
      }
      this.$router.push({
        name: 'kLine',
        params: {
          symbol
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.rank{
  font-size: 28px;
  border-radius: 10px;
  background: #FFF;
  padding: 0 34px;
  .subTab{
    position: relative;
    box-sizing: border-box;
    height: 91px;
    &::after{
      content: '';
      width: 100%;
      position: absolute;
      border: 1px solid $color-border;
      left: 0;
      bottom: 3px;
    }
    :deep(.van-tab--active){
      font-weight: bold;
    }
    :deep(.van-tabs__nav){
      padding-bottom: 0;
      .van-tab{
        font-size: 32px;
      }
      .van-tabs__line{
        height: 4px;
        width: 33.33%;
        bottom: 0;
      }
      font-size: 26px;
    }
  }
  .lists{
    padding: 0 0 10px;
    .tools{
      padding: 23px 0 0px;
      font-size: 22px;
      &>span{
        flex: 3;
        text-align: right;
        // max-width: 150px;
        // min-width: 150px;
        text-align: left;
        &:first-child{
          flex: 5;
          max-width: 500px;
        }
        &:last-child{
          text-align: right;
        }
      }
    }
    .list{
      // height: 90px;
      padding: 23px 0;
      .symCoin{
        width: 44px;
        height: 44px;
        border-radius: 30px;
        margin-right: 15px;
      }
      &>div{
        flex: 3;
        text-align: right;
        // max-width: 150px;
        // min-width: 150px;
        text-align: left;
        &:first-child{
          flex: 5;
          max-width: 500px;
        }
        &:last-child{
          text-align: right;
        }
      }
      .symName{
        font-size: 26px;
        .small{
          font-size: 24px;
        }
      }
      .symPools,
      .smallTip{
        font-size: 24px;
        margin-top: 4px;
      }
      .changeVol,
      .changeBtn{
        background: #01B796;
        padding: 12px 0;
        width: 130px;
        display: inline-block;
        font-size: 28px;
        color: #FFF;
        border-radius: 10px;
        text-align: center;
        &.red_p{
          background:#E54F5D;
          color: #FFF !important;
        }
      }
      .changeVol{
        background: #FFF;
        &.red_p{
          background: #FFF;
        }
      }
    }
  }
}
</style>
