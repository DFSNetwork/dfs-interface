// scatter 链接钱包
import ScatterJS from 'scatterjs-core';
// import ScatterEOS from 'scatterjs-plugin-eosjs2';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs-without-sort'; // 代签不排序
// import { isTpWallet } from '@/utils/wallet/fullScreen'; // tokenpocket JS

import axios from 'axios';
import store from '@/store';

ScatterJS.plugins( new ScatterEOS() );

// import './newWallet'
// import '../eos2/index';

class ScatterClass {
  constructor() {
    this.vthis = null;
    this.scatter = null;
    this.scatterEosJs = null;
    this.eosJs = null;
    this.connectCount = 0; // 重连次数
    this.isConnect = false;
  }
  // scatter 初始化
  scatterInit(vthis, callback) {
    this.vthis = vthis;
    const self = this;
    if (self.isConnect) {
      callback();
      return
    }
    const node = store.state.sys.baseConfig.node
    const networkOpt = {
      blockchain: 'eos',
      protocol: node.protocol, // 'https',
      host: node.host, // 'eos.blockeden.cn',
      port: node.port, // 443,
      chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    }
    const network = ScatterJS.Network.fromJson(networkOpt);
    ScatterJS.connect('DeFis-Network',{network}).then(async connected => {
      self.isConnect = connected;
      if (!connected) {
        self.connectCount += 1;
        if (self.connectCount > 10) {
          return false;
        }
        setTimeout(() => {
          self.scatterInit(self.vthis, callback);
        }, 500);
        return false;
      }
      self.scatter = ScatterJS.scatter;
      self.eosJs = ScatterJS.eos(network, Eos, {});
      callback();
    });
  }
  loginOut(cb) {
    const self = this;
    self.scatter.forgetIdentity()
    // location.reload()
    cb()
  }
  // login
  login(callback) {
    const self = this;
    if (!self.isConnect) {
      self.scatterInit(self.vthis, () => {
        self.login();
      })
      return;
    }
    self.scatter.login().then(id => {
      if(!id) return console.error('no identity');
      const account = ScatterJS.account('eos');
      const newAccount = {
        name: account.name,
        permissions: account.authority,
        publicKey: account.publicKey,
      }
      store.dispatch('setAccount', newAccount);
      callback(newAccount)
    });
  }
  /* -------- 获取余额 start -------- */
  getCurrencyBalance(params, callback) {
    const newParams = {
      code: params.code || 'eosio.token',
      symbol: params.coin || 'EOS',
      account: params.account || store.state.app.account.name,
    }
    const https = store.state.sys.baseConfig.node.url;
    // console.log(https)
    axios.post(`${https}/v1/chain/get_currency_balance`, JSON.stringify(newParams)).then((res) => {
      if (!res.data.length) {
        callback(`${Number(0).toFixed(params.decimal)} ${params.symbol}`);
        return;
      }
      const returnData = res.data[0];
      callback(returnData);
    }).catch((e) => {
      console.log(`e: ${e}`); // eslint-disable-line
    })
  }
  /* -------- 获取余额 end -------- */

  transfer(obj, callback) {
    const formName = store.state.app.account.name;
    const permission = store.state.app.account.permissions;
    const params = {
      actions: [
        {
          account: obj.code,
          name: 'transfer',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            from: formName,
            to: obj.toAccount,
            quantity: obj.quantity,
            memo: obj.memo || ''
          }
        }
      ]
    }
    // if (isTpWallet()) {
    //   this.handleUseFreeCpu(params, callback)
    //   return
    // }
    this.eosJs.transaction(params, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then((res) => {
      callback(null, res)
    }).catch((e) => {
      this.dealError(e, callback);
    });
  }

  // transaction 操作
  toTransaction(obj, callback) {
    const params = obj;
    const self = this;
    if (!self.isConnect) {
      self.toTransaction(obj, callback)
      return
    }
    // if (isTpWallet()) {
    //   this.handleUseFreeCpu(params, callback)
    //   return
    // }
    self.eosJs.transaction(params, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then((res) => {
      console.log(res)
      callback(null, res);
    }).catch((e) => {
      self.dealError(e, callback);
    });
  }

  handleUseFreeCpu(params, callback) {
    console.log(params)
    let actor = '11111cpufree';
    params.actions.forEach(v => {
      v.authorization.unshift({ actor, permission: 'active' })
    })
    
    this.eosJs.transaction(params, {
      broadcast: !1,
      sign: !0,
    }).then(res => {
      if (res.processed || res.transaction_id) {
        const p = res;
        const l = p.transaction.transaction;
        l.signatures = p.transaction.signatures;
        l.context_free_data = [];
        // const signed = JSON.stringify(l);
        const signed = l;
        this.pushFreeCpu(signed, (error, resFree) => {
          if (resFree) {
            callback(null, resFree);
            return;
          }
          this.errorCall(error, callback);
        })
      }
    }).catch((e) => {
      this.errorCall(e, callback);
    });
  }

  pushFreeCpu(signedTx, cb) {
    let url = 'http://47.243.71.86:7001/api/common/freeCpu';
    // let url = 'http://192.168.31.101:7001/api/common/freeCpu';
    axios.post(url, signedTx, {
      headers: {
        accept: 'application/json, text/plain, */*',
      },
    }).then((res) => {
      if (res.data.code !== 0) {
        const msg = res.data.message;
        cb(msg, null);
        return
      }
      cb(null, res.data)
    }).catch((error) => {
      console.log(error); // eslint-disable-line
    })
  }

  dealError(e, callback) {
    console.log(e)
    //  catch 错误回调 ---- code: 3080004 - cpu不足 | 3080002 - net不足 | 3080001 - ram不足
    let back = {
      code: 999,
      message: 'fails!',
    };
    try {
      if (typeof (e) === 'object') {
        if (e.code === 402) {
          back = {
            code: '402',
            message: 'User rejected the signature request',
          }
        }
      }
      if (typeof (e) === 'string') {
        const err = JSON.parse(e);
        // CPU 不足
        if (err.error.code === 3080004) {
          back = {
            code: 3080004,
            message: 'Insufficient CPU resources',
          }
        }
        // NET 不足
        if (err.error.code === 3080002) {
          back = {
            code: 3080002,
            message: 'Insufficient Net resources',
          }
        }
        // RAM 不足
        if (err.error.code === 3080001) {
          back = {
            code: 3080001,
            message: 'Insufficient RAM resources',
          }
        }
        // 交易超时
        if (err.error.code === 3080006) {
          back = {
            code: 3080006,
            message: this.vthis.$t('error.timeout'),
          }
        }
        if (err.error.code === 3050003 || err.error.code === 3010010) {
          // 滑点过高导致
          const detail = err.error.details;
          if (detail[0].message.indexOf('INSUFFICIENT_OUTPUT_AMOUNT') !== -1) {
            back = {
              code: 3050003,
              message: '滑点过高',
            }
          } else if (detail[0].message.indexOf('Invalid packed transaction') !== -1) { // 用户取消操作
            back = {
              code: 402,
              message: '用户取消',
            }
          } else {
            back = {
              code: err.error.code,
              message: detail[0].message,
            }
          }
        }
      }
      callback(back, null);
    } catch (error) {
      if (e === '操作已取消') {
        back = {
          code: 402,
          message: 'Cancel',
        }
      }
      callback(back, null);
    }
  }
}
export const scatterClass = new ScatterClass();