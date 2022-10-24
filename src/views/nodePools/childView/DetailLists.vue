<template>
  <div class="detail">
    <div class="title">
      <span class="act">{{ $t('sys.coinLpPool', {coin: `${lpPool.symbol0}/${lpPool.symbol1}`}) }}</span>
    </div>
    <div class="lpList">
      <TagRewardInfo :total="accLpData.showReward" @listenUpdate="handleClaim"/>
      <div class="marketInfo">
        <div class="coinInfo flexb">
          <div class="flexa">
            <img class="logo" :src="lpPool.imgUrl0" >
            <div>
              <div class="coinName">{{ lpPool.symbol0 }}</div>
              <div class="contract tip">{{ lpPool.contract0 }}</div>
            </div>
          </div>
          <img class="addImg" src="https://storied-crepe-e5e65c.netlify.app/svg/add.svg">
          <div class="flexa">
            <img class="logo" :src="lpPool.imgUrl1" >
            <div>
              <div class="coinName">{{ lpPool.symbol1 }}</div>
              <div class="contract tip">{{ lpPool.contract1 }}</div>
            </div>
          </div>
        </div>
        <div class="apy flexa">
          <span>{{ $t('apy.title') }}：</span>
          <span class="dinBold num">{{ apy }}%</span>
          <span class="green" @click="showApyDetail = true">{{ $t('public.detail') }}></span>
        </div>
        <div class="liq dinReg">
          {{ $t('dex.pools') }}：{{ lpPool.reserve0 }} / {{ lpPool.reserve1 }}
        </div>
      </div>
    </div>

    <div class="title flexb">
      <span class="act">{{ $t('nodePools.minerLists') }}</span>
      <span class="tip count">{{ $t('nodePools.allMinerNum') }}：{{allLists.length}}</span>
    </div>
    <div class="lists">
      <template v-for="(item, index) in lists">
        <div class="mineList" :class="{'page1': page === 1}" :key="index">
          <div class="flexb mb10">
            <span>{{ item.owner }}</span>
            <span class="flexa">
              <span>{{ $t('mine.earnings') }}：{{ item.showReward || '0.00000000' }} {{ pool.sym }}</span>
            </span>
          </div>
          <div class="flexb">
            <span>{{ $t('nodePools.allRes') }}</span>
            <span>{{ item.sym0 || '0.0000' }} {{lpPool.symbol0}} / {{ item.sym1 || '0.0000'}} {{lpPool.symbol1}}</span>
          </div>
          <!-- <label class="rankImg" v-if="page === 1 && index < 3"><img :src="`https://storied-crepe-e5e65c.netlify.app/rank/rank${index + 1}.png`" alt=""></label> -->
        </div>
      </template>

      <el-pagination
        v-if="allLists.length"
        class="pagination"
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :current-page.sync="page"
        :page-size="pageSize"
        :total="allLists.length">
      </el-pagination>
    </div>


    <el-dialog
      class="myDialog"
      :show-close="false"
      :visible.sync="showSure">
      <SureTip v-if="showSure" :params="params"
        @handleSure="handleSure" @handleClose="handleClose"/>
    </el-dialog>

    <van-popup
      class="popup_p"
      v-model="showApyDetail">
      <MarketApy :countApy="apy" :isActual="true"
                 :aprInfo="aprInfo"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import moment from 'moment';

import { get_balance, get_farmers_lists} from '@/utils/api'
import { getCoin, toLocalTime, toFixed } from '@/utils/public'
import { getAccVote, getReward, getLpReward } from '../js/nodePools'
import { sellToken } from '@/utils/logic';

import SureTip from '@/views/farms/dialog/SureTip';
import MarketApy from '@/views/market/popup/MarketApy'
import TagRewardInfo from '@/views/nodePools/childView/TagRewardInfo'

