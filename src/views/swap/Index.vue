<template>
  <div class="swap">
    <Tabs />
    <van-collapse v-model="activeNames">
      <van-collapse-item name="1">内容</van-collapse-item>
      <van-collapse-item title="标题2" name="2">内容</van-collapse-item>
      <van-collapse-item title="标题3" name="3">内容</van-collapse-item>
    </van-collapse>
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
      activeNames: []
    }
  }
}
</script>

<style lang="scss" scoped>
.swap{
  margin: 20px 30px;
}
</style>
