<template>
  <div class="marketInfo">
    <div class="flexb info">
      <div class="coin flexa">
        <div class="token flexa">
          <img class="coinImg" :src="checkedMarket.imgUrl1 || errorCoinImg" :onerror="errorCoinImg">
          <div class="">
            <div class="tokenName din">{{ checkedMarket.symbol1 }}/{{ checkedMarket.symbol0 }}</div>
            <div class="tokenContract tip">{{ checkedMarket.contract1 }}</div>
          </div>
        </div>
      </div>
      <div class="follow">
        <img v-if="isLike" @click="handleCancelLike" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/star-is.png">
        <img v-else @click="handleAddLike" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/star-un.png">
      </div>
    </div>
    <!-- 交易对信息 -->
    <div class="mksInfo flexb din">
      <div>
        <div class="mksRate" :class="{
          'red': parseFloat(checkedMarket.priceRate || 0) < 0
        }">{{ checkedMarket.priceRate }}</div>
        <div class="abtPrice tip" v-if="language === 'zh-CN'">¥{{ checkedMarket.aboutPriceCNY }}</div>
        <div class="abtPrice tip" v-else>${{ checkedMarket.aboutPriceU }}</div>
      </div>
      <div>
        <div class="subInfo flexb">
          <div class="infoItem">
            <div class="label">{{ $t('kline.lasterPrice') }}({{ checkedMarket.symbol0 }})</div>
            <div>{{ checkedMarket.price }}</div>
          </div>
          <div class="infoItem">
            <div class="label">{{ $t('kline.vol') }}({{ checkedMarket.symbol0 }})</div>
            <div>{{ parseInt(checkedMarket.volume24HToUsdt || 0) }}</div>
          </div>
        </div>
        <div class="subInfo flexb">
          <div class="infoItem">
            <div class="label">{{ $t('kline.apy') }}</div>
            <div>{{ checkedMarket.apy }}%</div>
          </div>
          <div class="infoItem">
            <div class="label">{{ $t('kline.fees') }}({{ checkedMarket.symbol0 }})</div>
            <div>{{ handleGetFees(checkedMarket.volume24HToUsdt) | numToCnt }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 年化详情 -->
    <el-dialog
      class="myDialog apy"
      :visible.sync="showApyDetail">
      <MarketApy :countApy="checkedMarket.apy" :isActual="true"
                 :aprInfo="checkedMarket.apy_detail"/>
    </el-dialog>

    <!-- 关于做市 -->
    <el-dialog
      class="myDialog apy"
      :show-close="false"
      :visible.sync="showAboutMarket">
      <AboutMarket />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DApp } from '@/utils/wallet';
import MarketApy from '@/views/market/popup/MarketApy'
import AboutMarket from '@/views/market/popup/AboutMarket'
import { dealNum } from '@/utils/public'

