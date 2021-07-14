<template>
  <div class="walletCreate">
    <div class="title">{{ $t('newwallet.createAcc') }}</div>
    <div class="item flexb" :class="{'border': iptAct === 1, 'error': nameError}">
      <van-field class="ipt"
        v-model="name"
        maxlength="8"
        @focus="handleFocus(1)"
        @blur="handleBlur(1)"
        type="text" :placeholder="$t('newwallet.setAccName')" />
      <van-popover
        v-model="showPopover"
        trigger="click"
        :actions="actions"
        @select="handleOnSelect"
      >
        <template #reference>
          <div class="flexa model dinReg">
            <span class="">{{ selectAct }}</span>
            <img src="https://cdn.jsdelivr.net/gh/defis-net/material2/icon/select.png" alt="">
          </div>
        </template>
      </van-popover>
    </div>
    <div class="label flexb">
      <span>{{ $t('newwallet.setAccNameTip') }}</span>
      <span class="green" @click="handleRandomAcc">{{ $t('newwallet.randomAcc') }}</span>
    </div>
    <div class="item flexb" :class="{'border': iptAct === 2, 'error': pwdError}">
      <van-field class="ipt"
        v-model="pwd"
        @focus="handleFocus(2)"
        @blur="handleBlur(2)"
        :type="pwdType" :placeholder="$t('newwallet.setPwd')" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>
    <div class="label">{{ $t('newwallet.setPwdTip') }}</div> 
    <div class="item flexb" :class="{'border': iptAct === 3, 'error': pwd2Error}">
      <van-field class="ipt"
        @focus="handleFocus(3)"
        @blur="handleBlur(3)"
        v-model="pwd2"
        :type="pwdType" :placeholder="$t('newwallet.setPwd2')" />
      <span class="green" @click="handleExType">
        <img v-if="pwdType === 'password'" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-show.png">
        <img v-else src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/pwd-hide.png">
      </span>
    </div>

    <div class="btn flexc" @click="handleRegister">{{ $t('newwallet.reg') }}</div>
    <div class="tips">
      <div>{{ $t('newwallet.regRules') }}</div>
      <div>{{ $t('newwallet.regRules1') }}</div>
      <div>{{ $t('newwallet.regRules2') }}</div>
      <div>{{ $t('newwallet.regRules3') }}</div>
      <div>{{ $t('newwallet.regRules4') }}</div>
    </div>

    <div class="hasWallet">
      <span>{{ $t('newwallet.hasAcc') }}</span>
      <span class="green"
        @click="handleTo('loginWallet')">{{ $t('newwallet.toLogin') }}</span>
    </div>

    <van-popup class="popup_p"
      v-model="showRegiInfo">
      <ShowRegiActions :memo="memo" @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet'
import ShowRegiActions from '@/views/accForPwd/popup/ShowRegiActions'
export default {
  name: 'accForPwd',
  components: {
    ShowRegiActions
  },
  data() {
    return {
      iptAct: 0,
      name: '',
      pwd: '',
      pwd2: '',
      pwdType: 'password', // text
      accReg: /^([a-z]|[1-5]){1,8}\.(tag|dfs)$/, // 匹配账户

      nameError: false,
      pwdError: false,
      pwd2Error: false,

      showRegiInfo: false,
      memo: '',

      showPopover: false,
      actions: [{ text: '.tag' }],
      selectAct: '.tag',
    }
  },
  computed: {
    shortName() {
      return `${this.name}${this.selectAct}`
    }
  },
  methods: {
    handleOnSelect(act) {
      this.selectAct = act.text
    },
    handleClose() {
      this.showRegiInfo = false
    },
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
        if (!this.name || this.accReg.test(this.shortName)) {
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
      for(let i = 0; i < 8; i++){
        let index = Math.round(Math.random() * (charStr.length - 1));
        returnStr += charStr.substring(index, index + 1);
      }
      this.name = returnStr;
    },
    handleReg() {
      if (!this.shortName || this.shortName.length < 4 || !this.accReg.test(this.shortName)) {
        this.$toast.fail(this.$t('newwallet.accRuleErr'))
        return false
      }
      if (!this.pwd || this.pwd.length < 12) {
        this.$toast.fail(this.$t('newwallet.pwdLenErr'))
        return false
      }
      if (!this.pwd2 || this.pwd2 !== this.pwd) {
        this.$toast.fail(this.$t('newwallet.pwdUnLike'))
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
        const {status} = await this.$api.get_account(this.shortName)
        if (!status) {
          return
        }
        this.$toast.fail(this.$t('newwallet.accRegied'))
      } catch (error) {
        const params = {
          account: this.shortName,
          pwd: this.pwd
        }
        DApp.accReg(params, (err, pub) => {
          if (err) {
            this.$toast.fail(err)
            return
          }
          const memo = `new:${this.shortName}:${pub}`
          // console.log(memo)
          this.showRegiInfo = true;
          this.memo = memo
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
  padding: 0 40px 40px;
  .title{
    font-size: 60px;
    font-weight: 600;
    margin-top: 20px;
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
    .model{
      margin-right: 10px;
      font-size: 28px;
      img{
        width: 24px;
        margin-left: 12px;
      }
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
      &.accipt{
        max-width: 200px;
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

    .green{
      color: $color-main;
      width: 120px;
      text-align: center;
      margin-right: 28px;
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
  .tips{
    padding: 0 10px;
    font-size: 24px;
    color: #BCC3C6;
  }
  .hasWallet{
    // position: fixed;
    // bottom: 150px;
    text-align: center;
    margin-top: 50px;
    font-size: 36px;
    font-weight: 500;
    .green{
      color: $color-main;
    }
  }
}
</style>
