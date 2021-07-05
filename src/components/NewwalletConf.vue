<template>
  <div>
    <van-popup class="popup_p" v-model="showComfire">
      <ShowActionsInfo v-if="showComfire"
        :obj="obj"
        @listenClose="handleClose"
        @listenIptPwd="handleShowIptPwd"/>
    </van-popup>

    <van-popup class="popup_p" v-model="showIptPwd">
      <ShowIptPwd v-if="showIptPwd"
        :obj="obj"
        @listenClose="handleClose"
        @listenSend="handleSend"/>
    </van-popup>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import Bus from '@/utils/bus';
import ShowActionsInfo from '@/components/popup/ShowActionsInfo';
import ShowIptPwd from '@/components/popup/ShowIptPwd'
export default {
  components: {
    ShowActionsInfo,
    ShowIptPwd
  },
  data() {
    return {
      showComfire: false,
      showIptPwd: false,
      obj: {},
      unShowComfire: false, // 不展示确认弹窗
      unShowPwd: false, // 不展示密码弹窗
    }
  },
  created() {
    Bus.$on('busShowComfire', (val) => {
      this.obj = val;
      this.handleRegShow()
    });
  },
  beforeDestroy: function () {
    Bus.$off('busShowComfire')
  },
  methods: {
    handleRegShow() {
      if (this.unShowComfire && this.unShowPwd) {
        // 直接执行合约操作
        this.handleSend({})
        return
      }
      if (!this.unShowComfire) {
        // 展示确认框
        this.showComfire = true;
        return
      }
      if (!this.unShowPwd) {
        // 展示密码框
        this.showIptPwd = true;
        return
      }
    },
    handleClose() {
      this.showComfire = false;
      this.showIptPwd = false;
    },
    handleShowIptPwd(obj) {
      this.showComfire = false;
      this.showIptPwd = true;
      this.unShowComfire = obj.status;
    },
    handleSend(obj) {
      this.handleClose();
      if (obj.type === 'pwd') {
        this.unShowPwd = obj.status;
      }
      const params = JSON.parse(JSON.stringify(this.obj))
      const cb = this.obj.cb;
      const type = this.obj.type;
      delete params.cb;
      delete params.type;
      if (type === 'transfer') {
        DApp.transferSure(params, cb)
        return
      }
      DApp.toTransactionSure(params, cb)
    }
  }
}
</script>

<style lang="scss" scoped>


.popup_p{
  margin-top: 15vh;
  width: 90%;
  top: 0px;
  transform: translate(-50%, 0);
}
</style>
