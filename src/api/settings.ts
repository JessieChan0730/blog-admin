import request from "@/utils/request";

const META_BASE_URL = "/api/settings";

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

const SETTING_PUT_BASE_URL = "/api/settings/";
const FRONT_SETTING_BASE_URL = "/api/settings/front/";
const ADMIN_SETTING__BASE_URL = "/api/settings/admin/";

export interface Setting {
  id: number;
  value: string;
}

export interface PaginationSetting {
  page_size: Setting;
  max_page_size: Setting;
}

export interface FrontCategorySettings {
  visible_max_num: Setting;
}

export interface FrontTagsSettings {
  quote_max_num: Setting;
}

export interface FrontBlogSettings extends PaginationSetting {
  recommend_max_num: Setting;
}

export interface FrontSetting {
  website_title: Setting;
  website_cover: Setting;
  record_info: Setting;
  copyright: Setting;
  category: FrontCategorySettings;
  tags: FrontTagsSettings;
  blog: FrontBlogSettings;
}
export class FrontSettingsAPI {
  static getAllSettings() {
    return request<any, FrontSetting>({
      url: `${FRONT_SETTING_BASE_URL}`,
      method: "get",
    });
  }

  static putFrontSetting(data: Setting[]) {
    return request<any, null>({
      url: `${SETTING_PUT_BASE_URL}`,
      method: "put",
      data,
    });
  }
}
