import request from "@/utils/request";
const SUM_UP_BASE_URL = "/api/sumup/";

export class SumUpAPI {
  static getAllSumUpInfo() {
    return request<null, SumUpVO>({
      url: `${SUM_UP_BASE_URL}`,
      method: "get",
    });
  }
}

export interface SumUpVO {
  article_num: number;
  articles_per_day: any;
  latest_articles: any;
  category_per_name: any;
  tags: any;
}
