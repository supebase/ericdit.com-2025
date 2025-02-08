export const useLocationIP = async () => {
  const data = await $fetch<{
    ipinfo: { text: string };
    ipdata: { info1: string };
  }>("https://api.vore.top/api/IPdata");

  if (!data.ipinfo?.text || !data.ipdata?.info1) {
    throw new Error('Invalid IP data');
  }

  return data;
};