export function removePaginationFromParams(params: URLSearchParams): URLSearchParams {
    const newParams = new URLSearchParams(params);
    newParams.delete("page");
    return newParams;
}