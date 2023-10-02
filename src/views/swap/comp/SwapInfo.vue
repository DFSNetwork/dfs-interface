<template>
  <div class="swapInfo">
    <!-- TokenA 信息 -->
    <div class="tokenInfo" :class="{'focus': payFocus}">
      <div class="flexb bal">
        <span @click="handleMax('pay')">{{ $t('public.balance') }}: {{ balA }} {{ tokenA.symbol }}</span>
        <span>{{ $t('dex.pay') }}</span>
      </div>
      <div class="flexb token">
        <div class="flexa" @click="handleShowDrawer('start')">
          <img class="tokenLogo" :src="tokenA.imgUrl" :onerror="$errorImg">
          <div>
            <div class="name flexa">
              <span>{{ tokenA.symbol }}</span>
              <img class="selectImg" src="https://resource2.dfs.land/dfs/inverted.png">
            </div>
            <div class="contract tip">{{ tokenA.contract }}</div>
          </div>
        </div>
        <div class="iptDiv dinBold">
          <van-field class="ipt" v-model="pay" placeholder="0.0"
            type="number"
            @focus="handleFocus('pay')"
            @blur="handleBlur('pay')"
            @input="handleGetAmtOut('pay')"/>
        </div>
      </div>
    </div>

    <!-- 上下币种切换 -->
    <div class="exchange">
      <div class="border flexc" :class="{'payFocus': payFocus, 'getFocus': getFocus}" @click="handleExchange">
        <img class="iconImg" v-if="!direction" src="https://resource1.dfs.land/dex/switch_down.svg">
        <img class="iconImg" v-else src="https://resource1.dfs.land/dex/switch_up.svg">
      </div>
    </div>

    <!-- TokenB 信息 -->
    <div class="tokenInfo" :class="{'focus': getFocus}">
      <div class="flexb bal">
        <span @click="handleMax('get')">{{ $t('public.balance') }}: {{ balB }} {{ tokenB.symbol }}</span>
        <span>{{ $t('dex.obtain') }}</span>
      </div>
      <div class="flexb token">
        <div class="flexa" @click="handleShowDrawer('end')">
          <img class="tokenLogo" :src="tokenB.imgUrl" :onerror="$errorImg">
          <div>
            <div class="name flexa">
              <span>{{ tokenB.symbol }}</span>
              <img class="selectImg" src="https://resource2.dfs.land/dfs/inverted.png">
            </div>
            <div class="contract tip">{{ tokenB.contract }}</div>
          </div>
        </div>
        <div class="iptDiv dinBold">
          <van-field class="ipt" v-model="get" placeholder="0.0"
            type="number"
            @focus="handleFocus('get')"
            @blur="handleBlur('get')"
            @input="handleGetAmtOut('get')"/>
        </div>
      </div>
    </div>
    <!-- 当前价格 -->
    <div class="price flexb">
      <span class="tip">{{ $t('dex.rate') }}</span>
      <span class="flexend din">
        <span v-if="!priceEX">1 {{ tokenB.symbol }} = {{ outPrice }} {{ tokenA.symbol }}</span>
        <span v-else>1 {{ tokenA.symbol }} = {{ inPrice }} {{ tokenB.symbol }}</span>
        <span class="flexa" @click="priceEX = !priceEX">
          <img class="iconImg small" v-if="priceEX" src="https://resource2.dfs.land/icon/price_switch_icon_btn_left.svg" alt="">
          <img class="iconImg small" v-else src="https://resource2.dfs.land/icon/price_switch_icon_btn_right.svg" alt="">
        </span>
      </span>
    </div>

    <!-- 交易按钮 -->
    <div class="btnDiv flexb">
      <div class="postion">
        <div class="myLoading flexc" v-if="loading"><van-loading type="spinner" color="#29D4B0"/></div>
        <div class="btn flexc" @click="handleSwap">{{ $t('tab.dex') }}</div>
      </div>
      <div class="dtokens" v-if="isDtokens" @click="handleToProject('dtoken')">
        <img :src="dtokenData.imgUrl">
        <div>{{ $t('sys.dAndW') }}</div>
      </div>
    </div>

    <!-- 币种列表 -->
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
import { DApp } from '@/utils/wallet'
import { mapState } from 'vuex';
import MarketArea from '@/components/MarketArea';

