import request from "@/utils/request";
import { Pagination } from "@/api/pagination";

const PHOTO_WALL_BASE_API = "/api/photos";

export class PhotoWallAPI {
  static getAllPhoto(query?: QueryForm) {
    return request<any, Pagination<PhotoWall>>({
      url: `${PHOTO_WALL_BASE_API}/`,
      method: "get",
      params: {
        page: query?.page,
        description: query?.description,
      },
    });
  }

  static uploadPhoto(form: PhotoWallCreateForm) {
    const formData = new FormData();
    formData.append("image", form.image as File);
    formData.append("description", form.description);
    return request<any, PhotoWall>({
      url: `${PHOTO_WALL_BASE_API}/`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });
  }

  static updatePhoto(id: number | string, data: PhotoWallUpdateForm) {
    const { description, visible } = data;
    return request<any, PhotoWall>({
      url: `${PHOTO_WALL_BASE_API}/${id}/change/`,
      method: "put",
      data: {
        description,
        visible,
      },
    });
  }

  static deletePhoto(id: number | string) {
    return request<any, null>({
      url: `${PHOTO_WALL_BASE_API}/${id}/`,
      method: "delete",
    });
  }

  static deleteMultiplePhotos(ids: number[]) {
    return request<any, null>({
      url: `${PHOTO_WALL_BASE_API}/multiple/`,
      method: "delete",
      data: {
        ids,
      },
    });
  }
}

export interface PhotoWall {
  id?: number;
  image: string;
  description: string;
  visible: boolean;
}

export interface PhotoWallCreateForm {
  id?: number;
  image: File | null;
  description: string;
}

export interface PhotoWallUpdateForm {
  description?: string;
  visible?: boolean;
}

export interface QueryForm {
  page?: number;
  description?: string;
}
