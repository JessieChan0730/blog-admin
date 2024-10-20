import { useAdminSettings } from "@/store";
export enum PaginationType {
  Category = "category",
  Tags = "tags",
  Blog = "blog",
  FriendLink = "friend_link",
  PhotoWall = "photo_wall",
  Comments = "comments",
}
export async function useGetPageSize(type: PaginationType) {
  const adminSettingStore = useAdminSettings();
  let page_size = 4;
  const adminSetting = await adminSettingStore.get();
  if (adminSetting) {
    page_size = Number(adminSetting[type].page_size.value);
  }
  return page_size;
}
