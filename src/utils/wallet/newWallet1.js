import Ecc from "eosjs-ecc";
import Eos from "eosjs-without-sort"; // 代签不排序

import { reg_newaccount, pushFreeCpu } from "@/api/list";
import store from "@/store";

class newWallet {
  constructor() {
    this.node = null;
    this.Ecc = null;
    this.Eos = null;
    this.public_key = null;
  }
  async init() {
    this.node = store.state.sys.baseConfig.node;
    this.Ecc = Ecc;
    this.Eos = Eos({
      chainId: this.node.chainId,
      httpEndpoint: this.node.url,
      keyProvider: "",
    });
    console.log(this.node, this.Eos);
  }
  loginOut() {
    this.node = null;
    this.Ecc = null;
    this.Eos = null;
    this.public_key = null;
    location.reload();
  }
  login() {}
  async loginByAcc(params, cb) {
    let eos_account = params.account;
    let login_password = params.pwd;

    // 获取公钥，签名字符串
    let prive_key = this.Ecc.seedPrivate(`${eos_account}-${login_password}`);
    this.public_key = this.Ecc.privateToPublic(prive_key);
    // 获取eos对象
    this.Eos = Eos({
      chainId: this.node.chainId,
      httpEndpoint: this.node.url,
      keyProvider: prive_key,
    });
    // // 获取公钥对应账户是否与账户名一致
    try {
      const result = await this.Eos.getKeyAccounts(this.public_key);
      let index = result.account_names.findIndex((v) => v === eos_account);
      if (index === -1) {
        return cb("账号不存在");
      }
      let per = result.permissions[index][0];
      const newAccount = {
        name: eos_account,
        permissions: per,
        publicKey: this.public_key,
      };
      cb(newAccount);
    } catch (error) {
      console.log(error);
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
    console.log(obj);
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
        console.log(params);
        let actor = "11111cpufree";
        params.actions.forEach((v) => {
          v.authorization.unshift({ actor, permission: "active" });
        });
        console.log(this.Eos)
        const result = await this.Eos.transaction(params, {
          blocksBehind: 3,
          expireSeconds: 30,
          broadcast: false,
          sign: true,
        });
        console.log("result", result);

        if (result.processed || result.transaction_id) {
          const p = result;
          const l = p.transaction.transaction;
          l.signatures = p.transaction.signatures;
          l.context_free_data = [];
          l.tttttt = "1234";
          const signed = l;
          this.pushFreeCpuWallet(signed, (error, resFree) => {
            if (resFree) {
              cb(null, resFree);
              return;
            }
            this.dealError(error, cb);
          });
        }
      } catch (error) {
        console.error(error);
        cb(error, null);
      }
    })();
  }

  // 免CPU操作
  async pushFreeCpuWallet(signedTx, cb) {
    console.log(signedTx);
    const { status, result } = await pushFreeCpu(signedTx);
    if (!status) {
      console.log("fail - 123");
      return;
    }
    console.log(result);
    cb(result);
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
wallet.init();
wallet.loginByAcc(
  {
    account: "hellodfsdfs2",
    pwd: "abcd1234",
  },
  (data) => {
    console.log("acc info", data);

    // wallet.accReg({
    //   account: 'hellodfsdfs3',
    //   pwd: 'abcd1234'
    // }, (err, res) => {
    //   console.log(err, res)
    // })

    wallet.transact(
      {
        actions: [
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [
              {
                actor: "hellodfsdfs2", // 转账者
                permission: "active",
              },
            ],
            data: {
              from: "hellodfsdfs2",
              to: "defisswapcnt",
              quantity: "0.0100 EOS",
              memo: "swap:17:358:2",
            },
          },
        ],
      },
      () => {}
    );
  }
);
