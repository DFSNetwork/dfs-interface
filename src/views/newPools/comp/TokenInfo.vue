<template>
  <div class="token flexb">
    <div class="flexa">
      <img class="coin" :src="src">
      <div>
        <div class="din">{{ supply }}</div>
        <div class="tip">{{ tokenName }} {{ $t('mine.coinSupply') }}</div>
      </div>
    </div>
    <div>
      <div class="din">$ {{ price }}</div>
      <div class="tip">{{ tokenName }} {{ $t('mine.price') }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'tokenInfo',
  props: {
    tokenName: {
      type: String,
      default: 'DFS'
    }
  },
  data() {
    return {
      contracts: {
        DFS: 'minedfstoken',
        TAG: 'tagtokenmain',
      },
      supply: '0.0000',
    }
  },
  mounted() {
    this.handleGetSupply()
  },
  computed: {
    ...mapState({
      coinPrices: (state) => state.sys.coinPrices,
    }),
    contract() {
      const contract = this.contracts[this.tokenName];
      return contract
    },
    src() {
      const coin = this.tokenName.toLowerCase()
      const contract = this.contract;
      const src = `https://cdn.jsdelivr.net/gh/defis-net/material2/coin/${contract}-${coin}.png`
      return src
    },
    price() {
      const prs = this.coinPrices.find(v => v.coin === this.tokenName) || {};
      const p = parseFloat(prs.price || '0.00').toFixed(2)
      return p
    }
  },
  methods: {
    async handleGetSupply() {
      const params = {
        code: this.contract,
        symbol: this.tokenName
      }
      const {status, result} = await this.$api.get_currency_stats(params);
      if (!status) {
        return;
      }
      const res = result[this.tokenName];
      const supply = res.supply.split(' ')[0];
      this.supply = parseInt(supply)
    }
  }
}
</script>

<style lang="scss" scoped>
.token{
  margin: 40px 0;
  text-align: left;
  font-size: 36px;
  box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
  border-radius: 20px;
  height: 160px;
  padding: 0 36px;
  .coin{
    width: 60px;
    margin-right: 30px;
  }
  .tip{
    font-size: 28px;
    margin-top: 6px;
  }
}
</style>
