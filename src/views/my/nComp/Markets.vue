<template>
  <div class="marketsComp">
    <div class="count item">
      <div class="title din flexa">
        <span>{{ $t('my.totalValue') }}</span>
        <span v-if="countByU">(USDT)</span>
        <span v-else>(EOS)</span>
        <img class="eye" v-if="!hideAss" @click="hideAss = !hideAss"
          src="https://resource2.dfs.land/dfs/eye.png">
        <img class="eye hideeye" v-else  @click="hideAss = !hideAss"
          src="https://resource2.dfs.land/dfs/hide.png">
      </div>
      <div class="flexend" v-if="!hideAss">
        <span class="amt dinBold" v-if="countByU">{{ allCountUsdt }}</span>
        <span class="amt dinBold" v-else>{{ allCountEos }}</span>
        <span class="small flexa">
          <span>≈ ¥{{ allCountCNY }}</span>
          <img class="exCount"  @click="countByU = !countByU"
            src="https://resource2.dfs.land/dfs/switch.png">
        </span>
      </div>
      <div class="flexa" v-else>
        <span class="amt dinBold">********</span>
        <img class="exCount" @click="countByU = !countByU"
            src="https://resource2.dfs.land/dfs/switch.png">
      </div>
    </div>

    <div class="lists">
      <div class="noData" v-if="!showArr.length">
        <img src="https://resource1.dfs.land/noData/noOrder.png">
        <div>{{ $t('my.noLiqData') }}</div>
      </div>
      <div class="item" v-for="(v, i) in showArr" :key="i">
        <div class="flexb">
          <div class="coin din flexa">
            <img class="logo" :src="v.imgUrl0" :onerror="$errorImg">
            <span>{{ v.symbol0 }}</span>
            <img class="add" src="https://resource1.dfs.land/svg/add.svg">
            <img class="logo" :src="v.imgUrl1" :onerror="$errorImg">
            <span>{{ v.symbol1 }}</span>
          </div>
          <div class="flexa">
            <div class="deposit flexc btn" @click="handleAdd(v)">{{ $t('more.add') }}</div>
            <div class="withdraw flexc btn" @click="handleWith(v)">{{ $t('more.remove') }}</div>
          </div>
        </div>
        <div class="info dinReg">
          <div class="flexa">
            <span class="label">{{ $t('market.myMarkets') }}：</span>
            <span>{{ v.nowMarket0 }} {{ v.symbol0 }} / {{ v.nowMarket1 }} {{ v.symbol1 }}</span>
          </div>
          <div class="flexa">
            <span class="label">{{ $t('market.capital') }}：</span>
            <span>{{ v.bal0 }} / {{ v.bal1 }}</span>
          </div>
          <div class="flexa" v-if="v.rdType">
            <span class="label">{{ $t('market.marketReward') }}：</span>
            <div v-if="v.showRdType === 0">
              <span v-if="!v.rdType.ex">
                <span :class="{
                  'green': parseFloat(v.rdType.t0 || 0) > 0,
                  'red': parseFloat(v.rdType.t0 || 0) < 0,
                  }">{{ v.rdType.t0 }} {{ v.symbol0 }}</span> / 
                <span :class="{
                  'green': parseFloat(v.rdType.t1 || 0) > 0,
                  'red': parseFloat(v.rdType.t1 || 0) < 0,
                  }">{{ v.rdType.t1 }} {{ v.symbol1 }}</span>
              </span>
              <span v-else>
                <span :class="{
                  'green': parseFloat(v.rdType.t1 || 0) > 0,
                  'red': parseFloat(v.rdType.t1 || 0) < 0,
                  }">{{ v.rdType.t1 }} {{ v.symbol1 }}</span> / 
                <span :class="{
                  'green': parseFloat(v.rdType.t0 || 0) > 0,
                  'red': parseFloat(v.rdType.t0 || 0) < 0,
                  }">{{ v.rdType.t0 }} {{ v.symbol0 }}</span>
              </span>
            </div>
            <div v-else-if="v.showRdType === 1">
              <span :class="{
                'green': parseFloat(v.rdType.rewardA || 0) > 0,
                'red': parseFloat(v.rdType.rewardA || 0) < 0,
                }">{{ v.rdType.rewardA }} {{ v.symbol0 }}</span>
            </div>
            <div v-else>
              <span :class="{
                'green': parseFloat(v.rdType.rewardB || 0) > 0,
                'red': parseFloat(v.rdType.rewardB || 0) < 0,
                }">{{ v.rdType.rewardB }} {{ v.symbol1 }}</span>
            </div>
            <img @click.stop="handleChangeRewardType(v)" class="qusTip" src="https://resource1.dfs.land/dex/price_switch_icon_green_left.svg" alt="">
          </div>
          <div class="flexa" v-if="v.timer">
            <span class="label">{{ $t('market.marketTime') }}：</span>
            <span>
              {{ $t('market.timer', {
                days: v.timer.days,
                hours: v.timer.hours,
                mins: v.timer.minutes,
                secs: v.timer.seconds,
              }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

     <!-- 加入做市 -->
    <van-popup
      get-container="body"
      class="popup_p"
      v-model="showAdd">
      <AddMarket v-if="showAdd"
        :thisMarket="menageMarket"
        @listenClose="handleClose"/>
    </van-popup>
    <!-- 取回做市 -->
    <van-popup
      get-container="body"
      class="popup_p"
      v-model="showRemove">
      <Withdraw v-if="showRemove"
        :thisMarket="menageMarket"
        @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { toFixed, accDiv, getMarketTimeLp, toLocalTime } from '@/utils/public';

import AddMarket from '@/views/market/popup/AddMarket'
import Withdraw from '@/views/market/comp/Withdraw'

export default {
  name: 'marketsComp',
  components: {
    AddMarket, Withdraw,
  },
  props: {
    liqs: {
      type: Array,
      default: function abs() {
        return []
      }
    },
    allBals: {
      type: Array,
      default: function abs() {
        return []
      }
    },
  },
  data() {
    return {
      timer: null,
      showArr: [],
      getMine: false,
      mineArr: [], // 挖矿数据
      rwTimer: null,
      minReward: 0.0001,

      menageMarket: {},
      showAdd: false,
      showRemove: false,

      countByU: true,
      hideAss: false,
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    clearInterval(this.rwTimer)
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      marketLists: state => state.sys.marketLists,
      mkFilterConf: state => state.config.mkFilterConf,
      coinPrices: state => state.sys.coinPrices,
      rankInfoV3: state => state.sys.rankInfoV3,
    }),
    allCountUsdt() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.balUsdt || 0)
      })
      return count.toFixed(4)
    },
    allCountEos() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.balEos || 0)
      })
      return count.toFixed(4)
    },
    allCountCNY() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.balCNY || 0)
      })
      return count.toFixed(4)
    },
  },
  watch: {
    liqs: {
      handler: function als() {
        this.handleDeal()
        this.handleGetMine()
      },
      deep: true,
      immediate: true
    },
    account: {
      handler: function als() {
        this.handleGetMine()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleChangeRewardType(v) {
      let n = v.showRdType;
      n = n + 1;
      n = n % 3
      this.$set(v, 'showRdType', n)
    },
    handleDeal() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.handleDeal()
      }, 1000);
      const newArr = JSON.parse(JSON.stringify(this.liqs))
      const dealArr = [];
      newArr.forEach(item => {
        const hasMarket = this.marketLists.find(vv => vv.mid === item.mid) || {};
        const hasLiq = this.showArr.find(vv => vv.mid === item.mid) || {};
        const v = Object.assign({
          status: 0,
        }, hasMarket, hasLiq, item)
        // 处理做市时长
        const sT = toLocalTime(`${v.start}.000+0000`);
        const mTime = getMarketTimeLp(sT)
        this.$set(v, 'timer', mTime);
        // 处理收益 - 正常双币种
        const reward0 = parseFloat(v.nowMarket0 || 0) - parseFloat(v.bal0 || 0)
        const reward1 = parseFloat(v.nowMarket1 || 0) - parseFloat(v.bal1 || 0)
        const t0 = parseFloat(reward0 || 0) > 0 ? `+${ parseFloat(reward0 || 0).toFixed(4) }`
                                                : parseFloat(reward0 || 0).toFixed(4);
        const t1 = parseFloat(reward1 || 0) > 0 ? `+${ parseFloat(reward1 || 0).toFixed(4) }`
                                                : parseFloat(reward1 || 0).toFixed(4);
        const ex = parseFloat(reward0 || 0) < parseFloat(reward1 || 0)
        // 处理收益 - 收益tokenA
        const priceA = parseFloat(v.nowMarket0 || 0) / parseFloat(v.nowMarket1 || 0);
        let rewardA = parseFloat(reward0) + priceA * parseFloat(reward1)
        const decimalA = v.decimal0 > 4 ? 4 : v.decimal0 ;
        rewardA = toFixed(rewardA, decimalA)
        if (Number(rewardA) > 0) {
          rewardA = `+${rewardA}`
        }
        // 处理收益 - 收益tokenB
        const priceB = parseFloat(v.nowMarket1 || 0) / parseFloat(v.nowMarket0 || 0);
        let rewardB = parseFloat(reward1) + priceB * parseFloat(reward0)
        const decimalB = v.decimal1 > 4 ? 4 : v.decimal1 ;
        rewardB = toFixed(rewardB, decimalB)
        if (Number(rewardB) > 0) {
          rewardB = `+${rewardB}`
        }
        this.$set(v, 'rdType', {
          t0,
          t1,
          ex,
          rewardA,
          rewardB,
        });
        v.showRdType = v.showRdType || 0;

        v.sym0Rate = toFixed(accDiv(parseFloat(v.reserve1 || 0), parseFloat(v.reserve0 || 0)), v.decimal1)
        v.sym1Rate = toFixed(accDiv(parseFloat(v.reserve0 || 0), parseFloat(v.reserve1 || 0)), v.decimal0)
        dealArr.push(v)
      })
      this.showArr = dealArr;
    },
    // 获取挖矿数据
    async handleGetMine() {
      const name = this.account.name;
      if (this.getMine || !name || !this.liqs.length) {
        return;
      }
      this.getMine = true;
      let mineArr = [];
      let index = 0;
      this.liqs.forEach(async v => {
        const has = this.rankInfoV3.find(vv => vv.mid === v.mid)
        if (!has) {
          index += 1
          return
        }
        const params = {
          code: 'miningpool11',
          scope: v.mid,
          table: 'miners2',
          lower_bound: ` ${name}`,
          upper_bound: ` ${name}`,
          json: true,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        index += 1
        if (!status || !result.rows.length) {
          return
        }
        const row = result.rows[0];
        row.mid = v.mid;
        mineArr.push(row)
        if (index === this.liqs.length) {
          this.mineArr = mineArr;
          // console.log(mineArr)
        }
      })
    },
    handleClose() {
      this.showAdd = false;
      this.showRemove = false;
    },
    handleWith(v) {
      this.menageMarket = v;
      this.showRemove = true;
    },
    handleAdd(v) {
      this.menageMarket = v;
      this.showAdd = true;
    },
  }
}
</script>

