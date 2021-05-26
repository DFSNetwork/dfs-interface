<template>
  <div class="update">
    <div class="title">大丰收日志</div>
    <V1 />
  </div>
</template>

<script>
import V1 from './comp/V1'
export default {
  name: 'update',
  components: {
    V1,
  }
}
</script>

<style lang="scss" scoped>
.update{
  margin: 0 28px;
  padding: 28px 0;
  border-top: 1px solid $color-border;
  text-align: left;
  .title{
    color: #333;
    font-size: 40px;
    font-weight: 500;
    margin-bottom: 40px;
  }
}
</style>