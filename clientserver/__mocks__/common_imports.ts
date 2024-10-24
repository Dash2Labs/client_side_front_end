const expressMock = jest.mock('express');
const pathMock = jest.mock('path');
const fsMock = jest.mock('fs');
const resolvePathMock = jest.fn();
const _dirname_Mock = jest.fn();
const _filename_Mock = jest.fn();
const constantsMock = jest.fn();
const defaultHeadersMock = jest.fn();
const uuiv4Mock = jest.fn();
const handleResponseMock = jest.fn();
export { 
    expressMock as express,
    pathMock as path,
    fsMock as fs,
    resolvePathMock as resolvePath,
    _dirname_Mock as _dirname_,
    _filename_Mock as _filename_,
    constantsMock as constants,
    defaultHeadersMock as defaultHeaders,
    uuiv4Mock as uuiv4,
    handleResponseMock as handleResponse
};
