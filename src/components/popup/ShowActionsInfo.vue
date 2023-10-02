<template>
  <div class="info">
    <img class="close" @click="handleClose" src="https://resource1.dfs.land/svg/sd_icon_btn.svg">
    <div class="title">{{ $t('newwallet.tradeDtl') }}</div>
    <div class="actsMethods">{{ $t('newwallet.useContract') }} </div>
    <div class="datas">
      <div class="action din" v-for="(v, i) in params" :key="i">
        <div class="mtd">
          <span> {{ v.account }} </span>
          <span> > {{ v.name }}</span>
        </div>
        <div class="dtsItem flexb" v-for="(vv, ii) in v.data" :key="`${i}-${ii}`">
          <span>{{ ii }}</span>
          <span>{{ vv }}</span>
        </div>
      </div>
    </div>

    <div class="btn flexc" @click="handleSend">{{ $t('newwallet.sendTrade') }}</div>
    <div class="flexa" @click="handleUnshowNext">
      <div class="checkBox" :class="{'act': next}">
        <img v-if="next"
        src="https://resource1.dfs.land/icon/checked.png">
      </div>
      <span>{{ $t('newwallet.nextUn') }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'showActionsInfo',
  props: {
    obj: {
      type: Object,
      default: function oj() {
        return {}
      }
    }
  },
  data() {
    return {
      params: [],
      type: 'transfer',
      cb: null,
      next: false,
    }
  },
  watch: {
    obj: {
      handler: function oj(newVal) {
        if (!newVal.type) {
          return
        }
        this.type = newVal.type;
        this.params = newVal.actions;
        console.log(this.params)
        this.cb = newVal.cb;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
    },
    handleSend() {
      this.$emit('listenIptPwd', {
        type: 'comfire',
        status: this.next
      })
    },
    handleUnshowNext() {
      this.next = !this.next
    }
  }
}
</script>

<style lang="scss" scoped>
.info{
  padding: 34px;
  text-align: left;
  color: #333;
  font-size: 30px;
  .close{
    width: 24px;
    position: absolute;
    right: 30px;
    top: 30px;
  }
  .title{
    font-weight: 500;
    margin-bottom: 20px;
    font-size: 36px;
    text-align: center;
  }
  .actsMethods{
    font-size: 30px;
    font-weight: 500;
  }
  .datas{
    margin: 20px 0 40px;
    background: #F3F3F3;
    border-radius: 12px;
    padding: 28px 34px;
    color: #8B8B8B;
    font-size: 26px;
    max-height: 350px;
    overflow: auto;
    .mtd{
      color: #333;
      font-weight: 600;
      font-size: 28px;
    }
    .dtsItem{
      margin: 12px 0;
    }
  }
  .btn{
    background: $color-main;
    color: #FFF;
    border-radius: 12px;
    height: 100px;
    font-size: 36px;
    font-weight: 500;
    margin: 40px 0;
  }
  .checkBox{
    width: 42px;
    height: 42px;
    border: 1px solid $color-border;
    border-radius: 50%;
    margin-right: 15px;
    box-sizing: border-box;
    &.act{
      border: 0;
    }
    img{
      display: block;
      width: 100%;
    }
  }
}
</style>
