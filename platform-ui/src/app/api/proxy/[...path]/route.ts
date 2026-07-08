import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://api:8000/api/v1";

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleProxy(request, params.path);
}

export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleProxy(request, params.path);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleProxy(request, params.path);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, pathArray: string[]) {
  const path = pathArray.join('/');
  const targetUrl = `${INTERNAL_API_URL}/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host"); // Let fetch set the correct host

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.blob();
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    
    // Copy headers from response
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`Proxy error to ${targetUrl}:`, error);
    return NextResponse.json(
      { detail: `Proxy Error: Unable to reach backend API. ${error.message}` },
      { status: 502 }
    );
  }
}
