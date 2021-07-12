<template>
  <div class="info">
    <img class="close" @click="handleClose" src="https://cdn.jsdelivr.net/gh/defis-net/material/svg/sd_icon_btn.svg">
    <div class="title">交易详情</div>
    <div class="datas">
      <div class="action flexb" v-for="(v, i) in params" :key="i">
        <span class="mr">调用合约方法 </span>
        <span>
          <span> {{ v.account }} </span>
          <span> > {{ v.name }}</span>
        </span>
      </div>
    </div>

    <div class="btn flexc" @click="handleSend">发送交易</div>
    <div class="flexa" @click="handleUnshowNext">
      <div class="checkBox" :class="{'act': next}">
        <img v-if="next"
        src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/checked.png">
      </div>
      <span>退出应用前不用再次确认</span>
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
  .datas{
    margin: 40px 0;
    background: #F3F3F3;
    border-radius: 12px;
    padding: 28px 34px;
    color: #8B8B8B;
    font-size: 26px;
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
