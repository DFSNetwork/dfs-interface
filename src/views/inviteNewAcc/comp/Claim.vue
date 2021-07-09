<template>
  <div class="main">
    <div class="card">
      <div class="title flexa">
        <span>我的收益</span>
        <img class="tips" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/tips_icon_btn.svg">
      </div>

      <div class="unClaim">
        <div class="label">待领取总收益</div>
        <div class="dinBold num">${{ totalUnClaim }}</div>
        <div class="small abt tip">≈ ¥ {{ abtCNY }}</div>
      </div>
      <div class="claimBtn flexc" @click="handleClaim()">一键领取</div>

      <div class="item flexb" v-for="(v, i) in area" :key="i">
        <div class="">
          <div class="label dinReg">{{ v.name }} 邀请收益</div>
          <div class="dinBold num">{{ v.unclaimed || `0.0000 ${v.name}` }}</div>
        </div>
        <div class="btn flexc" @click="handleClaim(v.name)">领取收益</div>
      </div>
    </div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet'
import { mapState } from 'vuex';
export default {
  data() {
    return {
      area: [{
        name: 'DFS',
        pool: 'miningpool11',
      }, {
        name: 'TAG',
        pool: 'tagtokenfarm',
      }]
    }
  },
  mounted() {
    this.handleGetReward()
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      coinPrices: (state) => state.sys.coinPrices,
      usdtPrice: (state) => state.sys.usdtPrice,
    }),
    totalUnClaim() {
      let total = 0;
      this.area.forEach(v => {
        const unc = parseFloat(v.unclaimed || 0);
        if (!unc) {
          return
        }
        let pi = this.coinPrices.find(vv => vv.coin === v.name) || {};
        pi = pi.price || 0;
        let t = unc * pi;
        total = parseFloat(total || 0) + parseFloat(t || 0)
      })
      return total.toFixed(2)
    },
    abtCNY() {
      const cny = this.usdtPrice * this.totalUnClaim;
      return cny.toFixed(2)
    }
  },
  methods: {
    handleGetReward() {
      const name = this.account.name
      this.area.forEach(async v => {
        const params = {
          "code": v.pool,
          "scope": v.pool,
          "table": "rewards",
          "json": true,
          "lower_bound": ` ${name}`,
          "upper_bound": ` ${name}`,
        }
        const {status, result} = await this.$api.get_table_rows(params);
        const rows = result.rows;
        if (!status || !rows.length) {
          return
        }
        this.$set(v, 'total_reward', rows[0].total_reward)
        this.$set(v, 'unclaimed', rows[0].unclaimed)
      })
    },
    handleClaim(type)  {
      let list = this.area;
      if (type) {
        list = this.area.filter(v => v.name === type)
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      let actions = []
      list.forEach(v => {
        const obj = {
          account: v.pool,
          name: 'claiminvite',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
          }
        }
        actions.push(obj)
      })
      const params = {
        actions
      }
      DApp.toTransaction(params, (err) => {
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
        this.$toast({
          message: this.$t('public.success'),
          type: 'success'
        });
        setTimeout(() => {
          this.handleGetReward();
        }, 1500);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main{
  margin: 30px !important;
  position: relative;
  border-radius: 12px;
  background: #FFF;
  padding: 26px 26px 0;
  font-size: 28px;
  .card{
    .title{
      font-size: 32px;
      font-weight: 500;
      padding-left: 24px;
      position: relative;
      margin-bottom: 20px;
      &::after{
        content: '';
        position: absolute;
        width: 8px;
        height: 36px;
        background: $color-main;
        border-radius: 6px;
        left: 0px;
        top: 50%;
        transform: translate(0, -50%);
      }
      .tips{
        width: 30px;
        margin-left: 18px;
      }
    }
    .label{
      color: #999;
    }
    .unClaim{
      font-size: 32px;
      .label{
        color: #A6A6A6;
      }
      .num{
        font-size: 64px;
      }
      .abt{
        margin: 20px;
      }
    }
    .claimBtn{
      height: 90px;
      color: #FFF;
      border-radius: 12px;
      background: $color-main;
      font-size: 32px;
      margin: 30px 0;
    }
    .item{
      height: 164px;
      border-bottom: 1px solid $color-border;
      &:last-child{
        border: 0px;
      }
      .label{
        text-align: left;
      }
      .num{
        font-size: 32px;
        margin-top: 10px;
      }
      .btn{
        height: 70px;
        border-radius: 12px;
        background: $color-main;
        color: #FFF;
        padding: 0 24px;
        &.unable{
          color: #999;
          background: #F2F2F2;
        }
      }
    }
  }
}
</style>
