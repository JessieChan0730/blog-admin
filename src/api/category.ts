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

  static addCategory(data: CategoryForm) {
    return request<any, CategoryVo>({
      url: `${CATEGORY_BASE_URL}`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: data.name,
        display: data.display,
      },
    });
  }

  static updateCategory(data: CategoryForm) {
    return request<any, CategoryVo>({
      url: `${CATEGORY_BASE_URL}/${data.id}/`,
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: data.name,
        display: data.display,
      },
    });
  }

  static deleteCategory(id: number | string) {
    return request<any, null>({
      url: `${CATEGORY_BASE_URL}/${id}/`,
      method: "delete",
    });
  }

  static deleteCategories(ids: number[]) {
    return request<any, null>({
      url: `${CATEGORY_BASE_URL}/multiple/`,
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ids,
      },
    });
  }

  static getAllCategory() {
    return request<any, CategoryVo[]>({
      url: `${CATEGORY_BASE_URL}/all/`,
      method: "get",
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

export interface CategoryForm {
  id?: number;
  name: string;
  display: boolean;
}