export default {
  props: {
    checkedMarket: {
      type: Object,
      default: function cmt() {
        return {}
      }
    }
  },
  components: {
    MarketApy,
    AboutMarket,
  },
  data() {
    return {
      errorCoinImg: 'this.src="https://ndi.340wan.com/eos/eosio.token-eos.png"',
      likeArr: [],
      isExPrice: false,
      showApyDetail: false,
      showAboutMarket: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      language: state => state.app.language,
    }),
    isLike() {
      const has = this.likeArr.find(v => v.mid === this.checkedMarket.mid)
      return !!has;
    },
    exPrice() {
      if (!parseFloat(this.checkedMarket.price)) {
        return 0
      }
      const exp = 1 / parseFloat(this.checkedMarket.price);
      return exp.toFixed(6)
    },
  },
  watch: {
    account: {
      handler: function acc(newVal) {
        if (!newVal.name) {
          return
        }
        this.handleGetLikes();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleGetFees(num) {
      const fees = parseFloat(num || 0) * 0.003;
      return fees.toFixed(this.checkedMarket.decimal0)
    },
    handleDealNum(num) {
      return dealNum(num)
    },
    handleTo(name) {
      this.$router.push({
        name,
        params: {
          mid: this.checkedMarket.mid
        }
      })
    },
    async handleGetLikes() {
      if (!this.account.name) {
        return
      }
      const {status, result} = await this.$api.get_acc_follow();
      if (!status) {
        return
      }
      const rows = result.rows;
      if (!rows.length) {
        this.likeArr = [];
        return
      }
      this.likeArr = rows;
    },

    handleCancelLike() {
      if (!this.account.name) {
        this.$router.push({
          name: 'loginWallet'
        })
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: [{
          account: 'dfsusersinfo',
          name: 'unlike',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
            mid: this.checkedMarket.mid
          }
        }]
      }
      DApp.toTransaction(params, (err) => {
        if (err && err.code == 402) {
          return;
        }
        if (err) {
          this.$message({
            type: 'error',
            message: err.message,
          })
          return;
        }
        this.$message({
          type: 'success',
          message: '操作成功'
        })
        setTimeout(() => {
          this.handleGetLikes()
        }, 1000);
      })
    },
    handleAddLike() {
      if (!this.account.name) {
        this.$router.push({
          name: 'loginWallet'
        })
        return
      }
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: [{
          account: 'dfsusersinfo',
          name: 'like',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            user: formName,
            mid: this.checkedMarket.mid
          }
        }]
      }
      DApp.toTransaction(params, (err) => {
        if (err && err.code == 402) {
          return;
        }
        if (err) {
          this.$message({
            type: 'error',
            message: err.message,
          })
          return;
        }
        this.$message({
          type: 'success',
          message: '操作成功'
        })
        setTimeout(() => {
          this.handleGetLikes()
        }, 1000);
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.marketInfo{
  padding: 20px 28px 20px;
  .info{
    margin-bottom: 10px;
  }
  .coin{
    flex: 1;
    .token{
      // flex: 1;
      min-width: 200px;
      max-width: 300px;
    }
    .coinImg{
      width: 60px;
      height: 60px;
      border-radius: 30px;
      margin-right: 10px;
    }
    .tokenName{
      font-size: 28px;
      color: #333;
    }
    .tokenContract{
      font-size: 24px;
      margin-top: 0px;
    }
    .add{
      margin: 0 30px;
    }
  }
  .follow{
    // width: 42px;
    img{
      width: 42px;
    }
  }
  .price{
    font-size: 30px;
    margin-bottom: 15px;
    .exImg{
      width: 36px;
      margin-left: 20px;
    }
  }
  .rate{
    margin-bottom: 26px;
    .green{
      color: #1FCD12; // #29d4b0 // 1FCD12
    }
    .red {
      color: #fe3b37;
    }
  }
  .bg{
    padding: 26px 22px;
    background: #FAFAFA;
    border-radius: 20px;
    .item{
      margin-bottom: 12px;
      .detail{
        color: #29d4b0;
        margin-left: 20px;
      }
    }
    .subTitle{
      color: #A6A6A6;
    }
    .qusImg{
      width: 28px;
      margin-left: 16px;
    }
  }
}

.myDialog{
  /deep/ .el-dialog{
    position: relative;
    margin: auto;
    width: 570px;
    border-radius: 20px;
    .el-dialog__body,
    .el-dialog__header{
      padding: 0;
    }
  }
  &.apy{
    /deep/ .el-dialog{
      width: 620px;
    }
  }
}

.mksRate{
  font-size: 52px;
  font-weight: bold;
  color: #5AAF90;
  &.red{
    color: #e54f5d;
  }
}
.abtPrice{
  font-size: 30px;
  margin-top: 6px;
}
.subInfo{
  font-size: 24px;
  margin-bottom: 10px;
  .infoItem{
    &:last-child{
      margin-left: 70px;
    }
  }
  .label{
    color: #A6A6A6;
    margin-bottom: 6px;
  }
}
</style>
