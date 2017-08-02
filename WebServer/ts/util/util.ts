import * as Express from "express";

function _jsonResponse(res: Express.Response, payload: any) {
    res.format({
        json: () => {
            res.json(payload);
        },
    });
}

export function jsonResponse(res: Express.Response) {
    return _jsonResponse.bind(null, res);
}

export function _errorResponse(res: Express.Response, action: string, error: any) {
    console.log("Failed to perform " + action + ": " + error);
    res.format({
        json: () => {
            res.json(error);
        },
    });
}

export function errorResponse(res: Express.Response, action: string) {
    return _errorResponse.bind(null, res, action);
}

function _logJson<T>(message: string, json: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        console.log(message + JSON.stringify(json));
        resolve(json);
    });
}

export function logJson(message: string): (obj) => Promise<any> {
    return _logJson.bind(null, message);
}

export function startWith(str: string, prefix: string): boolean {
    return str.substr(0, prefix.length) === prefix;
}
