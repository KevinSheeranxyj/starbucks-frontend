const state = {
  currentVersionId: 0,
  newestVersionId: 0,
};

const mutations = {
  SET_CURRENT_VERSION_ID: (state, currentVersionId) => {
    state.currentVersionId = currentVersionId;
  },

  SET_NEWEST_VERSION_ID: (state, newestVersionId) => {
    state.newestVersionId = newestVersionId;
  },
};

const actions = {
  setCurrentVersionId({ commit }, currentVersionId) {
    commit('SET_CURRENT_VERSION_ID', currentVersionId);
  },

  setNewestVersionId({ commit }, newestVersionId) {
    commit('SET_NEWEST_VERSION_ID', newestVersionId);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
