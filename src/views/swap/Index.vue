<template>
  <div class="swap">
    <Tabs />
    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item name="1">内容</van-collapse-item>
      <van-collapse-item name="2">内容</van-collapse-item>
      <van-collapse-item name="3">内容</van-collapse-item>
    </van-collapse>
    <span @click="handleClose">close</span>
    <span @click="handleShow">open</span>
  </div>
</template>

<script>
import Tabs from '../index/components/Tabs';

export default {
  name: 'newSwap',
  components: {
    Tabs,
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
}
</style>