export default {
  name: 'mineLists',
  components: {
    SureTip, MarketApy, TagRewardInfo
  },
  data() {
    return {
      allLists: [],
      lists: [],
      type: 'rex', // rex ｜ lp
      sym: 'eosio.token-eos', // 合约-Token ｜ mid
      rSymbol: 'EOS',
      pool: {},
      accVoteData: {},

      page: 1,
      pageSize: 20,
      poolsTimer: null,
      rewardTimer: null,
      runTimer: null,
      listTimer: null,
      listRunTimer: null,
      poolsLists: [],


      // Lp参数
      planRank: 30,
      lpPool: {
        sym1Data:{}
      },
      accLpData: {},
      lpTimer: null,
      lpRunTimer: null,
      bal0: '0.0000',
      bal1: '0.0000',
      showSure: false,
      params: {},


      apy: '0.00',
      aprInfo: {},
      showApyDetail: false,
    }
  },
  mounted() {
    this.type = this.$route.params.type;
    this.sym = this.$route.params.sym;
    if (this.type === 'rex') {
      this.rSymbol = this.sym.split('-')[1].toUpperCase();
    }
    this.handleGetThisPools()
    this.handleGetApy()
  },
  beforeDestroy() {
    clearTimeout(this.poolsTimer)
    clearTimeout(this.rewardTimer)
    clearInterval(this.runTimer)
    clearTimeout(this.listTimer)
    clearInterval(this.listRunTimer);

    // LpTimer
    clearTimeout(this.lpTimer)
    clearInterval(this.lpRunTimer)
  },
  watch: {
    filterMkLists: {
      handler: function mls(newVal, oldVal) {
        if (oldVal && oldVal.length === newVal.length) {
          return
        }
        if (this.type === 'rex') {
          this.handleDealAccReward(this.accVoteData)
          this.handleListReward()
          return
        }
        this.handleGetLpInfo()
      },
      deep: true,
      immediate: true,
    },
    account: {
      handler: function st(newVal) {
        if (newVal.name) {
          this.handleGetAccVote()

          this.handleGetRank()
          this.handleStartTimer()
          // this.handleGetAccLpData();
        }
      },
      deep: true,
      immediate: true,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      baseConfig: state => state.sys.baseConfig,
      filterMkLists: state => state.sys.filterMkLists,
      marketLists: state => state.sys.marketLists,
      poolsTagBal: state => state.sys.poolsTagBal,
      marketLists2: state => state.config.marketLists,
    }),
    addBuff() {
      let buff = (this.accLpData.weight || 1) - 1;
      buff = buff * 100;
      return buff.toFixed(2)
    }
  },
  methods: {
    async handleGetApy() {
      const info = this.marketLists2.find(v => v.mid == this.$route.params.sym) || {}
      this.apy = parseFloat(info.apy || 0).toFixed(2);
      this.aprInfo = info.apy_detail

      // const params = {
      //   mid: this.$route.params.sym
      // };
      // const {status, result} = await this.$api.get_market_info(params)
      // if (!status) {
      //   return
      // }
      // this.apy = parseFloat(result.apy || 0).toFixed(2);
      // this.aprInfo = result.apy_detail
    },
    handleClaim() {
      if (!this.account || !this.account.name || this.claim) {
        return
      }
      this.claim = true;
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: []
      }
      const lpAction = {
        account: this.baseConfig.nodeMiner,
        name: 'claim',
        authorization: [{ 
          actor: formName,
          permission,
        }],
        data: {
          user: formName,
          mid: this.$route.params.sym
        },
      }
      params.actions.push(lpAction)
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
      })
    },

    handleDealMyLpNum(v) {
      if (!v) {
        return
      }
      const lpNum = this.accLpData || {};
      const num0 = `${Number(lpNum.sym0 || 0).toFixed(4)} ${v.symbol0}`
      const num1 = `${Number(lpNum.sym1 || 0).toFixed(4)} ${v.symbol1}`
      let numStr = `${num0}/${num1}`
      return numStr
    },
    handleDealReserve(reserve) {
      if (!reserve) {
        return `0.0000`
      }
      const arr = reserve.split(' ');
      return `${Number(arr[0]).toFixed(4)} ${arr[1]}`
    },
    handleClose() {
      this.showSure = false;
    },
    handleGetThisPools() {
      if (this.type === 'rex') {
        this.handleGetPools(); // 获取矿池APR
        this.handleGetRexPoolListApi(); // 获取rex矿工列表
        return
      }
      this.handleGetLpPoolsBal();
      this.handleGetLpInfo()
    },
    handleCurrentChange() {
      const start = (this.page - 1) * this.pageSize;
      const end = this.page * this.pageSize;
      this.lists = this.allLists.slice(start, end);
      if (this.type === 'rex') {
        this.handleListReward()
      }
    },

    // REX 矿池处理
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
      // console.log(result)
      if (!status) {
        return
      }
      const contract = this.sym.split('-')[0];
      const lists = result.rows || [];
      lists.forEach(v => {
        const arr = v.sym.split(',');
        const decimal = arr[0];
        const sym = arr[1];
        const imgUrl = getCoin(v.contract, sym)
        const apy = (Math.pow(v.aprs, 86400 * 365) - 1) * 100;
        v.decimal = decimal;
        v.sym = sym;
        v.imgUrl = imgUrl;
        v.apy = apy.toFixed(2)
        if (contract === v.contract) {
          this.pool = v;
        }
      });
      this.poolsLists = lists;
      this.handleGetLpPoolBal();
    },
    // 获取池子余额
    async handleGetLpPoolBal() {
      const v = this.pool;
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
      this.$set(this.pool, 'bal', result)
    },
    // 获取用户挖矿数据
    async handleGetAccVote() {
      if (!this.account || !this.account.name) {
        return
      }
      getAccVote((accVoteData) => {
        this.accVoteData = accVoteData;
        this.handleDealAccReward(this.accVoteData)
      })
    },
    handleDealAccReward(accVoteData) {
      if (!this.filterMkLists.length || !accVoteData.isfarmer) {
        return;
      }
      const baseData = this.pool;
      const accData = {
        accNum: accVoteData.eosNum,
        last_drip: accVoteData.last_drip,
      }
      const reward = getReward(baseData, accData);
      this.$set(this.accVoteData, 'accReward', reward.toFixed(8))
      // console.log(reward)
      clearTimeout(this.rewardTimer)
      this.rewardTimer = setTimeout(() => {
        this.handleDealAccReward(accVoteData)
      }, 1000);
      this.handleRun()
    },
    // 数据滚动
    handleRun() {
      clearInterval(this.runTimer)
      this.runTimer = setInterval(() => {
        const accReward = this.accVoteData.accReward || 0;
        const showReward = this.accVoteData.showReward || accReward;
        let tReward = this.accVoteData.tReward || showReward;
        const t = (accReward - showReward) / 50
        tReward = Number(tReward) + Number(t);
        if (tReward > accReward) {
          tReward = accReward
        }
        this.$set(this.accVoteData, 'showReward', Number(tReward).toFixed(8))
        this.$set(this.accVoteData, 'tReward', Number(tReward))
      }, 20);
    },
    async handleGetRexPoolListApi() {
      const {status, result} = await get_farmers_lists()
      if (!status) {
        this.handleGetRexPoolList()
        return
      }
      const rows = result.farmers || [];
      rows.forEach(v => {
        const stakeEos = v.staked / 10000;
        this.$set(v, 'stakeEos', stakeEos.toFixed(4))
      });
      this.allLists = rows;
      this.lists = rows.slice(0, this.pageSize);
      this.handleListReward()
    },
    async handleGetRexPoolList() {
      const params = {
        "code": this.baseConfig.nodeMiner,
        "scope": this.baseConfig.nodeMiner,
        "table": "farmers",
        "json":true,
        "index_position": 2,
        "key_type": "i64",
        "limit": 3000,
        "reverse": true
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const rows = result.rows || [];
      rows.forEach(v => {
        const stakeEos = v.staked / 10000;
        this.$set(v, 'stakeEos', stakeEos.toFixed(4))
      });
      this.allLists = rows;
      this.lists = rows.slice(0, this.pageSize);
      this.handleListReward()
    },
    // 当前页面列表数据滚动
    handleListReward() {
      if (!this.filterMkLists.length || !this.lists.length) {
        return;
      }
      this.lists.forEach(v => {
        const baseData = this.pool;
        const accData = {
          accNum: v.stakeEos,
          last_drip: v.last_drip,
        }
        const reward = getReward(baseData, accData);
        this.$set(v, 'accReward', reward.toFixed(8))
      })
      clearTimeout(this.listTimer)
      this.listTimer = setTimeout(() => {
        this.handleListReward();
      }, 1000);
      this.handleRunLists()
    },
    // 当页列表数据滚动
    handleRunLists() {
      clearInterval(this.listRunTimer);
      this.listRunTimer = setInterval(() => {
        this.lists.forEach(v => {
          const accReward = v.accReward || 0;
          const showReward = v.showReward || accReward;
          let tReward = v.tReward || showReward;
          const t = (accReward - showReward) / 50
          tReward = Number(tReward) + Number(t);
          if (tReward > accReward) {
            tReward = accReward
          }
          this.$set(v, 'showReward', Number(tReward).toFixed(8))
          this.$set(v, 'tReward', Number(tReward))
        })
      }, 20);
    },

    // LP矿池处理
    handleGetLpInfo() {
      if (!this.filterMkLists.length) {
        return
      }
      const market = this.marketLists.find(v => v.mid == this.sym);
      // console.log(market)
      this.lpPool = Object.assign({}, this.lpPool, market);
      this.handleGetLpReward()
      this.handleGetLpApy();
      this.handleGetLpMinersLists()
    },
    // 获取LP矿池余额
    async handleGetLpPoolsBal() {
      const params = {
        code: this.baseConfig.nodeToken,
        symbol: 'TAG',
        decimal: 8,
        account: this.baseConfig.lpPools,
      }
      const {status, result} = await get_balance(params);
      if (!status) {
        return
      }
      // console.log(result)
      this.$set(this.lpPool, 'bal', parseFloat(result))
      this.handleGetLpReward()
      this.handleGetLpApy();
      this.handleLpListsReward();
    },
    // 获取用户挖矿数据
    async handleGetAccLpData() {
      const formName = this.account.name;
      const params = {
        "code": this.baseConfig.nodeMiner,
        "scope": this.sym,
        "table": "miners",
        "json":true,
        "lower_bound": ` ${formName}`,
        "upper_bound": ` ${formName}`,
      }
      const {status, result} = await this.$api.get_table_rows(params)
      if (!status) {
        return
      }
      if (!result.rows.length) {
        return
      }
      const rows = result.rows[0]
      const market = this.lpLists.find(v => v.mid === this.sym);
      const inData = {
        poolSym0: market.reserve0.split(' ')[0],
        poolSym1: market.reserve1.split(' ')[0],
        poolToken: market.liquidity_token,
        sellToken: Math.abs(rows.token)
      }
      const marketData = sellToken(inData)
      rows.market0 = marketData.getNum1;
      rows.market1 = marketData.getNum2;
      this.accLpData = Object.assign({}, this.accLpData, rows)
      // console.log(this.accLpData)
      this.handleGetLpReward()
    },
    // 获取挖矿列表
    async handleGetLpMinersLists() {
      const params = {
        "code": this.baseConfig.nodeMiner,
        "scope": this.sym,
        "table":"miners",
        "json":true,
        "index_position": 2,
        "key_type": "i64",
        "limit": 2000,
        "reverse": false
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const inData = {
        poolSym0: this.lpPool.reserve0.split(' ')[0],
        poolSym1: this.lpPool.reserve1.split(' ')[0],
        poolToken: this.lpPool.liquidity_token,
        // sellToken: Math.abs(tToken)
      }
      // console.log(inData)
      const rows = result.rows || [];
      rows.forEach((v, index) => {
        v.rank = index + 1;
        v.owner = v.miner;
        inData.sellToken = v.token;
        const marketNum = sellToken(inData)
        v.sym0 = marketNum.getNum1.toFixed(this.lpPool.decimal0)
        v.sym1 = marketNum.getNum2.toFixed(this.lpPool.decimal1)
        // if (index < 30) {
        //   v.weight = 1.3
        //   v.addBuff = 30
        // } else if (index < 60) {
        //   v.weight = 1.2
        //   v.addBuff = 20
        // } else if (index < 100) {
        //   v.weight = 1.1
        //   v.addBuff = 10
        // } else {
          v.weight = 1
        // }
      })
      // console.log(rows)
      this.allLists = rows;
      this.lists = rows.slice(0, this.pageSize);
      this.handleGetRank()
      this.handleLpListsReward()
    },
    // 获取用户排名
    handleGetRank() {
      if (!this.allLists.length || !this.account || !this.account.name) {
        return
      }
      const formName = this.account.name;
      const miner = this.allLists.find(v => v.miner === formName) || {};
      this.accLpData = Object.assign({}, this.accLpData, miner)
      this.$forceUpdate()
      // console.log(this.accLpData)
      this.handleGetLpReward();
    },
    // 用户收益计算
    handleGetLpReward() {
      if (!this.accLpData.token || !this.lpPool.bal || !this.lpPool.liquidity_token) {
        return
      }
      const allTagNum = this.handleAllLpTagNum()
      const tagNum = this.lpPool.contract1 === "tagtokenmain" ? parseFloat(this.accLpData.sym1) : parseFloat(this.accLpData.sym0)
      const rate = tagNum / allTagNum;
      const lpBal = this.lpPool.bal;
      const weight = 1;
      const nowT = moment().valueOf()
      let lastT = toLocalTime(`${this.accLpData.last_drip}.000+0000`).replace(/-/g, '/')
      lastT = moment(lastT).valueOf()
      let t = (nowT - lastT) / 1000 ;
      const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
      this.$set(this.accLpData, 'accLpReward', reward.toFixed(8))
      // console.log(reward)
      // 定时器
      clearTimeout(this.lpTimer)
      this.lpTimer = setTimeout(() => {
        this.handleGetLpReward();
      }, 1000);
      // LP数据滚动
      this.handleRunLp()
    },
    // 获取LP池子的总TAG数量
    handleAllLpTagNum() {
      return this.poolsTagBal;
    },
    handleRunLp() {
      clearInterval(this.lpRunTimer)
      this.lpRunTimer = setInterval(() => {
        const accLpReward = this.accLpData.accLpReward || 0;
        const showReward = this.accLpData.showReward || accLpReward;
        
        let tReward = this.accLpData.tReward || showReward;
        const t = this.accLpData.t  || ((accLpReward - showReward) / 50)
        tReward = Number(tReward) + Number(t);
        if (tReward > accLpReward) {
          tReward = accLpReward
        }
        // console.log(tReward, accLpReward, t)
        this.$set(this.accLpData, 'showReward', Number(tReward).toFixed(8))
        this.$set(this.accLpData, 'tReward', Number(tReward))
        this.$set(this.accLpData, 't', t)
      }, 20);
    },
    // 计算LP年化
    handleGetLpApy() {
      if (!this.lpPool.bal || !this.lpPool.reserve0) {
        return
      }
      const allTagNum = this.handleAllLpTagNum()
      // const tagNum = this.lpPool.contract1 === "tagtokenmain" ? parseFloat(this.lpPool.reserve1) : parseFloat(this.lpPool.reserve0)
      // const otherNum = this.lpPool.contract1 === "tagtokenmain" ? parseFloat(this.lpPool.reserve0) : parseFloat(this.lpPool.reserve1)
      // const price = otherNum / tagNum;
      const num = 0.1;
      const rate = num / allTagNum;
      const lpBal = this.lpPool.bal;
      const weight = 1;
      const t = 86400 * 365;
      const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
      
      const apy = reward / num * 100;
      // console.log(apy.toFixed(2))
      this.$set(this.lpPool, 'apy', apy.toFixed(2))
    },
    // Lp列表数据获取
    handleLpListsReward() {
      if (!this.lpPool.bal || !this.lpPool.liquidity_token) {
        return;
      }
      const allTag = this.handleAllLpTagNum()
      this.$set(this.lpPool, 'allTag', allTag);
      this.lists.forEach(v => {
        const reward = getLpReward(this.lpPool, v)
        this.$set(v, 'accReward', reward)
        // console.log(reward)
      });
      clearTimeout(this.listTimer)
      this.listTimer = setTimeout(() => {
        this.handleLpListsReward()
      }, 1000)
      this.handleRunLists();
    },
    
    // 计算相差多少
    handleDealToken() {
      if (!this.allLists.length || !this.lpPool.liquidity_token) {
        return 
      }
      const market = this.lpPool;
      // console.log(market)
      const setRank = Number(this.planRank);
      const rank75 = this.allLists[setRank - 1];
      // console.log(rank75)
      const uLp = this.accLpData || {};
      const tToken = parseInt(rank75.token) - parseInt(uLp.token || 0)
      const inData = {
        poolSym0: market.reserve0.split(' ')[0],
        poolSym1: market.reserve1.split(' ')[0],
        poolToken: market.liquidity_token,
        sellToken: Math.abs(tToken)
      }
      const out = sellToken(inData)
      const pay0 = toFixed(out.getNum1, market.decimal0)
      const pay1 = toFixed(out.getNum2, market.decimal1)
      const params = {
        market,
        pay0,
        pay1,
        token: tToken,
        bal0: this.bal0,
        bal1: this.bal1,
        planRank: this.planRank,
      }
      this.params = params;
      this.showSure = true;
      // console.log(this.params)
    },
    handleSure() {
      localStorage.setItem(`node_lp`, this.planRank)
      setTimeout(() => {
        this.handleGetThisPools()
      }, 1000);
      setTimeout(() => {
        this.handleGetThisPools()
      }, 3000);
    },

    handleStartTimer() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.handleStartTimer()
      }, 5000);
      this.handleGetBal('bal0')
      this.handleGetBal('bal1')
    },
    async handleGetBal(type = 'bal0') {
      if (!this.account || !this.account.name || !this.lpPool.liquidity_token) {
        return
      }
      const v = this.lpPool;
      let params = {
        code: v.contract0,
        symbol: v.symbol0,
        decimal: v.decimal0,
        account: this.account.name,
      }
      if (type !== 'bal0') {
        params = {
          code: v.contract1,
          symbol: v.symbol1,
          decimal: v.decimal1,
          account: this.account.name,
        }
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result.split(' ')[0];
      type === 'bal0' ? this.bal0 = bal : this.bal1 = bal;
    },
  }
}
</script>

