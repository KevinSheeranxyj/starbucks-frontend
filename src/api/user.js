import http from '@/utils/http';

export async function getUserInfo(errHandler) {
  try {
    const { data: res } = await http.get('/sys/user/info');
    return res;
  } catch (e) {
    errHandler();
  }
}
