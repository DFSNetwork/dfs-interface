<template>
  <div class="swapInfo">
    <!-- TokenA 信息 -->
    <div class="tokenInfo">
      <div class="flexb bal">
        <span>余额: {{ balA }} {{ tokenA.symbol }}</span>
        <span>支付</span>
      </div>
      <div class="flexb token">
        <div class="flexa" @click="handleShowDrawer('start')">
          <img class="tokenLogo" :src="tokenA.imgUrl" :onerror="$errorImg">
          <div>
            <div class="name flexa">
              <span>{{ tokenA.symbol }}</span>
              <img class="selectImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/inverted.png">
            </div>
            <div class="contract tip">{{ tokenA.contract }}</div>
          </div>
        </div>
        <div class="iptDiv dinBold">
          <van-field class="ipt" v-model="pay" placeholder="0.0" />
        </div>
      </div>
    </div>

    <!-- 上下币种切换 -->
    <div class="exchange">
      <div class="border flexc" :class="{'payFocus': payFocus, 'getFocus': getFocus}">
        <img class="iconImg" src="https://cdn.jsdelivr.net/gh/defis-net/material/dex/switch_down.svg">
        <!-- <img class="iconImg" src="https://cdn.jsdelivr.net/gh/defis-net/material/dex/switch_up.svg"> -->
      </div>
    </div>

    <!-- TokenB 信息 -->
    <div class="tokenInfo">
      <div class="flexb bal">
        <span>余额: {{ balB }} {{ tokenB.symbol }}</span>
        <span>获取</span>
      </div>
      <div class="flexb token">
        <div class="flexa" @click="handleShowDrawer('end')">
          <img class="tokenLogo" :src="tokenB.imgUrl" :onerror="$errorImg">
          <div>
            <div class="name flexa">
              <span>{{ tokenB.symbol }}</span>
              <img class="selectImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/inverted.png">
            </div>
            <div class="contract tip">{{ tokenB.contract }}</div>
          </div>
        </div>
        <div class="iptDiv dinBold">
          <van-field class="ipt" v-model="get" placeholder="0.0" />
        </div>
      </div>
    </div>

    <!-- 当前价格 -->
    <div class="price flexb">
      <span class="tip">兑换比率</span>
      <span class="flexend din">
        <span v-if="!priceEX">1 {{ tokenB.symbol }} = 100.0000 {{ tokenA.symbol }}</span>
        <span v-else>1 {{ tokenA.symbol }} = 0.0010 {{ tokenB.symbol }}</span>
        <span class="flexa" @click="priceEX = !priceEX">
          <img class="iconImg small" v-if="priceEX" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/price_switch_icon_btn_left.svg" alt="">
          <img class="iconImg small" v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/price_switch_icon_btn_right.svg" alt="">
        </span>
      </span>
    </div>

    <!-- 交易按钮 -->
    <div class="btnDiv">
      <div class="btn flexc">兑换</div>
    </div>


    <van-popup
      class="newMarket"
      v-model="showMarketList"
      position="left">
      <MarketArea v-if="showMarketList"
        :marketLists="marketLists" :type="showType"
        @listenMarketChange="handleMarketChange"
        @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MarketArea from '@/components/MarketArea';

export default {
  name: 'swapInfo',
  components: {
    MarketArea,
  },
  data() {
    return {
      // 状态类变量
      priceEX: false,
      payFocus: false,
      getFocus: false,
      showMarketList: false,

      // 数据信息
      tokenA: {
        contract: 'eosio.token',
        symbol: 'EOS',
        decimal: '4',
        imgUrl: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/eosio.token-eos.svg',
      },
      tokenB: {
        contract: 'minedfstoken',
        symbol: 'DFS',
        decimal: '4',
        imgUrl: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/minedfstoken-dfs.png',
      },
      balA: '0.0000',
      balB: '0.0000',

      // 输入信息
      pay: '',
      get: '',
      showType: 'start', // end | start
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      slipPoint: state => state.app.slipPoint,
      baseConfig: state => state.sys.baseConfig,
      filterMkLists: state => state.sys.filterMkLists,
      marketLists: state => state.sys.marketLists,
      rSwitch: state => state.app.rSwitch,
    }),
  },
  methods: {
    handleClose() {
      this.showMarketList = false;
    },
    handleShowDrawer(type) {
      this.showType = type;
      this.showMarketList = true
    },
    handleMarketChange(item, type) {
      if (type === 'start') {
        this.tokenA = item;
      } else {
        this.tokenB = item;
      }
      this.pay = '';
      this.get = '';
      this.showMarketList = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.swapInfo{
  padding: 20px;
  font-size: 24px;
  text-align: left;
  .tokenInfo{
    border: 1px solid $color-border;
    border-radius: 20px;
    padding: 36px 20px;
    .bal{
      margin-bottom: 15px;
    }
    .token{
      .tokenLogo{
        width: 60px;
        height: 60px;
        border-radius: 30px;
        margin-right: 14px;
      }
      .name{
        font-size: 28px;
      }
      .selectImg{
        width: 28px;
        margin-left: 9px;
      }
      .iptDiv{
        flex: 1;
        .ipt{
          padding: 0 0 0 15px;
          /deep/ .van-field__control{
            font-size: 52px;
            text-align: right;
          }
        }
      }
    }
  }
  .exchange{
    height: 20px;
    position: relative;
    .border{
      width: 100px;
      height: 100px;
      border-radius: 50px;
      position: absolute;
      background: $color-bgcolor;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-image: url('https://cdn.jsdelivr.net/gh/defis-net/material/dex/enter_solid_default.svg');
      background-repeat: no-repeat;
      background-size: cover;
      &.payFocus{
        background-image: url('https://cdn.jsdelivr.net/gh/defis-net/material/dex/enter_solid_up.svg');
        background-repeat: no-repeat;
        background-size: cover;
      }
      &.getFocus{
        background-image: url('https://cdn.jsdelivr.net/gh/defis-net/material/dex/enter_solid_down.svg');
        background-repeat: no-repeat;
        background-size: cover;
      }
      .iconImg{
        width: 72px;
      }
    }
  }
  .price{
    color: $color-black;
    padding: 0 20px;
    margin-top: 18px;
    font-size: 28px;
    .iconImg{
      width: 30px;
      margin-left: 12px;
    }
    .flexend{
      line-height: 26px;
    }
  }
  .btnDiv{
    margin: 20px 0 20px;
    font-size: 32px;
    font-weight: 500;
    .btn{
      flex: 1;
      height: 88px;
      background: #29D4B0;
      border-radius: 48px;
      color: #fff;
      &:active{
        background:rgba(2,198,152,1);
      }
    }
  }
}

.newMarket{
  width: 70%;
  top: 0px;
  bottom: 0px;
  transform: translate(0, 0);
  max-width: 550px;
  border-radius: 0px;
}
</style>