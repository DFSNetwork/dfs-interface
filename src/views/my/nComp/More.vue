<template>
  <div class="accCenterTools">
    <!-- 应用功能 -->
    <div class="tools">
      <div class="title flexb">
        <span @dblclick="handleClear">{{ $t('sys.dataAndServer') }}</span>
        <span class="tip" @click="handleClear">{{ $t('my.clear') }}</span>
      </div>
      <div class="lists flexa">
        <div class="list" @click="handleTo('history', {mid: 39})">
          <img class="icon big" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/swapHis.png" alt="">
          <div>{{ $t('sys.tradeHis') }}</div>
        </div>
        <div class="list" @click="handleTo('MarketHis', {mid: 39})">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/marketHis.png" alt="">
          <div>{{ $t('sys.marketHis') }}</div>
        </div>
        <div class="list" @click="handleTo('pddexOrder')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/order.png" alt="">
          <div>{{ $t('sys.myOrders') }}</div>
        </div>
        <div class="list" @click="handleTo('myMarketList')">
          <img class="icon big" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/myMarket.png" alt="">
          <div>{{ $t('sys.myMarkets') }}</div>
        </div>
      </div>
    </div>
    <!-- 游戏中心 -->
    <div class="tools">
      <div class="title">常用应用</div>
      <div class="lists flexa">
        <div class="list" @click="handleTo('mineHomeDfs')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/minedfstoken-dfs.png" alt="">
          <div>{{ $t('sys.coinPool', {coin: 'DFS'}) }}</div>
        </div>
        <div class="list" @click="handleTo('mineHomeTag')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/tagtokenmain-tag.png" alt="">
          <div>{{ $t('sys.coinPool', {coin: 'TAG'}) }}</div>
        </div>
        <div class="list" @click="handleTo('dssHomeDfs')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/dss.png" alt="">
          <div>DSS</div>
        </div>
        <div class="list" @click="handleToProject('dtoken')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/Graph@2x.png" alt="">
          <div>{{ $t('sys.dcap') }}</div>
        </div>
      </div>
    </div>

    <!-- 社区项目 -->
    <div class="tools">
      <div class="title">社区项目</div>
      <div class="lists flexa">
        <div class="list" @click="handleToProject('diary')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/note.png" alt="">
          <div>{{ $t('sys.diary') }}</div>
          <!-- <img class="beta hot" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/hot.png" alt=""> -->
        </div>
        <div class="list" @click="handleToProject('dfc')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/dfc1.png" alt="">
          <div>{{ $t('my.windmill') }}</div>
        </div>
        <div class="list" @click="handleToProject('kline')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/kline.png" alt="">
          <div>{{ $t('sys.kline') }}</div>
        </div>
        <div class="list" @click="handleToProject('eosdefi')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/djftokenmain-djf.png" alt="">
          <div>DJF</div>
        </div>
      </div>
      <div class="lists flexa">
        <div class="list" @click="handleToProject('usdx')">
          <img class="icon biger" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/usdx.png" alt="">
          <div>USDX</div>
        </div>
        <div class="list" @click="handleToProject('dfg')">
          <img class="icon biger" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/dfxtokenmain-dfg.png" alt="">
          <div>DFG</div>
        </div>
        <div class="list" @click="handleToProject('papaya')">
          <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/eos.v2.wei-papaya.png" alt="">
          <div>木瓜</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'accCenterTools',
  data() {
    return {
      showGovern: false,
      showDss: false,
    }
  },
  methods: {
    handleClear() {
      localStorage.clear();
      location.reload()
    },
    handleClick() {
      this.showGovern = false;
    },
    handleTo(name, params) {
      if (this.$route.name === name)  {
        return;
      }
      this.$router.push({
        name: name,
        params,
      })
    },
    handleToProject(name) {
      if (name === 'eosdefi') {
        location.href = 'http://eos-defi.sgxiang.com/'
        return
      }
      if (name === 'usdxVote') {
        location.href = 'https://usdx.defis.network/govern/usdc'
        return
      }
      if (name === 'usdx') {
        location.href = 'https://usdx.defis.network/'
        return
      }
      if (name === 'pdd') {
        location.href = 'https://pddfarm.defis.network/'
        return;
      }
      if (name === 'yfc') {
        location.href = 'https://yfc.one'
        return
      }
      if (name === 'yfcGuns') {
        location.href = 'https://yfc.one/guns'
        return
      }
      if (name === 'yfcDss') {
        location.href = 'https://yfc.one/vault'
        return
      }
      if (name === 'dbc') {
        location.href = 'https://dbc.yfc.one'
        return
      }
      if (name === 'eosdefi') {
        location.href = 'http://eos-defi.sgxiang.com/'
        return
      }
      if (name === 'totalData') {
        location.href = 'http://dfs-info.sgxiang.com'
      }
      if (name === 'kline') {
        location.href = 'https://dfs.defiview.io/kline'
      }
      if (name === 'dtoken') {
        location.href = 'https://dtoken.netlify.app/'
      }
      if (name === 'help') {
        location.href = 'https://dfsdefi.com/'
      }
      if (name === 'diary') {
        location.href = 'https://dfsfans.io/'
      }
      if (name === 'dfc') {
        location.href = 'https://dfsdefi.com/#/mine'
      }
      if (name === 'dfg') {
        location.href = 'https://dfgasc.netlify.app'
      }
      if (name === 'papaya') {
        location.href = 'http://v2.papaya.mobi'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.accCenterTools{
  color: #333;
  font-size: 24px;
  .tools{
    // margin: 28px;
    padding: 20px 28px 46px;
    background: #FFF;
    border-radius: 12px;
    border-bottom: 1px solid $color-border;
    // box-shadow: 0px 4px 8px 0px rgba(226,226,226,0.5);
    .title{
      font-size: 32px;
      text-align: left;
      font-weight: 500;
      .tip{
        font-size: 26px;
      }
    }
    .lists{
      margin-top: 30px;
      .list{
        flex: 1;
        width: 146px;
        max-width: 146px;
        margin-right: 18px;
        text-align: center;
        line-height: 34px;
        position: relative;
        &:last-child{
          margin-right: 0;
        }
        .beta{
          position: absolute;
          top: -15px;
          width: 58px;
          right: 8px;
          color: #FFF;
          font-weight: 300;
          &.hot{
            width: 48px;
            top: -10px;
            right: 12px;
          }
        }
        .icon{
          width: 42px;
          height: 42px;
          margin: auto;
          margin-bottom: 18px;
          display: block;
          &.big{
            width: 44px;
          }
          &.biger{
            width: 50px;
            height: 50px;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}

.myPopover{
  font-size: 28px;
  padding: 8px 26px;
  .item{
    height: 80px;
    border-bottom: 1px solid rgba(220,220,220, .3);
    &:last-child{
      border-bottom: 0;
    }
  }
}
</style>
