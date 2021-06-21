<template>
  <div>
    <div class="list" v-for="(v, i) in lasters" :key="i">
      <div class="flexb info">
        <span class="name">{{ v.user }}</span>
        <span class="dinReg">{{ v.time }}</span>
      </div>
      <div class="flexb">
        <span>{{ $t('kline.swap') }}</span>
        <div class="flexa dinReg">
          <span>{{ v.qin }}</span>
          <img class="swapLasterImg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/swapLaster.png" alt="">
          <span>{{ v.qout }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toLocalTime } from '@/utils/public'

export default {
  name: 'swapLaster',
  props: {
    checkedMarket: {
      type: Object,
      default: function cm() {
        return {}
      }
    }
  },
  data() {
    return {
      lasters: [],
      timer: null,
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  watch: {
    checkedMarket: {
      handler: function cm(newVal) {
        if (!newVal.mid) {
          return
        }
        this.handleGetLaster()
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    async handleGetLaster() {
      clearTimeout(this.timer)
      const params = {
        mid: this.checkedMarket.mid
      }
      const {status, result} = await this.$api.get_swap_lasters(params);
      this.timer = setTimeout(() => {
        this.handleGetLaster()
      }, 10 * 1000);

      if (!status) {
        return
      }
      const rows = result.data || [];
      rows.forEach(v => {
        const time = toLocalTime(v.create_time)
        v.time = time;
      });
      this.lasters = rows;
    }
  }
}
</script>

<style lang="scss" scoped>
.list{
  margin: 30px;
  padding: 24px 30px;
  border-radius: 20px;
  border: 1px solid $color-border;
  font-size: 24px;
  .name{
    font-size: 30px;
  }
  .info{
    margin-bottom: 15px;
  }
  .swapLasterImg{
    width: 28px;
    margin: 0 15px;
  }
}
</style>