import { getBaseMarkets, getAmtOut } from '../swap_deal';
import { SwapRouter } from '../swap_router';
import { toFixed, accDiv, accSub, accMul, GetUrlPara } from '@/utils/public'

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
      direction: false,
      loading: false,
      nearIpt: 'pay',

      // 数据信息
      tokenA: {
        contract: 'eosio.token',
        symbol: 'EOS',
        decimal: '4',
        imgUrl: 'https://resource2.dfs.land/coin/eosio.token-eos.svg',
      },
      tokenB: {
        contract: 'tethertether',
        symbol: 'USDT',
        decimal: '4',
        imgUrl: 'https://resource2.dfs.land/coin/tethertether-usdt.png',
      },
      balA: '0.0000',
      balB: '0.0000',
      inPrice: '0.0000',
      outPrice: '0.0000',

      // 输入信息
      pay: '',
      get: '',
      showType: 'start', // end | start

      // action 参数
      mids: '',
      minOut: '0.0000',
      priceRate: '0.00',
      hasMids: '',
      bestPath: '',

      // 定时器
      balTimer: null,
    }
  },
  mounted() {
    this.handleGetUrlInAndOut()
  },
  beforeDestroy() {
    clearTimeout(this.balTimer);
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
    isDtokens() {
      if (this.tokenA.contract === 'asset.dtoken' && this.tokenA.symbol === 'ETH') {
        return this.tokenA
      }
      if (this.tokenB.contract === 'asset.dtoken' && this.tokenB.symbol === 'ETH') {
        return this.tokenB
      }
      return false
    },
    dtokenData() {
      if (this.tokenA.contract === 'asset.dtoken' && this.tokenA.symbol === 'ETH') {
        return this.tokenA
      }
      if (this.tokenB.contract === 'asset.dtoken' && this.tokenB.symbol === 'ETH') {
        return this.tokenB
      }
      return {}
    },
  },
  watch: {
    marketLists: {
      handler: function mls(newVal) {
        if (!newVal.length) {
          return
        }
        this.handleGetSwapMarkets();
      },
      deep: true,
      immediate: true,
    },
    account: {
      handler: function mls(newVal) {
        if (!newVal.name) {
          return
        }
        this.handleBalanTimer();
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    // 获取路径币种
    handleGetUrlInAndOut() {
      const urlData = GetUrlPara();
      if (urlData.in && urlData.out) {
        try {
          const inData = urlData.in.split('-');
          const sym0 = {
            contract: inData[0],
            decimal: "4",
            symbol: inData[1].toUpperCase(),
          }
          this.tokenA = this.handleGetToken(sym0);
          const outData = urlData.out.split('-');
          const sym1 = {
            contract: outData[0],
            decimal: "4",
            symbol: outData[1].toUpperCase(),
          }
          this.tokenB = this.handleGetToken(sym1);
        } catch (error) {
          console.log(error)
        }
      } else {
        const localData = localStorage.getItem('swapMarkets') ? JSON.parse(localStorage.getItem('swapMarkets')) : null;
        // console.log(localData)
        if (localData) {
          this.tokenA = localData.thisMarket0;
          this.tokenB = localData.thisMarket1;
        }
      }
      this.handleGetSwapMarkets();
    },
    // 获取Token信息
    handleGetToken(coin) {
      let mk = coin;
      this.marketLists.forEach(v => {
        if (v.contract0 === coin.contract && v.symbol0 === coin.symbol) {
          mk = v.sym0Data;
        } else if (v.contract1 === coin.contract && v.symbol1 === coin.symbol) {
          mk = v.sym1Data;
        }
      })
      return mk
    },

    // 初始化Swap数
    handleGetSwapMarkets() {
      const baseArr = getBaseMarkets([this.tokenA, this.tokenB])
      SwapRouter.init(baseArr, this, this.tokenA, this.tokenB, () => {
        this.handleGetAmtOut(this.nearIpt)
        this.handleSetLocal()
      })
    },
    handleReverse(string) {
      const arr = string.split('-')
      return arr.reverse().join('-')
    },
    // 获取输出数量
    handleGetAmtOut(type) {
      this.nearIpt = type
      if (type === 'pay') {
        if (!parseFloat(this.pay || 0)) {
          this.get = ''
        }
      } else {
        if (!parseFloat(this.get || 0)) {
          this.pay = ''
        }
      }
      const inData = {
        get: this.get || '1',
        pay: this.pay || '1',
        type,
        tokenA: this.tokenA,
        tokenB: this.tokenB,
        rSwitch: this.rSwitch,
      }
      const out = getAmtOut(SwapRouter, inData)
      if (!out || !out.quantity_out) {
        this.$emit('listenTradeInfo', {
          show: '',
        })
        return
      }
      this.inPrice = toFixed(out.swapInPrice, Number(this.tokenB.decimal) + 2)
      this.outPrice = toFixed(out.swapOutPrice, Number(this.tokenA.decimal) + 2)

      // 有该交易对
      this.hasMids = type === 'pay' ? out.hasMids : this.handleReverse(out.hasMids);
      // 最优兑换路径
      this.bestPath = type === 'pay' ? out.bestPath : this.handleReverse(out.bestPath);
      // 兑换路径 - mids
      this.mids = type === 'pay' ? out.mid : this.handleReverse(out.mid);

      if (!parseFloat(this.pay || 0) && !parseFloat(this.get || 0)) {
        this.$emit('listenTradeInfo', {
          show: '',
          hasMids: out.hasMids,
        })
        return
      }
      if (type === 'pay') {
        this.get = out.quantity_out.split(' ')[0]
      } else {
        this.pay = out.quantity_out.split(' ')[0]
      }
      // 最小获取
      const minOut = (100 - this.slipPoint) * this.get / 100;
      this.minOut = toFixed(minOut, 4)
      // 价格滑点
      let priceRate = accDiv(out.swapInPrice, out.price);
          priceRate = accSub(1, priceRate)
          priceRate = accMul(priceRate, 100)
      if (Number(priceRate) < 0) {
        priceRate = '0.00000000';
      }
      priceRate = toFixed(priceRate, 2)
      this.priceRate = priceRate;
      // 手续费
      let fees = this.pay * 0.003;
          fees = `${toFixed(fees, 4)} ${this.tokenA.symbol}`;
      this.$emit('listenTradeInfo', {
        show: '1',
        minOut: this.minOut,
        priceRate,
        fees,
        bestPath: this.bestPath,
        hasMids: this.hasMids,
      })
    },

    // 保存本次切换币种信息
    handleSetLocal() {
      const info = {
        thisMarket0: this.tokenA,
        thisMarket1: this.tokenB,
        thisCoinsPath: this.bestPath,
        thisMidsPath: this.hasMids + '',
      }
      localStorage.setItem('swapMarkets', JSON.stringify(info))
    },
    // 关闭弹窗
    handleClose() {
      this.showMarketList = false;
    },
    // 打开币种帅选
    handleShowDrawer(type) {
      this.showType = type;
      this.showMarketList = true
    },
    // 切换币种
    handleMarketChange(item, type) {
      if (type === 'start') {
        this.tokenA = item;
      } else {
        this.tokenB = item;
      }
      this.pay = '';
      this.get = '';
      this.showMarketList = false;
      this.handleGetSwapMarkets()
      this.handleBalanTimer();
    },
    // 上下币种切换
    handleExchange() {
      this.direction = !this.direction;
      const t = this.tokenA;
      this.tokenA = this.tokenB;
      this.tokenB = t;
      this.pay = '';
      this.get = '';
      const b = this.balA;
      this.balA = this.balB;
      this.balB = b;
      this.handleGetSwapMarkets();
    },
    // 最大值
    handleMax(bType) {
      if (bType === 'pay') {
        this.pay = this.balA;
      } else {
        this.get = this.balB;
      }
      this.handleGetAmtOut(bType)
    },
    // 输入框操作
    handleFocus(iType) {
      if (iType === 'pay') {
        this.payFocus = true;
        this.getFocus = false;
      } else {
        this.payFocus = false;
        this.getFocus = true;
      }
      let n = iType === 'pay' ? this.pay : this.get;
      n = parseFloat(n || 0)
      if (!n) {
        n = ''
      }
      iType === 'pay' ? this.pay = n : this.get = n;
    },
    handleBlur(iType) {
      this.payFocus = false;
      this.getFocus = false;
      let n = iType === 'pay' ? this.pay : this.get;
      const decimal = iType === 'pay' ? this.tokenA.decimal : this.tokenB.decimal;
      n = parseFloat(n || 0)
      let tn = toFixed(n, decimal)
      if (!n) {
        tn = '';
      }
      iType === 'pay' ? this.pay = tn : this.get = tn;
    },
    handleToProject(type) {
      if (type === 'dtoken') {
        location.href = 'https://dtoken.netlify.app/'
      }
    },

    // 用户信息
    handleBalanTimer() {
      clearTimeout(this.balTimer);
      this.balTimer = setTimeout(() => {
        this.handleBalanTimer()
      }, 20 * 1000);
      this.handleGetBal()
      this.handleGetBal('next')
    },
    async handleGetBal(next) {
      const name = this.account.name;
      if (!name) {
        return
      }
      const params = {
        code: this.tokenA.contract,
        symbol: this.tokenA.symbol,
        decimal: this.tokenA.decimal,
        account: `${name}`
      };
      if (next) {
        params.code = this.tokenB.contract;
        params.symbol = this.tokenB.symbol;
        params.decimal = this.tokenB.decimal;
      }
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result.split(' ')[0]
      if (next) {
        if (params.symbol !== this.tokenB.symbol || params.code !== this.tokenB.contract) {
          this.handleGetBal(next)
          return
        }
        this.balB = bal;
        return;
      }
      if (params.symbol !== this.tokenA.symbol || params.code !== this.tokenA.contract) {
        this.handleGetBal()
        return
      }
      this.balA = bal;
    },
    // swap 验证
    handleReg() {
      if (!Number(this.pay || 0)) {
        return false;
      }
      const balance = Number(this.balA);
      if (Number(this.pay) > balance) {
        this.$toast.fail(this.$t('public.balanLow'))
        return false;
      }
      if (Number(this.slipPoint || 5) < Number(this.priceRate) || !parseFloat(this.minOut)) {
        this.$toast.fail(this.$t('dex.heightSlip'))
        return false;
      }
      return true
    },
    // 执行swap
    handleSwap() {
      if (this.loading) {
        return
      }
      if (!this.handleReg()) {
        return
      }
      this.loading = true;

      const path = this.mids

      const tradeCoin = this.tokenA.symbol;
      const minOutDecimal = this.tokenB.decimal;
      const params = {
        code: this.tokenA.contract,
        toAccount: this.baseConfig.toAccountSwap,
        memo: `swap:${path}:${accMul(toFixed(this.minOut, minOutDecimal), (10 ** minOutDecimal))}`,
        quantity: `${this.pay} ${tradeCoin}`
      }
      const inviAcc = localStorage.getItem('inviAcc') ? JSON.parse(localStorage.getItem('inviAcc')) : '';
      if (inviAcc) {
        params.memo = `${params.memo}:${inviAcc.id}`
      } else {
        params.memo = `${params.memo}:2`
      }
      console.log(params)
      DApp.transfer(params, (err) => {
        this.loading = false;
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
        this.pay = '';
        this.get = '';

        setTimeout(() => {
          this.handleGetAmtOut('pay')
          this.handleBalanTimer();
        }, 1500);
        this.$toast.success(this.$t('public.success'));
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.swapInfo{
  padding: 10px 20px 20px;
  font-size: 24px;
  text-align: left;
  .tokenInfo{
    border: 1px solid $color-border;
    border-radius: 20px;
    padding: 36px 20px;
    &.focus{
      border: 1px solid $color-main;
    }
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
        width: 21px;
        margin-left: 9px;
      }
      .iptDiv{
        flex: 1;
        .ipt{
          padding: 0 0 0 15px;
          :deep(.van-field__control){
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
      background-image: url('https://resource1.dfs.land/dex/enter_solid_default.svg');
      background-repeat: no-repeat;
      background-size: cover;
      &.payFocus{
        background-image: url('https://resource1.dfs.land/dex/enter_solid_up.svg');
        background-repeat: no-repeat;
        background-size: cover;
      }
      &.getFocus{
        background-image: url('https://resource1.dfs.land/dex/enter_solid_down.svg');
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
    .postion{
      position: relative;
      flex: 1;
    }
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
    .dtokens{
      margin-left: 30px;
      font-size: 24px;
      text-align: center;
      img{
        width: 44px;
      }
    }
  }
}

</style>