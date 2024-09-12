import request from "@/utils/request";
import type { Pagination } from "./pagination";
const TAGS_BASE_URL = "/api/tag/";

export class TagsAPI {
  static getAllTags(page: number) {
    return request<any, Pagination<TagsVO>>({
      method: "get",
      url: `${TAGS_BASE_URL}?page=${page}`,
    });
  }

  static addTags(data: TagsForm) {
    return request<any, TagsVO>({
      url: `${TAGS_BASE_URL}`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: data.name,
        color: data.color ? data.color : "#409EFF",
      },
    });
  }

  static updateTags(id: number, data: TagsForm) {
    return request<any, TagsVO>({
      url: `${TAGS_BASE_URL}${id}/`,
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: data.name,
        color: data.color ? data.color : "#409EFF",
      },
    });
  }
  static deleteTag(id: number | string) {
    return request<any, TagsVO>({
      url: `${TAGS_BASE_URL}${id}/`,
      method: "delete",
    });
  }
  static deleteTags(ids: number[]) {
    return request<any, null>({
      url: `${TAGS_BASE_URL}/multiple/`,
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ids,
      },
    });
  }
  static searchTags(name: string) {
    return request<any, TagsVO[]>({
      url: `${TAGS_BASE_URL}/search/`,
      method: "get",
      params: {
        name,
      },
    });
  }
}

export interface TagsVO {
  id: number;
  name: string;
  color?: string;
}

export interface TagsForm {
  id?: number;
  name: string;
  color?: string;
}
