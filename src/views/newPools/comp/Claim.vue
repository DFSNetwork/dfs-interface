<template>
  <div class="rewards">
    <div class="label">
      <span>{{ $t('mine.mineBonus') }}</span>
    </div>

    <div class="nums flexb">
      <div class="numDiv">
        <div class="num flexend">
          <span class="dinBold">{{ handleToFixed(dfsTotal, 4) }}</span>
          <span class="token dinReg">DFS</span>
        </div>
        <div class="tip">≈${{ dfsAbt }}</div>
      </div>
      <div class="numDiv">
        <div class="num flexend">
          <span class="dinBold">{{ handleToFixed(tagTotal, 4) }}</span>
          <span class="token dinReg">TAG</span>
        </div>
        <div class="tip">≈${{ tagAbt }}</div>
      </div>
    </div>

    <div class="claimBtn flexc" @click="handleClaim">{{ $t('mine.claimAll') }}</div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import {toFixed} from '@/utils/public'
export default {
  props: {
    dfsTotal: {
      type: String,
      default: '0.0000'
    },
    tagTotal: {
      type: String,
      default: '0.0000'
    }
  },
  data() {
    return {
      tagPoolsMid: [602, 665],
      dfsPoolsMid: [39, 451],
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      coinPrices: state => state.sys.coinPrices,
      baseConfig: state => state.sys.baseConfig,
    }),
    dfsAbt() {
      const price = this.coinPrices.find(v => v.coin === 'DFS') || {price: 0}
      const p = price.price
      const abt = this.dfsTotal * p;
      return toFixed(abt, 2)
    },
    tagAbt() {
      const price = this.coinPrices.find(v => v.coin === 'TAG') || {price: 0}
      const p = price.price
      const abt = this.tagTotal * p;
      return toFixed(abt, 2)
    }
  },
  methods: {
    handleToFixed(num, len) {
      return toFixed(num, len)
    },
    handleClaim() {
      if (!this.account || !this.account.name || this.claim) {
        return
      }
      this.claim = true;
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: []
      }

      this.dfsPoolsMid.forEach(v => {
        const actions = {
          account: 'miningpool11',
          name: 'claim2',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
            mid: v,
          }
        }
        params.actions.push(actions)
      })
      
      this.tagPoolsMid.forEach(v => {
        const lpAction = {
          account: this.baseConfig.nodeMiner,
          name: 'claim',
          authorization: [{ 
            actor: formName,
            permission,
          }],
          data: {
            user: formName,
            mid: v
          },
        }
        params.actions.push(lpAction)
      })
      console.log(params)
      DApp.toTransaction(params, (err) => {
        this.claim = false;
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
          // 查询代理账户数据
          this.$emit('listenUpdata', 'acc')
        }, 1500);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.rewards{
  text-align: left;
  font-size: 32px;
  border-radius: 20px;
  padding: 22px 36px 34px;
  box-shadow: 4px 4px 10px 4px rgba(230,230,230,0.64);
}
.nums{
  margin: 20px 0;
  .numDiv{
    flex: 1;
    margin-right: 30px;
    &:last-child{
      margin-right: 0;
    }
    .num{
      font-size: 56px;
      color: $color-main;
      .token{
        font-size: 36px;
        margin-left: 9px;
        padding-bottom: 7px;
      }
    }
    .tip{
      margin-top: 6px;
      color: #B9B7B7;
    }
  }
}
.claimBtn{
  height: 100px;
  background: $color-main;
  color: #FFF;
  font-size: 40px;
  border-radius: 16px;
}
</style>