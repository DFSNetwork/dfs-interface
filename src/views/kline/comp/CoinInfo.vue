<template>
  <div class="coinInfo">
    <div class="info">
      <div class="flexa base">
        <img class="logo" :src="checkedMarket.imgUrl1" :onerror="$errorImg">
        <span class="name dinBold">{{ checkedMarket.symbol1 }}</span>
        <span class="pro dinReg" v-if="tokenAInfo.project">
          <span v-if="language === 'zh-CN'">({{ tokenAInfo.project }})</span>
          <span v-else>({{ tokenAInfo.projectEn }})</span>
        </span>
      </div>
      <div class="mainContent">
        <span v-if="language === 'zh-CN'">{{ tokenAInfo.content || $t('kline.noDate') }}</span>
        <span v-else>{{ tokenAInfo.contentEn || $t('kline.noDate') }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.maxSupply') }}</span>
        <span>{{ parseFloat(supplyA.max_supply || 0) }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.supply') }}</span>
        <span>{{ parseFloat(supplyA.supply || 0) }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.spyCnt') }}</span>
        <span v-if="language === 'zh-CN'">¥{{ tokenACount }}</span>
        <span v-else>${{ tokenACount }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.contract') }}</span>
        <span>{{ checkedMarket.contract1 }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.websize') }}</span>
        <span>{{ tokenAInfo.websize || '-' }}</span>
      </div>
    </div>
    <div class="info">
      <div class="flexa base">
        <img class="logo" :src="checkedMarket.imgUrl0" :onerror="$errorImg">
        <span class="name dinBold">{{ checkedMarket.symbol0 }}</span>
        <span class="pro dinReg" v-if="tokenBInfo.project"> ({{ tokenBInfo.project }})</span>
      </div>
      <div class="mainContent">
        <span v-if="language === 'zh-CN'">{{ tokenBInfo.content || $t('kline.noDate') }}</span>
        <span v-else>{{ tokenBInfo.contentEn || $t('kline.noDate') }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.maxSupply') }}</span>
        <span>{{ parseFloat(supplyB.max_supply || 0) }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.supply') }}</span>
        <span>{{ parseFloat(supplyB.supply || 0) }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.spyCnt') }}</span>
        <span v-if="language === 'zh-CN'">¥{{ tokenBCount }}</span>
        <span v-else>${{ tokenBCount }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.contract') }}</span>
        <span>{{ checkedMarket.contract0 }}</span>
      </div>
      <div class="item flexb">
        <span>{{ $t('kline.websize') }}</span>
        <span>{{ tokenBInfo.websize || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'coinInfo',
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
      tokenAInfo: {},
      tokenBInfo: {},
      supplyA: {},
      supplyB: {},
    }
  },
  watch: {
    checkedMarket: {
      handler: function cmr(newVal) {
        if (!newVal.mid) {
          return
        }
        this.handleGetJson('tokenA')
        this.handleGetJson('tokenB')
        this.handleGetCurrent('tokenA')
        this.handleGetCurrent('tokenB')
        this.handleGetCoinPrice('tokenA')
        this.handleGetCoinPrice('tokenB')
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState({
      marketLists: state => state.sys.marketLists,
      coinPrices: state => state.sys.coinPrices,
      language:  state => state.app.language,
      tokenInfo:  state => state.config.tokenInfo,
    }),
    tokenACount() {
      const p = this.handleGetCoinPrice('tokenA');
      const priceU = p.price * parseFloat(this.supplyA.supply || 0);
      const priceCNY = p.CNY * parseFloat(this.supplyA.supply || 0);
      if (this.language === 'en') {
        return priceU.toFixed(2)
      }
      return priceCNY.toFixed(2)
    },
    tokenBCount() {
      const p = this.handleGetCoinPrice('tokenB');
      const priceU = p.price * parseFloat(this.supplyB.supply || 0);
      const priceCNY = p.CNY * parseFloat(this.supplyB.supply || 0);
      if (this.language === 'en') {
        return priceU.toFixed(2)
      }
      return priceCNY.toFixed(2)
    }
  },
  methods: {
    handleGetJson(token) {
      let fileName = `${this.checkedMarket.contract1}-${this.checkedMarket.symbol1.toLowerCase()}`
      if (token === 'tokenB') {
        fileName = `${this.checkedMarket.contract0}-${this.checkedMarket.symbol0.toLowerCase()}`
      }
      const result = this.tokenInfo[fileName] || {}
      token === 'tokenB' ? this.tokenBInfo = result : this.tokenAInfo = result;
    },
    // 获取发行量
    async handleGetCurrent(token) {
      let coin = this.checkedMarket.sym1Data;
      if (token === 'tokenB') {
        coin = this.checkedMarket.sym0Data;
      }
      const params = {
        code: coin.contract,
        symbol: coin.symbol
      }
      const {status, result} = await this.$api.get_currency_stats(params);
      if (!status) {
        return;
      }
      const res = result[coin.symbol];
      token === 'tokenB' ? this.supplyB = res : this.supplyA = res;
    },
    // 获取币种价格
    handleGetCoinPrice(token) {
      let coin = this.checkedMarket.sym1Data;
      if (token === 'tokenB') {
        coin = this.checkedMarket.sym0Data;
      }
      // 基础计价币计算价格
      const isBaseCoin = this.coinPrices.find(v => v.contract === coin.contract && coin.symbol === v.coin)
      if (isBaseCoin) {
        return isBaseCoin
      }
      const sPrice = token === 'tokenB'
        ? parseFloat(this.checkedMarket.reserve1 || 0) / parseFloat(this.checkedMarket.reserve0 || 0)
        : parseFloat(this.checkedMarket.reserve0 || 0) / parseFloat(this.checkedMarket.reserve1 || 0)
      const oPrice = this.handleGetCoinPrice(token === 'tokenB' ? 'tokenA' : 'tokenB');
      const nPrice = {
        CNY: oPrice.CNY * sPrice,
        price: oPrice.price * sPrice,
      }
      return nPrice
    }
  }
}
</script>

<style lang="scss" scoped>
.info{
  padding: 0 10px;
  .base{
    height: 110px;
    padding: 0 30px;
    border-bottom: 1px solid rgba($color-border, .8);
    font-size: 36px;
    .logo{
      width: 60px;
      margin-right: 24px;
    }
    .name{
      margin-right: 9px;
    }
  }
  .mainContent{
    padding: 30px;
    border-bottom: 1px solid rgba($color-border, .8);
  }
  .item{
    height: 100px;
    padding: 0 30px;
  }
}
</style>