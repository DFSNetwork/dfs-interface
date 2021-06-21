<template>
  <div class="header flexb">
    <div class="tools flexb">
      <div class="logoDiv flexa" :class="{'ani': ani}" @click="handleToIndex" @dblclick="handleDbClick">
        <img class="logo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/minedfstoken-dfs.png">
        <div>
          <div class="name">DeFis</div>
          <div class="network">Network</div>
        </div>
      </div>

      <div class="flexa">
        <span class="record" @click="handleSetLocal">
          <img class="svgIcon" @click="handleTo('update')"
            src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/up-record.png">
          <div class="desc" v-if="localVes !== rdVes"></div>
        </span>
        <img class="svgIcon"  @click="handleShowNav"
          src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/menu.png">
      </div>
    </div>
    <van-popup class="popup_p" v-model="showEgg">
      <Msg v-if="showEgg"/>
    </van-popup>
  </div>
</template>

<script>
import Msg from '@/views/konami/dialog/Msg'
export default {
  name: 'headerTools',
  components: {
    Msg
  },
  data() {
    return {
      ani: false,
      aniTimer: null,
      showEgg: false,
      rdVes: 3,
      localVes: parseInt(localStorage.getItem('rdVs') || 0),
    }
  },
  methods: {
    handleSetLocal() {
      this.localVes = this.rdVes
      localStorage.setItem('rdVs', this.rdVes)
    },
    handleToIndex() {
      clearTimeout(this.aniTimer)
      this.ani = true;
      this.aniTimer = setTimeout(() => {
        this.ani = false;
      }, 200);
      if (this.$route.name === 'home') {
        return
      }
      this.$router.push({name: 'home'})
    },
    handleTo(name, params) {
      if (this.$route.name === name)  {
        return;
      }
      this.$router.push({
        name: name,
        params,
      })
    },
    handleDbClick() {
      this.showEgg = true;
    },
    handleShowNav() {
      this.$emit('listenShowNav', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.header{
  background: $color-bgcolor;
  height: 110px;
  padding: 0 18px 0 40px;
  font-size: 28px;
  color: $color-tip;
  margin-bottom: 5px;
  img{
    display: block;
  }
  .tools{
    width: 100%;
    .logoDiv{
      position: relative;
      margin-right: 10px;
      transition: .3s all;
      transform: scale(1);
      color: #333;
      text-align: left;
      &.ani{
        transform: scale(1.2) !important;
      }
      .logo{
        position: relative;
        height: 80px;
        width: 80px;
        margin-right: 10px;
      }
      .name{
        font-size: 32px;
        font-weight: 600;
      }
      .network{
        font-size: 300;
        font-size: 26px;
      }
    }
    .create{
      box-sizing: border-box;
      box-shadow: none;
      padding: 10px;
      color: #000;
      margin-left: 00px;
      .downdraw{
        width: 12px;
        margin-left: 8px;
      }
    }
    .svgIcon{
      width: 80px;
      margin-left: 15px;
    }
    .record{
      position: relative;
      .desc{
        position: absolute;
        background: #EB0000;
        width: 12px;
        height: 12px;
        border-radius: 7px;
        top: 15px;
        right: 15px;
      }
    }
  }
}
</style>