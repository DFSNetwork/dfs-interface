<template>
  <div class="tools">
    <!-- 快捷交易 -->
    <!-- <div class="quick flexb">
      <img class="bg" src="https://resource2.dfs.land/dfs/quick_bg.png">
      <div class="info">
        <div class="name">{{ $t('home.oChain') }}</div>
        <div class="tip">{{ $t('home.oChainTip') }}</div>
      </div>
      <div class="btn flexc" @click="handleToPro('dcap')">
        <span>{{ $t('home.onkey') }}</span>
      </div>
    </div> -->

    <!-- 应用工具 -->
    <div class="appLists">
      <van-swipe class="my-swipe" :loop="false" indicator-color="#29D4B0">
        <van-swipe-item>
          <div class="lists flexb">
            <div class="list" @click="handleTo('newPools')">
              <img class="hot" src="https://resource2.dfs.land/dfs/new.png">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/mining_icon.png">
              <div>{{ $t('home.mine') }}</div>
            </div>
            <div class="list" @click="handleToPro('shining')">
              <img class="hot" src="https://resource2.dfs.land/dfs/new.png">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/fun2.png">
              <div>{{ $t('home.shining') }}</div>
            </div>
            <div class="list" @click="handleToPro('vault')">
              <img class="hot" src="https://resource2.dfs.land/dfs/new.png">
              <img class="iconImg small" src="@/assets/img/vault2.png">
              <div>{{ $t('home.vault') }}</div>
            </div>
            <div class="list" @click="handleToPro('town')">
              <!-- <img class="hot" src="https://resource2.dfs.land/dfs/new.png"> -->
              <img class="iconImg" src="https://resource3.dfs.land/Town-img/login/windmill_icon.png">
              <div>{{ $t('home.township') }}</div>
            </div>
            <div class="list" @click="handleToPro('nft')">
              <!-- <img class="hot" src="https://resource2.dfs.land/dfs/new.png"> -->
              <img class="iconImg" src="https://resource2.dfs.land/icon/NFT.png">
              <div>NFT</div>
            </div>
            <div class="list" @click="handleTo('dssHomeDfs')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/dss_icon.png">
              <div>DSS</div>
            </div>
            <div class="list" @click="handleTo('nodeVotePool')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/node_icon.png">
              <div>{{ $t('tab.nodeVote') }}</div>
            </div>
            <div class="list" @click="handleTo('inviter')">
              <!-- <img class="hot" src="https://resource2.dfs.land/dfs/new.png"> -->
              <img class="iconImg" src="https://resource2.dfs.land/dfs/invite1_icon.png">
              <div>{{ $t('home.inviter') }}</div>
            </div>
          </div>
        </van-swipe-item>

        <van-swipe-item>
          <div class="lists flexb">
            <div class="list" @click="handleToPro('usdx')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/usdx_icon.png">
              <div>USDX</div>
            </div>
            <div class="list" @click="handleTo('financial')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/financial_icon.png">
              <div>{{ $t('home.financial') }}</div>
            </div>
            <div class="list" @click="handleToPro('dcap')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/dtoken_icon.png">
              <div>{{ $t('sys.dcap') }}</div>
            </div>
            <div class="list" @click="handleTo('invite')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/farm1_icon.png">
              <div>{{ $t('invite.myFarm') }}</div>
            </div>
            <div class="list" @click="handleTo('vote')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/vote_icon.png">
              <div>{{ $t('home.vote') }}</div>
            </div>
            <div class="list" @click="handleTo('fundation')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/fun2.png">
              <div>{{ $t('home.donate') }}</div>
            </div>
            <!-- <div class="list" @click="handleToPro('suggestions')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/fundation_icon.png">
              <div>{{ $t('home.issues') }}</div>
            </div> -->
            <!-- <div class="list" @click="handleToPro('kline')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/kline_icon.png">
              <div>{{ $t('sys.kline') }}</div>
            </div> -->
            <!-- <div class="list" @click="handleToPro('record')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/note_icon.png">
              <div>{{ $t('home.diary') }}</div>
            </div> -->
            <!-- <div class="list" @click="handleTo('investment')">
              <img class="iconImg" src="https://resource2.dfs.land/dfs/date_icon.png">
              <div>{{ $t('home.investment') }}</div>
            </div> -->
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'homeTools',
  methods: {
    handleTo(name, params) {
      if (name === 'plan') {
        this.$toast('即将上线')
        return
      }
      this.$router.push({
        name, params,
      })
    },
    handleToPro(name) {
      if (name === 'dcap') {
        location.href = 'https://dtoken.netlify.app/convert/'
        return
      }
      if (name === 'record') {
        location.href = 'https://dfsfans.io/'
        return
      }
      if (name === 'usdx') {
        location.href = 'https://usdx.netlify.app/'
        return
      }
      if (name === 'suggestions') {
        location.href = 'https://support.qq.com/embed/323769'
        return
      }
      if (name === 'starteos') {
        location.href = 'https://usdtcross.starteos.io/'
      }
      if (name === 'kline') {
        location.href = 'https://dfs.defiview.io/kline'
      }
      if (name === 'nft') {
        location.href = 'https://dfsopensky.netlify.app/'
      }
      if (name === 'town') {
        location.href = 'https://dfsfarms.netlify.app'
      }
      if (name === 'shining') {
        location.href = 'https://shining.dfs.land'
      }
      if (name === 'vault') {
        location.href = 'https://shining.dfs.land/vault'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tools{
  text-align: left;
}
.quick{
  font-size: 32px;
  padding: 24px 28px;
  background: #FFF;
  border-radius: 10px;
  position: relative;
  margin-bottom: 20px;
  color: #333;
  .info{
    position: relative;
    z-index: 1;
  }
  .tip{
    font-size: 22px;
    font-weight: 300;
  }
  .name{
    font-weight: bold;
    margin-bottom: 8px;
  }
  .btn{
    background: $color-main;
    color: #fff;
    height: 76px;
    width: 188px;
    border-radius: 8px;
    font-size: 28px;
  }
  .bg{
    position: absolute;
    top: 50%;
    left: 55%;
    width: 116px;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
}
.appLists{
  font-size: 24px;
  background: #FFF;
  // padding: 22px 10px;
  border-radius: 10px;
  // margin-bottom: 20px;
  color: #333;
  .my-swipe{
    padding-bottom: 16px;
    margin-bottom: 26px;
    :deep( .van-swipe__track){
      padding: 22px 0px 32px;
      background: #FFF;
      box-sizing: border-box;
    }
    :deep( .van-swipe__indicator){
      background: #999999;
    }
  }
  .lists{
    margin-bottom: 28px;
    text-align: center;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 30px 20px;
    &:last-child{
      margin-bottom: 0px;
    }
  }
  .list{
    flex: 1;
    font-size: 24px;
    position: relative;
    .iconImg{
      width: 60px;
      margin-bottom: 8px;
      &.small{
        width: 50px;
      }
    }
    .hot{
      position: absolute;
      top: 0px;
      right: 35px;
      width: 48px;
    }
  }
}
</style>
