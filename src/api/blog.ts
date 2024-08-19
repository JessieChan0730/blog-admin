import request from "@/utils/request";
import { CategoryVo } from "@/api/category";
import { TagsVO } from "@/api/tags";
import User from "@/api/user";
import { Pagination } from "@/api/pagination";

const ARTICLE_URL = "/api/article/";

export class ArticleAPI {
  static getArticleList(params: QueryParams) {
    return request<any, Pagination<BlogVo>>({
      url: `${ARTICLE_URL}`,
      method: "get",
      params,
    });
  }
}

export interface QueryParams {
  page: number;
  search: string;
  ordering: string;
  category: number;
}

export interface BlogVo {
  id: number;
  title: string;
  content: string;
  intro: string;
  cover: string;
  recommend: boolean;
  visible: boolean;
  category: CategoryVo;
  tags: TagsVO[];
  author: User;
  create_date: string;
  update_date: string;
}

// 列表页博客视图
export interface BlogListVo {
  id: number;
  title: string;
  intro: string;
  cover: string;
  tags: TagsVO[];
  visible: boolean;
}
