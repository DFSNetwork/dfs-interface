<template>
  <div class="expwd">
    <div class="title">{{ $t('newwallet.exPwd') }}</div>
    <div class="item flexb" :class="{'border': iptAct === 1, 'error': pwdError}">
      <van-field class="ipt"
        @focus="handleFocus(1)"
        @blur="handleBlur"
        v-model="pwd"
        type="password" :placeholder="$t('newwallet.iptPwd')" />
    </div>
    <div class="item flexb" :class="{'border': iptAct === 2, 'error': newpwdError}">
      <van-field class="ipt"
        @focus="handleFocus(2)"
        @blur="handleBlur"
        v-model="newpwd"
        :type="pwdType" :placeholder="$t('newwallet.iptNewPwd')" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://leafy-kataifi-c6d825.netlify.app/dfs/pwd-show.png">
        <img v-else src="https://leafy-kataifi-c6d825.netlify.app/dfs/pwd-hide.png">
      </span>
    </div>
    <div class="item flexb" :class="{'border': iptAct === 3, 'error': newpwd2Error}">
      <van-field class="ipt"
        @focus="handleFocus(3)"
        @blur="handleBlur"
        v-model="newpwd2"
        :type="pwdType" :placeholder="$t('newwallet.iptNewPwd2')" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://leafy-kataifi-c6d825.netlify.app/dfs/pwd-show.png">
        <img v-else src="https://leafy-kataifi-c6d825.netlify.app/dfs/pwd-hide.png">
      </span>
    </div>

    <div class="btn flexc" @click="handleGetNewKey">{{ $t('public.confirm') }}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DApp } from '@/utils/wallet';
export default {
  name: 'expwd',
  data() {
    return {
      pwd: '',
      newpwd: '',
      newpwd2: '',
      pwdType: 'password',
      iptAct: 0,
      newKey: '',

      pwdError: false,
      newpwdError: false,
      newpwd2Error: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
  methods: {
    handleExType() {
      if (this.pwdType === 'password') {
        this.pwdType = 'text'
        return
      }
      this.pwdType = 'password'
    },
    handleFocus(num) {
      this.iptAct = num;
    },
    handleBlur() {
      if (this.iptAct === 1) {
        const pwd = this.pwd;
        DApp.regPwd(pwd, (err) => {
          if (err) {
            this.pwdError = true
            this.$toast.fail(this.$t('newwallet.pwdErr'))
            return
          }
          this.pwdError = false
        })
      } else if (this.iptAct === 2) {
        if (!this.newpwd || this.newpwd.length >= 12) {
          this.newpwdError = false
        } else {
          this.newpwdError = true
          this.$toast.fail(this.$t('newwallet.pwdLenErr'))
        }
      } else {
        if (this.newpwd === this.newpwd2) {
          this.newpwd2Error = false
        } else {
          this.newpwd2Error =  true
          this.$toast.fail(this.$t('newwallet.pwdUnLike'))
        }
      }
      this.iptAct = 0;
    },
    handleReg() {
      if (this.pwdError || this.newpwdError || this.newpwd2Error) {
        return false
      }
      return true
    },
    handleGetNewKey() {
      if (!this.handleReg()) {
        return
      }
      const name = this.account.name;
      const newPwd = this.newpwd;
      const params = {
        account: name,
        pwd: newPwd,
      }
      DApp.accReg(params, (err, key) => {
        if (err) {
          this.$toast.fail(err)
          return
        }
        this.newKey = key;
        console.log(key)
        this.handleExPwd()
      })
    },
    handleExPwd() {
      const formName = this.account.name;
      const permission = this.account.permissions;
      const params = {
        actions: [{
          account: 'dfsacmanager',
          name: 'changekey',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            acc: formName,
            newkey: this.newKey,
          }
        }]
      }
      DApp.toTransaction(params, (err) => {
        this.loading = false;
        if (err && err.code == 402) {
          return;
        }
        if (err) {
          this.$toast({
            type: 'fail',
            message: err.message,
          })
          return;
        }
        this.$toast({
          message: this.$t('public.success'),
          type: 'success'
        });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.expwd{
  padding: 40px;
  text-align: left;
  .title{
    font-size: 60px;
    font-weight: 600;
    margin-bottom: 60px;
  }

  .item{
    background: #F5F6F8;
    border-radius: 6px;
    border: 2px solid #E2E6E7;
    padding: 0 30px 0 22px;
    height: 100px;
    margin-top: 50px;

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
  .btn{
    font-size: 36px;
    font-weight: 500;
    height: 100px;
    border-radius: 6px;
    color: #FFF;
    background: $color-main;
    margin: 50px 0px 25px;
  }
}
</style>
