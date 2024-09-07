import request from "@/utils/request";
const USER_INFO_URL = "/api/user";
export class UserAPI {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  static getInfo() {
    return request<any, UserInfoVo>({
      url: `${USER_INFO_URL}/info/`,
      method: "get",
    });
  }

  static updateUserInfo(data: UserInfoForm) {
    for (const mediaKey in data.more_info?.media) {
      if (
        data.more_info?.media.hasOwnProperty(mediaKey) &&
        (data.more_info?.media as any)[mediaKey] === ""
      ) {
        (data.more_info?.media as any)[mediaKey] = "暂无";
      }
    }
    return request<any, UserInfoVo>({
      url: `${USER_INFO_URL}/change/`,
      method: "put",
      data,
    });
  }
}

export default UserAPI;

export interface Hobby {
  name: string;
  detail: string;
}

export interface MediaLink {
  github: string;
  bilibili: string;
  csdn: string;
  tiktok: string;
}

export interface User {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
}

export interface MoreInfo {
  hobby: Hobby[];
  media: MediaLink;
}

/** 用户信息 */
export interface UserInfoVo {
  nickname: string;
  // /** 头像URL */
  avatar: string;
  signature: string;
  more_info: MoreInfo;
}

/** 修改用户信息表单 */
export interface UserInfoForm {
  nickname?: string;
  signature?: string;
  more_info?: MoreInfo;
}
