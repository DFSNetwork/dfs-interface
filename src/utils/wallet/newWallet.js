import Ecc from 'eosjs-ecc'
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';  
const fetch = require('node-fetch');

import { get_account, reg_newaccount, pushFreeCpu } from '@/api/list'
import store from '@/store';

class newWallet {
  constructor() {
    this.Ecc = null;
    this.eos_client = null;
    this.rpc = null;
    this.signatureProvider = null;
    this.public_key = null;
    this.vthis = null;
  }
  scatterInit(vthis, cb) {
    this.vthis = vthis;
    this.Ecc = Ecc;
    this.rpc = new JsonRpc('https://dfs.tinyhill.dev', { fetch });
    console.log('init')
    cb()
  }
  loginOut(cb) {
    this.Ecc = null;
    this.eos_client = null;
    this.rpc = null;
    this.signatureProvider = null;
    this.public_key = null;
    location.reload()
    cb()
  }
  login(cb) {
    // console.log('login')
    // cb ? cb() : ''
    this.loginByAcc({
      account: 'hellodfsdfs2',
      pwd: 'abcd1234',
    }, cb)
  }
  async loginByAcc(params, cb) {
    let eos_account = params.account;
    let login_password = params.pwd;

    // 获取公钥，签名字符串
    let prive_key = this.Ecc.seedPrivate(`${eos_account}-${login_password}`);
    this.public_key = this.Ecc.privateToPublic(prive_key);
    this.signatureProvider = new JsSignatureProvider([prive_key]);
    // 获取eos对象
    this.eos_client = new Api({
      rpc: this.rpc, 
      signatureProvider: this.signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });

    // 获取公钥对应账户是否与账户名一致
    try {
      const {status, result} = await get_account(eos_account)
      if (!status) {
        return cb('账户查询失败')
      }
      let hasPubKey = false
      let perm_name = ''
      const permissions = result.permissions;
      permissions.forEach(v => {
        if (hasPubKey) {
          return
        }
        const keys = v.required_auth.keys;
        keys.forEach(vv => {
          if (vv.key === this.public_key) {
            hasPubKey = true;
            perm_name = v.perm_name
          }
        })
      });
      if (!hasPubKey) {
        return cb('账户公钥不匹配')
      }
      const newAccount = {
        name: eos_account,
        permissions: perm_name,
        publicKey: this.public_key,
      }
      store.dispatch('setAccount', newAccount);
      cb(newAccount)
    } catch (error) {
      console.log(error)
      return cb('账户接口查询失败')
    }
  }
  // 注册
  async accReg(params, cb) {
    let eos_account = params.account;
    let login_password = params.pwd;

    // 获取公钥，签名字符串
    let prive_key = this.Ecc.seedPrivate(`${eos_account}-${login_password}`);
    let public_key = this.Ecc.privateToPublic(prive_key);

    const obj = {
      account: eos_account,
      publickey: public_key,
    };
    const { status, result } = await reg_newaccount(obj);
    if (!status) {
      return cb("fail");
    }
    if (result.code === 500) {
      cb(result.msg, null);
      return;
    }
    cb(null, result);
  }

