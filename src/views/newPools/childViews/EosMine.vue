<template>
  <div class="detail">
    <div class="title">
      <span class="act">{{ `${lpPool.symbol0}/${lpPool.symbol1}` }}</span>
    </div>
    <div class="reward flexb">
      <div>
        <div>{{ $t('mine.mineBonus') }}</div>
        <div class="flexa green">
          <span class="dinBold rdNum">
            <!-- {{ total }} -->
            <CountTo :start-val='oldReward'
              :end-val='reward' :duration='1500'
              :decimals="4" :separator="','" 
              :prefix="''" :suffix="''" 
              :autoplay="true"/>
          </span>
          <span class="coin dinReg">EOS</span>
        </div>
        <div class="tip dinReg">≈${{ aboutPrice }}</div>
      </div>
      <div class="claim flexa">
        <div class="myLoading flexc" v-if="isClaim"><van-loading type="spinner" color="#29D4B0"/></div>
        <div class="btn flexc" @click="handleClaim">{{ $t('mine.claimAll') }}</div>
      </div>
    </div>

    <div class="marketInfo">
      <div class="coinInfo flexb">
        <div class="flexa">
          <img class="logo" :src="lpPool.imgUrl0" >
          <div>
            <div class="coinName">{{ lpPool.symbol0 }}</div>
            <div class="contract tip">{{ lpPool.contract0 }}</div>
          </div>
        </div>
        <img class="addImg" src="https://resource1.dfs.land/svg/add.svg">
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

    <MinerLists :lpPool="lpPool" :poolsBal="poolsBal" :swapBal="swapBal + ''"/>


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
import moment from 'moment';
import { mapState } from 'vuex';
import { toLocalTime } from '@/utils/public';
import { sellToken } from '@/utils/logic';
import { getReward } from '@/views/dfsMine/dfsMine'
import CountTo from 'vue-count-to'
import MinerLists from './MinerLists'
import MarketApy from '@/views/market/popup/MarketApy'

