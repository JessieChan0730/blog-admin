import request from "@/utils/request";
import { Pagination } from "@/api/pagination";

const COMMENTS_URL = "/api/comments";

export class CommentsAPI {
  static getComments(params?: CommentsParams) {
    return request<any, Pagination<CommentsVo>>({
      url: `${COMMENTS_URL}/`,
      method: "get",
      params,
    });
  }

  static deleteComments(id: string | number) {
    return request<any, null>({
      url: `${COMMENTS_URL}/${id}/`,
      method: "delete",
    });
  }

  static publishComments(form: CommentsForms) {
    return request<any, null>({
      url: `${COMMENTS_URL}/publish/`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: form,
    });
  }

  static deleteMultipleComments(ids: number[]) {
    return request<any, null>({
      url: `${COMMENTS_URL}/multiple/`,
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ids,
      },
    });
  }

  static subscribeComments(id: number, notification: boolean) {
    return request<any, SubscribeResult>({
      url: `${COMMENTS_URL}/${id}/subscribe/`,
      method: "put",
      data: {
        notification,
      },
    });
  }
}

export interface CommentsVo {
  id: number;
  article_pk: number;
  nickname: string;
  avatar: string;
  content: string;
  notification: boolean;
  parent_comment: number | null;
  parent_comment_nickname: string | null;
  admin_comment: boolean;
  create_time: string;
  reply_comments: CommentsVo[];
}

export interface CommentsForms {
  article_pk: number | null;
  content: string;
  parent_comment: number | null;
}

export interface CommentsParams {
  page?: number;
  article_pk?: number | null;
}
export interface SubscribeResult {
  notification: boolean;
}
