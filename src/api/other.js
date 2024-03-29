
import axios from 'axios';
import store from '@/store';
const zlib = require('zlib');
function unZip(deflated) {
  const inflated = zlib.inflateSync(new Buffer(deflated, 'base64')).toString();
  return inflated
}

export function getJson() {
  return new Promise((resolve, reject) => {
    axios.get('https://www.defis.network/coin/coinJson.json').then((res) => {
      // let result = Object.assign(res.data, {});
      let result = res.data;
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
export function getJsonByToken() {
  return new Promise((resolve, reject) => {
    // axios.get(`/static/test/tokenInfo.json`).then((res) => {
    axios.get(`https://www.defis.network/coin/tokenInfo.json`).then((res) => {
      let result = res.data;
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

export function dfsdata() {
  return new Promise((resolve, reject) => {
    axios.post('https://dfsinfoapi.sgxiang.com/dapi/dfsdata').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

export function orderLists(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/pddex/tradelog', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

export function transferLog(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/history/transfer', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 用户交易对交易记录
export function tradelog(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/swap/tradelog', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 用户做市记录
export function depositlog(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/swap/depositlog', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取支持Box的交易对 & 当前委托数据
export function boxMidsAndOrder() {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/pddex/info').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取节点tag标签
export function getBpTags() {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/bp/recommends').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取PDDEX行情列表
export function getPddexMarkets() {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/apy/tops2').then((res) => {
    // axios.get('http://localhost:8101/apy/tops2').then((res) => {
      let result = unZip(res.data)
      result = Object.assign(JSON.parse(result), {});
      // console.log(result)
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取USDT价格 https://api.yfc.one/static/market/usdtprice
export function getUsdtPrice() {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/market/usdtprice').then((res) => {
      let result = Object.assign(res.data, {});
      console.log(result)
      const price = result.usdtprice || 6.5;
      store.dispatch('setUsdtPrice', price);
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

export function debugApi(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/common/set_bug', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取所有币种余额
// https://api.light.xeos.me/api/balances/eos/dfsdeveloper
export function get_acc_bals(acc) {
  return new Promise((resolve, reject) => {
    axios.get(`https://api.light.xeos.me/api/balances/eos/${acc}`).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}