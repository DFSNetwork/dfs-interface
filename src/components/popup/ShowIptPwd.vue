<template>
  <div class="pwd">
    <img class="close" @click="handleClose" src="https://storied-crepe-e5e65c.netlify.app/svg/sd_icon_btn.svg">
    <div class="title">{{ $t('newwallet.regPwd') }}</div>
    <div class="flexa iptDiv">
      <van-field v-model="pwd"
        class="ipt"
        type="password" :placeholder="$t('newwallet.regPwdTip')" />
    </div>
    <div class="btn flexc" @click="handleRegPwd">{{ $t('public.confirm') }}</div>

    <div class="flexa" @click="handleUnshowNext">
      <div class="checkBox" :class="{'act': next}">
        <img v-if="next"
        src="https://storied-crepe-e5e65c.netlify.app/icon/checked.png">
      </div>
      <span>{{ $t('newwallet.nextUn') }}</span>
    </div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
export default {
  data() {
    return {
      pwd: '',
      next: false,
    }
  },
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
    },
    handleUnshowNext() {
      this.next = !this.next
    },
    handleRegPwd() {
      const pwd = this.pwd;
      DApp.regPwd(pwd, (err) => {
        if (err) {
          this.$toast.fail(this.$t('newwallet.pwdErr'))
          return
        }
        this.$emit('listenSend', {
          type: 'pwd',
          status: this.next
        })
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.pwd{
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
  .iptDiv{
    background: #F3F3F3;
    height: 80px;
    padding: 0 28px;
    border-radius: 12px;
    .ipt{
      background: rgba(0,0,0,0);
      padding: 0;
      :deep(.van-field__control) {
        padding: 0;
      }
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
