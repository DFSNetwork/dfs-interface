<template>
  <div class="investRank">
    <img class="banner" src="@/assets/img/investment.png">
    <div class="myInvest">
      <div class="flexb line">
        <div class="item">
          <div class="dinBold num"
            :class="{
              'greem': parseFloat(accInfo.totalRate || 0) > 0,
              'red': parseFloat(accInfo.totalRate || 0) < 0,
            }"
            >{{ accInfo.totalRate || '0.00' }}%</div>
          <div class="label din">{{ $t('invest.myRwdRate') }}</div>
        </div>
        <div class="item">
          <div class="dinBold num"
            :class="{
              'greem': parseFloat(accInfo.totalRate || 0) > 0,
              'red': parseFloat(accInfo.totalRate || 0) < 0,
            }">{{ accInfo.totalReward || '0.0000' }}</div>
          <div class="label din">{{ $t('invest.reward') }}(USDT)</div>
        </div>
      </div>
      <div class="flexb">
        <div class="item">
          <div class="dinBold num">{{ accInfo.maxLeng || '0' }}</div>
          <div class="label din">{{ $t('invest.inDays') }}</div>
        </div>
        <div class="item">
          <div class="dinBold num">{{ myRank }}</div>
          <div class="label din">{{ $t('invest.rateRank') }}</div>
        </div>
      </div>
    </div>

    <div class="nav flexb din">
      <span class="flexc"
        :class="{
          'noRight': act === i + 1,
          'act': act === i,
        }"
        @click="act = i"
        v-for="(v, i) in coins" :key="i">{{ v.symbol }}</span>
    </div>

    <div class="title flexb">
      <span class="din">{{ $t('invest.coinInvest', {coin: coins[act].symbol}) }}</span>
      <span class="dinReg count tip">{{ $t('invest.totalNum') }}: {{ actLists.length }}</span>
    </div>
    
    <RankLists v-for="(v, i) in actLists" :key="i" 
      :item="v"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RankLists from '@/views/investment/comp/RankLists';
import { getMyInvest, dealInvestArr } from '../invest';
export default {
  name: 'investRank',
  components: {
    RankLists,
  },
  data() {
    return {
      act: 0,
      accInfo: {},
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
      allInvests: state => state.invest.allInvests,
      coins: state => state.invest.coins,
    }),
    actLists() {
      const coin = this.coins[this.act];
      let arr = this.allInvests.filter(v => v.sym === coin.symbol);
      // console.log(arr)
      arr.sort((a, b) => {
        return parseFloat(b.buy_fund_sum || 0) - parseFloat(a.buy_fund_sum || 0)
      })
      const mid = coin.mid
      arr.forEach((v, i) => {
        v.rank = i + 1;
        v.mid = mid;
      });
      return arr
    },
    myRank() {
      const filterArr = dealInvestArr(this.allInvests);
      let rankArr = [];
      filterArr.forEach(v => {
        const item = getMyInvest(v.owner)
        rankArr.push(Object.assign({}, v, item))
      })
      filterArr.sort((a, b) => {
        return parseFloat(b.totalRate || 0) - parseFloat(a.totalRate || 0)
      })
      const rank = filterArr.findIndex(v => v.owner === this.account.name);
      if (rank === -1) {
        return '1000+'
      }
      return rank + 1
    }
  },
  watch: {
    account: {
      handler: function at(val) {
        if (!val.name) {
          return
        }
        this.accInfo = getMyInvest(val.name)
      },
      deep: true,
      immediate: true,
    }
  },
}
</script>

<style lang="scss" scoped>
.investRank{
  font-size: 28px;
  .banner{
    width: 100%;
    display: block;
  }
  .myInvest{
    position: relative;
    background: #FFF;
    border-radius: 16px;
    padding: 28px 42px;
    text-align: left;
    margin: -30px 30px 30px;
    box-shadow: 0px 6px 10px 4px rgba(226,226,226,0.5);
    .line{
      margin-bottom: 20px;
    }
    .item{
      flex: 1;
      padding-left: 18px;
      .num{
        font-size: 44px;

        &.greem{
          color: $color-main;
        }
        &.red{
          color: #F14444;
        }
      }
    }
    .label{
      color: #999;
      margin-top: 10px;
    }
  }
  .nav{
    background: #FFF;
    margin: 50px 30px 30px;
    border-top: 3px solid #EAEAEA;
    border-bottom: 3px solid #EAEAEA;
    height: 76px;
    border-radius: 8px;
    position: sticky;
    top: 0px;
    span{
      height: 76px;
      flex: 1;
      border-right: 3px solid #EAEAEA;
      &:last-child{
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }
      &:first-child{
        border-left: 3px solid #EAEAEA;
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }
    }
    .noRight{
      border-right: 0;
    }
    .act{
      border: 3px solid $color-main !important;
      border-radius: 8px;
      color: $color-main;
    }
  }
  .title{
    margin: 30px;
    font-weight: 600;
    .count{
      font-size: 24px;
      font-weight: 400;
    }
  }
}
</style>