<style lang="scss" scoped>
.marketsComp{
  font-size: 28px;
  text-align: left;

  .count{
    .title{
      margin-bottom: 10px;
    }
    .amt{
      font-size: 40px;
    }
    .small{
      font-size: 24px;
      margin-left: 15px;
    }
    .exCount{
      width: 32px;
      margin-left: 20px;
    }
    .eye{
      margin-top: 5px;
      margin-left: 15px;
      width: 32px;
      display: block;
    }
    .hideeye{
      margin-top: 10px;
    }
  }
  .btn{
    height: 60px;
    font-size: 24px;
    border-radius: 30px;
    background: $color-main;
    color: #FFF;
    // padding: 0 36px;
    width: 120px;
    margin-bottom: 10px;
    &.withdraw{
      margin-left: 15px;
      background: #D83D51;
    }
  }
  .item{
    padding: 24px;
    border-bottom: 1px solid $color-border;
  }
  .claimDiv{
    .title{
      margin-bottom: 9px;
    }
    .num{
      font-size: 40px;
    }
    .small{
      margin-left: 15px;
      font-size: 24px;
    }
  }
  .lists{
    .noData{
      padding: 50px 0;
      text-align: center;
      font-size: 24px;
      color: #999;
      img{
        width: 400px;
      }
    }
    .item{
      .coin{
        color: #000;
        margin-bottom: 10px;
      }
      .logo{
        min-width: 52px;
        width: 52px;
        height: 52px;
        margin-right: 9px;
      }
      .add{
        margin: 0 15px;
      }
      .info{
        font-size: 24px;
        &>div{
          margin: 15px 0;
        }
        .label{
          color: #666;
        }
        .green{
          color: $color-main;
        }
        .red{
          color: #FF4D4D;
        }
        .qusTip{
          margin-left: 9px;
          width: 32px;
        }
      }
    }
  }
}
</style>
