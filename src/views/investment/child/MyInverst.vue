<template>
  <div class="myInverst">
    <div class="total">
      <span class="top"></span>
      <span class="right"></span>

      <div class="main">
        <div class="rate dinBold">{{ accInfo.totalRate || '0.00' }}%</div>
        <div class="long">
          {{ 
            $t('invest.longTip', {
              days: accInfo.maxLeng || '0',
              num: accInfo.totalReward || '0.0000'
            }) 
          }}
        </div>
        <div class="flexb">
          <div class="item">
            <div class="label">{{ $t('invest.countIn') }}</div>
            <div class="tNum dinBold">$ {{ accInfo.totalPay || '0.0000' | numberTofixed }}</div>
          </div>
          <div class="item">
            <div class="label">{{ $t('invest.allAssets') }}</div>
            <div class="tNum dinBold">$ {{ accInfo.totalAssets || '0.0000' | numberTofixed }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的定投 -->
    <div class="inLists">
      <div class="title">{{ $t('invest.myInvest') }}</div>
      <div class="noData" v-if="!lists.length">{{ $t('public.noData') }}</div>
      <Inverst v-for="(v, i) in lists" :key="i" :item="v"
        @updateInfo="handleGetLists"/>
    </div>

    <div class="nullDiv"></div>
    <div class="fixedBtn flexc" @click="showDeposit = true">
      <van-icon name="plus" class="add"/>
      <span>{{ $t('invest.createIn') }}</span>
    </div> 

    <van-popup class="popup_long" v-model="showDeposit">
      <Deposit v-if="showDeposit"
        :actType="'create'"
        @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getMyInvest, dealInArr } from '../invest';

import Deposit from '@/views/investment/popup/Deposit'
import Inverst from '@/views/investment/comp/Inverst';
export default {
  name: 'myInverst',
  components: {
    Inverst,
    Deposit,
  },
  data() {
    return {
      accInfo: {},
      lists: [],
      showDeposit: false,
    }
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      account: state => state.app.account,
      allInvests: state => state.invest.allInvests,
      coins: state => state.invest.coins,
    }),
  },
  watch: {
    account: {
      handler: function at(val) {
        if (!val.name) {
          return
        }
        this.accInfo = getMyInvest(val.name)
        this.handleGetLists()
      },
      deep: true,
      immediate: true,
    },
    allInvests: {
      handler: function at(val) {
        if (!val.length) {
          return
        }
        if (this.account.name) {
          this.accInfo = getMyInvest(this.account.name)
        }
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    handleClose(status) {
      this.showDeposit = false;
      if (status) {
        this.handleGetLists()
      }
    },
    async handleGetLists() {
      const name = this.account.name;
      // const name = 'dfsdeveloper';
      // const myInvests = this.allInvests.filter(v => v.owner === name);
      // this.lists = myInvests;

      const params = {
        "code": "dfsdtservice",
        "scope": "dfsdtservice",
        "table": "plans",
        "json": true,
        "lower_bound": ` ${name}`,
        "upper_bound": ` ${name}`,
        "index_position": 2,
        "key_type": "i64",
        "limit": 100
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const rows = result.rows;
      this.lists = dealInArr(rows)
    }
  }
}
</script>

<style lang="scss" scoped>
.myInverst{
  padding: 30px 30px 150px;
  .total{
    box-shadow: 0px 6px 10px 4px rgba(226,226,226,0.5);
    padding: 28px 34px;
    background: #24CFAA;
    position: relative;
    overflow: hidden;
    height: 360px;
    box-sizing: border-box;
    border-radius: 24px;
    .top{
      width: 150px;
      height: 150px;
      border-radius: 80px;
      background: rgba(#fff, .2);
      position: absolute;
      top: -110px;
      left: 50%;
      transform: translate(-50%, 0);
    }
    .right{
      width: 120px;
      height: 120px;
      border-radius: 80px;
      background: rgba(#fff, .2);
      position: absolute;
      bottom: -20px;
      right: -10px;
    }
    .main{
      font-size: 28px;
      text-align: left;
      position: relative;
      color: #FFF;
      .rate{
        font-size: 78px;
        margin-bottom: 14px;
      }
      .label,
      .long{
        font-size: 28px;
        margin: 12px 0;
      }
      .item{
        margin-top: 20px;
        min-width: 250px;
      }
      .tNum{
        font-size: 40px;
      }
    }
  }
  .inLists{
    padding: 30px 0;
    .title{
      font-size: 36px;
      text-align: left;
      font-weight: 500;
    }
    .noData{
      color: #999;
      font-size: 24px;
      padding: 50px;
    }
  }
  .fixedBtn{
    position: fixed;
    bottom: 40px;
    background: $color-main;
    color: #FFF;
    font-size: 36px;
    font-weight: 500;
    border-radius: 16px;
    height: 100px;
    width: 690px;
    .add{
      font-size: 36px;
      font-weight: bold;
      margin-right: 15px;
    }
  }
}
</style>
