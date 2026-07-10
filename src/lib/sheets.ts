import { fetchWithRetry } from "./api"

const BASE = "https://sheets.googleapis.com/v4/spreadsheets"

async function request(
  path: string,
  accessToken: string,
  options: RequestInit = {},
) {
  const res = await fetchWithRetry(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  return res.json()
}

export async function getSheetData(range: string, accessToken: string) {
  const sid = process.env.SHEETS_ID!
  const data = await request(`/${sid}/values/${range}`, accessToken)
  return (data.values as string[][]) ?? []
}

export async function appendSheetData(
  range: string,
  values: string[][],
  accessToken: string,
) {
  const sid = process.env.SHEETS_ID!
  await request(`/${sid}/values/${range}:append`, accessToken, {
    method: "POST",
    body: JSON.stringify({ values, majorDimension: "ROWS" }),
    headers: { "Content-Type": "application/json" },
  })
}

export async function updateSheetData(
  range: string,
  values: string[][],
  accessToken: string,
) {
  const sid = process.env.SHEETS_ID!
  await request(`/${sid}/values/${range}`, accessToken, {
    method: "PUT",
    body: JSON.stringify({ values, majorDimension: "ROWS" }),
    headers: { "Content-Type": "application/json" },
  })
}

export async function createSpreadsheet(
  title: string,
  sheetNames: string[],
  accessToken: string,
) {
  const data = await request("", accessToken, {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
      sheets: sheetNames.map((s) => ({ properties: { title: s } })),
    }),
    headers: { "Content-Type": "application/json" },
  })
  return data as { spreadsheetId: string }
}
