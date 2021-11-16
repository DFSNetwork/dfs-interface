<template>
  <div class="myCenter">
    <!-- <AccInfo />
    <AccWallet />
    <Tools /> -->

    <MainComp />
  </div>
</template>

<script>
// import AccInfo from '@/views/my/comp/AccInfo'
// import AccWallet from  '@/views/my/comp/AccWallet'
// import Tools from  '@/views/my/comp/Tools'
import { mapState } from 'vuex';
import MainComp from  './nComp/MainComp'

export default {
  name: 'myCenter',
  components: {
    // AccInfo,
    // AccWallet,
    // Tools,
    MainComp,
  },
  mounted() {
    if (!this.account.name) {
      this.$router.replace({
        name: 'loginWallet'
      })
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
}
</script>

<style lang="scss" scoped>
.myCenter{
  // background: #f5f5f5;
  padding-bottom: 10px;
}
</style>
