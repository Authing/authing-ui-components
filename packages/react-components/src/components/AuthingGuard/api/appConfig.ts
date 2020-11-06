import { requestClient } from "./http";

export const fetchAppConfig = (appId: string) =>
  requestClient.get(`/api/v2/applications/${appId}/public-config`)