  // 操作
  transact(params, cb) {
    (async () => {
      try {
        const result = await this.eos_client.transact(params, {
          blocksBehind: 3,
          expireSeconds: 120,
        })
        cb(null, result);
      } catch (error) {
        this.dealError(error, cb)
      }
    })()
  }
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
            memo: obj.memo || 'test'
          }
        }
      ]
    }
    this.toTransaction(params, callback)
  }

  // 免CPU操作 
  toTransaction(tx, cb) {
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
        const {status, result} = await pushFreeCpu(data)
        console.log(result, status)
        if (!status || !result) { // 请求失败 - 走正常流程操作
          this.transact(tx, cb)
          return
        }
        let pushTransactionArgs
        if (result.code === 200) {
          let serverTransactionPushArgs = result.data;
          const requiredKeys = await this.eos_client.signatureProvider.getAvailableKeys();
          const serializedTx = Buffer.from(
            serverTransactionPushArgs.serializedTransaction,
            "hex"
          );
          const signArgs = {
            chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
            requiredKeys,
            serializedTransaction: serializedTx,
            abis: [],
          };
          pushTransactionArgs = await this.eos_client.signatureProvider.sign(
            signArgs
          );
          // add server signature
          pushTransactionArgs.signatures.unshift(
            serverTransactionPushArgs.signatures[0]
          );
        } else {
          // no server response => sign original tx
          pushTransactionArgs = await this.eos_client.transact(tx, {
            ...txh,
            sign: true,
            broadcast: false,
          });
        }
        let push_result = await this.eos_client.pushSignedTransaction(
          pushTransactionArgs
        );
        console.log(push_result)
        cb(null, push_result)
      } catch (error) {  
        this.dealFreeCpuError(error, cb)
      }
    })()
  }

  dealFreeCpuError(error, cb) {
    console.log(error.toString())
    const err = error.toString()
    let back = {
      code: 999,
      message: "fails!",
    };
    if (err.indexOf('INSUFFICIENT_OUTPUT_AMOUNT') !== -1) {
      back = {
        code: 3050003,
        message: "滑点过高",
      };
    }
    cb(back, null);
  }

  // 错误信息
  dealError(e, callback) {
    console.log(e);
    //  catch 错误回调 ---- code: 3080004 - cpu不足 | 3080002 - net不足 | 3080001 - ram不足
    let back = {
      code: 999,
      message: "fails!",
    };
    try {
      if (typeof e === "object") {
        if (e.code === 402) {
          back = {
            code: "402",
            message: "User rejected the signature request",
          };
        }
      }
      if (typeof e === "string") {
        const err = JSON.parse(e);
        // CPU 不足
        if (err.error.code === 3080004) {
          back = {
            code: 3080004,
            message: "Insufficient CPU resources",
          };
        }
        // NET 不足
        if (err.error.code === 3080002) {
          back = {
            code: 3080002,
            message: "Insufficient Net resources",
          };
        }
        // RAM 不足
        if (err.error.code === 3080001) {
          back = {
            code: 3080001,
            message: "Insufficient RAM resources",
          };
        }
        if (err.error.code === 3050003 || err.error.code === 3010010) {
          // 滑点过高导致
          const detail = err.error.details;
          if (detail[0].message.indexOf("INSUFFICIENT_OUTPUT_AMOUNT") !== -1) {
            back = {
              code: 3050003,
              // message: this.vthis.$t('dex.heightSlip'),
              message: "滑点过高",
            };
          } else if (
            detail[0].message.indexOf("Invalid packed transaction") !== -1
          ) {
            // 用户取消操作
            back = {
              code: 402,
              // message: this.vthis.$t('error.cancel'),
              message: "用户取消",
            };
          } else {
            back = {
              code: err.error.code,
              message: detail[0].message,
            };
          }
        }
      }
      callback(back, null);
    } catch (error) {
      if (e === "操作已取消") {
        back = {
          code: 402,
          message: "Cancel",
        };
      }
      callback(back, null);
    }
  }
}

const wallet = new newWallet();
// wallet.init();
// wallet.loginByAcc({
//   account: 'hellodfsdfs2',
//   pwd: 'abcd1234',
// }, (data) => {
//   console.log(data)

//   wallet.pushFreeCpu({
//     actions: [
//       {
//         account: 'eosio.token',
//         name: 'transfer',
//         authorization: [{
//           actor: 'hellodfsdfs2', // 转账者
//           permission: 'active',
//         }],
//         data: {
//           from: 'hellodfsdfs2',
//           to: 'defisswapcnt',
//           quantity: '0.0001 EOS',
//           memo: 'swap:17:358:2'
//         }
//       }
//     ]
//   }, (err, res) => {
//     console.log(err)
//     console.log(res)
//   })
// })
export default wallet;