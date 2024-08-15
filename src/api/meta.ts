import request from "@/utils/request";

const META_BASE_URL = "/api/meta";

export class MetaAPI {
  static getMeta() {
    return request<any, MetaVo>({
      url: `${META_BASE_URL}`,
      method: "get",
    });
  }

  static updateMeta(data: MetaForm) {
    return request<any, MetaVo>({
      url: `${META_BASE_URL}`,
      method: "post",
      data,
    });
  }
}

export interface MetaVo {
  title: string;
  cover: string;
}

export interface MetaForm {
  title?: string;
  cover?: string;
}
