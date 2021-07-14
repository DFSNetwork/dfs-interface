<template>
  <div class="wallet">
    <div class="title">{{ $t('newwallet.accLogin') }}</div>
    <div class="item flexb">
      <van-field class="ipt"
        v-model="name"
        type="text" :placeholder="$t('newwallet.loginAccTip')" />
    </div>
    <div class="item flexb">
      <van-field class="ipt"
        v-model="pwd"
        :type="pwdType" :placeholder="$t('newwallet.loginPwdTip')" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>
    <div class="label">{{ $t('newwallet.pwdTip') }}</div>

    <div class="btn flexc" @click="handleLogin">{{ $t('newwallet.login') }}</div>

    <div class="otherLogin">
      <van-divider>{{ $t('newwallet.otherLogin') }}</van-divider>
      <div class="flexb pro">
        <div class="logoItem" @click="handleLoginOther('tp')">
          <img class="logo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/tp_logo.png">
          <div>TP</div>
        </div>
        <div class="logoItem" @click="handleLoginOther('mykey')">
          <img class="logo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/mykey_logo.png">
          <div>Mykey</div>
        </div>
        <div class="logoItem" @click="handleLoginOther('start')">
          <img class="logo" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/start_logo.png">
          <div>Start</div>
        </div>
      </div>
    </div>

    <div class="hasWallet">
      <span>{{ $t('newwallet.hasDfsAcc') }}</span>
      <span class="green"
        @click="handleTo('createWallet')">{{ $t('newwallet.toCreate') }}</span>
    </div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet'
import { login } from '@/utils/public';
export default {
  name: 'loginWallet',
  data() {
    return {
      name: localStorage.getItem('LOGINACC') || '',
      pwd: '',
      pwdType: 'password', // text
      accReg: /^([a-z]|[1-5]|\.){5,12}$/, // 匹配账户
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
      if (!this.name.trim() || this.name.trim().length < 4 || !this.accReg.test(this.name)) {
        this.$toast.fail(this.$t('newwallet.accErr'))
        return false
      }
      if (!this.pwd) {
        this.$toast.fail(this.$t('newwallet.loginPwdTip'))
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
      localStorage.setItem('WALLET', 'newwallet')
      localStorage.setItem('LOGINACC', this.name)
      DApp.scatterInit(this, () => {
        DApp.loginByAcc({
          account: this.name,
          pwd: this.pwd,
        }, (err) => {
          if (err) {
            this.$toast.fail(this.$t('newwallet.pwdErr'))
            return
          }
          this.$toast.success(this.$t('newwallet.loginSuccess'))
          this.$router.push({
            name: 'home'
          })
        })
      })
    },
    // 登录
    handleLoginOther(wallet) {
      localStorage.setItem('WALLET', wallet)
      DApp.scatterInit(this, () => {
        if (wallet === 'newwallet') {
          this.handleTo('loginWallet')
          return
        }
        login(this, () => {
          this.showNav = false;
          this.handleTo('home')
        })
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.wallet{
  font-size: 28px;
  text-align: left;
  padding: 0 40px;
  .title{
    margin-top: 20px;
    font-size: 60px;
    font-weight: 600;
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
    margin-top: 80px;
    font-size: 36px;
    font-weight: 500;
    text-align: center;
    .green{
      color: $color-main;
    }
  }

  .otherLogin{
    margin-top: 80px;
    .pro{
      margin-top: 80px;
    }
    .logoItem{
      flex: 1;
      text-align: center;
      font-size: 32px;
      .logo{
        width: 90px;
        height: 90px;
        margin-bottom: 9px;
      }
    }
  }
}
</style>
