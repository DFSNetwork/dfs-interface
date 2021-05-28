import { toFixed, accDiv } from '@/utils/public';
class swapRouter {
  constructor() {
    this.markets = [];
    this.pair_market_map = {};
    this.mid_market_map = {};
    this.tokens = [];
    this.paths = [];
    this.isInit = false;
    this._pathsArr = [];
    this.bestPath = '';
    this.doing = false; // 正在初始化中

    // 保存上一次生成路径的两个币种信息
    this.token0 = '';
    this.token1 = '';
  }
  init(data, vThis, market0, market1, cb) {
    this.markets = data || [];
    this._pathsArr = [];
    this.bestPath = '';
    const token0 = `${market0.contract}:${market0.symbol}`;
    const token1 = `${market1.contract}:${market1.symbol}`;
    if ((this.token0 === token0 && this.token1 === token1)) {
      return
    }
    this.token0 = token0;
    this.token1 = token1;
    if (window.Worker) {
      this.workerToInitPath(vThis, token0, token1, cb)
    } else {
      this.initPath()
    }
  }

  workerToInitPath(vThis, token0, token1, cb) {
    const dealPath = (markets) => {
      let paths = [];
      let pair_market_map = {};
      let mid_market_map = {};
      let tokens = [];
      markets.map(x => {
        let tokenA = x.contract0 + ":" + x.sym0.split(",")[1];
        let tokenB = x.contract1 + ":" + x.sym1.split(",")[1];
        let pair_a = tokenA + "-" + tokenB;
        let pair_b = tokenB + "-" + tokenA;
  
        pair_market_map[pair_a] = x;
        pair_market_map[pair_b] = x;
  
        mid_market_map[x.mid] = x;
  
        paths.push(pair_a);
        paths.push(pair_b);
  
        let new_paths = []
  
        for (let i = 0; i < paths.length; i++) {
          let path = paths[i];
          let tks = path.split("-");
          if (tks.length >= 5) {
            continue
          }
          if (tks[0] === tokenA && tks[tks.length - 1] !== tokenB) {
            new_paths.push(tokenB + "-" + path)
          }
          if (tks[tks.length - 1] === tokenA && tks[0] !== tokenB) {
            new_paths.push(path + "-" + tokenB);
          }
  
          if (tks[0] === tokenB && tks[tks.length - 1] !== tokenA) {
            new_paths.push(tokenA + "-" + path)
          }
  
          if (tks[tks.length - 1] === tokenB && tks[0] !== tokenA) {
            new_paths.push(path + "-" + tokenA);
          }
        }
  
        paths = paths.concat(new_paths);
  
        if (tokens.indexOf(tokenA) === -1) {
          tokens.push(tokenA)
        }
        if (tokens.indexOf(tokenB) === -1) {
          tokens.push(tokenB)
        }
      })
      paths = paths.sort((a, b) => {
        return a.length - b.length;
      })
      return {
        paths, pair_market_map, mid_market_map, tokens
      }
    }
    // console.log('开始执行循环 - ', Date.parse(new Date()))
    vThis.$worker.run(dealPath, [this.markets]).then(res => {
      if (token0 !== this.token0 || token1 !== this.token1) {
        cb()
        return
      }
      this.paths = res.paths;
      this.pair_market_map = res.pair_market_map;
      this.mid_market_map = res.mid_market_map;
      this.tokens = res.tokens;
      this.isInit = true;
      cb()
      // console.log('生成路径长度 - ', this.paths)
      // console.log('生成路径长度 - ', this.paths.length)
      // console.log('循环执行结束 - ', Date.parse(new Date()))
    }).catch(e => console.log(e))
  }

  initPath() {
    this.paths = [];
    this.pair_market_map = {};
    this.mid_market_map = {};
    this.tokens = [];
    this.markets.map(x => {
      let tokenA = x.contract0 + ":" + x.sym0.split(",")[1];
      let tokenB = x.contract1 + ":" + x.sym1.split(",")[1];
      let pair_a = tokenA + "-" + tokenB;
      let pair_b = tokenB + "-" + tokenA;

      this.pair_market_map[pair_a] = x;
      this.pair_market_map[pair_b] = x;

      this.mid_market_map[x.mid] = x;

      this.paths.push(pair_a);
      this.paths.push(pair_b);

      let new_paths = []

      for (let i = 0; i < this.paths.length; i++) {
        let path = this.paths[i];
        let tks = path.split("-");
        if (tks.length >= 3) {
          continue
        }
        if (tks[0] === tokenA && tks[tks.length - 1] !== tokenB) {
          new_paths.push(tokenB + "-" + path)
        }

        if (tks[tks.length - 1] === tokenA && tks[0] !== tokenB) {
          new_paths.push(path + "-" + tokenB);
        }

        if (tks[0] === tokenB && tks[tks.length - 1] !== tokenA) {
          new_paths.push(tokenA + "-" + path)
        }

        if (tks[tks.length - 1] === tokenB && tks[0] !== tokenA) {
          new_paths.push(path + "-" + tokenA);
        }
      }

      this.paths = this.paths.concat(new_paths);

      if (this.tokens.indexOf(tokenA) === -1) {
        this.tokens.push(tokenA)
      }
      if (this.tokens.indexOf(tokenB) === -1) {
        this.tokens.push(tokenB)
      }
    })
    // console.log("tokens", this.tokens);
    this.paths = this.paths.sort((a, b) => {
      return a.length - b.length;
    })
    // console.log("paths", this.paths);
    this.isInit = true;
  }

