import request from "@/utils/request";
import { Pagination } from "@/api/pagination";
const CATEGORY_BASE_URL = "/api/category/";
export class CategoryAPI {
  static getCategoryData(params?: QueryParams) {
    return request<any, Pagination<CategoryVo>>({
      url: `${CATEGORY_BASE_URL}`,
      method: "get",
      params: params || null,
    });
  }
}

export interface CategoryVo {
  id: number;
  name: string;
  display: boolean;
}

export interface QueryParams {
  name: string;
  page: number;
}
