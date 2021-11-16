<template>
  <div class="accInfo">
    <img class="accBgImg" :src="accInfo.cover || 'https://cdn.jsdelivr.net/gh/defis-net/material/accBanner/banner1.png'">
    <div class="info flexa">
      <div class="headDiv flexc">
        <img class="headImg" :src="accInfo.avatar">
      </div>
      <div style="flex: 1">
        <div class="name flexb">
          <div class="flexa">
            <span>{{ accInfo.nick || id }}</span>
            <img v-if="accInfo.sex == 0" class="sex" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/sex0.png" alt="">
            <img v-if="accInfo.sex == 1" class="sex" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/sex1.png" alt="">
          </div>
          <img class="set" @click="$router.push({name: 'mySetting'})"
            src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/set.png" alt="">
        </div>
        <div class="account flexa">
          <span
            v-clipboard:copy="id"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">ID: {{ id }}</span>
          <img class="copy"
            v-clipboard:copy="id"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/copy.png" alt="">
        </div>
        <div class="intro" @click="showInfo = true">{{ accInfo.desc || $t('my.noDesc') }}</div>
      </div>
    </div>

    <div class="tools flexb">
      <span :class="{'act': act === 0}" @click="handleAct(0)">{{ $t('my.assManage') }}</span>
      <span :class="{'act': act === 1}" @click="handleAct(1)">{{ $t('my.liqsManage') }}</span>
      <span :class="{'act': act === 2}" @click="handleAct(2)">{{ $t('my.moreServer') }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'accInfo',
  props: {
    act: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      id: '',
      showInfo: false,
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      accInfo: state => state.app.accInfo,
    }),
  },
  watch: {
    account: {
      handler: function sc (newVal) {
        if (newVal.name) {
          this.id = newVal.name;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onCopy() {
      this.$message.success(this.$t('public.copySuccess'));
    },
    onError() {
      this.$message.error(this.$t('public.copyFail'));
    },
    handleAct(act) {
      this.$emit('listenAct', act)
    }
  }
}
</script>

<style lang="scss" scoped>
.accInfo{
  font-size: 24px;
  height: 408px;
  position: relative;
  .accBgImg{
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;
  }
  .info{
    position: relative;
    padding: 5px 28px 0;
    height: 200px;
    color: #FFF;
    text-align: left;
    .headDiv{
      background: #FFF;
      border-radius: 70px;
      width: 140px;
      min-width: 140px;
      height: 140px;
      margin-right: 28px;
    }
    .headImg{
      width: 84px;
      height: 84px;
      border-radius: 50px;
    }
    .name{
      font-size: 40px;
      font-weight: 500;
      .sex{
        width: 46px;
        margin-left: 10px;
      }
      .set{
        width: 44px;
      }
    }
    .account{
      margin-bottom: 8px;
      .copy{
        width: 24px;
        margin-left: 10px;
      }
    }
    .intro{
      height: 64px;
      line-height: 32px;
      text-align: left;
      position: relative;
      color: #FFF;
      overflow: hidden;
      text-overflow:ellipsis; //溢出用省略号显示
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
}
.infoData{
  margin-top: 30px;
  position: relative;
  z-index: 1;
  color: #FFF;
  font-size: 28px;
  padding: 0 28px;
  .num{
    font-size: 40px;
    margin-bottom: 8px;
  }
  .numDiv{
    flex: 1;
    &>div{
      flex: 1;
      text-align: center;
      // margin-right: 60px;
    }
  }
  .setBtn{
    height: 60px;
    border: 1px solid #FFF;
    border-radius: 30px;
    padding: 0 36px;
  }
}

.tools{
  margin-top: 20px;
  font-size: 32px;
  height: 48px;
  color: rgba(#FFF, .8);
  position: relative;
  margin: 25px 30px 30px;
  &>span{
    position: relative;
  }
  .act{
    color: #FFF;
    font-weight: 500;

    &::after{
      content: '';
      position: absolute;
      left: 50%;
      bottom: -45px;
      width: 20px;
      height: 20px;
      background: #FFF;
      transform: translate(-50%, 0) rotate(-45deg);
    }
  }
}
</style>
