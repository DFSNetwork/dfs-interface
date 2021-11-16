import {scatterClass} from './scatter';
import newWallet from '@/utils/wallet/newWallet';
import {Anchor} from '@/utils/eos/anchor';
import store from '@/store';
class DAppModel {
  constructor() {
    this.wallet = '';
    this.obj = null;
  }
  
  scatterInit(vthis, callback) {
    this.wallet = (localStorage.getItem('WALLET') || 'scatter').toLowerCase();
    if (this.wallet === 'anchor') {
      this.obj = Anchor;
    } else if (this.wallet === 'scatter2') {
      this.obj = scatterClass;
    } else if (this.wallet === 'newwallet') {
      this.obj = newWallet;
    } else {
      this.obj = scatterClass;
    }
    this.obj.scatterInit(vthis, callback)
  }
  accReg(obj, cb) {
    this.obj.accReg(obj, cb)
  }
  login(cb) {
    this.obj.login(cb)
  }
  loginByAcc(obj, cb) {
    this.obj.loginByAcc(obj, cb)
  }
  loginOut(cb) {
    store.dispatch('setAccount', {})
    this.obj.loginOut(cb)
  }
  transfer(obj, cb) {
    this.obj.transfer(obj, cb)
  }
  toTransaction(obj, cb) {
    this.obj.toTransaction(obj, cb)
  }
  // newwallet 钱包
  exportPrivateKey() {
    return this.obj.exportPrivateKey()
  }
  transferSure(obj, cb) { // 转账确认
    this.obj.transfer(obj, cb)
  }
  toTransactionSure(obj, cb) { // 操作确认
    this.obj.toTransactionSure(obj, cb)
  }
  regPwd(pwd, cb) { // 密码验证
    this.obj.regPwd(pwd, cb)
  }
  randomKey(cb) {
    this.obj.randomKey(cb)
  }
}

export const DApp = new DAppModel();