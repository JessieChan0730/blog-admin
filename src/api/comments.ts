import request from "@/utils/request";
import { Pagination } from "@/api/pagination";

const COMMENTS_URL = "/api/comments/";
export class CommentsAPI {
  static getComments() {
    return request<any, Pagination<CommentsVo>>({
      url: `${COMMENTS_URL}`,
      method: "get",
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
