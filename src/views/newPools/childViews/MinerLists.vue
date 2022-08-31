<template>
  <div class="newMinerLists">
    <div class="title flexb">
      <span class="act">{{ $t('nodePools.minerLists') }}</span>
      <span class="tip count">{{ $t('nodePools.allMinerNum') }}：{{allLists.length}}</span>
    </div>
    <div class="lists">
      <div class="mineList" v-for="(item, index) in lists" :key="index">
        <div class="flexb mb10">
          <span>{{ item.owner }}</span>
          <span class="flexa">
            <span>
              {{ $t('mine.earnings') }}：
              <CountTo :start-val='item.oldReward'
                :end-val='item.reward' :duration='1500'
                :decimals="8" :separator="','" 
                :prefix="''" :suffix="''" 
                :autoplay="true"/>
              EOS</span>
          </span>
        </div>
        <div class="flexb">
          <span>{{ $t('nodePools.allRes') }}</span>
          <span>{{ item.sym0 || '0.0000' }} {{lpPool.symbol0}} / {{ item.sym1 || '0.0000'}} {{lpPool.symbol1}}</span>
        </div>
      </div>
    </div>
    <el-pagination
      v-if="allLists.length"
      class="pagination"
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
      :current-page.sync="page"
      :page-size="pageSize"
      :total="allLists.length">
    </el-pagination>
  </div>
</template>

<script>
import moment from 'moment';
import { toLocalTime } from '@/utils/public';
import { sellToken } from '@/utils/logic';
import { getReward } from '@/views/dfsMine/dfsMine'
import CountTo from 'vue-count-to'
export default {
  name: 'newMinerLists',
  components: {
    CountTo
  },
  props: {
    lpPool: {
      type: Object,
      default: function lpPool() {
        return {}
      }
    },
    swapBal: {
      type: String,
      default: '0',
    },
    poolsBal: {
      type: String,
      default: '0',
    }
  },
  data() {
    return {
      allLists: [],
      lists: [],
      page: 1,
      pageSize: 20,
      timer: null,
    }
  },
  mounted() {
    this.handleGetLists()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    handleCurrentChange() {
      const start = (this.page - 1) * this.pageSize;
      const end = this.page * this.pageSize;
      this.lists = this.allLists.slice(start, end);
      this.handleListReward()
    },
    async handleGetLists() {
      const params = {
        "code": 'miningpool11',
        "scope": this.lpPool.mid,
        "table":"miners2",
        "json":true,
        // "index_position": 2,
        // "key_type": "i64",
        "limit": 2000,
        // "reverse": false
      }
      const { status, result } = await this.$api.get_table_rows(params);
      if (!status) {
        return
      }
      let rows = result.rows || [];
      rows.sort((a, b) => {
        return b.token - a.token
      })
      const inData = {
        poolSym0: this.lpPool.reserve0.split(' ')[0],
        poolSym1: this.lpPool.reserve1.split(' ')[0],
        poolToken: this.lpPool.liquidity_token,
      }
      rows.forEach((v, index) => {
        v.rank = index + 1;
        v.owner = v.miner;
        inData.sellToken = v.token;
        const marketNum = sellToken(inData)
        v.sym0 = marketNum.getNum1.toFixed(this.lpPool.decimal0)
        v.sym1 = marketNum.getNum2.toFixed(this.lpPool.decimal1)
        v.weight = 1;
        let lastTime = toLocalTime(`${v.last_drip}.000+0000`);
        v.lastTime = moment(lastTime).valueOf();
      })
      this.allLists = rows;
      this.lists = rows.slice(0, this.pageSize);
      this.handleListReward();
    },
    handleListReward() {
      clearTimeout(this.timer)
      if (!this.lists.length) {
        return
      }
      this.timer = setTimeout(() => {
        this.handleListReward()
      }, 1000)
      this.lists.forEach(v => {
        if (!v.token) {
          return;
        }
        let reward = 0
        const num = this.lpPool.contract0 === 'eosio.token' ? parseFloat(v.sym0) : parseFloat(v.sym1)
        const reward0 = getReward({
          poolBal: this.poolsBal,
          swapBal: parseFloat(this.swapBal)
        }, {
          lastTime: v.lastTime,
          num: num
        })
        reward = parseFloat(reward || 0) + parseFloat(reward0 || 0);
        this.$set(v, 'oldReward', v.reward || 0)
        this.$set(v, 'reward', reward)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.newMinerLists{
  padding-bottom: 50px;
  .title{
    font-size: 32px;
    text-align: left;
    margin: 0 0 20px;
    .count{
      font-size: 24px;
    }
    .act{
      color: #333;
      position: relative;
      padding-left: 28px;
      &::before{
        content: '';
        position: absolute;
        width: 8px;
        height: 30px;
        background:rgba(2,198,152,1);
        border-radius:4px;
        top: 50%;
        left: 0;
        transform: translateY(-45%);
      }
    }
  }
  .lists{
    margin-bottom: 30px;
  }
  .mineList{
    margin-top: 25px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    position: relative;
    &>div{
      padding: 20px;
      position: relative;
      z-index: 1;
      background: #FFF;
      border-radius: 30px;

      &:nth-child(1) {
        padding-bottom: 0;;
      }
      &:nth-child(2) {
        padding-top: 0;;
      }
    }
    .mb10{
      margin-bottom: 10px;
    }
  }

  .pagination{
    text-align: right;
    margin-top: 20px;
    font-size: 26px;
    :deep(.el-pager) {
      li.active{
        color: #07D79B;
      }
      li:hover{
        color: #07D79B;
      }
      li{
        font-size: 26px;
      }
    }
    :deep(.btn-prev), :deep(.btn-next) {
      &:hover {
        color: #07D79B;
      }
      .el-icon-arrow-left, .el-icon-arrow-right{
        font-size: 26px;
      }
    }
  }

  :deep(.el-input-number) {
    overflow: hidden;
    position: relative;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: center;
    .el-input-number__decrease,
    .el-input-number__increase{
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      width: 50px;
      box-sizing: border-box;
      font-size: 24px;
    }
    .el-input{
      font-size: 27px;
      .el-input__inner{
        height: 60px;
      }
    }
  }
  :deep(.el-slider__runway){
    margin: 30px 0;
    .el-slider__button-wrapper{
      height: 60px;
      width: 60px;
      top: -25px;
      .el-slider__button{
        height: 30px;
        width: 30px;
      }
    }
  }
}
</style>