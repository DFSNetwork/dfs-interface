<template>
  <div class="investment">
    <img class="banner" src="https://leafy-kataifi-c6d825.netlify.app/dfs/investment.png">
    <div class="tools flexb">
      <div class="item" @click="handleTo('inverstRank')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/ranking.png" alt="">
        <div>{{ $t('invest.rank') }}</div>
      </div>
      <div class="item" @click="handleTo('myInverst')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/fixed.png" alt="">
        <div>{{ $t('invest.myInvest') }}</div>
      </div>
      <div class="item" @click="handleTo('inverstRules')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/news.png" alt="">
        <div>{{ $t('invest.investRules') }}</div>
      </div>
    </div>
    <div class="total flexb">
      <div class="tItem">
        <div class="label">{{ $t('invest.inAssets') }}（$）</div>
        <div class="dinBold num">{{ bal }}</div>
      </div>
      <div class="tItem">
        <div class="label">{{ $t('invest.inNum') }}</div>
        <div class="dinBold num">{{ howPeople }}</div>
      </div>
    </div>
    <HotCoin />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import HotCoin from '@/views/investment/comp/HotCoin';
import { dealInvestArr } from './invest'

export default {
  name: 'investment',
  components: {
    HotCoin,
  },
  data() {
    return {
      bal: '0.0000',
    }
  },
  mounted() {
    this.handleGetBal()
  },
  computed: {
    ...mapState({
      allInvests: state => state.invest.allInvests,
    }),
    howPeople() {
      const arr = dealInvestArr(this.allInvests)
      return arr.length
    }
  },
  methods: {
    handleTo(name) {
      this.$router.push({
        name
      })
    },
    async handleGetBal() {
      const params = {
        code: 'tethertether',
        symbol: 'USDT',
        decimal: 4,
        account: 'dfsdtservice',
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      if (!result.length) {
        return
      }
      const bal = result.split(' ')[0];
      this.bal = bal;
    },
  }
}
</script>

<style lang="scss" scoped>
.investment{
  .banner{
    width: 100%;
  }
  .tools{
    font-size: 28px;
    position: relative;
    background: #FFF;
    border-radius: 16px;
    box-shadow: 0px 6px 10px 4px rgba(226,226,226,0.5);
    padding: 28px;
    margin: -30px 30px 40px;
    .item{
      flex: 1;
      img{
        width: 80px;
        margin-bottom: 12px;
      }
    }
  }
  .total{
    font-size: 32px;
    text-align: left;
    padding: 0 30px 30px;
    border-bottom: 15px solid #f9f9f9;
    .tItem{
      flex: 5;
      padding-left: 32px;
      &:last-child{
        flex: 4;
        // padding-left: 70px;
      }
      .label{
        color: #999;
        margin-bottom: 18px;
      }
      .num{
        color: #333;
        font-size: 44px;
      }
    }
  }
}
</style>
