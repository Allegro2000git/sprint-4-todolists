import { changeStatusAC, setAppErrorAC } from "@/app/app-slice"
import type { Dispatch } from "@reduxjs/toolkit"
import type { BaseResponse } from "@/common/types"

export const handleAppError = <T>(data: BaseResponse<T>, dispatch: Dispatch) => {
  data.messages.length
    ? dispatch(setAppErrorAC({ error: data.messages[0] }))
    : dispatch(setAppErrorAC({ error: "Some error occurred" }))
  dispatch(changeStatusAC({ status: "failed" }))
}
