<template>
  <div class="banner">
    <van-swipe class="my-swipe" :autoplay="6000" indicator-color="white">
      <!-- <van-swipe-item>
        <img class="bannerImg" v-if="language === 'zh-CN'"
          src="https://leafy-kataifi-c6d825.netlify.app/dfs/banner1.png">
        <img class="bannerImg" v-else
          src="https://leafy-kataifi-c6d825.netlify.app/dfs/banner1-en.png">
      </van-swipe-item> -->

      <van-swipe-item>
        <img class="bannerImg"
          src="https://leafy-kataifi-c6d825.netlify.app/banner/new-inviter.png">
      </van-swipe-item>
      <van-swipe-item>
        <img class="bannerImg" @click="handleToObj('town')"
          src="https://venerable-semolina-21a376.netlify.app//Town-img/login/banner.png">
      </van-swipe-item>
      <van-swipe-item>
        <img class="bannerImg" @click="handleToObj('nft')"
          src="https://leafy-kataifi-c6d825.netlify.app/banner/opensky.png">
      </van-swipe-item>
      <van-swipe-item>
        <img class="bannerImg" @click="handleToObj('nft')"
          src="https://leafy-kataifi-c6d825.netlify.app/banner/nft-banner-1.png">
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'homeBanner',
  computed: {
    ...mapState({
      language: state => state.app.language, // 基础配置 - 默认为{}
    })
  },
  methods: {
    handleToObj(type) {
      if (type === 'trade') {
        location.href = 'https://dfsfans.io/?page=home&tab=play'
      }
      if (type === 'nft') {
        location.href = 'https://dfsopensky.netlify.app/'
      }
      if (type === 'town') {
        location.href = 'https://dfsfarms.netlify.app/'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.banner{
  background: #FFF;
  border-radius: 20px;
  overflow: hidden;
  padding: 10px 0;
  /deep/ .van-swipe-item{
    width: 100%;
    padding: 0 28px;
    box-sizing: border-box;
  }
  .bannerImg{
    border-radius: 20px;
    width: 100%;
    max-height: 280px;
    display: block;
  }
}
</style>
