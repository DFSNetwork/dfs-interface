<template>
  <div class="resourceManage">
    <van-popup class="popup_p"
      get-container="#app"
      v-model="showResource">
      <div class="resource">
        <img class="close" @click="showResource = false" src="https://resource1.dfs.land/svg/sd_icon_btn.svg">
        <div class="title">{{ $t('resource.manage') }}</div> 
        <div class="infos">
          <div class="info flexc">
            <span class="name">CPU</span>
            <span class="use">{{ $t('resource.useNum', {cpuRate}) }}</span>
            <span class="act" @click="showCpu = true">{{ $t('resource.lease') }}</span>
          </div>
          <div class="info flexc">
            <span class="name">NET</span>
            <span class="use">{{ $t('resource.useNum', {cpuRate: netRate}) }}</span>
            <span class="act" @click="showCpu = true">{{ $t('resource.lease') }}</span>
          </div>
          <div class="info flexc">
            <span class="name">RAM</span>
            <span class="use">{{ $t('resource.lessNum', {ramRate}) }}</span>
            <span class="act" @click="showRam = true">{{ $t('resource.buyAndSell') }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <van-popup class="popup_p" v-model="showRam" get-container="#app">
      <BuyRam :resInfo="resInfo" v-if="showRam"
        @listenClose="handleClose"
        @listenUpdate="handleGetAccInfo"/>
    </van-popup>
    <van-popup class="popup_p popupCpu" v-model="showCpu" get-container="#app">
      <LeaseCpu :resInfo="resInfo" v-if="showCpu"
        @listenClose="handleClose"
        @listenUpdate="handleGetAccInfo"/>
    </van-popup>
    
    <van-popup class="popup_p popupCpu" v-model="showResInsufficient" get-container="#app">
      <ResInsufficient :types="insufficientType"
        @listenClose="handleClose"
        @listenTo="handleGoTo"
        />
    </van-popup>
  </div>
</template>

<script>
import Bus from '@/utils/bus'
import { mapState } from 'vuex'
import BuyRam from '@/components/resourceManage/BuyRam'
import LeaseCpu from '@/components/resourceManage/LeaseCpu'
import ResInsufficient from '@/components/resourceManage/ResInsufficient.vue'
export default {
  name: 'resourceManage',
  components: {
    BuyRam,
    LeaseCpu,
    ResInsufficient,
  },
  data() {
    return {
      showResource: false,
      showCpu: false,
      showRam: false,
      showResInsufficient: false,
      insufficientType: 'CPU',
      cpuRate: '100.00',
      netRate: '100.00',
      ramRate: '0.00',
      resInfo: {},
    }
  },
  created() {
    Bus.$on('showResource', (status) => {
      this.showResource = status
    })
    Bus.$on('showResInsufficient', (type) => {
      this.showResInsufficient = true;
      this.insufficientType = type
    })
  },
  beforeDestroy() {
    Bus.$off('showResource')
    Bus.$off('showResInsufficient')
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
  watch: {
    account: {
      handler: function acc(newVal) {
        if (!newVal.name || !this.showResource) {
          return
        }
        this.handleGetAccInfo()
      },
      deep: true,
      immediate: true
    },
    showResource(newVal) {
      if (!this.account.name || !newVal) {
        return
      }
      this.handleGetAccInfo()
    }
  },
  methods: {
    handleGoTo() {
      this.showResInsufficient = false;
      if (this.insufficientType === 'CPU') {
        this.showCpu = true;
        return
      }
      this.showRam = true;
    },
    handleClose() {
      this.showCpu = false;
      this.showRam = false;
      this.showResInsufficient = false;
    },
    async handleGetAccInfo() {
      const {status, result} = await this.$api.get_account(this.account.name);
      console.log(status, result)
      if (!status) {
        return
      }
      const res = result
      const cpuInfo = res.cpu_limit || {};
      let cpuRate = parseFloat(cpuInfo.used || 0) / parseFloat(cpuInfo.max || 1) * 100;
      if (cpuRate > 100) {
        cpuRate = 100
      }
      const netInfo = res.net_limit || {};
      let netRate = parseFloat(netInfo.used || 0) / parseFloat(netInfo.max || 1) * 100;
      if (netRate > 100) {
        netRate = 100
      }

      let ramRate = (parseFloat(res.ram_quota || 0) - parseFloat(res.ram_usage || 0)) / 1024;
      if (ramRate < 0) {
        ramRate = 0
      }
      this.cpuRate = cpuRate.toFixed(2)
      this.netRate = netRate.toFixed(2)
      this.ramRate = ramRate.toFixed(2)
      this.resInfo = res;
    }
  }
}
</script>

<style lang="scss" scoped>
.resourceManage{
  position: absolute;
  top: 0;
}
.resource{
  padding: 20px 40px 30px;
  font-size: 28px;
  position: relative;
  .close{
    position: absolute;
    top: 20px;
    right: 20px;
    width: 24px;
  }
  .title{
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .infos{
    .info{
      height: 60px;
      text-align: left;
      .name{
        width: 100px;
        font-weight: 600;
      }
      .use{
        width: 200px;
      }
      .act{
        width: 200px;
        color: $color-aux;
      }
    }
  }
}
.popupCpu{
  margin-top: 10vh;
}
</style>