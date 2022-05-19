<template>
  <div class="actions">
    <div class="title">{{ $t('dsr.retrieve') }}</div>
    <div class="content">
      <div class="item">
        <div class="info flexb">
          <span class="type">{{ $t('dex.coin', {coin: ''}) }}</span>
          <span @click="handleClickBalan('pay')">{{ $t('dsr.depositBal') }}: {{ myDepositInfo.bal }}</span>
        </div>
        <div class="iptDiv flexb">
          <div class="coinInfo flex">
            <div class="coinImg"><img width="100%" :src="thisMarket.imgUrl" :onerror="$errorImg" alt=""></div>
            <div>
              <div class="coin">{{ thisMarket.symbol }}</div>
              <div class="contract tip">{{ thisMarket.contract }}</div>
            </div>
          </div>
          <div class="inputDiv">
            <el-input class="elIpt" type="number" v-model="payNum" placeholder="0.0"
              @focus="handleFocus('pay')"
              @blur="handleBlur('pay')"></el-input>
          </div>
        </div>
      </div>
      <div class="flexc allTip" v-if="!myDepositInfo.isRelease">
        <!-- <span>已存入: 10000.0000 DFS</span>
        <span>未到期: 9000.0000 DFS ></span> -->
        {{ $t('dsr.endDate') }}：{{myDepositInfo.releaseTime}}
      </div>
    </div>
    <div class="btnDiv">
      <div class="btn flexc" v-loading="loading" @click="handleWithdraw">{{ $t('public.confirm') }}</div>
    </div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import { toFixed } from '@/utils/public';
export default {
  data() {
    return {
      token: '0.0000',
      payNum: '',
      thisMarket: {
        symbol: 'DFS',
        contract: 'minedfstoken',
        decimal: 4,
        imgUrl: 'https://leafy-kataifi-c6d825.netlify.app/coin/minedfstoken-dfs.png'
      },
      loading: false,
    }
  },
  props: {
    myDepositInfo: {
      type: Object,
      default: function mdi() {
        return {}
      }
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    })
  },
  methods: {
    handleFocus() {
      const n = Number(this.payNum);
      n > 0 ? this.payNum = n : this.payNum = '';
    },
    handleBlur() {
      const n = Number(this.payNum);
      n > 0 ? this.payNum = toFixed(n, 4) : this.payNum = '';
    },
    handleClickBalan() {
      this.payNum = this.myDepositInfo.balance || '0.0000';
    },
    handleReg() {
      if (!Number(this.payNum)) {
        return false
      }
      if (!this.myDepositInfo.isRelease) {
        return false;
      }
      if (Number(this.myDepositInfo.balance) < Number(this.payNum)) {
        this.$message.error('存款余额不足')
        return false
      }
      return true;
    },
    handleWithdraw() {
      if (this.loading) {
        return
      }
      if (!this.handleReg()) {
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: [
          {
            account: 'dfsdsrsystem',
            name: 'withdraw',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
              quantity: `${this.payNum} DFS`,
            }
          },
        ]
      }
      this.loading = true;
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
        this.$emit('listenClose', true)
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.actions{
  padding: 40px;
  .title{
    font-size: 32px;
    color: #c05d5d;
    margin-bottom: 20px;
  }
  .item{
    padding: 20px;
    border: 1px solid #f3f3f3;
    border-radius: 30px;
    &.focus{
      border:1px solid rgba(7,215,155,1);
    }
    &.pdb10{
      padding-bottom: 28px;
    }
    .info{
      font-size: 24px;
      margin-bottom: 24px;
      .type{
        font-size: 28px;
      }
    }
    .iptDiv{
      .coinInfo{
        text-align: left;
        flex: 3;
        .coinImg{
          width: 60px;
          height: 60px;
          margin-right: 10px;
        }
        .coin{
          font-size: 28px;
          font-weight: 500;;
          line-height: 30px;
        }
        .contract{
          line-height: 30px;
        }
        .ableGet{
          color: #2F3F52;
        }
      }
      .inputDiv{
        flex: 4;
        .elIpt{
          /deep/ .el-input__inner{
            color: $color-black;
            border: 0px;text-align: right;
            font-size: 52px;
            padding: 0 0 0 20px;
            height: 62px;
          }
        }
      }
    }
    .time{
      margin: 20px 0 0;
      .select{
        height: 60px
      }
      /deep/ .el-select{
        .el-input__suffix-inner{
          display: flex;
          align-items: center;
          height: 60px;
        }
        .el-input__inner{
          height: 60px;
          font-size: 16px;
          text-align: right;
          width: 160px;
          border: 0px;
          padding-right: 38px;
          &:focus{
            border-color: #07d79b;
          }
        }
      }
      /deep/ .el-scrollbar{
        .el-select-dropdown__item{
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: normal;
          &.selected{
            font-weight: bold;
            color: #07d79b;
          }
        }
      }
    }
  }
  .allTip{
    font-size: 28px;
    margin: 20px 0;
    color: #f5a623;
  }
}
.btnDiv{
  margin: 30px 0 0;
  font-size: 32px;
  font-weight: 500;
  .btn{
    height: 88px;
    background:rgba(192,93,93,1);
    border-radius:30px;
    color: #fff;
    &:active{
      background:rgba(185,78,90,1);
    }
  }
}
</style>
