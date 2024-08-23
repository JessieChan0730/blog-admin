import { store, useUserStore } from "@/store";
import { ArticleAPI, BlogListVo, BlogVo, QueryParams } from "@/api/blog";
import { Pagination } from "@/api/pagination";

export const useBlogStore = defineStore("blog", () => {
  const articleList = reactive<Pagination<BlogVo>>({
    count: 0,
    previous: null,
    next: null,
    results: [],
  });

  /**
   * 初始化数据
   */
  function init(params: QueryParams) {
    return new Promise<Pagination<BlogVo>>((resolve, reject) => {
      ArticleAPI.getArticleList(params)
        .then((data) => {
          articleList.count = data.count;
          articleList.previous = data.previous;
          articleList.next = data.next;
          articleList.results = data.results;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const articleListVo = computed<Pagination<BlogListVo>>(() => {
    const articles = articleList.results.map((article) => {
      return {
        id: article.id,
        title: article.title,
        intro: article.intro,
        cover_url: article.cover_url,
        tags: article.tags,
        visible: article.visible,
      };
    });
    return {
      count: articleList.count,
      next: articleList.next,
      previous: articleList.previous,
      results: articles,
    };
  });

  return {
    init,
    articleListVo,
  };
});

export function useArticleStoreHook() {
  return useUserStore(store);
}
