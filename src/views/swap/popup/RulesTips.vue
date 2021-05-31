<template>
  <div class="pTip">
    <div v-if="sType === 'minout'">{{ $t('dex.qusTip1') }}</div>
    <div v-if="sType === 'rate'">{{ $t('dex.qusTip2') }}</div>
    <div v-if="sType === 'fee'">{{ $t('dex.qusTip3') }}</div>
  </div>
</template>

<script>
export default {
  name: 'swapRules',
  props: {
    sType: {
      type: String,
      default: 'minout'
    }
  }
}
</script>

<style lang="scss" scoped>
.pTip{
  text-align: left;
  font-size: 28px;
  padding: 28px;
}
</style>
