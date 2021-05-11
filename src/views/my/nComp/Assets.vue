<template>
  <div class="assetsComp">
    <div class="count item">
      <div class="title din">账户资产 (USDT)</div>
      <div>
        <span class="amt dinBold">1.334</span>
        <span class="small">≈ 8.91 CNY</span>
      </div>
    </div>
    <div class="tools tip item flexb">
      <div class="flexa">
        <div class="select"></div>
        <div>隐藏小额资产</div>
        <img class="tips" src="">
      </div>
      <div class="flexa">
        <img class="searchImg" src="">
        <van-field class="searchIpt" v-model="value" placeholder="搜索币种" />
      </div>
    </div>
    <!-- 币种列表 -->
    <div class="coinLists">
      <div class="item">
        <div class="coin flexa">
          <img class="logo" src="https://ndi.340wan.com/eos/usdxusdxusdx-usdc.png">
          <span>EOS</span>
        </div>
        <div class="flexb balData">
          <div class="bal">
            <div class="subTitle">估值</div>
            <div class="num din">1000.0000</div>
            <div class="abt din">¥6500.00</div>
          </div>
          <div class="bal">
            <div class="subTitle">做市</div>
            <div class="num din">1000.0000</div>
            <div class="abt din">¥6500.00</div>
          </div>
          <div class="bal">
            <div class="subTitle">余额</div>
            <div class="num din">1000.0000</div>
            <div class="abt din">¥6500.00</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'assetsComp',
  data() {
    return {
      value: '',
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