  get_paths(tokenA, tokenB, type) {
    const newTokenA = type === 'pay' ? tokenA : tokenB
    const newTokenB = type === 'pay' ? tokenB : tokenA
    if (!this.isInit) return;
    let _paths;
    const _pathsArr = [];

    for (let i = 0; i < this.paths.length; i++) {
      // if (_pathsArr.length === 10) {
      //   break
      // }
      let path = this.paths[i];
      let tks = path.split("-");
      if ((tks[0] === newTokenA && tks[tks.length - 1] === newTokenB)) {
        _paths = path;
        _pathsArr.push(_paths)
      }
    }
    // 根据兑换路径, 找出对应的mid路径
    this._pathsArr = _pathsArr; // 查到所有路径 - 合约路径
    const _pathsMids = [];
    _pathsArr.forEach((v) => {
      let mids;
      let tks = v.split("-");

      for (let i = 0; i < tks.length - 1; i++) {
        let pair = tks[i] + "-" + tks[i + 1]
        if (!mids) {
          mids = this.pair_market_map[pair].mid;
        } else {
          mids = mids + "-" + this.pair_market_map[pair].mid;
        }
      }
      _pathsMids.push(mids + '') // 返回所有Mid路径
    })
    // console.log(_pathsMids)
    // return [_pathsMids[0]];
    return _pathsMids;
  }

  //  mids = [], token_in = eosio.token:EOS, amount_in = 10000, type = 'pay' | 'get'
  get_amounts_out(mids, token_in, amount_in, type) {
    if (!this.isInit) return;
    let amounts_out_arr = [];
    let hasMids = 0;
    mids.forEach((m, mIndex) => {
      let mid_arr = m.split("-");
      if (mid_arr.length === 1) {
        hasMids = mid_arr[0]
      }
      let quantity_out;
      let price = 1;
      let swapInPrice = 1;
      let swapOutPrice = 1;
      let new_token_in = token_in, new_amount_in = amount_in;
      // console.log(' --------------------- ')
      for (let i = 0; i < mid_arr.length; i++) {
        let mid = mid_arr[i];
        // console.log('mid', mid)
        let market = this.markets.find(v => v.mid == mid);
        if (!market) {
          return
        }
        let swap_result
        if (!type) {
          swap_result = this.swap(mid, new_token_in, new_amount_in);
        } else {
          swap_result = this.swap(mid, new_token_in, new_amount_in, type);
        }
        new_amount_in = swap_result.amount_out;
        new_token_in = swap_result.token_out;
        quantity_out = swap_result.quantity_out;
        price = swap_result.price * price;
        swapInPrice = swap_result.swapInPrice * swapInPrice;
        swapOutPrice = swap_result.swapOutPrice * swapOutPrice;
      }
      amounts_out_arr.push({
        amount_in: new_amount_in, token_in: new_token_in, quantity_out, price, mid: m, mIndex,
        swapInPrice, swapOutPrice,
      })
    })
    if (!type) {
      amounts_out_arr.sort((a, b) => {
        return parseFloat(b.quantity_out) - parseFloat(a.quantity_out);
      })
    } else {
      amounts_out_arr = amounts_out_arr.filter(v => v.amount_in > 0)
      amounts_out_arr.sort((a, b) => {
        return parseFloat(a.quantity_out) - parseFloat(b.quantity_out);
      })
    }
    if (!amounts_out_arr.length) {
      return {}
    }
    this.bestPath = this._pathsArr[amounts_out_arr[0].mIndex]
    amounts_out_arr[0].bestPath = this.bestPath;
    amounts_out_arr[0].hasMids = hasMids;

    return amounts_out_arr[0]
  }

