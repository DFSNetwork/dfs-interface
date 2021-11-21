<template>
  <div class="accVote flexb">
    <div class="din">{{ $t('nodePools.voteNum', {token: 'EOS'}) }}：{{ accVoteData.eosNum }}</div>
    <div class="btn flexc" v-if="!accVoteData.isDfsProxy"
      v-loading="loadingProxy"
      @click="handleProxy">{{ $t('nodePools.proxyToHis') }}</div>
    <div class="btn flexc" v-else-if="accVoteData.showJoinBtn"
      v-loading="loadingJoin"
      @click="handleJoin">{{ $t('nodePools.join') }}</div>
    <div class="btn flexc" v-else 
      v-loading="loadingJoin"
      @click="$emit('listenUpdata', 'acc'); showManage = !showManage">{{ $t('nodePools.manage') }}</div>

    <van-popup
      class="popup_p"
      v-model="showManage">
      <ManageVote v-if="showManage" :accVoteData="accVoteData"
        @listenUpdata="listenUpdata"/>
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DApp } from '@/utils/wallet';
import { getJoinActions, getVoteToProxy } from '../../nodePools/js/nodePools';
import ManageVote from '@/views/nodePools/dialog/ManageVote'
export default {
  components: {
    ManageVote,
  },
  props: {
    accVoteData: {
      type: Object,
      default: function ad() {
        return {}
      }
    }
  },
  data() {
    return {
      loadingJoin: false,
      loadingProxy: false,
      showManage: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.app.account,
    }),
  },
  methods: {
    handleJoin() {
      if (!this.account || !this.account.name || this.loadingProxy) {
        return
      }
      this.loadingJoin = true;
      const params = getJoinActions(this.accVoteData)
      DApp.toTransaction(params, (err) => {
        this.loadingJoin = false;
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
        this.listenUpdata();
      })
    },
    listenUpdata() {
      this.showManage = false;
      setTimeout(() => {
        // 查询代理账户数据
        this.$emit('listenUpdata', 'acc')
      }, 1500);
    },
    // 执行代理委托
    handleProxy() {
      if (!this.account || !this.account.name || this.loadingProxy) {
        return
      }
      this.loadingProxy = true;
      const params = getVoteToProxy(this.accVoteData)
      DApp.toTransaction(params, (err) => {
        this.loadingProxy = false;
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
        this.listenUpdata();
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.accVote{
  z-index: 2;
  position: relative;
  font-size: 32px;
  height: 140px;
  box-shadow: 4px 4px 10px 4px rgba(243,243,243,1);
  padding: 0 24px;
  border-radius: 20px;
  .btn{
    width: 200px;
    height: 80px;
    color: #FFF;
    background: $color-main;
    border-radius: 12px;
  }
}
</style>
