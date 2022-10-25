// scatter 链接钱包
import ScatterJS from 'scatterjs-core';
// import ScatterEOS from 'scatterjs-plugin-eosjs2';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs-without-sort'; // 代签不排序
// import { isTpWallet } from '@/utils/wallet/fullScreen'; // tokenpocket JS

import axios from 'axios';
import store from '@/store';
// import { pushFreeCpu2 } from '@/api/list'; // reg_newaccount

ScatterJS.plugins( new ScatterEOS() );
const FREECPUPRIVATEKEY = store.state.config.freeCpuPrivateKey;
// import './newWallet'
// import '../eos2/index';

import abi from './eosio.system.json'
class ScatterClass {
  constructor() {
    this.vthis = null;
    this.scatter = null;
    this.scatterEosJs = null;
    this.eosJs = null;
    this.connectCount = 0; // 重连次数
    this.isConnect = false;

    this.freeCpuEos = null;
  }
  // scatter 初始化
  scatterInit(vthis, callback) {
    this.vthis = vthis;
    const self = this;
    this.initFreeCpu()
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
      window.eosJs = self.eosJs
      if (self.eosJs.fc.abiCache) {
        try {
          self.eosJs.fc.abiCache.abi('eosio', abi);
        } catch (error) {
          console.log(error)
        }
      }
      callback();
    });
  }
  initFreeCpu() {
    const node = store.state.sys.baseConfig.node
    const networkOpt = {
      blockchain: 'eos',
      protocol: node.protocol, // 'https',
      host: node.host, // 'eos.blockeden.cn',
      port: node.port, // 443,
      chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      url: `${node.protocol}://${node.host}:${node.port}`
    }
    // const network = ScatterJS.Network.fromJson(networkOpt);
    this.freeCpuEos = Eos({
      keyProvider: FREECPUPRIVATEKEY, // private key
      httpEndpoint: networkOpt.url,
      chainId: networkOpt.chainId,
    });
    if (this.freeCpuEos.fc.abiCache) {
      try {
        this.freeCpuEos.fc.abiCache.abi('eosio', abi);
      } catch (error) {
        console.log(error)
      }
    }
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
        // name: 'dfsdeveloper',
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
    const useFreeCpu = store.state.app.freeCpu;
    if (useFreeCpu) {
      this.handleUseFreeCpu(params, callback)
      return
    }
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
    const useFreeCpu = store.state.app.freeCpu;
    // console.log('useFreeCpu', useFreeCpu)
    if (useFreeCpu) {
      this.handleUseFreeCpu(params, callback)
      return
    }
    self.eosJs.transaction(params, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then((res) => {
      callback(null, res);
    }).catch((e) => {
      const err = e.toString()
      if (err.indexOf('Missing ABI action') !== -1) {
        this.addAbiTransaction(params, callback)
        return;
      }
      self.dealError(e, callback);
    });
  }

  // 添加abi方法
  addAbiTransaction(params, callback) {
    if (this.eosJs.fc.abiCache) {
      try {
        this.eosJs.fc.abiCache.abi('eosio', abi);
        this.eosJs.transaction(params).then((res) => {
          callback(null, res);
        }).catch((e) => {
          this.dealError(e, callback);
        });
      } catch (error) {
        console.log(error)
      }
      return;
    }
    const err = {
      code: 'Scatter',
    }
    this.dealError(err, callback);
  }

  buffer2hex(buffer) {
    return Array.from(buffer, (x) => ('00' + x.toString(16)).slice(-2)).join('')
  }

  handleUseFreeCpu(tx, cb) {
    (async () => {
      try {
        const txh = {
          blocksBehind: 3,
          expireSeconds: 120,
        };
        const data = {
          tx,
          txh
        }
        const formName = store.state.app.account.name;
        tx.actions.unshift({
          account: "dfsfreecpu11",
          name: 'freecpu2',
          authorization: [
            {
              actor: "yfcmonitor11",
              permission: `cpu`,
            },
          ],
          data: {
            user: formName
          },
        })
        // tx.actions[0].authorization.unshift({
        //   actor: "iq3rwbsfcqlv",
        //   permission: `active`,
        // })
        let pushTransactionArgs = await this.eosJs.transaction(tx, {
          // ...txh,
          sign: true,
          broadcast: false,
        });
        const p = pushTransactionArgs;
        const l = p.transaction.transaction;
        l.signatures = p.transaction.signatures;
        l.context_free_data = [];
        data.sign_data = l

        // console.log(tx)
        // console.log(data)
        this.toSignFreeCpu(data.sign_data, cb)

        // const {status, result} = await pushFreeCpu2(data)
        // console.log(result, status)
        // if (!status || !result) { // 请求失败 - 走正常流程操作
        //   cb(result, null)
        //   return
        // }
        // cb(null, result)
      } catch (error) {
        const err = error.toString()
        if (err.indexOf('Missing ABI action') !== -1) {
          if (this.eosJs.fc.abiCache) {
            try {
              this.eosJs.fc.abiCache.abi('eosio', abi);
              this.handleUseFreeCpu(tx, cb)
            } catch (error) {
              this.dealFreeCpuError(error, cb)
            }
          }
          return;
        }
        this.dealFreeCpuError(error, cb)
      }
    })()
  }
  async toSignFreeCpu(params, cb) {
    // try {
    // console.log('执行this.freeCpuEos.transaction', params)
    let signResult = await this.freeCpuEos.transaction(params, {
      sign: true,
      broadcast: false,
      blocksBehind: 3,
      expireSeconds: 30,
    })
    // console.log('signResult = ', signResult)
    const pushTransaction = signResult.transaction;
    pushTransaction.signatures.push(params.signatures[0]);
    const pushResult = await this.freeCpuEos.pushTransaction(pushTransaction);
    // console.log('pushResult', pushResult)
    cb(null, pushResult)
    // } catch (error) {
    //   console.error(error.toString())
    // }
  }
  dealFreeCpuError(error, cb) {
    // console.log(typeof error)
    let err = error.toString()
    if (typeof error === 'object') {
      err = JSON.stringify(error)
    }
    let back = {
      code: 999,
      message: err,
    };
    if (err.indexOf('INSUFFICIENT_OUTPUT_AMOUNT') !== -1) {
      back = {
        code: 3050003,
        message: "滑点过高",
      };
    }
    if (err.indexOf('you have no permission for this operation') !== -1) {
      back = {
        code: 3050003,
        message: "您没有权限操作",
      };
    }
    cb(back, null);
  }

  dealError(e, callback) {
    console.log(JSON.stringify(e))
    console.log(e.toString())
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