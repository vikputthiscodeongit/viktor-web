interface IFetchWithTimeout {
    resource: RequestInfo | URL,
    fetchOptions?: RequestInit,
    timeout?: number
}

export default async function fetchWithTimeout({ resource, fetchOptions, timeout }: IFetchWithTimeout) {
    if (!timeout) {
        timeout = 8000;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
      ...(fetchOptions || {}),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    return response;
}
