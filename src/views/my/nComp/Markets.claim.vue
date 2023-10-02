<template>
  <div class="marketsComp">
    <div class="item claimDiv flexb">
      <div class="cnt">
        <div class="title">{{ $t('my.liqsReward') }}(DFS)</div>
        <div>
          <span class="num dinBold">{{ countMine }}</span>
          <span class="small">≈ {{ countMineCNY }} CNY</span>
        </div>
      </div>
      <div class="claimBtn flexc" @click="handleClaim">{{ $t('my.oneKeys') }}</div>
    </div>

    <div class="lists">
      <div class="item" v-for="(v, i) in showArr" :key="i">
        <div class="coin din flexa">
          <img class="logo" :src="v.imgUrl0" :onerror="$errorImg">
          <span>{{ v.symbol0 }}</span>
          <img class="add" src="https://resource1.dfs.land/svg/add.svg">
          <img class="logo" :src="v.imgUrl1" :onerror="$errorImg">
          <span>{{ v.symbol1 }}</span>
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
      class="popup"
      v-model="showAdd">
      <AddMarket v-if="showAdd"
        :thisMarket="menageMarket"
        @listenClose="handleClose"/>
    </van-popup>
    <!-- 取回做市 -->
    <van-popup
      class="popup"
      v-model="showRemove">
      <Withdraw v-if="showRemove"
        :thisMarket="menageMarket"
        @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import moment from 'moment';
import { mapState } from 'vuex';
// import { sellToken, getV3PoolsClass } from '@/utils/logic';
import { toFixed, getMarketTimeLp, toLocalTime } from '@/utils/public';
import { getBals } from '@/utils/DfsMineData'
import { getReward } from '@/views/dfsMine/dfsMine'

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
    countMine() {
      let count = 0;
      this.showArr.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.showReward || 0)
      })
      return count.toFixed(4)
    },
    countMineCNY() {
      let price = this.coinPrices.find(v => v.coin === 'DFS') || {};
      price = price.CNY;
      const cny = parseFloat(price || 0) * parseFloat(this.countMine || 0)
      return cny.toFixed(2)
    }
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
        // 处理收益
        const reward0 = parseFloat(v.nowMarket0 || 0) - parseFloat(v.bal0 || 0)
        const reward1 = parseFloat(v.nowMarket1 || 0) - parseFloat(v.bal1 || 0)
        const t0 = parseFloat(reward0 || 0) > 0 ? `+${ parseFloat(reward0 || 0).toFixed(4) }`
                                                : parseFloat(reward0 || 0).toFixed(4);
        const t1 = parseFloat(reward1 || 0) > 0 ? `+${ parseFloat(reward1 || 0).toFixed(4) }`
                                                : parseFloat(reward1 || 0).toFixed(4);
        const ex = parseFloat(reward0 || 0) < parseFloat(reward1 || 0)
        this.$set(v, 'rdType', {
          t0,
          t1,
          ex,
        });
        // 计算收益
        const reward = this.handleGetReward(v)
        this.$set(v, 'reward', reward);
        dealArr.push(v)
      })
      this.showArr = dealArr;
      this.handleRunReward()
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
    // 计算挖矿收益
    handleGetReward(v) {
      // if (!this.mineArr.length || this.marketLists.mid) {
      //   return 
      // }
      const has = this.mineArr.find(vv => vv.mid === v.mid);
      let reward = 0
      if (!has) {
        return reward
      }
      const {allBal, swapBal} = getBals()
      let lastTime = toLocalTime(`${has.last_drip}.000+0000`);
      has.lastTime = moment(lastTime).valueOf();
      if (v.contract0 === 'tethertether' || v.contract1 === 'tethertether') {
        const num = v.contract0 === 'tethertether' ? parseFloat(v.nowMarket0) : parseFloat(v.nowMarket1)
        const reward0 = getReward({
          poolBal: allBal.usdtPoolsBal,
          swapBal: swapBal.usdtSwapBal
        }, {
          lastTime: has.lastTime,
          num
        })
        reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
      }
      if (v.contract0 === 'eosio.token' || v.contract1 === 'eosio.token') {
        const num = v.contract0 === 'eosio.token' ? parseFloat(v.nowMarket0) : parseFloat(v.nowMarket1)
        const reward0 = getReward({
          poolBal: allBal.eosPoolsBal,
          swapBal: swapBal.eosSwapBal
        }, {
          lastTime: has.lastTime,
          num
        })
        reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
      }
      if (v.contract0 === 'minedfstoken' || v.contract1 === 'minedfstoken') {
        const num = v.contract0 === 'minedfstoken' ? parseFloat(v.nowMarket0) : parseFloat(v.nowMarket1)
        const reward0 = getReward({
          poolBal: allBal.dfsPoolsBal,
          swapBal: swapBal.dfsSwapBal
        }, {
          lastTime: has.lastTime,
          num
        })
        reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
      }
      // console.log(v.mid, reward)
      return reward
    },
    // 挖矿收益数据滚动
    handleRunReward() {
      clearInterval(this.rwTimer)
      this.rwTimer = setInterval(() => {
        this.handleRun()
      }, 50);
      this.handleRun()
    },
    handleRun() {
      this.showArr.forEach(v => {
        if (!parseFloat(v.reward || 0)) {
          return
        }
        const reward = v.reward;
        let showReward = v.showReward || reward;
        let tReward = v.tReward || showReward;
        const t = (reward - showReward) / 20;

        tReward = Number(tReward) + Number(t);
        showReward = toFixed(tReward, 8)
        this.$set(v, 'showReward', showReward)
        this.$set(v, 'tReward', tReward)
      })
    },
    handleClaim() {
      if (!this.account.name) {
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const actions = [];
      this.showArr.forEach(item => {
        if (!item.reward || Number(item.reward) < Number(this.minReward)) {
          return
        }
        actions.push({
          account: 'miningpool11',
          name: 'claim2',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
            mid: item.mid,
          }
        })
      })
      if (!actions.length) {
        return
      }
      const params = {
        actions
      }
      DApp.toTransaction(params, (err) => {
        this.loading = false;
        if (err && err.code == 402) {
          this.$emit('listenUpdate', true)
          return;
        }
        if (err) {
          this.$toast({
            type: 'fail',
            message: err.message,
          })
          return;
        }
        this.$toast({
          type: 'success',
          message: 'Success'
        })
        this.getMine = false;
        setTimeout(() => {
          this.handleGetMine();
        }, 2000);
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.marketsComp{
  font-size: 28px;
  text-align: left;
  .claimBtn{
    height: 90px;
    font-size: 32px;
    border-radius: 12px;
    background: $color-main;
    color: #FFF;
    padding: 0 36px;
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
    .item{
      .coin{
        color: #000;
        margin-bottom: 20px;
      }
      .logo{
        min-width: 52px;
        width: 52px;
        height: 52px;
        margin-right: 15px;
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
      }
    }
  }
}
</style>
