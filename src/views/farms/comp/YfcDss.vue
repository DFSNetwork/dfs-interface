<template>
  <div class="lists flexa" v-loading="loading">
    <div class="coinDiv flexc">
      <img class="coin" src="https://leafy-kataifi-c6d825.netlify.app/coin/yfctokenmain-yfc.png" alt="">
    </div>
    <div class="f1">
      <div class="projectName flexb">
        <span>YFC金库</span>
        <span class="claim green" v-loading="claiming || allClaiming" @click.stop="handleClaim">领取</span>
      </div>
      <div class="reward">
        <span>收益：</span>
        <span>{{ myDepositInfo.showReward || '0.00000000' }} YFC</span>
      </div>
      <div class="about">
        <span>≈ {{ aboutEos }} EOS</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import { toFixed, accAdd, accSub, accDiv, toLocalTime, countdown } from '@/utils/public';

export default {
  name: 'dssComp',
  data() {
    return {
      args: {},
      isGetAccinfo: false,
      myDepositInfo: {},
      secTimer: null,
      runTimer: null,
      claiming: false,
      loading: true,
      minReward: '0.0001',
      mid: 329, // dfs: 39 | DMD: 326 | YFC: 329 | DBC: 346 | LOOP: 424
      marketData: {},
      sec10Timer: null, // 10秒定时器
      ableClaimNum: '0.0000',
    }
  },
  props: {
    allClaiming: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      dsrPools: state => state.sys.dsrPools,
      marketLists: state => state.sys.marketLists,
    }),
    aboutEos() {
      const price = parseFloat(this.marketData.reserve0) / parseFloat(this.marketData.reserve1) || 0;
      const num = price * this.myDepositInfo.showReward;
      return toFixed(num, 4)
    },
  },
  watch: {
    marketLists: {
      handler: function ml(newVal) {
        this.marketData = newVal.find(v => v.mid === this.mid) || {}
      },
      deep: true,
      immediate: true,
    },
    account: {
      handler: function listen(newVal) {
        if (newVal.name && !this.isGetAccinfo) {
          this.handleGetAccDssInfo()
        }
      },
      deep: true,
      immediate: true,
    },
    dsrPools: {
      handler: function listen() {
        this.handleRunReward()
      },
      deep: true,
      immediate: true,
    },
    args: {
      handler: function listen() {
        this.handleRunReward()
      },
      deep: true,
      immediate: true,
    }
  },
  mounted() {
    this.handleGetDssArgs();
    this.handleGetDfsBalance();
  },
  beforeDestroy() {
    clearInterval(this.secTimer)
    clearInterval(this.runTimer)
    clearTimeout(this.sec10Timer)
  },
  methods: {
    async handleGetDfsBalance() {
      const params = {
        code: 'yfctokenmain',
        symbol: 'YFC',
        decimal: 4,
        account: 'yfcdssbuffer'
      };
      const {status, result} = await this.$api.get_currency_balance(params);
      if (!status) {
        return
      }
      const balance = result.split(' ')[0];
      this.ableClaimNum = balance;
      this.sec10Timer = setTimeout(() => {
        this.handleGetDfsBalance();
      }, 10000);
    },
    async handleGetDssArgs() {
      const params = {
        "code": "yfcdsssystem",
        "scope": "yfcdsssystem",
        "table": "args",
        "json": true,
      }
      const {status, result} = await this.$api.get_table_rows(params)
      if (!status || !result.rows.length) {
        return
      }
      this.args = result.rows || []
    },
    async handleGetAccDssInfo() {
      this.isGetAccinfo = true;
      const formName = this.account.name;
      const params = {
        "code": "yfcdsssystem",
        "scope": "yfcdsssystem",
        "table": "holders",
        "lower_bound": ` ${formName}`,
        "upper_bound": ` ${formName}`,
        "json": true,
      }
      const {status, result} = await this.$api.get_table_rows(params)
      this.loading = false;
      if (!status || !result.rows.length) {
        this.myDepositInfo = {}
        return
      }
      const allList = result.rows;
      allList.forEach((v) => {
        const inTime = toLocalTime(`${v.last_drip}.000+0000`)
        this.$set(v, 'inTime', inTime);
        const releaseTime = toLocalTime(`${v.release_time}.000+0000`)
        this.$set(v, 'releaseTime', releaseTime);
        this.$set(v, 'balance', v.bal.split(' ')[0]);
        const endT = countdown(releaseTime);
        this.$set(v, 'isRelease', endT.total < 0);
      })
      this.myDepositInfo = allList[0];
      this.handleRunReward()
    },
    // 秒级定时器
    handleRunReward() {
      clearInterval(this.secTimer)
      if (!this.myDepositInfo.holder || !Number(this.args.aprs) || !this.dsrPools.length) {
        return
      }
      this.handleRunLogic()
      this.secTimer = setInterval(() => {
        this.handleRunLogic()
      }, 1000);
    },
    handleRunLogic() {
      clearInterval(this.runTimer)
      let userTime = toLocalTime(`${this.myDepositInfo.last_drip}.000+0000`)
      userTime = moment(userTime).valueOf();
      const nowTime = moment().valueOf(); // 当前时间
      const time = (nowTime - userTime) / 1000;
      let reward = parseFloat(this.myDepositInfo.bal) * Math.pow(this.args.aprs, time) - parseFloat(this.myDepositInfo.bal)
      if (this.myDepositInfo.pool) {
        const pool = this.dsrPools.find(vv => vv.id === this.myDepositInfo.pool)
        reward = reward * pool.bonus;
      }
      if (Number(this.ableClaimNum) < Number(reward)) {
        reward = this.ableClaimNum;
      }
      reward = toFixed(reward, 8)
      const v = this.myDepositInfo;
      let showReward = v.reward || '0.00000000';
      let countReward = showReward;
      if (!v.showReward) {
        this.$set(v, 'showReward', reward)
        showReward = reward;
        countReward = reward;
      }
      this.$set(v, 'reward', reward)
      let t = accSub(reward, showReward);
      t = accDiv(t, 20)
      this.runTimer = setInterval(() => {
        countReward = accAdd(countReward, t)
        if (countReward > Number(reward)) {
          showReward = toFixed(reward, 8);
          clearInterval(this.runTimer)
        } else {
          showReward = toFixed(countReward, 8);
        }
        this.$set(v, 'showReward', showReward);
      }, 50);
    },
    handleGetActions() {
      const formName = this.account.name;
      const permission = this.account.permissions;
      if (Number(this.minReward) > Number(this.myDepositInfo.reward || 0)) {
        return []
      }
      const action = {
        account: 'yfcdsssystem',
        name: 'claim',
        authorization: [{
          actor: formName, // 转账者
          permission,
        }],
        data: {
          user: formName,
        }
      }
      return [action];
    },
    handleClaim() {
      if (this.allClaiming || this.claiming) {
        return
      }
      const actions = this.handleGetActions()
      if (!actions.length) {
        return
      }
      this.claiming = true;
      const params = {
        actions
      }
      DApp.toTransaction(params, (err) => {
        this.claiming = false;
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
          this.handleGetAccDssInfo()
        }, 1000);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './comp.scss';
</style>
