import http from "@/utils/http";

export async function networkDeviceApi(errHandler) {
  try {
    const { data: res } = await http.get('/network/device');
    return res;
  } catch (e) {
    errHandler();
  }
}
