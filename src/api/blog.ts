import request from "@/utils/request";
import { CategoryVo } from "@/api/category";
import { TagsVO } from "@/api/tags";
import { User } from "@/api/user";
import { Pagination } from "@/api/pagination";

const ARTICLE_URL = "/api/article";

export class ArticleAPI {
  static getArticleList(params: QueryParams) {
    return request<any, Pagination<BlogVo>>({
      url: `${ARTICLE_URL}/`,
      method: "get",
      params,
    });
  }

  static publishArticle(data: BlogForm) {
    return request<any, Pagination<BlogVo>>({
      url: `${ARTICLE_URL}/publish/`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data,
    });
  }

  static getArticleById(id: string | number) {
    return request<any, BlogVo>({
      url: `${ARTICLE_URL}/${id}/`,
      method: "get",
    });
  }

  static modifyArticle(id: number | string, data: BlogForm) {
    return request<any, BlogVo>({
      url: `${ARTICLE_URL}/${id}/modify/`,
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      data,
    });
  }

  static deleteArticle(id: number | string) {
    return request<any, null>({
      url: `${ARTICLE_URL}/${id}/`,
      method: "delete",
    });
  }

  static getArticleSelectedData() {
    return request<any, BlogSelectedVo[]>({
      url: `${ARTICLE_URL}/selected/`,
      method: "get",
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
  cover_url: string;
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
  cover_url: string;
  tags: TagsVO[];
  visible: boolean;
}

export interface BlogForm {
  cover_url?: string;
  title?: string;
  intro?: string;
  content?: string;
  recommend?: boolean;
  visible?: boolean;
  category_id?: number | null;
  tags_ids?: number[];
}

export interface BLogPreview {
  title: string;
  content: string;
  intro: string;
  tags: TagsVO[];
  author: User;
  create_date: string;
  update_date: string;
}

export interface BLogManage {
  title: string;
  cover_url: string;
  recommend: boolean;
  visible: boolean;
  category: number;
  tags: TagsVO[];
}

export interface BlogSelectedVo {
  id: number;
  title: string;
}
