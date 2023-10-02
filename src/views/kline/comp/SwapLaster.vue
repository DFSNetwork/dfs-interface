<template>
  <div>
    <van-list
        v-model="loadingMore"
        :finished="finished"
        :loading-text="$t('public.loading')"
        :finished-text="$t('public.noMore')"
        @load="handleCurrentChange"
      >
      <div class="list" v-for="(v, i) in lasters" :key="i">
        <div class="flexb info">
          <span class="name">{{ v.user }}</span>
          <span class="dinReg">{{ v.time }}</span>
        </div>
        <div class="flexb">
          <span>{{ $t('kline.swap') }}</span>
          <div class="flexa dinReg">
            <span>{{ v.qin }}</span>
            <img class="swapLasterImg" src="https://resource2.dfs.land/dfs/swapLaster.png" alt="">
            <span>{{ v.qout }}</span>
          </div>
        </div>
      </div>
    </van-list>
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

      loadingMore: false,
      finished: false,
      page: 1,
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  watch: {
    // checkedMarket: {
    //   handler: function cm(newVal) {
    //     if (!newVal.mid) {
    //       return
    //     }
    //     this.handleGetLaster()
    //   },
    //   deep: true,
    //   immediate: true,
    // }
  },
  methods: {
    async handleGetLaster() {
      clearTimeout(this.timer)
      const params = {
        mid: this.checkedMarket.mid,
        page: this.page,
        limit: 30
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
        let create_time = v.create_time.replace(/Z$/, '-0800')
        const time = toLocalTime(create_time)
        v.time = time;
      });
      if (this.page === 1) {
        this.lasters = rows;
      } else {
        this.lasters.push(...rows);
      }
      this.loadingMore = false;
      this.page += 1;
      if (rows.length < 30) {
        this.finished = true;
      }
    },
    handleCurrentChange() {
      if (!this.checkedMarket.mid) {
        setTimeout(() => {
          this.handleCurrentChange()
        }, 500);
        return
      }
      this.handleGetLaster()
    },
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
