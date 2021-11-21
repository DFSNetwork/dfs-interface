<template>
  <div class="pool">
    <div class="banner">
      <img width="100%" src="https://cdn.jsdelivr.net/gh/defis-net/material/banner/nodePools.png">
    </div>
    <div class="main">
      <AccVote :accVoteData="accVoteData" @listenUpdata="handleGetAccVote"/>

      <div class="nodeInfo">
        <div class="title">{{ $t('nodePools.nodeInfo') }}</div>
        <div class="flexb">
          <div class="item">
            <div class="num din">{{ proxyData.eosNum }}</div>
            <div class="subTip">{{ $t('nodePools.allVote') }}（EOS）</div>
          </div>
          <div class="item">
            <div class="num din">{{ yearApr }}%</div>
            <div class="subTip">{{ $t('nodePools.apy') }}</div>
          </div>
        </div>
      </div>

      <div class="reward">
        <div class="title">{{ $t('nodePools.nodeReward') }}</div>
        <div class="flexs rInfo">
          <div>
            <div class="rItem" v-for="(v, index) in Object.keys(poolsData)" :key="index">
              <div class="din">{{ poolsData[v].showReward || '0.0000' }} <span class="small">{{ poolsData[v].sym }}</span></div>
              <div class="subTip">≈{{ poolsData[v].aboutEos || '0.0000' }} EOS</div>
            </div>
          </div>
          <div class="btn flexc" v-loading="claim" @click="handleClaimAll">领取收益</div>
        </div>
      </div>

      <div class="rules">
        <div>{{ $t('nodePools.mineRules1') }}</div>
        <div>{{ $t('nodePools.mineRules2') }}</div>
        <div>{{ $t('nodePools.mineRules3') }}</div>
        <div>{{ $t('nodePools.mineRules4') }}</div>
        <div>{{ $t('nodePools.mineRules5') }}</div>
      </div>

      <div class="nullDiv">
        <div class="btns flexb">
          <div class="btn flexc" @click="handleShow('sell')">{{ $t('nodePools.desVote') }}</div>
          <div class="btn add flexc" @click="handleShow('buy')">{{ $t('nodePools.addVote') }}</div>
        </div>
      </div>
    </div>


    <van-popup
      class="popup_p"
      v-model="showManage">
      <ManageVote v-if="showManage" :accVoteData="accVoteData" :showType="showType"
        @listenUpdata="handleGetAccVote"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';

