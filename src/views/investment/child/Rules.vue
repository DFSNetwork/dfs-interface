<template>
  <div class="rules">
    <img v-if="language === 'zh-CN'" src="@/assets/img/investment_rules.png">
    <img v-else src="@/assets/img/investment_rules-en.png">
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'investRules',
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      language: state => state.app.language,
    }),
  },
}
</script>

<style lang="scss" scoped>
.rules{
  img{
    width: 100%;
  }
}
</style>