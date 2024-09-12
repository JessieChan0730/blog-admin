// 将RGB字符串转换为RGB数组
const rgbToArray = (rgb: string) => {
  const match = rgb.match(
    /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
  );
  return match
    ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
    : [0, 0, 0];
};

// 计算文字颜色
export const textColor = (bgColor: string) => {
  const rgb = rgbToArray(bgColor);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF"; // 简单的亮度判断
};
