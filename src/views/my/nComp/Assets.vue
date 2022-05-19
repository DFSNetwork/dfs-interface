<template>
  <div class="assetsComp">
    <div class="count item">
      <div class="title din flexa">
        <span>{{ $t('my.accAssets') }}</span>
        <span v-if="countByU">(USDT)</span>
        <span v-else>(EOS)</span>
        <img class="eye" v-if="!hideAss" @click="hideAss = !hideAss"
          src="https://leafy-kataifi-c6d825.netlify.app/dfs/eye.png">
        <img class="eye hideeye" v-else  @click="hideAss = !hideAss"
          src="https://leafy-kataifi-c6d825.netlify.app/dfs/hide.png">
      </div>
      <div class="flexend" v-if="!hideAss">
        <span class="amt dinBold" v-if="countByU">{{ allCount }}</span>
        <span class="amt dinBold" v-else>{{ allCountEos }}</span>
        <span class="small flexa">
          <span>≈ ¥{{ allCountCNY }}</span>
          <img class="exCount"  @click="countByU = !countByU"
            src="https://leafy-kataifi-c6d825.netlify.app/dfs/switch.png">
        </span>
      </div>
      <div class="flexa" v-else>
        <span class="amt dinBold">********</span>
        <img class="exCount" @click="countByU = !countByU"
            src="https://leafy-kataifi-c6d825.netlify.app/dfs/switch.png">
      </div>
    </div>
    <div class="walletTrans flexb">
      <div class="flexa" @click="handleTo('myTransfer')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/transfer.png">
        <span>{{ $t('newwallet.transfer') }}</span>
      </div>
      <div class="flexa" @click="handleTo('myReceive')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/payment.png">
        <span>{{ $t('newwallet.receive') }}</span>
      </div>
      <div class="flexa" @click="handleTo('index')">
        <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/transaction.png">
        <span>{{ $t('newwallet.trade') }}</span>
      </div>
    </div>
    <div class="tools tip item flexb">
      <div class="flexa" @click="hidLess = !hidLess">
        <div class="select">
          <img class="hideImg" v-if="hidLess"
            src="https://storied-crepe-e5e65c.netlify.app/icon/checked.png" alt="">
        </div>
        <div>{{ $t('my.hideMinAssets') }}</div>
        <img class="tips" src="">
      </div>
      <div class="flexa searchDiv">
        <img class="searchImg" src="https://storied-crepe-e5e65c.netlify.app/icon/search.png">
        <van-field class="searchIpt" v-model="search"
          @input="handleSearch"
          :placeholder="$t('my.search')" />
      </div>
    </div>
    <!-- 币种列表 -->
    <div class="coinLists">
      <div class="noDate" v-if="!sArr.length">{{ $t('public.noData') }}</div>
      <template v-for="(v, i) in sArr">
        <div class="item flexb" v-if="!(parseFloat(v.countUsdt || 0) < minNum && hidLess)" :key="i">
          <div class="coin flexa">
            <img class="logo" :src="v.imgUrl" :onerror="$errorImg">
            <div>
              <div>{{ v.symbol }}</div>
              <div class="flexa about">
                <span class="label">{{ $t('my.value') }}</span>
                <div v-if="!hideAss">
                  <div class="num dinReg" v-if="countByU">{{ parseFloat(v.countUsdt || 0).toFixed(2) }} USD</div>
                  <div class="num dinReg" v-else>{{ parseFloat(v.countEos || 0).toFixed(2) }} EOS</div>
                </div>
                <span v-else class="num dinReg">****</span>
              </div>
            </div>
          </div>
          <div class="bals" v-if="!hideAss">
            <div class="flexa">
              <span class="label">{{ $t('my.bal') }}：</span>
              <span class="num dinReg">{{ v.amount || '0.0000' }}</span>
            </div>
            <div class="flexa">
              <span class="label">{{ $t('my.liqs') }}：</span>
              <span class="num dinReg">{{ v.bal || '0.0000' }}</span>
            </div>
            <div class="flexa"
              v-if="v.symbol === 'DFS' || v.symbol === 'TAG' || v.symbol === 'YFC'">
              <span class="label">DSS：</span>
              <span class="num dinReg">{{ v.dss || '0.0000' }}</span>
            </div>
          </div>
          <div class="bals" v-else>
            <div class="flexa">
              <span class="label">{{ $t('my.bal') }}：</span>
              <span class="num dinReg">****</span>
            </div>
            <div class="flexa">
              <span class="label">{{ $t('my.liqs') }}：</span>
              <span class="num dinReg">****</span>
            </div>
            <div class="flexa"
              v-if="v.symbol === 'DFS' || v.symbol === 'TAG' || v.symbol === 'YFC'">
              <span class="label">DSS：</span>
              <span class="num dinReg">****</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'assetsComp',
  props: {
    allBals: {
      type: Array,
      default: function abs() {
        return []
      }
    },
    allCountCNY: {
      type: String,
      default: '0.00'
    },
  },
  data() {
    return {
      minNum: 1,
      search: '',
      sArr: [],
      hidLess: true,
      countByU: true,
      hideAss: false,
      wallet: '',
    }
  },
  mounted() {
    this.wallet = localStorage.getItem('WALLET')
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
    allCount() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.countUsdt || 0)
      })
      return count.toFixed(4)
    },
    allCountEos() {
      let count = 0;
      this.allBals.forEach(v => {
        count = parseFloat(count || 0) + parseFloat(v.countEos || 0)
      })
      return count.toFixed(4)
    },
  },
  watch: {
    allBals: {
      handler: function abs() {
        this.handleSearch()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleTo(name) {
      this.$router.push({
        name
      })
    },
    handleSearch() {
      if (!this.search) {
        this.sArr = this.allBals;
        return
      }
      this.sArr = this.allBals.filter(v => v.symbol.indexOf(this.search.toUpperCase()) !== -1)
    }
  }
}
</script>

<style lang="scss" scoped>
.assetsComp{
  font-size: 28px;
  text-align: left;
  .noDate{
    padding: 50px 0;
    font-size: 24px;
    color: #999;
    text-align: center;
  }
  .walletTrans{
    padding: 0 28px;
    height: 118px;
    border-bottom: 1px solid $color-border;
    font-size: 28px;
    img{
      width: 60px;
      margin-right: 18px;
    }
    &>div{
      // flex: 1;
      // margin-right: 80px;
      &:last-child{
        margin-right: 0;
      }
    }
  }
  .item{
    padding: 34px 24px;
    border-bottom: 1px solid $color-border;
  }
  .count{
    padding: 24px 24px;
    .title{
      margin-bottom: 10px;
    }
    .amt{
      font-size: 40px;
    }
    .small{
      font-size: 24px;
      margin-left: 15px;
    }
    .exCount{
      width: 32px;
      margin-left: 20px;
    }
    .eye{
      margin-top: 5px;
      margin-left: 15px;
      width: 32px;
      display: block;
    }
    .hideeye{
      margin-top: 10px;
    }
  }
  .tools{
    padding: 20px 24px;
    .select{
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid $color-border;
      margin-right: 10px;
      .hideImg{
        width: 100%;
      }
    }
    .tips{
      width: 32px;
      margin-left: 10px;
    }
    .searchDiv{
      border: 1px solid $color-border;
      padding: 4px 18px;
      border-radius: 40px;
    }
    .searchImg{
      width: 28px;
      // margin-right: 10px;
    }
    .searchIpt{
      padding: 0 0px;
      width: 150px;
      /deep/ .van-field__control{
        text-align: center;
      }
    }
  }

  .coin{
    font-size: 30px;
    font-weight: 500;
    flex: 4;
    .logo{
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 15px;
    }
    .about{
      margin-top: 9px;
      .label{
        font-size: 24px;
        color: #666666;
        margin-right: 10px;
      }
      .num{
        font-size: 30px;
      }
    }
  }
  .bals{
    flex: 3;
    &>div{
      margin-bottom: 9px;
      &:last-child{
        margin-bottom: 0;
      }
    }
    .label{
      font-size: 24px;
      color: #666666;
      margin-right: 10px;
    }
    .num{
      font-size: 30px;
      max-width: 200px;
      overflow: hidden;
    }
  }
}
</style>
