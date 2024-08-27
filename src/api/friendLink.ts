import request from "@/utils/request";
import { Pagination } from "@/api/pagination";

const FRIEND_LINK_BASE_URL = "/api/link";
const STATEMENT_BASE_URL = "/api/statement";
export class FriendLinkAPI {
  static getALlLink(params?: FLinkQueryParams) {
    return request<any, Pagination<FriendLink>>({
      url: `${FRIEND_LINK_BASE_URL}/`,
      method: "get",
      params,
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

  static deleteLink(id: number | string) {
    return request<any, null>({
      url: `${FRIEND_LINK_BASE_URL}/${id}/`,
      method: "delete",
    });
  }
  static deleteMultipleLinks(ids: number[]) {
    return request<any, null>({
      url: `${FRIEND_LINK_BASE_URL}/multiple/`,
      method: "delete",
      data: {
        ids,
      },
    });
  }
}

export class FriendLinkStatementAPI {
  static getStatement() {
    return request<any, Statement>({
      url: `${STATEMENT_BASE_URL}/show/`,
      method: "get",
    });
  }

  static changeStatement(statement: string) {
    return request<any, Statement>({
      url: `${STATEMENT_BASE_URL}/change/`,
      method: "put",
      data: {
        statement,
      },
    });
  }
}

export enum Status {
  PENDING = "pending",
  ON_SHELF = "on_shelf",
  OFF_SHELF = "off_shelf",
}

export interface Statement {
  statement: string;
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
