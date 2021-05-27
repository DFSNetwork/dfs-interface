<template>
  <div class="mineHome">
    <div class="flexb nav">
      <div class="flexc item" :class="{'act': act === 0}" @click="handleAct(0)">
        <img class="tokenLogo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/minedfstoken-dfs.png">
        <span>DSS</span>
      </div>
      <div class="flexc item" :class="{'act': act === 1}" @click="handleAct(1)">
        <img class="tokenLogo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/tagtokenmain-tag.png">
        <span>DSS</span>
      </div>
      <div class="flexc item" :class="{'act': act === 2}" @click="handleAct(2)">
        <img class="tokenLogo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/coin/yfctokenmain-yfc.png">
        <span>DSS</span>
      </div>
    </div>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'mineHome',
  data() {
    return {
      act: 0,
    }
  },
  watch: {
    '$route': {
      handler: function rt(newVal) {
        if (newVal.name === 'dssHomeDfs') {
          this.act = 0;
        } else if (newVal.name === 'dssHomeTag') {
          this.act = 1;
        } else {
          this.act = 2;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleAct(act) {
      let name = 'dssHomeDfs';
      if (act === 1) {
        name = 'dssHomeTag';
      } else if(act === 2) {
        location.href = "https://yfc.one/vault"
        return
      }
      this.$router.replace({
        name
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mineHome{
  .nav{
    font-size: 32px;
    color: #333;
    margin-bottom: 25px;
    padding-top: 25px;
    .tokenLogo{
      width: 44px;
      height: 44px;
      margin-right: 15px;
    }
    .item{
      flex: 1;
      height: 84px;
      margin: 0 28px;
      box-shadow: 0px 4px 8px 4px rgba(227,227,227,0.5);
      border-radius: 12px;
    }
    .act{
      color: #FFF;
      background: $color-main;
      box-shadow: none;
    }
  }
}
</style>
