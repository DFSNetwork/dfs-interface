<template>
  <div class="walletCreate">
    <div class="title">
      <span @click="handleTo('createWallet')"
        class="unAct">{{ $t('newwallet.pwdModel') }}</span>
      <span>{{ $t('newwallet.walletModel') }}</span>
    </div>
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
    <div class="item item2 flexb" :class="{'border': iptAct === 2, 'error': pwdError}">
      <van-field class="ipt textarea"
        v-model="pubkey"
        rows="2"
        @focus="handleFocus(2)"
        @blur="handleBlur(2)"
        type="textarea" :placeholder="$t('newwallet.warnTip4')" />
    </div>
    <div class="label flexb">
      <span class="red">{{ $t('newwallet.warnTip3') }}</span>
      <span class="flexa green" @click="showRandomKey = true">
        <span>{{ $t('newwallet.generator') }}</span>
      </span>
    </div> 

    <div class="btn flexc" @click="handleRegister">{{ $t('newwallet.reg') }}</div>
    <div class="tips">
      <div>{{ $t('newwallet.regRules') }}</div>
      <div>{{ $t('newwallet.regRules5') }}</div>
      <div>{{ $t('newwallet.regRules6') }}</div>
      <div>{{ $t('newwallet.regRules7') }}</div>
      <div>{{ $t('newwallet.regRules8') }}</div>
      <div>{{ $t('newwallet.regRules9') }}</div>
    </div>

    <div class="hasWallet">
      <span>{{ $t('newwallet.unHasWallet') }}</span>
      <span class="green"
        @click="handleTo('loginWallet')">{{ $t('newwallet.toDownWallet') }}</span>
    </div>

    <van-popup class="popup_long"
      v-model="showRegiInfo">
      <ShowRegiActions :memo="memo" :shortName="shortName" @listenClose="handleClose"/>
    </van-popup>

    <van-popup class="popup_p"
      v-model="showRandomKey">
      <ShowKeys @listenClose="handleClose" @update="handleGetNewKey"/>
    </van-popup>
  </div>
</template>

<script>
// import { DApp } from '@/utils/wallet'
import ShowRegiActions from '@/views/accForPwd/popup/ShowRegiActions';
import ShowKeys from '@/views/accForPwd/popup/ShowKeys';
export default {
  name: 'accForPwd',
  components: {
    ShowRegiActions,
    ShowKeys
  },
  data() {
    return {
      iptAct: 0,
      name: '',
      pubkey: '',
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

      showRandomKey: false,
    }
  },
  computed: {
    shortName() {
      return `${this.name}${this.selectAct}`
    }
  },
  methods: {
    handleGetNewKey(data) {
      this.pubkey = data;
    },
    handleOnSelect(act) {
      this.selectAct = act.text
    },
    handleClose() {
      this.showRegiInfo = false;
      this.showRandomKey = false;
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
        if (!this.pubkey || this.pubkey.length == 53) {
          this.pwdError = false
        } else {
          this.pwdError = true
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
      if (!this.pubkey || this.pubkey.length !== 53) {
        this.$toast.fail('请输入正确公钥')
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
        const memo = `new:${this.shortName}:${this.pubkey}`
        console.log(memo)
        this.showRegiInfo = true;
        this.memo = memo
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
    font-size: 50px;
    font-weight: 600;
    margin-top: 20px;
    .unAct{
      color: #A5A5A5;
      margin-right: 70px;
    }
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
    &.item2{
      height: 150px;
      padding: 0;
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
      &.textarea{
        padding: 0;
        height: 160px;
        padding: 28px;
      }
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

    .red{
      color: #FF1717;
    }

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
    border-radius: 16px;
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
