<template>
  <div class="tips">
    <div v-if="showType === 'reward'">
      <div>{{ $t('newwallet.inviterTip2') }}</div>
    </div>
    <div v-else>
      <div>{{ $t('newwallet.inviterTip1') }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showType: {
      type: String,
      default: 'reward'
    }
  }
}
</script>

<style lang="scss" scoped>
.tips{
  padding: 40px;
  position: relative;
  font-size: 30px;
  text-align: left;
}
</style>
