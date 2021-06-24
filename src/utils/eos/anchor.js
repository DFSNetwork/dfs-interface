// The required anchor-link includes
import AnchorLink from 'anchor-link'
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport'
import store from '@/store';

class AnchorClass {
  constructor() {
    this.transport = null
    this.link = null
    this.vthis = null
  }
  scatterInit(vthis, cb) {
    this.vthis = vthis;
    this.transport = new AnchorLinkBrowserTransport()
    this.link = new AnchorLink({transport: this.transport})
    cb()
  }
  loginOut(cb) {
    this.transport = null
    this.link = null
    this.vthis = null
    location.reload()
    cb()
  }
  async login(cb) {
    const identity = await this.link.login('apps.defis.network')
    // console.log(identity)
    const newId = {
      name: identity.account.account_name,
      permissions: identity.account.permissions[0].perm_name,
      publicKey: identity.account.publicKey,
    }
    store.dispatch('setAccount', newId);
    cb(newId)
  }
  transaction(params) {
    return new Promise((resolve, reject) => {
      this.link.transact(params).then((res) => {
        // console.log(`Transaction broadcast! Transaction id: ${ res.processed.id }`)
        resolve(res);
      }, err => {
        reject(err)
      })
    })
  }
  transfer(obj, callback) {
    const account = store.state.app.account;
    const formName = account.name;
    const permission = account.permissions;
    const quantity = obj.quantity;
    let params = {
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
            quantity,
            memo: obj.memo
          }
        }
      ]
    }
    this.transaction(params).then((res) => {
      callback(null, res)
    }).catch((e) => {
      this.errorCall(e, callback);
    });
  }
  // transaction 操作
  toTransaction(obj, callback) {
    const params = obj;
    const self = this;
    self.transaction(params, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then((res) => {
      callback(null, res);
    }).catch((e) => {
      self.errorCall(e, callback);
    });
  }
  errorCall(e, callback) {
    let back = {
      code: '0001',
      message: JSON.stringify(e),
    };
    try {
      if (typeof (e) === 'object') {
        if (e.code === 402) {
          back = {
            code: 402,
            message: this.vthis.$t('error.cancel'),
          }
        }
      }
      if (typeof (e) === 'string') {
        const err = JSON.parse(e);
        // console.log(err)
        // CPU 不足
        if (err.error.code === 3080004) {
          back = {
            code: 3080004,
            message: this.vthis.$t('error.insufficient', {res: 'CPU'}),
          }
        }
        // NET 不足
        if (err.error.code === 3080002) {
          back = {
            code: 3080002,
            message: this.vthis.$t('error.insufficient', {res: 'NET'}),
          }
        }
        // RAM 不足
        if (err.error.code === 3080001) {
          back = {
            code: 3080001,
            message: err.error.details[0].message,
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
              message: this.vthis.$t('dex.heightSlip'),
            }
          } else if (detail[0].message.indexOf('Invalid packed transaction') !== -1) { // 用户取消操作
            back = {
              code: 402,
              message: this.vthis.$t('error.cancel'),
            }
          } else {
            back = {
              code: err.error.code,
              message: detail[0].message,
            }
          }
        }
      }
      callback(back);
    } catch (error) {
      // console.log(error)
      if (e === '操作已取消') {
        back = {
          code: 402,
          message: this.vthis.$t('error.cancel'),
        }
      }
      callback(back);
    }
  }
}

export const Anchor = new AnchorClass();

// Anchor.login()
