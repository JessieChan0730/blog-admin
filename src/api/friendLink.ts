import request from "@/utils/request";
import { Pagination } from "@/api/pagination";

const FRIEND_LINK_BASE_URL = "/api/link";

export class FriendLinkAPI {
  static getALlLink() {
    return request<any, Pagination<FriendLink>>({
      url: `${FRIEND_LINK_BASE_URL}/`,
      method: "get",
    });
  }

  static addALlLink(data: FriendLink) {
    return request<any, FriendLink>({
      url: `${FRIEND_LINK_BASE_URL}/`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data,
    });
  }

  static updateLink(data: FriendLink) {
    return request<any, FriendLink>({
      url: `${FRIEND_LINK_BASE_URL}/${data.id}/`,
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      data,
    });
  }

  static deleteALlLink(id: number | string) {
    return request<any, null>({
      url: `${FRIEND_LINK_BASE_URL}/${id}/`,
      method: "delete",
    });
  }
}
export enum Status {
  ALL = "ALL",
  PENDING = "pending",
  ON_SHELF = "on_shelf",
  OFF_SHELF = "off_shelf",
}

export interface FriendLink {
  id?: number;
  name: string;
  intro: string;
  link: string;
  avatar: string;
  email: string;
  status?: Status;
}

export interface FLinkQueryParams {
  page: number;
  name?: string;
  status?: Status;
}
