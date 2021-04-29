<template>
  <div class="speedTip">
    <div class="title">流速规则</div>
    <div class="rls">每日基础发行量：3600 DFS</div>
    <div class="rls">衰减系数：没发行100万DFS，衰减25%</div>
    <div class="rls">当前衰减系数：{{ parseFloat(damping).toFixed(4) }}</div>
    <div class="rls">流速计算公式：(每日基础发行量 * 衰减系数) / 86400</div>
    <div class="rls">当前流速：{{ speed }} DFS/秒</div>

    <div class="rls"><strong>DFS以当前流速流入以下矿池</strong></div>
    <ul class="ul">
      <li>DFS矿池：35%</li>
      <li>EOS矿池：30%</li>
      <li>USDT矿池：25%</li>
      <li>DSS矿池：10%</li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'speedDfs',
  props: {
    speed: {
      type: String,
      default: '0.0000'
    }
  },
  computed: {
    // damping
    ...mapState({
      damping: (state) => state.sys.damping,
    }),
  },
}
</script>

<style lang="scss" scoped>
.speedTip{
  padding: 40px;
  text-align: left;
  .title{
    text-align: center;
    font-size: 36px;
    font-weight: 500;
    margin-bottom: 20px;
  }
  div{
    margin: 5px 0;
  }
  .ul{
    padding-left: 40px;
    list-style-type: disc;
    li{
      margin: 5px 0;
    }
  }
}
</style>
