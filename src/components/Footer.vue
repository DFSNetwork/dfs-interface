<template>
  <div class="footer" :class="{'mt0': $route.name === 'home'}">
    <div v-if="$route.name !== 'home'">
      <div class="safe tip">
        <span>{{ $t('public.safeRecord1') }}</span>
        <span class="who" @click="handleToShowReport('slotMist')"> {{ $t('public.safeRecord2') }}</span> &
        <span class="who" @click="handleToShowReport('peckshield')">{{ $t('public.safeRecord4') }} </span>
        <span>{{ $t('public.safeRecord3') }}</span>
      </div>
    </div>
    <DfsInfo v-else :newDfsSwapData="newDfsSwapData"
      :tradeUserNum="tradeUserNum"
      :poolsUsdt="poolsUsdt"
      :poolsEos="poolsEos"/>

    <el-dialog
      class="dialog"
      :visible.sync="showImg">
      <img width="100%" src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gh00tvkd0dj30ku112tbw.jpg" />
    </el-dialog>
    <el-dialog
      class="dialog"
      :visible.sync="showImg2">
      <img width="100%" src="https://tva1.sinaimg.cn/large/0081Kckwly1gjzkya7bllj30ku112abv.jpg" />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { accMul } from '@/utils/public';
import DfsInfo from '@/views/home/comp/DfsInfo';

export default {
  components: {
    DfsInfo,
  },
  data() {
    return {
      showImg: false,
      showImg2: false,
      dfsInfoData: {},
      newDfsSwapData: {},
      timer: null,
      closeDFSInfoDataTip: true,
      poolsEos: '0.0000 EOS',
      poolsUsdt: '0.0000',
      isEx: false,
      tradeUserNum: '0',
    }
  },
  computed: {
    ...mapState({
      poolsBal: state => state.sys.poolsBal,
      marketLists: state => state.sys.marketLists,
    }),
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  mounted() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.handleGetDfsInfoData();
      this.handleGetTotalNum()
    }, 1000 * 30);
    this.handleGetDfsInfoData();
    this.handleGetTotalNum()
    this.handleDealLocal()
  },
  watch: {
  },
  methods: {
    handleSetAllRes() {
      const allResult = [];
      const feesDataKeys = this.dfsInfoData.trading_volume_in || [];
      const feesDataKeysOut = this.dfsInfoData.trading_volume_out || [];
      const dealArr = [];
      feesDataKeys.forEach((item) => {
        const allHas = dealArr.find(v => v.mid === item.mid)
        if (allHas) {
          return
        }
        const i = item;
        const o = feesDataKeysOut.find(v => v.mid === item.mid && v.sym === item.sym) || {}
        const total = {
          mid: i.mid,
          total: parseFloat(i.total || 0) + parseFloat(o.total || 0),
          sym: i.sym,
        }
        dealArr.push(total)
      })
      dealArr.forEach(v => {
        const value = v.total * 0.002;
        const market = this.marketLists.find(vv => vv.mid === v.mid);
        if (!market) {
          return
        }
        let liq = market.symbol0 === v.sym ? market.reserve0 : market.reserve1;
        liq = parseFloat(liq || 0) * 2;
        const poolsApr = value / (liq - value) * 365 * 100;
        allResult.push({
          mid: v.mid,
          symbol: v.sym,
          poolsApr: `${poolsApr.toFixed(3)}%`
        });
      });
      this.$store.dispatch('setFeesApr', allResult);
    },
    handleToShowReport(name) {
      if (name === 'peckshield') {
        this.showImg2 = true;
        return
      }
      this.showImg = true;
    },
    // 获取总发行量
    async handleGetDfsInfoData() {
      const {status, result} = await this.$api.get_swap_summary();
      if (!status) {
        return;
      }
      this.dfsInfoData = result;
      this.tradeUserNum = this.dfsInfoData.trade_user_num + '';
      const totalArr = this.dfsInfoData.tvl_eos.split(' ');
      this.dfsInfoData.total_volume = `${parseInt(this.dfsInfoData.total_volume)} ${totalArr[1]}`
      this.poolsEos = `${parseInt(totalArr[0])} ${totalArr[1]}`;
      this.poolsUsdt = parseInt(this.dfsInfoData.tvl_usdt) + '';
      const price = this.poolsUsdt / parseFloat(this.poolsEos)
      const total_volume_usdt = price * parseFloat(this.dfsInfoData.total_volume)
      this.$set(this.dfsInfoData, 'total_volume_usdt', total_volume_usdt.toFixed(0))
      this.$store.dispatch('setDfsData', this.dfsInfoData)
      this.handleSetAllRes()
    },
    async handleGetTotalNum() {
      const {status, result} = await this.$api.get_swap_counter();
      if (!status) {
        return;
      }
      const res = result;
      localStorage.setItem('counter', JSON.stringify(res))
      this.tradeUserNum = res.trade_user_num + '';
      const totalArr = res.tvl_eos.split(' ');
      res.total_volume = `${parseInt(res.total_volume)} ${totalArr[1]}`
      this.poolsEos = `${parseInt(totalArr[0])} ${totalArr[1]}`;
      this.poolsUsdt = parseInt(res.tvl_usdt) + '';
      const price = this.poolsUsdt / parseFloat(this.poolsEos)
      const total_volume_usdt = price * parseFloat(res.total_volume)
      this.$set(res, 'total_volume_usdt', total_volume_usdt.toFixed(0))
      this.newDfsSwapData = res;
    },
    handleDealLocal() {
      const counter = localStorage.getItem('counter')
      if (!counter) {
        return
      }
      const res = JSON.parse(counter);
      this.tradeUserNum = res.trade_user_num + '';
      const totalArr = res.tvl_eos.split(' ');
      res.total_volume = `${parseInt(res.total_volume)} ${totalArr[1]}`
      this.poolsEos = `${parseInt(totalArr[0])} ${totalArr[1]}`;
      this.poolsUsdt = parseInt(res.tvl_usdt) + '';
      const price = this.poolsUsdt / parseFloat(this.poolsEos)
      const total_volume_usdt = price * parseFloat(res.total_volume)
      this.$set(res, 'total_volume_usdt', total_volume_usdt.toFixed(0))
      this.newDfsSwapData = res;
    },
    // 获取账户余额
    async handleGetBalance() {
      const params = {
        code: 'eosio.token',
        symbol: 'EOS',
        decimal: 4,
        account: 'defisswapcnt'
      };
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const bal = result.split(' ')[0];
      this.poolsEos = accMul(bal, 2).toFixed(4);
    },
  },
}
</script>

<style lang="scss" scoped>
.ml20{
  margin-left: 15px;
}
.dialog{
  :deep(.el-dialog) {
    margin-top: 10vh !important;
    width: 600px;
    .el-dialog__header,
    .el-dialog__body{
      padding: 0;
    }
  }
  img{
    display: block;
  }
}
.copy{
  width: 30px;
  margin-left: 10px;
}
.footer{
  font-size: 26px;
  color: #333;
  margin-top: 30px;
  &.mt0{
    margin-top: 0;
  }
  .poolsNum{
    margin-top: 8px;
    &>span{
      &:first-child{
        margin-right: 8px;
      }
    }
    .exchange{
      width: 30px;
      margin: 0 10px;
    }
  }
  .safe{
    margin: 12px 0 30px;
    font-size: 24px;
    // font-weight: 300;
  }
  .who{
    font-weight: bold;
    color: $color-black;
  }
  .help{
    font-size: 27px;
    margin: 12px 0 ;
  }
}
</style>
