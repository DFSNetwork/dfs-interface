<template>
  <div class="wallet">
    <div class="title">账户登录</div>
    <div class="item flexb">
      <van-field class="ipt"
        v-model="name"
        type="text" placeholder="请输入EOS账号" />
    </div>
    <div class="item flexb">
      <van-field class="ipt"
        v-model="pwd"
        :type="pwdType" placeholder="请输入登录密码" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>
    <div class="label">请保管好个人密码，不要透露给任何人！</div>

    <div class="btn flexc" @click="handleLogin">登 录</div>

    <div class="hasWallet">
      <span>还没有大丰收账号？</span>
      <span class="green" @click="handleTo('createWallet')">去创建</span>
    </div>

  </div>
</template>

<script>
import { DApp } from '@/utils/wallet'
export default {
  name: 'loginWallet',
  data() {
    return {
      name: '',
      pwd: '',
      pwdType: 'password', // text
      accReg: /^([a-z]|[1-5]){12}$/, // 匹配账户
    }
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
    handleReg() {
      if (!this.name.trim() || this.name.trim().length < 12 || !this.accReg.test(this.name)) {
        this.$toast.fail('请输入12位账号')
        return false
      }
      if (!this.pwd) {
        this.$toast.fail('请输入密码')
        return false
      }
      return true
    },
    async handleLogin() {
      if (!this.handleReg()) {
        return
      }
      // 验证账号对应公钥是否匹配
      // 1. 拿到账号密码对应公钥
      // 2. 查询链上账户公钥
      // 3. 公钥对比  一致 - 密码正确 ｜ 不一致 - 密码错误
      DApp.loginByAcc({
        account: this.name,
        pwd: this.pwd,
      }, (err) => {
        if (err) {
          this.$toast.fail('账号或密码错误')
          return
        }
        this.$toast.success('登陆成功')
        this.$router.push({
          name: 'home'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wallet{
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
    color: #FF4D4D;
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
  .hasWallet{
    // position: fixed;
    margin-top: 50px;
    font-size: 36px;
    font-weight: 500;
    .green{
      color: $color-main;
    }
  }
}
</style>
