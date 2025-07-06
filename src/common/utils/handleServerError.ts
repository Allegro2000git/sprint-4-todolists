import { changeStatusAC, setAppErrorAC } from "@/app/app-slice"
import type { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"

export const handleServerError = (err: unknown, dispatch: Dispatch) => {
  if (axios.isAxiosError(err)) {
    const error = err.response?.data?.message ?? err.message
    dispatch(setAppErrorAC({ error: error }))
  } else if (err instanceof Error) {
    dispatch(setAppErrorAC({ error: err.message }))
  } else {
    dispatch(setAppErrorAC({ error: JSON.stringify(err) }))
  }

  dispatch(changeStatusAC({ status: "failed" }))
}
