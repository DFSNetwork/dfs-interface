import { get_table_rows } from '@/api/list';
import { toLocalTime, getMarketTimeLp } from '@/utils/public';
import store from '@/store';

export async function getAllInvest(cb) {
  let more = true;
  let next = '';
  let arr = [];
  while (more) {
    const params = {
      "code": "dfsdtservice",
      "scope": "dfsdtservice",
      "table": "plans",
      "json": true,
      lower_bound: next,
      limit: 100
    }
    const {status, result} = await get_table_rows(params);
    if (!status) {
      return
    }
    more = result.more;
    next = result.next_key;
    arr.push(...result.rows)
  }
  const nArr = dealInArr(arr)
  cb(nArr)
}
export function dealInArr(arr = []) {
  const coins = store.state.invest.coins;
  const markets = store.state.config.marketLists;
  arr.forEach(v => {
    const createTime = toLocalTime(`${v.create_time}.000+0000`)
    const nextTime = toLocalTime(`${v.next_time}.000+0000`)
    v.createTime = createTime;
    v.nextTime = nextTime;
    const total = getMarketTimeLp(createTime)
    v.holdTime = total.days;
    // 计算时间间隔
    const days = parseInt(v.gap / 86400);
    v.days = days;
    // 计算收益率
    const coin = coins.find(vv => vv.symbol === v.sym);
    const mk = markets.find(vv => vv.mid === coin.mid) || {};
    const mkPrice = mk.price || 0;
    const buyNum = parseFloat(v.total_buy_quantity || 0);
    const buyAssets = buyNum * mkPrice;
    const pay = parseFloat(v.total_pay_quantity || 0);
    const reward = buyAssets - pay;
    let rate = reward / pay * 100;
    rate = parseFloat(rate || 0).toFixed(2);
    if (parseFloat(rate || 0) >= 0) {
      rate = `+${rate}`
    }
    v.rate = rate;
    v.logo = coin.logo;
  })
  return arr;
}
export function dealInvestArr(lists = []) {
  const resArr = lists;
  // 删除重复项
  const uniques = [];
  const stringify = {};
  resArr.forEach(v => {
    const str = `${v.owner}`;
    if (!stringify[str]) {
      uniques.push(v);
      stringify[str] = true;
    }
  })
  return uniques;
}

export function getMyInvest(inName) {
  const name = inName || 'dfsdeveloper';
  const allInvests = store.state.invest.allInvests;
  const coins = store.state.invest.coins;
  const myInvests = allInvests.filter(v => v.owner === name)
  const markets = store.state.config.marketLists;
  // console.log(myInvests)
  let totalU = 0; // 累计定投总资金
  let totalPay = 0; // 累计已支付资金
  let totalAssets = 0; // 累计总资产
  let totalReward = 0; // 累计总收益
  let totalRate = 0; // 累计总收益率
  let maxLeng = 0; // 最长定投时间
  myInvests.forEach(v => {
    const coin = coins.find(vv => vv.symbol === v.sym);
    const mk = markets.find(vv => vv.mid === coin.mid) || {};
    const mkPrice = mk.price || 0;
    const buyNum = parseFloat(v.total_buy_quantity || 0);
    const buyAssets = buyNum * mkPrice;
    const pay = parseFloat(v.total_pay_quantity || 0);
    const reward = buyAssets - pay;
    if (maxLeng < v.holdTime) {
      maxLeng = v.holdTime;
    }
    totalAssets = parseFloat(totalAssets || 0) + parseFloat(buyAssets || 0);
    totalReward = parseFloat(totalReward || 0) + parseFloat(reward || 0);
    totalPay = parseFloat(totalPay || 0) + parseFloat(pay || 0);
    totalU = parseFloat(totalU || 0) + parseFloat(v.buy_fund_sum || 0);
  })
  totalRate = totalReward / totalPay * 100;
  totalRate = parseFloat(totalRate || 0).toFixed(2)
  totalReward = parseFloat(totalReward || 0).toFixed(4)
  totalAssets = parseFloat(totalAssets || 0).toFixed(4)
  return {
    totalU, totalPay, totalReward, totalRate, maxLeng, totalAssets
  }
}