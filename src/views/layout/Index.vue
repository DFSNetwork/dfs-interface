<template>
  <div class="layout">
    <header-tools v-if="!$route.meta.noHeader" @listenShowNav="handleShowNav" @listenShowTools="handleShowTools"/>
    <!-- <acc-login v-if="showAcc && !$route.meta.noHeader"/> -->
    <transition name="fade" mode="out-in">
      <router-view class="content" @listenUpdateList="listenUpdateList"/>
    </transition>
    <my-footer v-show="$route.name === 'index'"/>

    <Tabbar v-if="!$route.meta.noTab"/>

    <!-- 弹窗 -->
    <Nav ref="nav" @listenShowComp="handleShowComp"/>
    <SlipPointTools ref="slipPointTools"/>
    <el-dialog
      class="mydialog"
      :visible.sync="showInvi">
      <invi-acc v-if="showInvi" />
    </el-dialog>
    <el-dialog
      class="nodeDialog"
      :show-close="false"
      :visible.sync="showNode">
      <NodeSet v-if="showNode" @listenClose="handleClose"/>
    </el-dialog>

    <warm-tip :showWarm="showWarm" @listenClose="handleClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import HeaderTools from '@/components/Header';
import MyFooter from '@/components/Footer';
// import Nav from '@/components/Nav';
import Nav from '@/views/layout/comp/More';
import SlipPointTools from '@/components/SlipPointTools';
import InviAcc from '@/components/InviAcc';
import NodeSet from '@/components/popup/NodeSet';
import WarmTip from '@/components/WarmTip';
import Tabbar from './comp/Tabbar';

import { get_acc_info, get_balance } from '@/utils/api';
import { dealMarketLists } from '@/utils/logic';
import { get_tag_lp_mids } from '@/utils/minerLogic';
import { fullScreen } from '@/utils/wallet/fullScreen';

import '@/utils/DfsMineData'

