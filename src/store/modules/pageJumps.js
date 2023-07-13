const state = {
  pageQuery: {}
};

const mutations = {
  ADD_PAGE_QUERY: (state, option) => {
    const { name, query } = option;
    state.pageQuery[name] = query;
  },

  CLEAR_PAGE_QUERY: (state, pageName) => {
    state.pageQuery[pageName] = undefined;
  }
};

const actions = {
  addPageQuery({ commit }, option) {
    commit('ADD_PAGE_QUERY', option);
  },

  clearPageQuery({ commit }, pageName) {
    commit('CLEAR_PAGE_QUERY', pageName);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
