import { Response } from "express"

interface IResponseMeta {
  page?: number
  limit?: number
  total?: number
  totalPage?: number
}

interface IResponseData<T> {
  success: boolean
  statusCode: number
  message?: string
  data?: T
  meta?: IResponseMeta
}

export const sendResponse = <T>(res: Response, responseData: IResponseData<T>): Response => {
  return res.status(responseData.statusCode).json({
    success: responseData.success,
    statusCode: responseData.statusCode,
    message: responseData.message || "Success",
    meta: responseData.meta,
    data: responseData.data,
  })
}
