<template>
  <div class="invLists">
    <div class="card">
      <div class="title flexa">
        <span>邀请记录</span>
        <!-- <img class="tips" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/tips_icon_btn.svg"> -->
      </div>
      <div class="item flexa" v-for="(v, i) in lists" :key="i">
        <div>
          <div class="flexb name">
            <span>{{ v.owner }}</span>
            <span class="dinReg date">{{ v.time }}</span>
          </div>
          <div class="flexb">
            <span class="tip">邀请</span>
            <span class="tip">${{ handleGetItemReward(v.owner) }}</span>
            <!-- <span class="dinReg num">预估返佣：0.82 EOS</span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { toLocalTime } from '@/utils/public'

export default {
  name: 'invLists',
  data() {
    return {
      lists: [],
      tagLists: [],
      dfsLists: [],
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      coinPrices: (state) => state.sys.coinPrices,
      usdtPrice: (state) => state.sys.usdtPrice,
    }),
  },
  watch: {
    account: {
      handler: function at(newVal) {
        if (!newVal.name) {
          return
        }
        this.handleGetLists()
        this.handleGetReward()
        this.handleGetReward('tag')
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    async handleGetLists() {
      const name = this.account.name;
      if (!name) {
        return
      }
      const params = {
        "code": "dfsacmanager",
        "scope": "dfsacmanager",
        "table": "relations",
        "lower_bound": ` ${name}`,
        "upper_bound": ` ${name}`,
        "index_position": 2,
        "key_type": "i64",
        "json": true,
        "limit": 100,
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      console.log(result)
      const rows = result.rows;
      rows.forEach(v => {
        const time = toLocalTime(`${v.create_time}+0000`)
        v.time = time;
      });
      this.lists = rows;
    },
    async handleGetReward(type) {
      const name = this.account.name;
      const params = {
        "code": "miningpool11",
        "scope": ` ${'judy.dfs'}`,
        "table": "members",
        "json": true,
        limit: 100,
      }
      if (type === 'tag') {
        params.code = 'tagtokenfarm'
      }
      const {status, result} = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      const rows = result.rows || [];
      let priceObj = this.coinPrices.find(vv => vv.coin === 'DFS') || {};
      if (type === 'tag') {
        priceObj = this.coinPrices.find(vv => vv.coin === 'TAG') || {};
      }
      const price = priceObj.price || 0;
      let count = 0;
      rows.forEach(v => {
        let t = parseFloat(v.total_reward || 0) / 100 * price;
        v.reward = parseFloat(t || 0).toFixed(4)
      })
      type === 'tag' ? this.tagLists = rows : this.dfsLists = rows;
    },
    handleGetItemReward(acc) {
      const tag = this.tagLists.find(v => v.owner === acc) || {}
      const tagNum = tag.reward || 0

      const dfs = this.dfsLists.find(v => v.owner === acc) || {}
      const dfsNum = dfs.reward || 0

      const count = parseFloat(dfsNum || 0) + parseFloat(tagNum || 0)
      return count.toFixed(4)
    }
  }
}
</script>

<style lang="scss" scoped>
.invLists{
  margin: 30px !important;
  position: relative;
  border-radius: 12px;
  background: #FFF;
  padding: 26px 26px 0;
  font-size: 28px;
  .card{
    .title{
      font-size: 32px;
      font-weight: 500;
      padding-left: 24px;
      position: relative;
      margin-bottom: 20px;
      &::after{
        content: '';
        position: absolute;
        width: 8px;
        height: 36px;
        background: $color-main;
        border-radius: 6px;
        left: 0px;
        top: 50%;
        transform: translate(0, -50%);
      }
      .tips{
        width: 30px;
        margin-left: 18px;
      }
    }
    .label{
      color: #999;
    }
    .item{
      height: 144px;
      border-bottom: 1px solid $color-border;
      font-size: 24px;
      &:last-child{
        border: 0px;
      }
      &>div{
        flex: 1;
      }
      .name{
        font-size: 30px;
        margin-bottom: 10px;
      }
      .date{
        font-size: 24px;
      }
    }
  }
}
</style>