<style lang="scss" scoped>
.detail{
  padding: 0 26px;
  font-size: 27px;
}
.title{
  font-size: 32px;
  text-align: left;
  margin: 0 0 20px;
  .count{
    font-size: 24px;
  }
  .act{
    color: #333;
    position: relative;
    padding-left: 28px;
    &::before{
      content: '';
      position: absolute;
      width: 8px;
      height: 30px;
      background:rgba(2,198,152,1);
      border-radius:4px;
      top: 50%;
      left: 0;
      transform: translateY(-45%);
    }
  }
}

.lpList{
  position: relative;
  .marketInfo{
    text-align: left;
    padding: 28px;
    border-radius: 12px;
    margin: 30px 0;
    box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
    .coinInfo{
      margin-bottom: 20px;
      .logo{
        width: 70px;
        height: 70px;
        margin-right: 12px;
      }
      .coinName{
        font-size: 32px;
      }.contract{
        font-size: 24px;
      }
      .addImg{
        width: 30px;
      }
    }
    .apy{
      margin-bottom: 16px;
      font-size: 28px;
      .num{
        font-size: 30px;
      }
      .green{
        color: $color-main;
        margin-left: 15px;
      }
    }
    .liq{
      color: #000;
    }
  }
  .reward{
    margin: 14px 0;
  }
  .myRank{
    margin-top: 15px;
    // border-top: 1px solid #eee;
  }
}
.list{
  font-size: 27px;
  position: relative;
  z-index: 1;
  background: #FFF;
  border: 1px solid #eee;
  padding: 20px 26px;
  border-radius: 12px;
  text-align: left;
  margin-bottom: 20px;
  .poolInfo{
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    .bal{
      flex: 1;
    }
    .coinImg{
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .num{
      font-size: 50px;
    }
    .apy{
      color: #333;
    }
  }
}
.buffImg{
  width: 25px;
}
.lists{
  margin-bottom: 30px;
}
.mineList{
  margin-top: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  &>div{
    padding: 20px;
    position: relative;
    z-index: 1;
    background: #FFF;
    border-radius: 30px;

    &:nth-child(1) {
      padding-bottom: 0;;
    }
    &:nth-child(2) {
      padding-top: 0;;
    }
  }
  .mb10{
    margin-bottom: 10px;
  }
}

.pagination{
  text-align: right;
  margin-top: 20px;
  font-size: 26px;
  :deep(.el-pager) {
    li.active{
      color: #07D79B;
    }
    li:hover{
      color: #07D79B;
    }
    li{
      font-size: 26px;
    }
  }
  :deep(.btn-prev), :deep(.btn-next) {
    &:hover {
      color: #07D79B;
    }
    .el-icon-arrow-left, .el-icon-arrow-right{
      font-size: 26px;
    }
  }
}

:deep(.el-input-number) {
  overflow: hidden;
  position: relative;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  .el-input-number__decrease,
  .el-input-number__increase{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    width: 50px;
    box-sizing: border-box;
    font-size: 24px;
  }
  .el-input{
    font-size: 27px;
    .el-input__inner{
      height: 60px;
    }
  }
}
:deep(.el-slider__runway){
  margin: 30px 0;
  .el-slider__button-wrapper{
    height: 60px;
    width: 60px;
    top: -25px;
    .el-slider__button{
      height: 30px;
      width: 30px;
    }
  }
}
.myDialog{
  :deep(.el-dialog) {
    position: relative;
    margin: auto;
    width: 590px;
    border-radius: 20px;
    .el-dialog__body,
    .el-dialog__header{
      padding: 0;
    }
  }
}
</style>
