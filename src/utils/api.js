import store from '@/store';
import { getV3Apr } from '@/utils/logic';
import axios from 'axios';
import moment from 'moment';
import { get_table_rows } from '@/api/list'

function getHost() {
  const baseConfig = store.state.sys.baseConfig;
  return baseConfig.node.url;
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

// 获取投票矿池排名
export async function getVotePools() {
  const params = {
    "code":"dfspoolsvote",
    "scope":"dfspoolsvote",
    "table":"pools",
    "json":true,
    "index_position": 2,
    "key_type": "float64",
    "limit": 100
  }
  const {status, result} = await get_table_rows(params)
  if (!status || !result.rows.length) {
    return
  }
  const rows = result.rows || [];
  store.dispatch('setRankTrade', rows)
  const lists = rows.slice(0, 30);
  getVoteRankConfV3(lists);
}

// 获取矿池排名配置
export async function getVoteRankConfV3(lists) {
  const params = {
    "code": "miningpool11",
    "scope": "miningpool11",
    "json": true,
    "table": "poolslots2",
    limit: 30,
  }
  const {status, result} = await get_table_rows(params)
  if (!status || !result.rows.length) {
    return
  }
  const rows = result.rows || [];
  const rankInfoV3 = [];
  lists.forEach((v, index) => {
    const deal = getV3Apr(v.mid, rows[index])
    const t = Object.assign({}, v, rows[index], deal)
    rankInfoV3.push(t)
  })
  store.dispatch('setRankInfoV3', rankInfoV3)
}

// 链上查表
export function get_balance(params) {
  return new Promise((resolve, reject) => {
    const host = getHost()
    axios.post(`${host}/v1/chain/get_currency_balance`, JSON.stringify(params)).then((res) => {
      // let result = Object.assign(res.data, {});
      let result = res.data;
      if (!result.length) {
        result = [`${Number(0).toFixed(params.decimal || 4)} ${params.symbol}`]
      }
      resolve({ status: res.status === 200, result: result[0] });
    }, err => {
      reject(err)
    })
  })
}

// 获取代理
export function get_producers() {
  return new Promise((resolve, reject) => {
    axios.get('https://www.api.bloks.io/producers?pageNum=1&perPage=500').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取乐捐数据
export function get_fundation(params) {
  // https://api.yfc.one/history/fundation?page=1&limit=15
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/history/fundation', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取乐捐总价值
export function get_summary() {
  // https://api.yfc.one/history/fundation?page=1&limit=15
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/summary').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取最新 ｜ 最贵 ｜ 最热 留言数据
export function get_new_fundation(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/new', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
export function get_mvd_fundation(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/mvd', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
export function get_hot_fundation(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/hot', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

export function get_reply_fundation(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/reply', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取乐捐记录
export async function get_acc_fund_lists(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/i', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      // console.log(result)
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取rex挖矿列表
export async function get_farmers_lists() {
  return new Promise((resolve, reject) => {
    // const params = {};
    axios.get('https://api.yfc.one/dfs/tag/farmers').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取账户信息
export function get_acc_info(user) {
  return new Promise((resolve, reject) => {
    const account = store.state.app.account;
    const params = {
      "code":"dfscommunity",
      "scope":"dfscommunity",
      "table":"profiles",
      "json":true,
      "lower_bound": ` ${user}`,
      "upper_bound": ` ${user}`,
    }
    const host = getHost()
    axios.post(`${host}/v1/chain/get_table_rows`, JSON.stringify(params)).then((res) => {
      let result = {};
      if (!res.data.rows.length) {
        result = {
          avatar: "https://cdn.jsdelivr.net/gh/defis-net/material2/coin/tagtokenmain-tag.png",
          cover: "https://cdn.jsdelivr.net/gh/defis-net/material/accBanner/banner1.png",
          desc: "",
          nick: "",
          sex: 2,
        }
      } else {
        result = Object.assign(res.data.rows[0], {});
      }
      if (account && account.name && account.name === user) {
        store.dispatch('setAccInfo', result);
      }
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取账户访客
// 获取账户关注列表
// ## 关注列表
// cleos -u https://eos.blockeden.cn get table 
// dfscommunity dfsdeveloper followers
export function get_acc_lists(user, type, nextKey) {
  return new Promise((resolve, reject) => {
    const params = {
      "code": "dfscommunity",
      "scope": ` ${user}`,
      "table": type,
      "json": true,
      "limit": 100,
    }
    if (nextKey) {
      params.lower_bound = nextKey;
    }
    const host = getHost()
    axios.post(`${host}/v1/chain/get_table_rows`, JSON.stringify(params)).then((res) => {
      let result = Object.assign(res.data, {});
      // console.log(result)
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取用户关注数量
export function get_acc_flow_info(user) {
  return new Promise((resolve, reject) => {
    const params = {
      "code": "dfscommunity",
      "scope": "dfscommunity",
      "table": "relations",
      "json": true,
      "lower_bound": ` ${user}`,
      "upper_bound": ` ${user}`
    }
    const host = getHost()
    axios.post(`${host}/v1/chain/get_table_rows`, JSON.stringify(params)).then((res) => {
      let result = {};
      if (!res.data.rows.length) {
        result = {}
      } else {
        result = Object.assign(res.data.rows[0], {});
      }
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取访客记录
export function get_acc_visit(user) {
  return new Promise((resolve, reject) => {
    const params = {
      user,
    }
    axios.get('https://api.yfc.one/dfs/social/summary', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 用户访问他人主页
export function acc_visit_other(visitor, user) {
  return new Promise((resolve, reject) => {
    const params = {
      user,
      visitor,
    }
    axios.get('https://api.yfc.one/dfs/social/visit', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取K线数据
export function get_kline_data(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/kline/data', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}
// 获取K线数据
export function get_kline_data2(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dex/swap/kline', {params}).then((res) => {
    // axios.get('https://dfs.defiview.io/api/getBars', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取今日最新最热最贵3条置顶数据
export function get_top3_fundation(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/top3', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取公告
export function get_voices() {
  return new Promise((resolve, reject) => {
    // https://api.yfc.one/static/swap/voices
    axios.get('https://api.yfc.one/dfs/swap/voices').then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取bp评价列表
export function get_bp_scores(params) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.yfc.one/dfs/fundation/bp', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// 获取节点信息
export function get_bp_info(params) {
  return new Promise((resolve, reject) => {
    const nT = moment().valueOf()
    if (!params && store.state.sys.nodeLists && nT - store.state.sys.nodeListsTamp < 600000) {
      const result = {
        voters: store.state.sys.nodeLists
      };
      resolve({ 
        status: true,
        result
      });
      return
    }
    axios.get('https://api.yfc.one/dfs/bp/bps', {params}).then((res) => {
      let result = Object.assign(res.data, {});
      store.dispatch('setNodeListsTamp', moment().valueOf())
      resolve({ status: res.status === 200, result });
    }, err => {
      reject(err)
    })
  })
}

// setTimeout(() => {
//   // get_acc_lists('dfsdeveloper', 'followers')
//   // get_acc_lists('djsja24djdjs', 'fans')
//   // get_acc_flow_info('djsja24djdjs')
//   acc_visit_other('iq3rwbsfcqlv', 'djsja24djdjs')
//   get_acc_visit('iq3rwbsfcqlv')
// }, 2000);