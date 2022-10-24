import store from '@/store'
import { get_currency_balance } from '@/api/list'

let swapTagBal = 0,
    swapEosBal = 0,
    swapDfsBal = 0;
let poolTag = 0,
    poolEos = 0,
    poolDfs = 0;

export function getApyInfoByMid(mid) {
  const marketLists = store.state.config.marketLists || [];
  const info = marketLists.find(v => v.mid == mid) || {}
  if (!info.mid) {
    return {
      count: 0,
      feesApy: 0,
      eosApy: 0,
      tagLpApy: 0,
      dfsApy: 0
    }
  }
  const feesApy = calcFeesApy(info)
  const eosApy = calcEos2UsdtApy(info)
  const tagApy = calcTagPoolApy(info)
  const dfsApy = calcDfsPoolApy(info)

  const count = Number(feesApy) + Number(eosApy) + Number(tagApy) + Number(dfsApy)
  return {
    count,
    feesApy,
    eosApy,
    tagLpApy: tagApy,
    dfsApy
  }
}
// 获取info的liq
function getInfoLiq(info) {
  const volArr = info.volume24H.split(' ');
  const sym0Arr = info.sym0.split(',');
  if (volArr[1] === sym0Arr[1]) {
      return parseFloat(info.reserve0 || 0) * 2;
  }
  return parseFloat(info.reserve1 || 0) * 2;
}
// 计算手续费年化
function calcFeesApy(info) {
  const fees = parseFloat(info.volume24H || 0) * 0.002;
  const sym0Liq = getInfoLiq(info);
  const feesApy = fees / (sym0Liq - fees) * 365 * 100;
  return feesApy
}
// 计算EOS/USDT年化
function calcEos2UsdtApy(info) {
  if (info.mid != 17 || !Number(poolEos) || !Number(swapEosBal)) {
    return 0
  }
  const num = 1;
  const rate = num / swapEosBal;
  const lpBal = poolEos;
  const t = 86400 * 365;
  const weight = 1
  const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
  const apy = reward / num * 100
  return parseFloat(apy || 0).toFixed(2)
}
// 计算TAG池子年化
function calcTagPoolApy(info) {
  const ableMids = [602, 665];
  const lpLists = ableMids.find(vv => vv == info.mid)
  if (!lpLists || !parseFloat(poolTag) || !parseFloat(swapTagBal)) {
    return 0
  }
  const num = 0.1;
  const rate = num / swapTagBal;
  const lpBal = poolTag;
  const t = 86400 * 365;
  const weight = 1
  const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
  const apy = reward / num * 100
  return parseFloat(apy || 0).toFixed(2)
}
// 计算DFS池子余额
function calcDfsPoolApy(info) {
  const ableMids = [39, 451, 382, 726, 727];
  const lpLists = ableMids.find(vv => vv == info.mid)
  if (!lpLists || !parseFloat(poolDfs) || !parseFloat(swapDfsBal)) {
    return 0
  }
  const num = 10;
  const rate = num / swapDfsBal;
  const lpBal = poolDfs;
  const t = 86400 * 365;
  const weight = 1
  const reward = lpBal - lpBal * Math.pow(0.9999, t * rate * weight);
  const apy = reward / num * 100
  return parseFloat(apy || 0).toFixed(2)
}

// 获取EOS/USDT矿池中EOS余额
async function getEosPoolBal() {
  const params = {
    code: 'eosio.token',
    symbol: 'EOS',
    decimal: 4,
    account: 'dfspool11111'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  poolEos = parseFloat(bal) + ''
}
async function getDfsPoolBal() {
  const params = {
    code: 'minedfstoken',
    symbol: 'DFS',
    decimal: 4,
    account: 'dfspool11111'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  poolDfs = parseFloat(bal) + ''
}
async function getTagPoolBal() {
  const params = {
    code: 'tagtokenmain',
    symbol: 'TAG',
    decimal: 8,
    account: 'tageosmining'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  poolTag = parseFloat(bal) + ''
}

// 获取Swap池子EOS余额
async function getSwapEosBal() {
  const params = {
    code: 'eosio.token',
    symbol: 'EOS',
    decimal: 4,
    account: 'defisswapcnt'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  swapEosBal = parseFloat(bal) + '';
}
// 获取Swap池子EOS余额
async function getSwapDfsBal() {
  const params = {
    code: 'minedfstoken',
    symbol: 'DFS',
    decimal: 4,
    account: 'defisswapcnt'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  swapDfsBal = parseFloat(bal) + '';
}
// 获取Swap池子TAG余额
async function getSwapTagBal() {
  const params = {
    code: 'tagtokenmain',
    symbol: 'TAG',
    decimal: 8,
    account: 'defisswapcnt'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  swapTagBal = parseFloat(bal) + '';
}

function init() {
  getSwapEosBal()
  getSwapDfsBal()
  getSwapTagBal()
  getEosPoolBal()
  getDfsPoolBal()
  getTagPoolBal()
  setTimeout(() => {
    init()
  }, 5000);
}
init()
