<template>
  <div class="upAcc">
    <div class="banner">
      <img class="bg" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/upgrade.png">
      <div class="title">
        <img class="new" src="https://cdn.jsdelivr.net/gh/defis-net/material2/dfs/new_upacc.png" >
        <div>升级个人账户</div>
        <div class="subTitle">升级为自主账户</div>
      </div>
    </div>

    <div class="tips">
      <div class="label">1. 账户升级，购买永久专属你的账户</div>
      <div class="label">2. 获取账户完整的操作权限</div>
    </div>

    <div class="btn flexc" @click="handleUpAcc">立即升级</div>
    <div class="btn unBtn flexc" @click="handleClose">暂不升级</div>
  </div>
</template>

<script>
import { DApp } from '@/utils/wallet';
import { mapState } from 'vuex';
export default {
  name: 'upAcc',
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
  methods: {
    handleClose() {
      this.$emit('listenClose', false)
    },
    handleUpAcc() {
      const formName = this.account.name;
      const permission = this.account.permissions;
      const memo = `buy:${this.account.publicKey}`
      const params = {
        actions: [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            from: formName,
            to: 'dfsacmanager',
            quantity: '1.0000 EOS',
            memo
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
        this.handleClose()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.upAcc{
  border-radius: 12px;
  .banner{
    text-align: left;
    position: relative;
    height: 332px;
    .bg{
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }
    .title{
      position: relative;
      z-index: 1;
      padding: 50px;
      font-size: 48px;
      font-weight: 600;
      .new{
        width: 92px;
        margin-bottom: 10px;
      }
      .subTitle{
        font-size: 32px;
        font-weight: 400;
        margin-top: 10px;
      }
    }
  }
  .tips{
    padding: 50px;
    font-size: 40px;
    text-align: left;
    .label{
      margin-bottom: 40px;
    }
  }
  .btn{
    height: 100px;
    font-size: 34px;
    font-weight: 500;
    color: #FFF;
    background: $color-main;
    border-radius: 12px;
    margin: 10px 45px;
    &.unBtn{
      color: $color-main;
      background: rgba(0,0,0,0);
    }
  }
}
</style>
