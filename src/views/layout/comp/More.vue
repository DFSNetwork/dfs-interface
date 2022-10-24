<template>
  <!-- more -->
  <van-popup
    position="right"
    class="drawerCss"
    v-model="showNav">
    <div class="morePop">
      <div class="acc flexb">
        <div style="flex:1">
          <div class="wel">{{ $t('more.wel') }}</div>
          <div class="flexb" v-if="!account || !account.name">
            <div class="appLogin" @click="handleLogin('scatter')">{{ $t('newwallet.loginByWallet') }}</div>
            <div class="appLogin appLogin2" @click="handleLogin('newwallet')">{{ $t('newwallet.loginByPwd') }}</div>
          </div>
          <div v-else class="login">{{ account.name }}</div>
        </div>
        <!-- <img v-if="!account || !account.name" @click="handleLogin"
          class="right" src="https://storied-crepe-e5e65c.netlify.app/svg/acc_right.svg" alt=""> -->
        <span v-if="account && account.name" class="red exit" @click="handleLoginOut">{{ $t('public.loginOut') }}</span>
      </div>
      <!-- list -->
      <div class="lists">
        <!-- <div class="list flexb wel" @click="handleToAbout">
          <div class="flexa">
            <img class="dfslogo" src="https://leafy-kataifi-c6d825.netlify.app/coin/minedfstoken-dfs.png">
            <span>{{ $t('more.aboutDfs') }}</span>
          </div>
          <img class="right_to" src="https://storied-crepe-e5e65c.netlify.app/svg/about_right.svg" alt="">
        </div> -->
        <div class="list switch flexb">
          <span>免CPU操作</span>
          <span class="rel">
            <van-switch class="vanSwitch"
              :value="cpuSwitch" @input="handleSetCpu"
              size="26px"
              active-color="#FFF" inactive-color="#FFF"/>
            <span v-if="cpuSwitch" class="switchInfo infoA" @click="handleSetCpu(!cpuSwitch)">ON</span>
            <span v-else class="switchInfo infoB" @click="handleSetCpu(!cpuSwitch)">OFF</span>
          </span>
        </div>
        <div class="list flexa" @click="handleShowComp('silderSet')">
          <img class="listImg" src="https://leafy-kataifi-c6d825.netlify.app/dfs/swap-set.png">
          <span>{{ $t('dex.TradeSet') }}</span>
        </div>
        <div class="list flexa" @click="handleShowNode">
          <img class="listImg" src="https://leafy-kataifi-c6d825.netlify.app/dfs/node-set.png">
          <span>{{ $t('node.nodeSet') }}</span>
        </div>
        <div class="list flexa" @click="handleTo('createMarket')">
          <img class="listImg" src="https://storied-crepe-e5e65c.netlify.app/svg/create_set.svg">
          <span>{{ $t('dex.addMarket') }}</span>
        </div>
        <!-- <div class="list flexa" @click="handleToPro('docs')">
          <img class="listImg" src="https://storied-crepe-e5e65c.netlify.app/svg/tutorial_set.svg">
          <span>{{ $t('more.faq') }}</span>
        </div> -->
        <div class="list flexa" @click="handleShowComp('warn')">
          <img class="listImg" src="https://storied-crepe-e5e65c.netlify.app/svg/safe_set.svg">
          <span>{{ $t('public.warnTip') }}</span>
        </div>
        <div class="list lang flexb">
          <div class="flexc" :class="{'act': language === 'zh-CN'}" @click="handleChangeLang('zh-CN')">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/lang-zh.png">
            <span>简体中文</span>
          </div>
          <div class="flexc" :class="{'act': language === 'en'}" @click="handleChangeLang('en')">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/lang-en.png">
            <span>English</span>
          </div>
        </div>
      </div>

      <div class="telUs">
        <!-- <div class="subTi">联系我们</div> -->
        <div class="flexb item">
          <a href="https://github.com/defis-net" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/github2.png">
          </a>
          <!-- <a href="https://bihu.com/people/1511717747" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/telUs/Bihu.png">
          </a> -->
          <a href="https://twitter.com/DFSnetworks" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/twitter2.png">
          </a>
          <a href="https://t.me/dfsnet" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/telegram2.png">
          </a>
          <a href="https://bihu.com/people/1511717747" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/dfs/bihu2.png">
          </a>
        </div>
        <!-- <div class="flexb item">
          <a v-clipboard:copy="'dfsfarmer'"
            v-clipboard:success="handleCopy"
            v-clipboard:error="handleCopyError">
            <img src="https://leafy-kataifi-c6d825.netlify.app/telUs/WeChat.png">
          </a>
          <a href="https://dfsofficial.medium.com/" target="_blank">
            <img src="https://leafy-kataifi-c6d825.netlify.app/telUs/medium.png">
          </a>
        </div> -->
      </div>
    </div>
  </van-popup>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex'
import { login } from '@/utils/public';

