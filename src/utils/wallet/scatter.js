// scatter 链接钱包
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs-without-sort'; // 代签不排序

import axios from 'axios';
import store from '@/store';
import Bus from '@/utils/bus';
import abi from './eosio.system.json'

ScatterJS.plugins( new ScatterEOS() );
const FREECPUPRIVATEKEY = store.state.config.freeCpuPrivateKey;
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
    let signResult = await this.freeCpuEos.transaction(params, {
      sign: true,
      broadcast: false,
      blocksBehind: 3,
      expireSeconds: 30,
    })
    const pushTransaction = signResult.transaction;
    pushTransaction.signatures.push(params.signatures[0]);
    const pushResult = await this.freeCpuEos.pushTransaction(pushTransaction);
    cb(null, pushResult)
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
    // console.log(JSON.stringify(e))
    // console.log(e.toString())
    //  catch 错误回调 ---- code: 3080004 - cpu不足 | 3080002 - net不足 | 3080001 - ram不足
    let back = {
      code: 999,
      message: 'fails!',
    };
    let deal = [
      [ // 用户取消操作
        (code) => {
          const codes = [402]
          return codes.includes(Number(code))
        },
        () => {
          return {
            code: 402,
            message: 'User rejected the signature request',
          }
        }
      ],
      [ // 资源不足
        (code) => {
          const codes = [3080004, 3080002, 3080001]
          return codes.includes(Number(code))
        },
        (tErr) => {
          Bus.$emit('showResInsufficient', tErr.code == 3080001 ? 'RAM' : 'CPU')
          return {
            code: 402,
            message: '资源不足'
          }
        }
      ],
      [ // 交易超时
        (code) => {
          const codes = [3080006]
          return codes.includes(Number(code))
        },
        () => {
          return {
            code: 3080006,
            message: this.vthis.$t('error.timeout'),
          }
        }
      ],
      [
        (code) => {
          const codes = [3050003, 3010010]
          return codes.includes(Number(code))
        },
        (tErr) => {
          const detail = tErr.details;
          if (detail[0].message.indexOf('INSUFFICIENT_OUTPUT_AMOUNT') !== -1) {
            return {
              code: 3050003,
              message: '滑点过高',
            }
          }
          if (detail[0].message.indexOf('Invalid packed transaction') !== -1) { // 用户取消操作
            return {
              code: 402,
              message: '用户取消',
            }
          }
          return {
            code: tErr.code,
            message: detail[0].message,
          }
        }
      ]
    ]
    try {
      const typeofStatus = typeof (e);
      let dErr = e;
      if (typeofStatus === 'string') {
        const tErr = JSON.parse(e)
        dErr = tErr.error ? tErr.error : tErr;
      }
      // console.log(dErr, 'dErr')

      const findErr = deal.find(v => v[0](dErr.code))
      if (findErr) {
        back = findErr[1](dErr)
      }
      callback(back, null);
    } catch (error) {
      if (e === '操作已取消') {
        back = {
          code: 402,
          message: 'User rejected the signature request',
        }
      }
      callback(back, null);
    }
  }
}
export const scatterClass = new ScatterClass();