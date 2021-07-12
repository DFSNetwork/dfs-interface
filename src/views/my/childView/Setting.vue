<template>
  <div class="setting">
    <div class="title flexb">
      <span class="back flexa" @click="$router.back()">
        <img src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/back.png" alt="">
      </span>
      <span>{{ $t('my.setting') }}</span>
      <span class="back"></span>
    </div>

    <div class="accinfo flexb" @click="$router.push({name: 'setInfo'})">
      <div class="flexa">
        <img class="headImg" :src="accInfo.avatar">
        <div>
          <div class="name">{{ accInfo.nick || account.name }}</div>
          <div class="tip flexa">
            <span>ID: {{ account.name }}</span>
            <!-- <img class="copy" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/copy.png"> -->
          </div>
        </div>
      </div>
      <img class="right" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/itemRight.png">
    </div>

    <div class="exportPrivate flexb"
      @click="showPwd = true"
      v-if="wallet === 'newwallet' && account.name">
      <div class="flexa">
        <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/exportPrivite1.png" alt="">
        <span>{{ $t('my.exPriveKey') }}</span>
      </div>
      <img class="right" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/itemRight.png">
    </div>
    <div class="exportPrivate flexb"
      @click="$router.push({name: 'myExpwd'})"
      v-if="wallet === 'newwallet' && account.name">
      <div class="flexa">
        <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/password1.png" alt="">
        <span>{{ $t('my.exPwd') }}</span>
      </div>
      <img class="right" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/itemRight.png">
    </div>
    <div class="exportPrivate flexb"
      @click="showUpAcc = true"
      v-if="wallet === 'newwallet' && account.name && !account.isSelf">
    <!-- <div class="exportPrivate flexb" @click="showUpAcc = true"> -->
      <div class="flexa">
        <img class="icon" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/upAcc1.png" alt="">
        <span>{{ $t('my.upAcc') }}</span>
      </div>
      <img class="right" src="https://cdn.jsdelivr.net/gh/defis-net/material/icon/itemRight.png">
    </div>

    <van-popup class="popup_p"
      v-model="showExp">
      <ExportPrivateKey @listenClose="handleClose"/>
    </van-popup>
    <van-popup class="popup_p"
      v-model="showUpAcc">
      <UpAcc @listenClose="handleClose"/>
    </van-popup>
    <van-popup  class="popup_p"
      v-model="showPwd">
      <ShowIptPwd @listenSend="handleSend" @listenClose="handleClose"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
import ExportPrivateKey from '@/views/accForPwd/popup/ExportPrivateKey'
import UpAcc from '@/views/my/dialog/UpAcc'
import ShowIptPwd from '@/components/popup/ShowIptPwd'

export default {
  name: 'setting',
  components: {
    ExportPrivateKey,
    UpAcc,
    ShowIptPwd,
  },
  data() {
    return {
      wallet: localStorage.getItem('WALLET') || 'scatter',
      showExp: false,
      showUpAcc: false,
      showPwd: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
      accInfo: state => state.app.accInfo,
    }),
  },
  methods: {
    handleClose() {
      this.showUpAcc = false
      this.showExp = false;
      this.showPwd = false;
    },
    handleSend() {
      this.showPwd = false;
      this.showExp = true
    }
  }
}
</script>

<style lang="scss" scoped>
.setting{
  font-size: 32px;
  color: #333;
  min-height: 100vh;
  background: #F5F5F5;
  .title{
    background: #FFF;
    font-size: 36px;
    height: 90px;
    padding: 0 28px;
    font-weight: 500;
    margin-bottom: 30px;
    .back{
      width: 50px;
      height: 50px;
      img{
        display: block;
        width: 18px;
      }
    }
  }
  .accinfo{
    background: #FFF;
    height: 200px;
    margin: 30px 0;
    padding: 0 38px 0 28px;
    text-align: left;
    .right{
      width: 16px;
    }
    .headImg{
      width: 84px;
      height: 84px;
      border-radius: 50px;
      margin-right: 15px;
    }
    .name{
      font-size: 32px;
      margin-bottom: 6px;
    }
    .tip{
      font-size: 24px;
      .copy{
        width: 24px;
        margin-left: 15px;
      }
    }
  }
  .exportPrivate{
    background: #FFF;
    height: 176px;
    margin: 30px 0;
    padding: 0 38px 0 28px;
    text-align: left;
    font-size: 32px;
    .icon{
      width: 32px;
      margin-right: 24px;
    }
    .right{
      width: 16px;
    }
  }
}
</style>
