
import store from '@/store';
import { accMul } from '@/utils/public';
const baseCoin = [{
  symbol: 'EOS',
  contract: 'eosio.token'
}, {
  symbol: 'USDT',
  contract: 'tethertether'
}, {
  symbol: 'DFS',
  contract: 'minedfstoken'
}, {
  symbol: 'USDC',
  contract: 'usdxusdxusdx'
}, {
  symbol: 'TAG',
  contract: 'tagtokenmain'
}, {
  symbol: 'DFG',
  contract: 'dfxtokenmain'
}]
// 获取基础交易对列表
export function getBaseMarkets(swapCoin = []) {
  const baseMks = [];
  const tBase = baseCoin;
  swapCoin.forEach(v => {
    const has = tBase.find(vv => vv.contract === v.contract && vv.symbol === v.symbol);
    if (has) {
      return
    }
    tBase.push(v)
  })
  baseCoin.forEach((v, i) => {
    const arr = baseCoin.slice(i + 1, baseCoin.length)
    const cArr = concatArr(v, arr)
    baseMks.push(...cArr)
  })
  return filterMks(baseMks)
}
// 币种连接成交易对
function concatArr(base, arr = []) {
  let tArr = [];
  arr.forEach(v => {
    const mk = {
      contract0: v.contract,
      symbol0: v.symbol,
      contract1: base.contract,
      symbol1: base.symbol,
    }
    tArr.push(mk)
  });
  return tArr;
}
// 过滤不存在的交易对
function filterMks(baseMks) {
  const markets = store.state.sys.marketLists;
  let mksArr = [];
  baseMks.forEach(v => {
    const has = markets.find(vv => {
      const reg0 = (v.contract0 === vv.contract0 && v.symbol0 === vv.symbol0)
                && (v.contract1 === vv.contract1 && v.symbol1 === vv.symbol1)
      const reg1 = (v.contract0 === vv.contract1 && v.symbol0 === vv.symbol1)
                && (v.contract1 === vv.contract0 && v.symbol1 === vv.symbol0)
      return (reg0 || reg1)
    })
    if (!has) {
      return
    }
    mksArr.push(has)
  })
  return mksArr;
}

// 获取输出数量
/**
 * 
 * @param {*} SwapRouter 
 * @param {
 *  pay: '',
 *  get: '',
 *  type: 'pay' | 'get',
 *  tokenA: {},
 *  tokenB: {},
 *  rSwitch: true | false, // 是否多路径兑换
 * } inData 
 */
export function getAmtOut(SwapRouter, inData) {
  // console.log('inData', inData)
  if (!Number(inData.pay || 0) && !Number(inData.get || 0)) {
    const outData = {
      type: inData.type,
    }
    return outData
  }
  const tokenAstr = `${inData.tokenA.contract}:${inData.tokenA.symbol}`;
  const tokenBstr = `${inData.tokenB.contract}:${inData.tokenB.symbol}`;
  let path = SwapRouter.get_paths(tokenAstr, tokenBstr, inData.type)
  // console.log('path', path)
  if (!inData.rSwitch) {
    const fPathArr = path[0].split('-');
    if (fPathArr.length === 1) {
      path = [path[0]]
    }
  }
  const params = [
    path,
    inData.type === 'pay' ? tokenAstr : tokenBstr,
  ]
  if (inData.type === 'pay') {
    params.push(accMul(inData.pay, 10 ** inData.tokenA.decimal))
  } else {
    params.push(accMul(inData.get, 10 ** inData.tokenB.decimal))
    params.push(inData.type)
  }
  const res = SwapRouter.get_amounts_out(...params)
  // console.log(res)
  return res
}