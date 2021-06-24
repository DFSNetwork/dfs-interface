import {scatterClass} from './scatter';
import newWallet from '@/utils/wallet/newWallet';
import {Anchor} from '@/utils/eos/anchor';

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
  login(cb) {
    console.log(cb)
    this.obj.login(cb)
  }
  loginOut(cb) {
    this.obj.loginOut(cb)
  }
  transfer(obj, callback) {
    this.obj.transfer(obj, callback)
  }
  toTransaction(obj, callback) {
    this.obj.toTransaction(obj, callback)
  }
}

export const DApp = new DAppModel();