<template>
  <div class="swap">
    <div class="box">
      <Tabs />
      <SwapInfo />
    </div>
  </div>
</template>

<script>
import Tabs from '../index/components/Tabs';
import SwapInfo from '@/views/swap/comp/SwapInfo';

export default {
  name: 'newSwap',
  components: {
    Tabs,
    SwapInfo,
  },
  data() {
    return {
      activeNames: ''
    }
  },
  methods: {
    handleClose() {
      this.activeNames = ''
    },
    handleShow() {
      this.activeNames = '1'
    },
  }
}
</script>

<style lang="scss" scoped>
.swap{
  margin: 20px 30px;
  .box{
    box-shadow: 2px 2px 6px 4px rgba(243,243,243,1);
    border-radius: 20px;
  }
}
</style>
