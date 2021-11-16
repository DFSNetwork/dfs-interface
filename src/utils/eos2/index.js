import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import {JsonRpc, Api} from 'eosjs';

// 项目依赖
// import store from '@/store';
// import { construct } from 'core-js/fn/reflect';

ScatterJS.plugins( new ScatterEOS() );

class Eos2 {
  constructor() {
    // 系统参数
    this.scatterConnected = false;
    this.scatappOnline = false;
    this.maxFrequency = 20;
    this.nowFrequency = 0;

    // 变量
    this.vthis = null;
    this.wallet = (localStorage.getItem('WALLET') || 'scatter').toLowerCase();
    this.network = null;
    this.rpc = null;
    this.EosJs = null;
    this.scatterEosJs = null; // 登录后的各种操作对象
  }
  init(vthis, callback) {
    const self = this;
    self.vthis = vthis;
    self.wallet = (localStorage.getItem('WALLET') || 'scatter').toLowerCase()

    self.network = ScatterJS.Network.fromJson({
      blockchain:'eos',
      chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      host:'nodes.get-scatter.com',
      port:443,
      protocol:'https'
    });
    self.rpc = new JsonRpc(self.network.fullhost());

    // 初始化完成 - 直接执行回调
    if (self.scatterConnected) {
      callback();
      return;
    }

    ScatterJS.connect('defis-network', {
      network: self.network
    }).then(connected => {
      self.scatterConnected = connected;
      if (!connected) {
        self.nowFrequency += 1;
        if (self.nowFrequency > self.maxFrequency) {
          // 退出当前账户
          console.log('scatter 链接失败')
          return
        }
        setTimeout(() => {
          self.init(self.vthis, callback);
        }, 500);
        return false;
      }
      // scatter 链接成功
      self.scatappOnline = true;
      // 初始化 EosJs
      self.EosJs = ScatterJS.eos(self.network, Api, {
        rpc: self.rpc
      });

      ScatterJS.login().then(id => {
        if(!id) return console.error('no identity');
        const account = ScatterJS.account('eos');
        console.log('account', account)
      });
    });
  }
}
const Eos2DApp = new Eos2()
Eos2DApp.init(this, () => {
  console.log(123)
})

// export default Eos2DApp;