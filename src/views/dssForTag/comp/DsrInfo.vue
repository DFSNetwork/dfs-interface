<template>
  <div v-loading="loading">
    <div class="banner">
      <img class="bannerImg" src="https://cdn.jsdelivr.net/gh/defis-net/material/banner/tagDss.png" alt="">
    </div>
    <div class="mt40">
      <div class="dataInfo">
        <div class="bg-left"></div>
        <div class="bg-right"></div>
        <div class="flexb floatDiv">
          <div class="left">
            <div class="tip bonus">
              <span>{{ $t('dsr.totalNum') }}(TAG)</span>
            </div>
            <div class="dinBold">{{ lockDfs }}</div>
          </div>
        </div>
        <div class="miningInfo flexb" v-loading="loading">
          <div class="miningData">
            <div class="num dinBold">{{ ableClaimNum }}</div>
            <div class="tip">
              <span>{{ $t('dsr.poolBal') }}(TAG)</span>
              <!-- <span>({{ `${timeObj.hours}:${timeObj.minutes}:${timeObj.seconds}` }})</span> -->
            </div>
          </div>
          <div class="right">
            <div class="dinBold">{{ yearApr }}%</div>
            <div class="tip bonus">
              <span>{{ $t('dsr.nowApy') }}</span>
            </div>
          </div>
        </div>
        <div class="unClaim flexc">
          <span>{{ $t('mine.waitClaim') }}</span>
          <span class="green">{{ myDepositInfo.showReward }}</span>
          <span>TAG</span>
          <img class="tipIcon ml10" @click="showReWardTip = true" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/tips_icon_btn.svg" alt="">
        </div>
        <div class="allClaimBtn flexc"
          @click="handleClaimAll"
          v-loading="allClaim">{{ $t('bonus.claim') }}</div>
      </div>
    </div>

    <van-popup
      class="popup_p"
      v-model="showReWardTip">
      <MinReward :minReward="minReward"/>
    </van-popup>
  </div>
</template>

<script>
import { EosModel } from '@/utils/eos';
import { mapState } from 'vuex';
import { toFixed, accMul, accDiv, countdown } from '@/utils/public';
import MinReward from '@/views/market/popup/MinReward'

