import request from "@/utils/request";

const TAGS_BASE_URL = "/api/tag/";

export class TagsAPI {
  static getAllTags() {
    return request<any, TagsVO[]>({
      method: "get",
      url: `${TAGS_BASE_URL}`,
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
      },
    });
  }
  static deleteTag(id: number | string) {
    return request<any, TagsVO>({
      url: `${TAGS_BASE_URL}${id}/`,
      method: "delete",
    });
  }
}

export interface TagsVO {
  id: number;
  name: string;
}

export interface TagsForm {
  id?: number;
  name: string;
}
