import request from "@/utils/request";

const UPLOAD_URL = "/api/image/";

export class FileAPI {
  static upload(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return request<any, ImageVo>({
      url: `${UPLOAD_URL}`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export interface ImageVo {
  image: string;
}
