
// 获取DFS挖矿池子余额
import { get_currency_balance } from '@/api/list';

let allBal = {}, swapBal = {};

async function handleGetBal(type = "dfs") {
  const params = {
    code: 'minedfstoken',
    symbol: 'DFS',
    decimal: 4,
    account: 'defisswapcnt'
  }
  if (type === 'eos') {
    params.code = 'eosio.token'
    params.symbol = 'EOS'
  } else if (type === 'usdt') {
    params.code = 'tethertether'
    params.symbol = 'USDT'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  if (type === 'dfs') {
    swapBal.dfsSwapBal = parseFloat(bal) + ''
  } else if (type === 'eos') {
    swapBal.eosSwapBal = parseFloat(bal) + ''
  } else if (type === 'usdt') {
    swapBal.usdtSwapBal = parseFloat(bal) + ''
  }
}
async function handleGetBalPools(type = "dfs") {
  const params = {
    code: 'minedfstoken',
    symbol: 'DFS',
    decimal: 4,
    account: 'dfsavingpool'
  }
  if (type === 'dfs') {
    params.account = 'dfspool11111'
  } else if (type === 'eos') {
    params.account = 'dfspool22222'
  } else if (type === 'usdt') {
    params.account = 'dfspool33333'
  }
  const {status, result} = await get_currency_balance(params);
  if (!status) {
    return
  }
  const bal = result;
  if (type === 'dfs') {
    allBal.dfsPoolsBal = parseFloat(bal) + ''
  } else if (type === 'eos') {
    allBal.eosPoolsBal = parseFloat(bal) + ''
  } else if (type === 'usdt') {
    allBal.usdtPoolsBal = parseFloat(bal) + ''
  } else if (type === 'dss') {
    allBal.dssPoolsBal = parseFloat(bal) + ''
  }
}
function handleGetBals() {
  handleGetBal('dfs')
  handleGetBal('eos')
  handleGetBal('usdt')

  handleGetBalPools('dfs')
  handleGetBalPools('eos')
  handleGetBalPools('usdt')
}
setTimeout(() => {
  handleGetBals()
}, 1000);
setInterval(() => {
  handleGetBals()
}, 10 * 1000)

export function getBals() {
  return {
    allBal,
    swapBal,
  }
}