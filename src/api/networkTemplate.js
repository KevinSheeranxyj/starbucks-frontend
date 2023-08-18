import http from "@/utils/http";

export async function networkTemplateApi(errHandler) {
  try {
    const { data: res } = await http.get('/network/template');
    return res;
  } catch (e) {
    errHandler();
  }
}
