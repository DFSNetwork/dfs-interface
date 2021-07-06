<template>
  <div class="walletCreate">
    <div class="title">创建账号</div>
    <div class="item flexb" :class="{'border': iptAct === 1, 'error': nameError}">
      <van-field class="ipt"
        v-model="name"
        maxlength="12"
        @focus="handleFocus(1)"
        @blur="handleBlur(1)"
        type="text" placeholder="设置账号名（EOS）" />
      <span class="green" @click="handleRandomAcc">随机账号</span>
    </div>
    <div class="label">账号由12位小写字母a-z和1-5组成</div>
    <div class="item flexb" :class="{'border': iptAct === 2, 'error': pwdError}">
      <van-field class="ipt"
        v-model="pwd"
        @focus="handleFocus(2)"
        @blur="handleBlur(2)"
        :type="pwdType" placeholder="设置密码" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>
    <div class="label">不少于12位，包含大小写字母、含特殊符号</div> 
    <div class="item flexb" :class="{'border': iptAct === 3, 'error': pwd2Error}">
      <van-field class="ipt"
        @focus="handleFocus(3)"
        @blur="handleBlur(3)"
        v-model="pwd2"
        :type="pwdType" placeholder="请再次输入密码" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>

    <div class="btn flexc" @click="handleRegister">注 册</div>
    <div class="tips">
      <div>在线创建账号，在您设置好自己的账号后，您亦可在信息确认页面刷新切换公私钥。</div>
      <div>请您在输入前，一定要备份好自己的账号与密码，并妥善保管好。请勿将密码泄露给任何人。</div>
    </div>

    <div class="hasWallet">
      <span>已有账号？</span>
      <span class="green" @click="handleTo('loginWallet')">去登录</span>
    </div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet'
export default {
  name: 'accForPwd',
  data() {
    return {
      iptAct: 0,
      name: '',
      pwd: '',
      pwd2: '',
      pwdType: 'password', // text
      accReg: /^([a-z]|[1-5]){12}$/, // 匹配账户

      nameError: false,
      pwdError: false,
      pwd2Error: false,
    }
  },
  computed: {
  },
  methods: {
    handleTo(name) {
      this.$router.replace({
        name
      })
    },
    handleExType() {
      if (this.pwdType === 'password') {
        this.pwdType = 'text'
        return
      }
      this.pwdType = 'password'
    },
    handleFocus(num) {
      this.iptAct = num
    },
    handleBlur() {
      if (this.iptAct === 1) {
        if (!this.name || this.accReg.test(this.name)) {
          this.nameError = false
        } else {
          this.nameError = true
        }
      } else if (this.iptAct === 2) {
        if (!this.pwd || this.pwd.length >= 12) {
          this.pwdError = false
        } else {
          this.pwdError = true
        }
      } else {
        if (this.pwd === this.pwd2) {
          this.pwd2Error = false
        } else {
          this.pwd2Error =  true
        }
      }
      this.iptAct = 0;
    },
    handleRandomAcc() {
      let returnStr = '',       
          charStr = 'abcdefghijklmnopqrstuvwxyz12345'; 
      for(let i = 0; i < 12; i++){
        let index = Math.round(Math.random() * (charStr.length - 1));
        returnStr += charStr.substring(index, index + 1);
      }
      this.name = returnStr;
    },
    handleReg() {
      if (!this.name || this.name.length < 12 || !this.accReg.test(this.name)) {
        this.$toast.fail('请按规则输入12位账号')
        return false
      }
      if (!this.pwd || this.pwd.length < 12) {
        this.$toast.fail('请按规则输入不少于12位密码')
        return false
      }
      if (!this.pwd2 || this.pwd2 !== this.pwd) {
        this.$toast.fail('两次密码不一致，请重新输入')
        return false
      }
      return true
    },
    async handleRegister() {
      if (!this.handleReg()) {
        return
      }
      try {
        // 验证账户是否被注册
        const {status} = await this.$api.get_account(this.name)
        if (!status) {
          return
        }
        this.$toast.fail('账号已被注册')
      } catch (error) {
        const params = {
          account: this.name,
          pwd: this.pwd
        }
        DApp.accReg(params, (err, pub) => {
          if (err) {
            this.$toast.fail(err)
            return
          }
          const memo = `new:${this.name}:${pub}`
          console.log(memo)
          // this.handleTo('loginWallet')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.walletCreate{
  font-size: 28px;
  text-align: left;
  padding: 0 40px;
  .title{
    font-size: 60px;
    font-size: 500;
  }
  .item{
    background: #F5F6F8;
    border-radius: 6px;
    border: 2px solid #E2E6E7;
    padding: 0 30px 0 22px;
    height: 100px;
    margin-top: 40px;
    &.border{
      border: 2px solid $color-main !important;
    }
    &.error{
      border: 2px solid #FF4D4D;
    }
    .green{
      color: $color-main;
      width: 120px;
      text-align: center;
      img{
        width: 40px;
      }
    }
    .ipt{
      background: rgba(0,0,0,0);
      padding: 0;
      flex: 1;
      &::after{
        display: none;
      }
      /deep/ .van-field__control{
        font-size: 32px;
        color: #333;
      }
    }
  }
  .label{
    font-size: 24px;
    color: #BCC3C6;
    margin-top: 22px;
    margin-left: 22px;
  }
  .btn{
    font-size: 36px;
    font-weight: 500;
    height: 100px;
    border-radius: 6px;
    color: #FFF;
    background: $color-main;
    margin: 50px 0px 25px;
  }
  .tips{
    padding: 0 10px;
    font-size: 24px;
    color: #BCC3C6;
  }
  .hasWallet{
    // position: fixed;
    // bottom: 150px;
    margin-top: 50px;
    font-size: 36px;
    font-weight: 500;
    .green{
      color: $color-main;
    }
  }
}
</style>