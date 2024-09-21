import {
  AdminSetting,
  AdminSettingsAPI,
  FrontSetting,
  FrontSettingsAPI,
} from "@/api/settings";
import { store, useUserStore } from "@/store";
import { ADMIN_SETTING_KEY, FRONT_SETTING_KEY } from "@/enums/CacheEnum";

// TODO 相同的逻辑是否可以封装
export const useFrontSettings = defineStore("frontSetting", () => {
  const frontSetting = reactive<FrontSetting>(<FrontSetting>{
    website_title: {
      id: 0,
      value: "",
    },
    website_cover: {
      id: 0,
      value: "",
    },
    record_info: {
      id: 0,
      value: "",
    },
    copyright: {
      id: 0,
      value: "",
    },
    category: {
      visible_max_num: {
        id: 0,
        value: "",
      },
    },
    tags: {
      quote_max_num: {
        id: 0,
        value: "",
      },
    },
    blog: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
      recommend_max_num: {
        id: 0,
        value: "",
      },
    },
  });

  function get() {
    return new Promise<FrontSetting>((resolve, reject) => {
      if (
        localStorage.getItem(FRONT_SETTING_KEY) &&
        localStorage.getItem(FRONT_SETTING_KEY)?.trim() !== "" &&
        localStorage.getItem(FRONT_SETTING_KEY)?.trim() !== "undefined"
      ) {
        const frontSettingsObj = JSON.parse(
          localStorage.getItem(FRONT_SETTING_KEY) as string
        ) as FrontSetting;
        Object.assign(frontSetting, { ...frontSettingsObj });
        resolve(frontSettingsObj);
      } else {
        FrontSettingsAPI.getAllSettings()
          .then((data) => {
            Object.assign(frontSetting, { ...data });
            const frontSettingJSON = JSON.stringify(data);
            localStorage.setItem(FRONT_SETTING_KEY, frontSettingJSON);
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  async function refresh() {
    localStorage.removeItem(FRONT_SETTING_KEY);
    await get();
  }

  return {
    get,
    refresh,
  };
});

export const useAdminSettings = defineStore("adminSetting", () => {
  const adminSetting = reactive<AdminSetting>(<AdminSetting>{
    website_title: {
      id: 0,
      value: "",
    },
    website_logo: {
      id: 0,
      value: "",
    },
    record_info: {
      id: 0,
      value: "",
    },
    copyright: {
      id: 0,
      value: "",
    },
    category: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
    },
    tags: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
    },
    blog: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
    },
    friend_link: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
    },
    photo_wall: {
      page_size: {
        id: 0,
        value: "",
      },
      max_page_size: {
        id: 0,
        value: "",
      },
    },
  });

  function get() {
    return new Promise<AdminSetting>((resolve, reject) => {
      if (
        localStorage.getItem(ADMIN_SETTING_KEY) &&
        localStorage.getItem(ADMIN_SETTING_KEY)?.trim() !== "" &&
        localStorage.getItem(ADMIN_SETTING_KEY)?.trim() !== "undefined"
      ) {
        console.log("成功");
        const adminSettingsObj = JSON.parse(
          localStorage.getItem(ADMIN_SETTING_KEY) as string
        ) as AdminSetting;
        Object.assign(adminSetting, { ...adminSettingsObj });
        resolve(adminSettingsObj);
      } else {
        AdminSettingsAPI.getAllSettings()
          .then((data) => {
            Object.assign(adminSetting, { ...data });
            const adminSettingJSON = JSON.stringify(data);
            localStorage.setItem(ADMIN_SETTING_KEY, adminSettingJSON);
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }
  async function refresh() {
    localStorage.removeItem(ADMIN_SETTING_KEY);
    await get();
  }

  return {
    adminSetting,
    get,
    refresh,
  };
});

export function useBlogSettingsStoreHook() {
  return useUserStore(store);
}
