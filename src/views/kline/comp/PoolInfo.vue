<template>
  <div class="poolInfo">
    <div class="item">
      <div class="label">{{ $t('footer.marketApr') }}</div>
      <div class="flexa">
        <span>{{ $t('dsr.nowApy') }}：</span>
        <span class="dinReg">{{ checkedMarket.apy || '0.00' }}%</span>
        <span class="green" @click="showApyDetail = true">{{ $t('public.detail') }}></span>
      </div>
    </div>
    <div class="item">
      <div class="label">{{ $t('dex.exchangePrice') }}</div>
      <div class="flexa" @click="ex = !ex">
        <span class="dinReg" v-if="ex">1 {{ checkedMarket.symbol1 }} = {{ price | numToPrice}} {{ checkedMarket.symbol0 }}</span>
        <span class="dinReg" v-else>1 {{ checkedMarket.symbol0 }} = {{ price1 | numToPrice}} {{ checkedMarket.symbol1 }}</span>
        <img class="ex" v-if="ex" src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/price_switch_icon_btn_right.svg">
        <img class="ex" v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/price_switch_icon_btn_left.svg">
      </div>
    </div>
    <div class="item">
      <div class="label flexa">
        <span>{{ $t('dex.poolNum') }}</span>
        <span class="green" @click="handleTo('dfsMinePool')">{{ $t('pools.toPool') }}></span>
      </div>
      <div class="flexa dinReg">
        {{ checkedMarket.reserve1 }} / {{ checkedMarket.reserve0 }}
      </div>
    </div>

    <!-- 年化详情 -->
    <van-popup
      class="popup_p"
      v-model="showApyDetail">
      <MarketApy :countApy="checkedMarket.apy" :isActual="true"
                 :aprInfo="checkedMarket.apy_detail"/>
    </van-popup>

    <!-- 关于做市 -->
    <el-dialog
      class="popup_p"
      :show-close="false"
      v-model="showAboutMarket">
      <AboutMarket />
    </el-dialog>
  </div>
</template>

<script>
import MarketApy from '@/views/market/popup/MarketApy'
import AboutMarket from '@/views/market/popup/AboutMarket'

export default {
  name: 'poolInfo',
  components: {
    MarketApy,
    AboutMarket,
  },
  props: {
    checkedMarket: {
      type: Object,
      default: function cm() {
        return {}
      }
    }
  },
  data() {
    return {
      showApyDetail: false,
      showAboutMarket: false,
      ex: true,
    }
  },
  computed: {
    price() {
      const price = parseFloat(this.checkedMarket.reserve0 || 0) / parseFloat(this.checkedMarket.reserve1 || 0)
      return price
    },
    price1() {
      const price = parseFloat(this.checkedMarket.reserve1 || 0) / parseFloat(this.checkedMarket.reserve0 || 0)
      return price
    },
  },
  methods: {
    handleTo(name) {
      this.$router.push({
        name,
        params: {
          mid: this.checkedMarket.mid
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.poolInfo{
  padding: 26px 22px;
  border-radius: 20px;
  background: #FAFAFA;
  margin: 30px;
  .item{
    margin-top: 20px;
    &:first-child{
      margin-top: 0;
    }
    .green{
      color: $color-main;
      margin-left: 15px;
      font-size: 28px;
      margin-top: 3px;
    }
    .ex{
      width: 36px;
      margin-left: 15px;
    }
  }
  .label{
    color: #A6A6A6;
    font-size: 28px;
    margin-bottom: 6px;
  }
}
</style>