  swap(mid, token_in, amount_in, type) {
    if (!this.isInit) return;
    let market = this.markets.find(v => v.mid == mid);
    if (!market) {
      return
    }
    let tokenA = market.contract0 + ":" + market.sym0.split(",")[1];
    let tokenB = market.contract1 + ":" + market.sym1.split(",")[1];
    let inNum = amount_in;
    if (!type) {
      amount_in -= amount_in * 0.001; // 协议费扣除
      inNum = amount_in * 0.998;
    }
    let amount_out;
    let token_out;
    let quantity_out;
    let price;
    let swapPrice; // 兑换后的价格
    if (token_in === tokenA) {
      inNum = inNum / (10 ** market.sym0.split(",")[0]);
      let reserve_in = parseFloat(market.reserve0) * (10 ** market.sym0.split(",")[0]);
      let reserve_out = parseFloat(market.reserve1) * (10 ** market.sym1.split(",")[0]);
      if (!(reserve_in > 0 && reserve_out > 0)) {
        return {
          token_out: tokenB,
          amount_out: '0',
          quantity_out: '0',
          price: '0'
        }
      }
      if (!type) {
        amount_out = this.get_amount_out(amount_in, reserve_in, reserve_out);
      } else {
        amount_out = this.get_amount_in(amount_in, reserve_in, reserve_out);
      }
      token_out = tokenB
      quantity_out = toFixed((amount_out / (10 ** market.sym1.split(",")[0])), market.sym1.split(",")[0]) + " " + market.reserve1.split(" ")[1];
      if (!type) {
        price = parseFloat(market.reserve1) / parseFloat(market.reserve0);
      } else {
        price = parseFloat(market.reserve0) / parseFloat(market.reserve1);
      }
      swapPrice = accDiv(amount_out, 10 ** market.sym1.split(",")[0]); // 计算总输出 - 不截取
    }
    if (token_in === tokenB) {
      inNum = inNum / (10 ** market.sym1.split(",")[0]);
      let reserve_in = parseFloat(market.reserve1) * (10 ** market.sym1.split(",")[0]);
      let reserve_out = parseFloat(market.reserve0) * (10 ** market.sym0.split(",")[0]);
      if (!(reserve_in > 0 && reserve_out > 0)) {
        return {
          token_out: tokenA,
          amount_out: '0',
          quantity_out: '0',
          price: '0'
        }
      }
      if (!type) {
        amount_out = this.get_amount_out(amount_in, reserve_in, reserve_out);
      } else {
        amount_out = this.get_amount_in(amount_in, reserve_in, reserve_out);
      }
      token_out = tokenA;
      quantity_out = toFixed((amount_out / (10 ** market.sym0.split(",")[0])), (market.sym0.split(",")[0])) + " " + market.reserve0.split(" ")[1];
      if (!type) {
        price = parseFloat(market.reserve0) / parseFloat(market.reserve1);
      } else {
        price = parseFloat(market.reserve1) / parseFloat(market.reserve0);
      }
      swapPrice = accDiv(amount_out, 10 ** market.sym0.split(",")[0]); // 计算总输出 - 不截取
    }
    let swapInPrice, swapOutPrice;
    if (!type) {
      swapInPrice = swapPrice / inNum;
      swapOutPrice = inNum / swapPrice;
    } else {
      swapPrice = swapPrice * 0.997;
      swapInPrice = inNum / swapPrice;
      swapOutPrice = swapPrice / inNum;
    }
    return {
      token_out,
      amount_out,
      quantity_out,
      price,
      swapInPrice,
      swapOutPrice
    }
  }

  get_amount_out(amount_in, reserve_in, reserve_out) {
    if (!this.isInit) return 0;
    if (!(amount_in > 0)) {
      return 0
    }
    let amount_in_with_fee = amount_in * (10000 - 20); // 去除手续费后总输入
    let numerator = amount_in_with_fee * reserve_out;
    let denominator = reserve_in * 10000 + amount_in_with_fee;
    let amount_out = numerator / denominator;
    if (!(amount_out > 0)) {
      return 0
    }
    return amount_out;
  }
  // 根据获得计算输入
  get_amount_in(amount_out, reserve_in, reserve_out) {
    if (!this.isInit) return 0;
    if (!(amount_out > 0)) {
      return 0
    }
    let amount_in_with_fee = amount_out * 10000; // 去除手续费后总输入
    let numerator = amount_in_with_fee * reserve_out;
    let denominator = reserve_in * 10000 - amount_in_with_fee;
    let amount_in = numerator / denominator;
    amount_in = amount_in / 0.997
    if (!(amount_in > 0)) {
      return 0
    }
    return amount_in;
  }

  check(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }
}
export const SwapRouter = new swapRouter();
export const SwapRouterFilter = new swapRouter();