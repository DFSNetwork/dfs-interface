<template>
  <div class="assetsComp">
    <div class="count item">
      <div class="title din">账户资产 (USDT)</div>
      <div>
        <span class="amt dinBold">${{ allCount }}</span>
        <span class="small">≈ {{ allCountCNY }} CNY</span>
      </div>
    </div>
    <div class="tools tip item flexb">
      <div class="flexa" @click="hidLess = !hidLess">
        <div class="select">
          <img class="hideImg" v-if="hidLess"
            src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/checked.png" alt="">
        </div>
        <div>隐藏小额资产</div>
        <img class="tips" src="">
      </div>
      <div class="flexa">
        <img class="searchImg" src="">
        <van-field class="searchIpt" v-model="search"
          @input="handleSearch"
          placeholder="搜索币种" />
      </div>
    </div>
    <!-- 币种列表 -->
    <div class="coinLists">
      <template v-for="(v, i) in sArr">
        <div class="item" v-if="!(parseFloat(v.count || 0) < minNum && hidLess)" :key="i">
          <div class="coin flexa">
            <img class="logo" :src="v.imgUrl" :onerror="$errorImg">
            <span>{{ v.symbol }}</span>
          </div>
          <div class="flexb balData">
            <div class="bal">
              <div class="subTitle">总计</div>
              <div class="num din">{{ v.count || '0.0000' }}</div>
              <div class="abt din">¥{{ v.countCNY || '0.00' }}</div>
            </div>
            <div class="bal">
              <div class="subTitle">做市</div>
              <div class="num din">{{ v.bal || '0.0000' }}</div>
              <div class="abt din">¥{{ v.balCNY || '0.00' }}</div>
            </div>
            <div class="bal">
              <div class="subTitle">余额</div>
              <div class="num din">{{ v.amount || '0.0000' }}</div>
              <div class="abt din">¥{{ v.amtCNY || '0.00' }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
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
    allCount: {
      type: String,
      default: '0.00'
    },
  },
  data() {
    return {
      minNum: 1,
      search: '',
      sArr: [],
      hidLess: false,
    }
  },
  watch: {
    allBals: {
      handler: function abs(newVal) {
        this.sArr = newVal
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
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
  .item{
    padding: 24px;
    border-bottom: 1px solid $color-border;
  }
  .count{
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
  }
  .tools{
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
    .searchImg{
      width: 32px;
      margin-right: 10px;
    }
    .searchIpt{
      padding: 0 8px;
      width: 150px;
      /deep/ .van-field__control{
        text-align: center;
      }
    }
  }

  .coin{
    font-size: 30px;
    font-weight: 500;
    margin-bottom: 15px;
    .logo{
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
  .balData{
    .bal{
      &:last-child{
        text-align: right;
      }
      .subTitle{
        font-size: 24px;
        color: #999;
        margin-bottom: 6px;
      }
      .num{
        font-size: 32px;
        margin-bottom: 6px;
      }
      .abt{
        font-size: 24px;
        font-weight: 300;
      }
    }
  }
}
</style>
