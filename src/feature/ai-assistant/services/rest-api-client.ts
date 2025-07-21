import { getAccessToken } from "./../../auth/services/token-manager";
import { ApiRequest } from "./rest-api-mapping";

const API_BASE_URL = "http://localhost:8080"; // Sửa lại nếu cần

function buildUrl(
  endpoint: string,
  pathParams?: Record<string, any>,
  queryParams?: Record<string, any>
) {
  let url = endpoint;
  // Thay thế path params
  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
  }
  // Thêm query params
  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      )
      .join("&");
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }
  return API_BASE_URL + url;
}

export async function callRestApi(request: ApiRequest): Promise<any> {
  const url = buildUrl(
    request.endpoint,
    request.pathParams,
    request.queryParams
  );
  const options: RequestInit = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      // Thêm Authorization nếu cần
      Authorization: `Bearer ${getAccessToken()}`,
    },
  };
  if ((request.method === "POST" || request.method === "PUT") && request.body) {
    options.body = JSON.stringify(request.body);
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    // Nếu không có content (204), trả về null
    if (response.status === 204) return null;
    // Nếu là JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    // Nếu là text
    return await response.text();
  } catch (err) {
    throw err;
  }
}
