<template>
  <div class="resInsufficient">
    <img class="close" @click="$emit('listenClose')" src="https://storied-crepe-e5e65c.netlify.app/svg/sd_icon_btn.svg">
    <div class="title">{{ $t('resource.manage') }}</div>
    <div class="content">
      <div v-if="types === 'CPU'">{{ $t('resource.cpuErr') }}</div>
      <div v-else>{{ $t('resource.ramErr') }}</div>
    </div>
    <div class="flexc btn" @click="$emit('listenTo')">{{ $t('resource.goNow') }}</div>
  </div>
</template>

<script>
export default {
  name: 'resInsufficient',
  props: {
    types: {
      type: String,
      default: 'CPU'
    }
  },
}
</script>

<style lang="scss" scoped>
.resInsufficient{
  font-size: 28px;
  padding: 20px 40px 30px;
  position: relative;
  .close{
    position: absolute;
    top: 20px;
    right: 20px;
    width: 24px;
  }
  .title{
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .content{
    margin: 20px 0;
  }
  .btn{
    color: #FFF;
    background: $color-main;
    border-radius: 12px;
    height: 80px;
    margin-top: 40px;
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 10px;
  }
}
</style>