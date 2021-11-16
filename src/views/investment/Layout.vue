<template>
  <div>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import {getAllInvest} from './invest'
export default {
  name: 'investLayout',
  data() {
    return {
      timer: null,
    }
  },
  mounted() {
    this.handleTimer()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    handleTimer() {
      clearTimeout(this.timer);
      getAllInvest((arr) => {
        this.$store.dispatch('setAllInvests', arr)
        setTimeout(() => {
          this.handleTimer()
        }, 10000);
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>