export default {
  components: {
    MinReward
  },
  data() {
    return {
      lockDfs: '0.0000',
      ableUse: '0.0000',
      nextTime: 0,
      timer: null,
      lockLoading: true,
      stockLoading: true,
      // claimLoading: true,
      timeObj: {
        days: 0,
        hours: '00',
        minutes: '00',
        seconds: '00'
      },
      secTimer: null,
      showReWardTip: false,
      allClaim: false,
      minReward: '0.0001',
    }
  },
  props: {
    args: {
      type: Object,
      default: function a() {
        return {}
      }
    },
    timesmap: {
      type: Number,
      default: 0,
    },
    ableClaimNum: {
      type: String,
      default: '0.0000'
    },
    claimLoading: {
      type: Boolean,
      default: true
    },
    myDepositInfo: {
      type: Object,
      default: function b() {
        return {}
      }
    }
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    }),
    perDayReward() {
      let wDfs = accMul(10000, 0.05);
      wDfs = accDiv(wDfs, 365);
      return toFixed(wDfs, 4)
    },
    loading() {
      return this.lockLoading && this.stockLoading && this.claimLoading;
    },
    yearApr() {
      let apr = Math.pow(this.args.aprs, 86400 * 365) - 1
      apr = apr * 100;
      return toFixed(apr, 2)
    },
  },
  watch: {
    timesmap() {
      this.handleNextUpdataTime()
      this.handleTimer()
    }
  },
  mounted() {
    this.handleNextUpdataTime()
    this.handleTimer()
  },
  beforeDestroy() {
    clearTimeout(this.secTimer)
  },
  methods: {
    handleNextUpdataTime() {
      const params = {
        "code": "dss.tag",
        "scope": "dss.tag",
        "table": "allocates",
        "limit": 10,
        "json": true,
        "reverse": true
      }
      EosModel.getTableRows(params, (res) => {
        if (!res.rows.length) {
          return
        }
        const rows = res.rows[0]
        let nextTime = rows.key;
        nextTime = nextTime + (60 * 60 * 8)
        this.nextTime = nextTime;
        this.handleCutDown()
      })
    },
    handleCutDown() {
      clearTimeout(this.secTimer)
      this.timeObj = countdown(this.nextTime, true)
      // if (this.timeObj.total <= 0) {
      //   this.handleNextUpdataTime();
      //   return
      // }
      this.secTimer = setTimeout(() => {
        this.handleCutDown()
      }, 1000);
    },
    handleTimer() {
      this.handleGetDfsBalance('lock')
      this.handleGetDfsBalance('stock')
      // this.handleGetDfsBalance('claim')
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.handleTimer()
      }, 10000)
    },
    // 获取DFS锁定量
    handleGetDfsBalance(type) {
      const params = {
        code: 'tagtokenmain', // ++++
        coin: 'TAG',
        decimal: 8, // ++++
      };
      if (type === 'lock') {
        params.account = 'dss.tag';
      }
      if (type === 'stock') {
        params.account = 'vault.tag';
      }
      // if (type === 'claim') {
      //   params.account = 'dfsdsrbuffer';
      // }
      EosModel.getCurrencyBalance(params, res => {
        let balance = toFixed('0.0000000000001', params.decimal);
        (!res || res.length === 0) ? balance : balance = res.split(' ')[0];
        if (type === 'lock') {
          this.lockLoading = false;
          this.lockDfs = balance;
          this.$emit('listenAllLock', balance)
          return
        }
        if (type === 'stock') {
          this.stockLoading = false;
          this.ableUse = balance;
          return
        }
      })
    },
    handleClaimAll() {
      if (this.allClaim) {
        return
      }
      this.allClaim = true;
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: 'dss.tag',
            name: 'claim',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
            }
          },
        ]
      }
      EosModel.toTransaction(params, (res) => {
        this.allClaim = false;
        if(res.code && JSON.stringify(res.code) !== '{}') {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.$message({
          message: this.$t('public.success'),
          type: 'success'
        });
        setTimeout(() => {
          this.handleGetList();
        }, 1000);
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.banner{
  position: relative;
  // background: #07D79B;
  // padding: 30px 40px;
  color: #FFF;
  text-align: left;
  overflow: hidden;
  .bgImg{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 0;
  }
  .bannerImg{
    display: block;
    height: 320px;
    width: 100%;
  }
  .bannerTitle{
    position: relative;
    font-size: 36px;
    font-weight: 500;
    z-index: 1;
  }
  .bannerSubTitle{
    position: relative;
    z-index: 1;
    margin-top: 15px;
    margin-bottom: 30px;
    font-size: 30px;
    font-weight: 300;
  }
}
.mt40{
  margin-top: -40px;
  background: #FFF;
  position: relative;
  padding-top: 40px;
  border-radius: 40px 40px 0 0 ;
}
.dataInfo{
  box-shadow: 0px 4px 8px 4px rgba(227,227,227,0.5);
  border-radius: 20px 20px 0px 0px;
  padding: 28px 28px;
  margin: 0 32px 20px;
  background: #FFF;
  position: relative;
  color: #333;
  overflow: hidden;

  .bg-left{
    position: absolute;
    width: 198px;
    height: 232px;
    background: linear-gradient(-45deg, #FFFFFF 0%, #FFFFFF 50%, #F3FFFB 50%, #F3FFFB 100%);
    left: 0;
    top: 0;
  }
  .bg-right{
    position: absolute;
    width: 438px;
    height: 532px;
    background: linear-gradient(-233deg, #FFFFFF 0%, #FFFFFF 50%, #F3FFFB 50%, #F3FFFB 100%);
    bottom: 20px;
    right: 0px;
  }
  .dinBold{
    font-size: 40px !important;
    margin-bottom: 9px;
  }
  .floatDiv{
    z-index: 1;
    position: relative;
    text-align: left;
    font-size: 32px;
    color: #333;
    margin-bottom: 25px;
    &>div{
      flex: 1;
      // background: #FFF;
      // padding: 40px 20px;
      border-radius: 20px;
      text-align: center;
      .dinBold{
        font-size: 60px !important;
        margin-bottom: 9px;
      }
    }
    .bonus{
      font-size: 30px;
      margin-bottom: 10px;
    }
  }
}
.miningInfo{
  z-index: 1;
  position: relative;
  // background: #FFF;
  // padding: 40px;
  font-size: 28px;
  text-align: center;
  &>div{
    flex: 1;
    &:first-child{
      margin-right: 30px;
    }
    .num{
      font-size: 32px;
      // margin-top: 10px;
    }
  }
}
.unClaim{
  position: relative;
  z-index: 1;
  background: #F8F8F8;
  font-size: 30px;
  color: #999;
  height: 72px;
  width: 560px;
  margin: 30px auto;
  border-radius: 40px;
  .green{
    color: $color-main;
    margin: 0 10px;
  }
  .tipIcon{
    width: 32px;
    margin-left: 12px;
  }
}
.allClaimBtn{
  position: relative;
  z-index: 1;
  background: $color-main;
  border-radius: 12px;
  color: #FFF;
  font-size: 36px;
  height: 92px;
  font-weight: 500;
}
</style>
