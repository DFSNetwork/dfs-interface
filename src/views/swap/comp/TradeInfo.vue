<template>
  <div class="">
    <van-collapse class="tradeInfo"
      v-model="activeNames" accordion>
      <van-collapse-item name="1">
        <div class="hidInfo">
          <div class="flexb item">
            <div class="flexa" @click="handleShowRules('minout')">
              <span>{{ $t('dex.minGet') }}</span>
              <img class="tipImg" src="https://resource1.dfs.land/icon/tips_icon_btn.svg">
            </div>
            <div class="num din">{{ info.minOut }}</div>
          </div>
          <div class="flexb item">
            <div class="flexa" @click="handleShowRules('rate')">
              <span>{{ $t('dex.priceSlip') }}</span>
              <img class="tipImg" src="https://resource1.dfs.land/icon/tips_icon_btn.svg">
            </div>
            <div class="num green din" :class="{
              'yellow': Number(info.priceRate) > 5,
              'red': Number(info.priceRate) > 10
            }">{{ info.priceRate }}%</div>
          </div>
          <div class="flexb item">
            <div class="flexa" @click="handleShowRules('fee')">
              <span>{{ $t('public.fee') }}</span>
              <img class="tipImg" src="https://resource1.dfs.land/icon/tips_icon_btn.svg">
            </div>
            <div class="num din">{{ info.fees }}</div>
          </div>
          <div class="flexb item">
            <div>
              <div class="flexa" v-if="routePath.length > 2"
                @click="handleShowMoreRoute()">
                <span>{{ $t('dex.moreRoute') }}</span>
                <img class="tipImg" src="https://resource2.dfs.land/icon/important.png">
              </div>
            </div>
            <img class="tradeSet" @click="handleShowTools" src="https://resource2.dfs.land/icon/stepupIcon.png" alt="">
          </div>
        </div>
      </van-collapse-item>
    </van-collapse>

    <div class="poolInfo" v-if="market.mid">
      <div class="flexa piTitle">
        <span>{{ $t('dex.poolNum') }}</span>
        <span class="green" @click="handleToPool">{{ $t('pools.toPool') }}></span>
      </div>
      <div class="dinReg">{{ market.reserve0 }} / {{ market.reserve1 }}</div>
    </div>

    <van-popup class="popup_p" v-model="showRules">
      <RulesTips :sType="sType"/>
    </van-popup>
    <van-popup class="popup_p" v-model="showMoreRouter">
      <MoreRouter v-if="showMoreRouter"
        :routePath="routePath" />
    </van-popup>

    <SlipPointTools ref="slipPointTools"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import RulesTips from '@/views/swap/popup/RulesTips';
import MoreRouter from '@/views/swap/popup/MoreRouter';
import SlipPointTools from '@/components/SlipPointTools';
export default {
  name: 'tradeInfo',
  components: {
    RulesTips,
    MoreRouter,
    SlipPointTools,
  },
  data() {
    return {
      activeNames: '',
      info: {},
      sType: 'minout',
      showRules: false,
      showMoreRouter: false,
    }
  },
  computed: {
    ...mapState({
      filterMkLists: state => state.sys.filterMkLists,
      marketLists: state => state.sys.marketLists,
    }),
    routePath() {
      const path = this.info.bestPath;
      if(!path) {
        return []
      }
      const pathArr = path.split('-')
      return pathArr
    },
    market() {
      const hasMid = this.info.hasMids || '';
      if (!hasMid) {
        return {}
      }
      const mk = this.marketLists.find(v => v.mid == parseInt(hasMid)) || {}
      return mk
    }
  },
  methods: {
    handleToPool() {
      let name = 'dfsMinePool'
      const poolNames = this.$store.state.config.poolNames;
      Object.keys(poolNames).forEach(key => {
        const status = poolNames[key].includes(Number(this.market.mid))
        if (status) {
          name = key;
        }
      })
      console.log(name)
      this.$router.push({
        name,
        params: {
          mid: this.market.mid,
          type: 'lp',
          sym: this.market.mid,
        }
      })
    },
    handleTo(name) {
      this.$router.push({
        name,
        params: {
          mid: this.market.mid
        }
      })
    },
    handleSetInfo(info) {
      // console.log(info)
      this.info = Object.assign({}, this.info, info);
      this.activeNames = info.show;
    },
    handleShowRules(sType) {
      this.sType = sType;
      this.showRules = true;
    },
    handleShowMoreRoute() {
      this.showMoreRouter = true;
    },
    handleShowTools() {
      this.$refs.slipPointTools.showNav = true;
    },
  }
}
</script>

<style lang="scss" scoped>
.tradeInfo{
  position: relative;
  z-index: 0;
  margin: -90px 6px 30px;
  :deep( .van-collapse),
  :deep( .van-collapse-item){
    &::after{
      display: none;
    }
  }
  :deep( .van-collapse-item__content){
    padding: 0;
  }
  .hidInfo{
    padding: 10px 28px;
    background: #FAFAFA;
    border-radius: 20px;
    color: #A6A6A6;
    font-size: 26px;
    .item{
      height: 50px;
      .tipImg{
        width: 30px;
        margin-left: 10px;
      }
      .tradeSet{
        width: 32px;
      }
      .num{
        color: #333;
        &.green{
          color: $color-main;
        }
        &.yellow{
          color: #f29949;
        }
        &.red{
          color: rgb(255, 104, 113);
        }
      }
    }
  }
}
.poolInfo{
  box-shadow: 2px 2px 6px 4px rgba(243,243,243,1);
  padding: 26px 34px;
  font-size: 26px;
  text-align: left;
  border-radius: 20px;
  margin-top: 40px;
  .piTitle{
    font-size: 30px;
    margin-bottom: 15px;
    .green{
      color: $color-main;
      margin-left: 15px;
    }
  }
}
</style>