export default {
  name: 'more',
  data() {
    return {
      showNav: false,
      cpuSwitch: false,
      wallet: '',
    }
  },
  mounted() {
    this.cpuSwitch = this.freeCpu;
    this.wallet = localStorage.getItem('WALLET')
  },
  computed: {
    ...mapState({
      language: state => state.app.language,
      account: state => state.app.account,
      freeCpu: state => state.app.freeCpu,
    }),
  },
  methods: {
    handleToAbout() {
      location.href = "https://defis.network/"
    },
    handleSetCpu(checked) {
      console.log(checked)
      this.cpuSwitch = checked;
      this.$store.dispatch('setFreeCpu', checked)
      console.log(this.freeCpu)
    },
    handleChangeLang(lang) {
      let type = lang;
      this.$i18n.locale = type;
      this.$store.dispatch('setLanguage', type);
    },
    // 登录
    handleLogin(wallet) {
      this.wallet = wallet;
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
    handleShowNode() {
      this.$emit('listenShowComp', 'node')
      this.showNav = false;
    },
    handleToV1(ve) {
      if (ve === 'v1') {
        location.href = 'https://app2.defis.network/'
      } else if (ve === 'v2') {
        location.href = 'https://v2.defis.network/'
      } else if (ve === 'v3') {
        location.href = 'https://v3.defis.network/'
      } else if (ve === 'v4') {
        location.href = 'https://v4.defis.network/'
      } else if (ve === 'v5') {
        location.href = 'https://apps.defis.network/'
      }
    },
    handleToPro(type) {
      if (type === 'docs') {
        location.href = 'https://dfscommunity.baklib-free.com/'
      }
    },
    handleTo(name) {
      if (this.$route.name === name)  {
        this.showNav = false;
        return;
      }
      this.$router.push({name: name})
      this.showNav = false;
    },
    handleShowComp(type) {
      this.$emit('listenShowComp', type)
      this.showNav = false;
    },
    handleLoginOut() {
      DApp.loginOut(() => {
        // location.reload()
      })
    },
    // 分享 - 复制文本
    handleCopy() {
      this.$message.success({
        message: this.$t('public.copySuccess'),
        position: 'center',
        duration: 2000
      });
    },
    handleCopyError() {
      this.$message.error({
        message: this.$t('public.copyFail'),
        position: 'center',
        duration: 2000
      });
    },
  }
}
</script>

<style lang="scss" scoped>
/*iphoneX、iphoneXs*/
// @media only screen and (max-width: 750px) {
//   .exit{
//     display: none !important;
//   }
// }
.morePop{
  max-height: 100vh;
  overflow: auto;
  font-size: 27px;
  .right{
    width: 20px;
  }
  .red{
    color: #FFF;
    background: #EB6765;
    padding: 14px 22px;
    font-size: 24px;
    border-radius: 20px;
  }
  .acc{
    padding: 30px 15px 0px 30px;
    text-align: left;
    .wel{
      margin-bottom: 10px;
      font-size: 32px;
      font-weight: 500;
    }
    .login{
      font-size: 50px;
      font-weight: 500;
      margin-bottom: 10px;
      color: #333;
    }
    .appLogin{
      margin-top: 20px;
      flex: 1;
      color: #FFF;
      background: $color-main;
      padding: 14px 22px;
      border-radius: 20px;
      font-size: 28px;
      margin-right: 22px;
      text-align: center;
      &.appLogin2{
        color: $color-main;
        margin-right: 0;
        background: #FFF;
        box-shadow: 0px 4px 8px 0px rgba(206,206,206,0.5);
      }
    }
  }
  .lists{
    // margin: 0 30px 30px;
    .title{
      color: #FFF;
      background: #57DBBF;
      height: 80px;
      border-radius: 20px 20px 0px 0px;
      padding: 30px;
      box-sizing: border-box;
      margin-bottom: 10px;
      .titleImg{
        width: 60px;
        margin-right: 10px;
      }
    }
    .list{
      color: #333;
      height: 80px;
      padding-right: 30px;
      box-sizing: border-box;
      margin: 30px 30px;
      font-size: 32px;
      font-weight: 500;
      &.wel{
        height: 102px;
        background: $color-main;
        color: #FFF;
        margin: 30px 15px;
        border-radius: 20px 20px 0px 0px;
        padding: 0 26px;
      }
      .listImg{
        width: 32px;
        margin-right: 30px;
        margin-left: 10px;
      }
      .dfslogo{
        width: 54px;
        margin-right: 15px;
      }
      .right_to{
        width: 20px;
      }
    }
    .switch{
      background: rgba(#29D4B0, 1);
      padding: 30px;
      height: 104px;
      border-radius: 12px;
      color: #FFF;
      .rel{
        position: relative;
      }
      .vanSwitch{
        border: 1px solid #FFF;
        :deep( .van-switch__node){
          background: #67DEC5;
          box-shadow: none;
          border: 1px solid #FFF;
          box-sizing: border-box;
        }
      }
      .switchInfo{
        font-size: 20px;
        color: #FFF;
        position: absolute;
        &.infoA{
          color: $color-main;
          top: 50%;
          left: 12px;
          transform: translateY(-60%);
        }
        &.infoB{
          color: #EB6765;
          top: 50%;
          right: 10px;
          transform: translateY(-60%);
        }
      }
    }
  }
  .lang{
    height: 84px;
    color: #333;
    border-radius: 20px;
    background: rgba(#57DBBF, .08);
    padding-right: 0 !important;
    &>div{
      font-size: 24px;
      box-sizing: border-box;
      flex: 1;
      height: 80px;
    }
    .act{
      border: 1px solid $color-main;
      border-radius: 20px;
    }
    img{
      width: 38px;
      margin-right: 10px;
    }
  }
  .version{
    font-size: 30px;
    color: #333;
    padding: 30px;
    &>span{
      width: 50px;
      height: 50px;
      margin-right: 50px;
      &:last-child{
        margin-right: 0px;
      }
    }
  }
  .telUs{
    // background: #EEFBF8;
    color: $color-main;
    text-align: left;
    margin: 28px;
    border-radius: 12px;
    padding: 28px 0;
    .item{
      margin-top: 30px;
      &:first-child{
        margin-top: 0px;
      }
      img{
        width: 96px;
      }
    }
  }
  .exportPrivate{
    border: 2px solid $color-main;
    color: $color-main;
    margin: 30px;
    height: 80px;
    border-radius: 20px;
  }
}

.drawerCss{
  width: 480px;
  height: 100vh;
}
</style>