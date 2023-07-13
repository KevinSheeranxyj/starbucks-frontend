const state = {
  username: '',
  account: '',
  mobile: '',
  entryDate: '',
  roles: '',
};

const mutations = {
  SET_USERNAME: (state, username) => {
    state.username = username;
  },

  SET_ACCOUNT: (state, account) => {
    state.account = account;
  },

  SET_MOBILE: (state, mobile) => {
    state.mobile = mobile;
  },

  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },

  SET_ENTRY_DATE: (state, date) => {
    state.entryDate = date;
  },

  CLEAR_USER_INFO: (state) => {
    state.username = undefined;
    state.account = undefined;
    state.mobile = undefined;
    state.roles = undefined;
  },
};

const actions = {
  refreshUserInfo({ commit }, userInfo) {
    commit('SET_USERNAME', userInfo.username);
    commit('SET_ACCOUNT', userInfo.account);
    commit('SET_MOBILE', userInfo.mobile);
    commit('SET_ROLES', userInfo.roles);
    commit('SET_ENTRY_DATE', userInfo.entryDate);
  },

  clearUserInfo({ commit }) {
    commit('CLEAR_USER_INFO');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
