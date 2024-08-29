import request from "@/utils/request";

const SITE_INFO_BASE_URL = "/api/siteinfo";

export class SiteInfoAPI {
  static getSiteInfo() {
    return request<any, SiteInfo>({
      url: `${SITE_INFO_BASE_URL}/view/`,
      method: "get",
    });
  }

  static updateSiteInfo(data: SiteInfoForm) {
    return request<any, SiteInfo>({
      url: `${SITE_INFO_BASE_URL}/change/`,
      method: "put",
      data,
    });
  }
}
export interface SiteInfo {
  title: string;
  content: string;
}

export interface SiteInfoForm {
  title?: string;
  content?: string;
}
