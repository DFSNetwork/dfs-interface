<template>
  <div>
    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item name="1">内容</van-collapse-item>
    </van-collapse>
    <span @click="handleClose">close</span>
    <span @click="handleShow">open</span>
  </div>
</template>

<script>
export default {
  name: 'tradeInfo'
}
</script>

<style lang="scss" scoped>

</style>