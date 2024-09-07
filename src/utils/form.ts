export function showValidateErrorMessage(fields: any) {
  const firstKey = Object.keys(fields as Object)[0];
  const message = fields?.[firstKey][0].message;
  ElMessage.error(message);
}
