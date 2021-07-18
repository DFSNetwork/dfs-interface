<template>
  <div class="banner">
    <van-swipe class="my-swipe" :autoplay="6000" indicator-color="white">
      <!-- <van-swipe-item>
        <img class="bannerImg" v-if="language === 'zh-CN'"
          src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/banner1.png">
        <img class="bannerImg" v-else
          src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/banner1-en.png">
      </van-swipe-item> -->

      <van-swipe-item>
        <img class="bannerImg"
          src="https://cdn.jsdelivr.net/gh/defis-net/material2/banner/new-inviter.png">
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