export default {
  name: 'layout',
  components: {
    HeaderTools,
    MyFooter,
    Nav,
    SlipPointTools,
    InviAcc,
    NodeSet,
    WarmTip,
    Tabbar,
  },
  data() {
    return {
      timer: null,
      topLists: [
        39
      ],
      showInvi: false,
      showNode: false,
      showWarm: false,
      tagTimer: null,

      // 价格定时器
      priceTimer: null,

      chainGet: false,
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
      mkFilterConf: state => state.config.mkFilterConf, // 基础配置 - 默认为{}
      marketLists: state => state.sys.marketLists,
    }),
    showAcc() {
      const showAcc = !this.$route.meta.noAcc;
      return showAcc
    }
  },
  watch: {
    account: {
      handler: function sc (newVal) {
        if (newVal.name) {
          get_acc_info(newVal.name)
          this.$api.get_acc_follow()
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.handleGetTagBal()
    this.handleRowsMarket();
    this.handleStartTimer();
    this.handleGetVotes()
    this.handleGetPrice()

    const fullType = parseInt(localStorage.getItem('setFullScreen') || 0)
    if (fullType === 1) {
      fullScreen(fullType)
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearTimeout(this.tagTimer)
    clearTimeout(this.priceTimer)
  },
  methods: {
    // 获取TAG LP 矿池列表
    async handleGetVotes() {
      get_tag_lp_mids()
      // console.log(this.$store.state.config.tagLpMids)
    },
    async handleGetTagBal() {
      clearTimeout(this.tagTimer)
      this.tagTimer = setTimeout(() => {
        this.handleGetTagBal()
      }, 10000);
      const params = {
        code: 'tagtokenmain',
        coin: 'TAG',
        decimal: 8,
        account: 'defisswapcnt'
      }
      const {status, result} = await get_balance(params);
      if (!status) {
        return
      }
      this.$store.dispatch('setPoolsTagBal', result.split(' ')[0])
    },
    handleClose() {
      this.showWarm = false;
      this.showNode = false;
    },
    handleShowComp(type) {
      if (type === 'invi') {
        this.showInvi = true;
      }
      if (type === 'node') {
        this.showNode = true
      }
      if (type === 'warn') {
        this.showWarm = true;
      }
      if (type === 'silderSet') {
        this.$refs.slipPointTools.showNav = true;
      }
    },
    handleShowNav() {
      this.$refs.nav.showNav = true;
    },
    handleShowTools() {
      this.$refs.slipPointTools.showNav = true;
    },
    handleStartTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.handleRowsMarket();
      }, 5000);
    },
    listenUpdateList() {
      this.handleRowsMarket();
    },
    // 获取做市池子
    handleRowsMarket1() {
      let i = 0;
      const max = 8;
      const limit = 200;
      for (i; i < max; i++) {
        const start = i * limit + 1;
        const end = (i + 1) * limit;
        this.handleGet(start, end)
      }
    },
    async handleGet(start, end) {
      const params = {
        code: "defisswapcnt",
        scope: "defisswapcnt",
        table: "markets",
        json: true,
        limit: 200,
        lower_bound: start,
        upper_bound: end,
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      this.handleMerge(result.rows)
    },
    async handleRowsMarket2() {
      let more = true;
      while(more) {
        const params = {
          code: "defisswapcnt",
          scope: "defisswapcnt",
          table: "markets",
          json: true,
          limit: -1,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        if (!status) {
          more = false;
          continue
        }
        more = result.more;
        const filter_markets = result.rows.filter(v => {
            if (['sars.run', 'smalldogedex', 'eosdogdogeos', 'okkkkkkkkkkk'].includes(v.contract0)) {
                return false
            }
            if (['sars.run', 'smalldogedex', 'eosdogdogeos', 'okkkkkkkkkkk'].includes(v.contract1)) {
                return false
            }
            return true
        })
        this.handleMerge(filter_markets)
      }
      // dealMarketLists(rows, this.topLists)
    },
    async handleRowsMarket() {
      try {
        const {status, result} = await this.$api.get_markets()
        if (!status) {
          this.handleRowsMarket2()
          return
        }
        dealMarketLists(result.rows, this.topLists)
      } catch (error) {
        this.handleRowsMarket2()
      }
    },
    handleMerge(newArr) {
      const nMks = JSON.parse(JSON.stringify(this.marketLists));
      newArr.forEach(v => {
        const hasIndex = nMks.findIndex(vv => vv.mid === v.mid);
        if (hasIndex === -1) {
          nMks.push(v)
          return
        }
        nMks.splice(hasIndex, 1, v)
      })
      dealMarketLists(nMks, this.topLists)
    },
    // 获取做市池子 - 链上查询
    async handleRowsMarketByChain() {
      let more = true;
      let next_key = '';
      let lists = [];
      this.chainGet = false;
      while(more) {
        const params = {
          code: "defisswapcnt",
          scope: "defisswapcnt",
          table: "markets",
          json: true,
          limit: 100,
          lower_bound: next_key,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        if (!status) {
          return
        }
        const rows = result.rows || [];
        lists.push(...rows)
        more = result.more;
        next_key = result.next_key;
      }
      this.chainGet = true;
      dealMarketLists(lists, this.topLists)
    },
    // 获取常用币种价格
    async handleGetPrice() {
      clearTimeout(this.priceTimer)
      this.priceTimer = setTimeout(() => {
        this.handleGetPrice()
      }, 1000 * 60 * 5);
      const {status, result} = await this.$api.get_price();
      if (!status) {
        return
      }
      this.$store.dispatch('setCoinPrices', result)
    }
  }
}
</script>

<style lang="scss" scoped>
/*iphone Xs Max*/
@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio:3){
  .layout{
    min-height: calc(100vh - 80px) !important;
  }
}
/*iphoneX、iphoneXs*/
@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) {
  .layout{
    min-height: calc(100vh - 80px) !important;
  }
}
.layout{
  width: 100%;
  margin: auto;
  position: relative;
  box-sizing: border-box;
  .mydialog,.nodeDialog{
    /deep/ .el-dialog{
      border-radius: 12px;
      width: 480px;
      margin-top: 15vh !important;
      .el-dialog__header{
        padding: 0;
      }
      .el-dialog__body{
        font-size: 26px;
        padding: 35px;
      }
    }
  }
  .nodeDialog{
    /deep/ .el-dialog{
      width: 680px;
      .el-dialog__body{
        font-size: 26px;
        padding: 0px;
      }
    }
  }
}

</style>