export default {
  name: 'eosMine',
  components: {
    CountTo, MinerLists, MarketApy
  },
  data() {
    return {
      showApyDetail: false,
      oldReward: 0,
      reward: 0,
      lpPool: {
        symbol0: 'EOS',
        symbol1: 'USDT',
      },
      mid: 17,
      swapBal: '0.0000', // swap 池子中EOS的数量
      poolsBal: '0.0000', // 分配池 中EOS的数量
      minnerData: {},
      timer: null,
      isClaim: false,
    }
  },
  created() {
    this.mid = this.$route.params.mid;
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      coinPrices: (state) => state.sys.coinPrices,
      filterMkLists: state => state.sys.filterMkLists,
      marketLists2: state => state.config.marketLists,
    }),
    aboutPrice() {
      const dfsPriceObj = this.coinPrices.find(v => v.coin === 'EOS');
      const dfsPrice = dfsPriceObj.price;
      const about = parseFloat(this.total || 0) * parseFloat(dfsPrice || 0);
      return parseFloat(about || 0).toFixed(2)
    },
    apy() {
      const info = this.marketLists2.find(v => v.mid == this.$route.params.mid) || {}
      return parseFloat(info.apy || 0).toFixed(2);
      // const num = 1;
      // const rate = num / this.swapBal;
      // const lpBal = this.poolsBal;
      // const t = 86400 * 365;
      // const weight = 1
      // const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
      // const apy = reward / num * 100
      // return parseFloat(apy || 0).toFixed(2)
    },
    aprInfo() {
      const info = this.marketLists2.find(v => v.mid == this.$route.params.mid) || {}
      return info.apy_detail
    }
  },
  watch: {
    filterMkLists: {
      handler: function mls(newVal, oldVal) {
        if (oldVal && oldVal.length === newVal.length) {
          return
        }
        this.handleGetLpInfo()
      },
      deep: true,
      immediate: true,
    },
    account: {
      handler: function at(newVal) {
        if (newVal.name) {
          this.handleGetLiqs()
        }
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    handleClaim() {
      if (!this.account || !this.account.name || this.isClaim) {
        return
      }
      if (this.reward < 0.0001) {
        this.$toast(this.$t('public.minLess', {coin: 'EOS'}))
        return
      }
      this.isClaim = true;
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: []
      }
      const actions = {
        account: 'miningpool11',
        name: 'claim2',
        authorization: [{
          actor: formName, // 转账者
          permission,
        }],
        data: {
          user: formName,
          mid: this.mid,
        }
      }
      params.actions.push(actions)
      DApp.toTransaction(params, (err) => {
        this.isClaim = false;
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
          this.handleGetLpInfo()
          this.handleGetLiqs()
        }, 1500);
      })
    },
    // LP矿池处理
    handleGetLpInfo() {
      if (!this.filterMkLists.length) {
        return
      }
      this.mid = this.$route.params.mid;
      const market = this.filterMkLists.find(v => v.mid == this.mid);
      this.lpPool = Object.assign({}, this.lpPool, market);
      this.handleGetBal()
      this.handleGetBalPools()
    },
    // 获取swap做市余额
    async handleGetBal() {
      const params = {
        code: 'eosio.token',
        symbol: 'EOS',
        decimal: 4,
        account: 'defisswapcnt'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      this.swapBal = parseFloat(bal);
    },
    // 获得待分发池子余额
    async handleGetBalPools() {
      const params = {
        code: 'eosio.token',
        symbol: 'EOS',
        decimal: 4,
        account: 'dfspool11111'
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result;
      this.poolsBal = parseFloat(bal) + ''
    },
    // 获取用户做市信息
    async handleGetLiqs() {
      const name = this.account.name;
      const params = {
        "code":"defislogsone",
        "scope": ` ${name}`,
        "table":"liqs2",
        "json":true,
        limit: 1000,
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const list = result.rows || [];
      const minerInfo = list.find(v => v.mid == this.mid);
      if (!minerInfo) {
        return
      }
      this.minnerData = Object.assign({}, this.minnerData, minerInfo)
      this.handleDealReward()
    },
    async handleDealReward() {
      const name = this.account.name;
      const params = {
        code: 'miningpool11',
        scope: this.mid,
        table: 'miners2',
        lower_bound: ` ${name}`,
        upper_bound: ` ${name}`,
        json: true,
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status || !result.rows.length) {
        return
      }
      const row = result.rows[0];
      const inData = {
        poolSym0: parseFloat(this.lpPool.reserve0 || 0),
        poolSym1: parseFloat(this.lpPool.reserve1 || 0),
        poolToken: this.lpPool.liquidity_token || 0,
        sellToken: `${row.token}`
      }
      const nowMarket = sellToken(inData);
      row.liq_bal0 = `${parseFloat(nowMarket.getNum1).toFixed(this.lpPool.decimal0)} ${this.lpPool.symbol0}`
      row.liq_bal1 = `${parseFloat(nowMarket.getNum2).toFixed(this.lpPool.decimal1)} ${this.lpPool.symbol1}`
      let lastTime = toLocalTime(`${row.last_drip}.000+0000`);
      row.lastTime = moment(lastTime).valueOf();
      this.minnerData = Object.assign({}, this.minnerData, row)
      this.handleGetReward()
    },
    handleGetReward() {
      clearTimeout(this.timer)
      if (!this.minnerData.token) {
        return
      }
      this.timer = setTimeout(() => {
        this.handleGetReward()
      }, 1000)
      let reward = 0
      const num = this.lpPool.contract0 === 'eosio.token' ? parseFloat(this.minnerData.liq_bal0) : parseFloat(this.minnerData.liq_bal1) 
      const reward0 = getReward({
        poolBal: this.poolsBal,
        swapBal: parseFloat(this.swapBal)
      }, {
        lastTime: this.minnerData.lastTime,
        num: num
      })
      reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
      this.oldReward = this.minnerData.reward || 0;
      this.$set(this.minnerData, 'reward', reward)
      this.reward = reward;
    }
  }
}
</script>

<style lang="scss" scoped>
.detail{
  padding: 0 26px;
  font-size: 27px;
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
  .reward{
    text-align: left;
    font-size: 32px;
    border-radius: 20px;
    padding: 32px 26px;
    box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
    .green{
      color: $color-main;
      font-size: 40px;
    }
    .rdNum{
      font-size: 60px;
      margin-right: 10px;
    }
    .coin{
      padding-top: 5px;
    }
    .claim{
      position: relative;
      .tipImg{
        width: 32px;
        margin-right: 15px;
      }
      .btn{
        color: #FFF;
        background: $color-main;
        border-radius: 9px;
        height: 92px;
        width: 200px;
      }
    }
  }
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
}
</style>