import { mapState } from 'vuex';
import AccVote from '@/views/nodeVote/comp/AccVote'
import ManageVote from '@/views/nodePools/dialog/ManageVote'
import { getVoteWeight, getAccVote, getReward } from '../nodePools/js/nodePools'
import { getCoin } from '@/utils/public';
import { get_balance } from '@/utils/api'
export default {
  name: 'nodeVote',
  components: {
    AccVote, ManageVote
  },
  data() {
    return {
      accVoteData: {},
      voteWeight: 0,
      proxyData: {},
      poolsLists: [],
      poolsData: {},
      showType: 'buy',
      showManage: false,

      poolsTimer: null,
      runTimer: null,
      rewardTimer: null,
      claim: false,
    }
  },
  mounted() {
    this.handleGetNodeLists()
    this.handleGetProxy()
    this.handleGetPools()
  },
  beforeDestroy() {
    clearTimeout(this.poolsTimer)
    clearInterval(this.runTimer)
    clearTimeout(this.rewardTimer)
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      filterMkLists: state => state.sys.filterMkLists,
      marketLists: state => state.sys.marketLists,
      baseConfig: state => state.sys.baseConfig,
      poolsTagBal: state => state.sys.poolsTagBal,
    }),
    yearApr() {
      let apy = 0;
      const pools = this.poolsData;
      const keys = Object.keys(pools);
      keys.forEach((v, index) => {
        if (index >= 3) {
          return
        }
        apy = apy + parseFloat(pools[v].apy || 0)
      })
      return apy.toFixed(2)
    },
    // allReward() {
    //   let all = 0;
    //   const keys = Object.keys(this.poolsData);
    //   keys.forEach(v => {
    //     all += parseFloat(this.poolsData[v].aboutEos || 0)
    //   })
    //   return Number(all || 0).toFixed(4)
    // },
  },
  watch: {
    account: {
      handler: function at() {
        this.handleGetAccVote()
      },
      deep: true,
      immediate: true,
    },
    filterMkLists: {
      handler: function mls() {
        this.handleDealAccReward(this.accVoteData)
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    handleShow(type) {
      this.showType = type;
      this.showManage = true;
    },
    // 用户票数统计
    async handleGetAccVote() {
      if (!this.account || !this.account.name) {
        return
      }
      getAccVote((accVoteData) => {
        this.accVoteData = accVoteData;
        this.$forceUpdate()
        this.handleDealAccReward(this.accVoteData)
      })
    },
    // 获取代理账户信息
    async handleGetProxy() {
      const params = {
        "code":"eosio",
        "scope":"eosio",
        "table":"voters",
        "json":true,
        "lower_bound": "dfsbpsproxy1",
        "upper_bound": "dfsbpsproxy1",
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      this.proxyData = result.rows[0]
      this.hanldeDealNum();
    },
    // 计算票数
    hanldeDealNum() {
      if (!this.voteWeight || !Number(this.proxyData.last_vote_weight)) {
        return
      }
      const num = Number(this.proxyData.last_vote_weight) * this.voteWeight;
      this.$set(this.proxyData, 'eosNum', Math.ceil(num));
    },
    // 获取节点列表
    handleGetNodeLists() {
      const weight = getVoteWeight()
      this.voteWeight = weight;
      this.hanldeDealNum();
    },
    // 获取矿池列表
    async handleGetPools() {
      clearTimeout(this.poolsTimer)
      this.poolsTimer = setTimeout(() => {
        this.handleGetPools();
      }, 10000)
      const params = {
        "code":"dfsfundation",
        "scope":"dfsfundation",
        "table":"pools",
        "key_type": "float64",
        "index_position": 2,
        "json":true,
        "limit": 1000,
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const lists = result.rows || [];
      lists.forEach(v => {
        const arr = v.sym.split(',');
        const decimal = arr[0];
        const sym = arr[1];
        const imgUrl = getCoin(v.contract, sym)
        v.decimal = decimal;
        v.sym = sym;
        v.imgUrl = imgUrl;
      });
      this.poolsLists = lists.filter(v => v.mid === 602) || [];
      this.handleGetBal()
      this.handleDealApy()
    },
    handleGetBal() {
      this.poolsLists.forEach(async (v, i) => {
        if (this.poolsData[`${v.sym}-${v.mid}`]) {
          return
        }
        setTimeout(async () => {
          const params = {
            code: v.contract,
            symbol: v.sym,
            decimal: v.decimal,
            account: this.baseConfig.fundation,
          }
          const {status, result} = await get_balance(params);
          if (!status) {
            return
          }
          this.$set(this.poolsData, `${v.sym}-${v.mid}`, Object.assign({}, (this.poolsData[`${v.sym}-${v.mid}`] || v) , {bal: result}))
        }, i * 100);
      })
    },
    // 计算年化
    handleDealApy() {
      if (!this.poolsLists.length) {
        return;
      }
      this.poolsLists.forEach((list) => {
        const apy = (Math.pow(list.aprs, 86400 * 365) - 1) * 100;
        this.$set(list, 'apy', apy.toFixed(2));
      })
    },

    // 获取矿池价格
    handleGetPoolPrice(mid) {
      if (mid === 17) {
        return 1
      }
      const market = this.filterMkLists.find(v => v.mid == mid)
      if (!market) {
        return 0
      }
      return parseFloat(market.reserve0) / parseFloat(market.reserve1)
    },
    // 计算用户收益
    handleDealAccReward(accVoteData) {
      const keys = Object.keys(this.poolsData)
      if (!this.filterMkLists.length || !keys.length || !this.proxyData.eosNum || !accVoteData.isfarmer
       || accVoteData.showJoinBtn) {
        return;
      }
      const allEos = this.proxyData.eosNum; // 总票数
      const pools = this.poolsData;
      keys.forEach((v) => {
        // 计算年化
        const poolBal = parseFloat(pools[v].bal);
        const list = this.poolsLists.find(vv => `${vv.sym}-${vv.mid}` === v);
        const baseData = Object.assign({}, list, {
          allEos,
          poolBal,
        })
        const accData = {
          accNum: accVoteData.eosNum,
          last_drip: accVoteData.last_drip,
        }
        const reward = getReward(baseData, accData)
        const price = this.handleGetPoolPrice(list.mid)
        this.$set(this.poolsData[v], 'accReward', reward.toFixed(8));
        this.$set(this.poolsData[v], 'price', price);
      })
      this.handleRun()
      clearTimeout(this.rewardTimer)
      this.rewardTimer = setTimeout(() => {
        this.handleDealAccReward(accVoteData)
      }, 1000);
      this.$forceUpdate()
    },
    // 数据滚动
    handleRun() {
      clearInterval(this.runTimer)
      this.runTimer = setInterval(() => {
        this.poolsLists.forEach((pList, index) => {
          if (index >= 3) {
            return
          }
          const v = `${pList.sym}-${pList.mid}`; // ${v.sym}-${v.mid}
          if (!this.poolsData[v]) {
            return
          }
          const accReward = this.poolsData[v].accReward || 0;
          const showReward = this.poolsData[v].showReward || accReward;
          let tReward = this.poolsData[v].tReward || showReward;
          const t = (accReward - showReward) / 50
          tReward = Number(tReward) + Number(t);
          if (tReward > accReward) {
            tReward = accReward
          }
          const aboutEos = tReward * this.poolsData[v].price;
          this.$set(this.poolsData[v], 'aboutEos', Number(aboutEos || 0).toFixed(4))
          this.$set(this.poolsData[v], 'showReward', Number(tReward).toFixed(8))
          this.$set(this.poolsData[v], 'tReward', Number(tReward))
        })
      }, 20);
    },

    handleClaimAll() {
      if (!this.account || !this.account.name || this.claim) {
        return
      }
      this.claim = true;
      const formName = this.account.name;
      const permission = this.account.permissions;
      // const params = getClaimActions(this.accVoteData)
      const params = {
        actions: [
          { // 收获
            account: this.baseConfig.nodeMiner,
            name: 'harvest',
            authorization: [{ 
              actor: formName,
              permission,
            }],
            data: {
              farmer: formName,
            },
          }
        ]
      }
      DApp.toTransaction(params, (err) => {
        this.claim = false;
        if (err && err.code == 402) {
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
          message: this.$t('public.success'),
          type: 'success'
        });
        setTimeout(() => {
          // 查询代理账户数据
          this.handleGetAccVote()
        }, 1500);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pool{
  .banner{
    position: relative;
  }
  .main{
    z-index: 1;
    position: relative;
    padding: 40px;
    border-radius: 40px 40px 0px 0px;
    margin-top: -60px;
    background: #FFF;
  }
  .nodeInfo{
    color: #333;
    margin: 40px 0;
    border-radius: 20px;
    padding: 34px 24px;
    box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
    text-align: left;
    .title{
      font-size: 32px;
      margin-bottom: 20px;
    }
    .item{
      margin-right: 60px;
      flex: 1;
      &:last-child{
        margin-right: 0;
      }
    }
    .num{
      font-size: 42px;
    }
    .subTip{
      margin-top: 6px;
      color: $color-tip;
      font-size: 24px;
    }
  }
  .reward{
    color: #333;
    margin: 40px 0;
    border-radius: 20px;
    padding: 24px 24px;
    box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
    text-align: left;
    .title{
      font-size: 32px;
      margin-bottom: 10px;
    }
    .rInfo{
      justify-content: space-between;
      .btn{
        background: $color-main;
        border-radius: 12px;
        height: 80px;
        font-size: 32px;
        color: #FFF;
        width: 200px;
      }
      .rItem{
        color: $color-main;
        font-size: 50px;
        .small{
          font-size: 32px;
        }
        .subTip{
          margin-top: 6px;
          font-size: 26px;
          color: $color-tip;
        }
      }
    }
  }
  .rules{
    text-align: left;
    color: $color-tip;
    font-size: 26px;
    &>div{
      margin: 8px 0;
    }
  }
  .nullDiv{
    height: 150px;
    .btns{
      z-index: 1;
      position: fixed;
      bottom: 0px;
      left: 50%;
      transform: translate(-50%, 0);
      width: 100%;
      box-sizing: border-box;
      max-width: 750px;
      padding: 30px;
      background: #FFF;
      
      .btn{
        flex: 1;
        height: 90px;
        font-size: 36px;
        color: $color-main;
        border-radius: 12px;
        border: 1px solid $color-main;
        &.add{
          background: $color-main;
          color: #FFF;
          margin-left: 40px;
        }
      }
    }
  }
}
</style>