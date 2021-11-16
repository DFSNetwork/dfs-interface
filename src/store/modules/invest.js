
const inverst = {
  state: {
    coins: [{
      mid: 17,
      symbol: 'EOS',
      contract: 'eosio.token',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/eosio.token-eos.svg',
    },
    {
      mid: 451,
      symbol: 'DFS',
      contract: 'minedfstoken',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/minedfstoken-dfs.png',
    },
    {
      mid: 1035,
      symbol: 'BTC',
      contract: 'asset.dtoken',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/asset.dtoken-btc.png',
    },
    {
      mid: 894,
      symbol: 'ETH',
      contract: 'asset.dtoken',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/asset.dtoken-eth.png',
    },
    {
      mid: 665,
      symbol: 'TAG',
      contract: 'tagtokenmain',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/tagtokenmain-tag.png',
    },
    {
      mid: 332,
      symbol: 'YFC',
      contract: 'yfctokenmain',
      logo: 'https://cdn.jsdelivr.net/gh/defis-net/material2/coin/yfctokenmain-yfc.png',
    }],
    allInvests: [],
  },
  mutations: {
    SET_allInvests: (state, allInvests) => {
      state.allInvests = allInvests;
    },
  },
  actions: {
    setAllInvests({ commit }, allInvests) {
      commit('SET_allInvests', allInvests);
    },
  }
};

export default inverst;
