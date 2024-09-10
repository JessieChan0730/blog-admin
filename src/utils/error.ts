export function showValidateErrorMessage(fields: any) {
  const firstKey = Object.keys(fields as Object)[0];
  const message = fields?.[firstKey][0].message;
  ElMessage.error(message);
}

export function showBadRequestErrorMessage(fields: any) {
  const firstKey = Object.keys(fields as Object)[0];
  const message = fields?.[firstKey][0];
  ElMessage.error(`${firstKey}:${message}`);
}
