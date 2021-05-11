<template>
  <div class="marketsComp">
    <div class="item claimDiv flexb">
      <div class="cnt">
        <div class="title">做市资产(USDT)</div>
        <div>
          <span class="num dinBold">1.334</span>
          <span class="small">≈ 8.91 CNY</span>
        </div>
      </div>
      <div class="claimBtn flexc">一键领取</div>
    </div>

    <div class="lists">
      <div class="item">
        <div class="coin din flexa">
          <img class="logo" src="https://ndi.340wan.com/eos/usdxusdxusdx-usdc.png">
          <span>DFS</span>

          <img class="add" src="https://cdn.jsdelivr.net/gh/defis-net/material/svg/add.svg">

          <img class="logo" src="https://ndi.340wan.com/eos/usdxusdxusdx-usdc.png">
          <span>USDT</span>
        </div>
        <div class="info dinReg">
          <div class="flexb">
            <span class="label">我的做市</span>
            <span>64821.1157 DFS / 3734.8389 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市本金</span>
            <span>64821.1157 DFS / 3734.8389 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市盈亏</span>
            <span>+2838.383 DFS / -388.938 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市时长</span>
            <span>3天0时0分0秒</span>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="coin din flexa">
          <img class="logo" src="https://ndi.340wan.com/eos/usdxusdxusdx-usdc.png">
          <span>DFS</span>

          <img class="add" src="https://cdn.jsdelivr.net/gh/defis-net/material/svg/add.svg">

          <img class="logo" src="https://ndi.340wan.com/eos/usdxusdxusdx-usdc.png">
          <span>USDT</span>
        </div>
        <div class="info dinReg">
          <div class="flexb">
            <span class="label">我的做市</span>
            <span>64821.1157 DFS / 3734.8389 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市本金</span>
            <span>64821.1157 DFS / 3734.8389 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市盈亏</span>
            <span>+2838.383 DFS / -388.938 USDT</span>
          </div>
          <div class="flexb">
            <span class="label">做市时长</span>
            <span>3天0时0分0秒</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'marketsComp',
}
</script>

<style lang="scss" scoped>
.marketsComp{
  font-size: 28px;
  text-align: left;
  .claimBtn{
    height: 90px;
    font-size: 32px;
    border-radius: 12px;
    background: $color-main;
    color: #FFF;
    padding: 0 36px;
  }
  .item{
    padding: 24px;
    border-bottom: 1px solid $color-border;
  }
  .claimDiv{
    .title{
      margin-bottom: 9px;
    }
    .num{
      font-size: 40px;
    }
    .small{
      margin-left: 15px;
      font-size: 24px;
    }
  }
  .lists{
    .item{
      .coin{
        color: #000;
        margin-bottom: 20px;
      }
      .logo{
        min-width: 60px;
        width: 60px;
        margin-right: 15px;
      }
      .add{
        margin: 0 15px;
      }
      .info{
        font-size: 24px;
        &>div{
          margin: 15px 0;
        }
        .label{
          color: #666;
        }
      }
    }
  }
}
</style>
