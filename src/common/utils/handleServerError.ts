import { changeStatusAC, setAppErrorAC } from "@/app/app-slice"
import type { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod/v4"

export const handleServerError = (err: unknown, dispatch: Dispatch) => {
  let errorMessage

  switch (true) {
    case axios.isAxiosError(err):
      errorMessage = err.response?.data?.message || err.message
      break

    case err instanceof z.ZodError:
      console.table(err.issues)
      errorMessage = "Zod error. Смотри консоль"
      break

    case err instanceof Error:
      errorMessage = `Native error: ${err.message}`
      break

    default:
      errorMessage = JSON.stringify(err)
  }

  dispatch(setAppErrorAC({ error: errorMessage }))
  dispatch(changeStatusAC({ status: "failed" }))
}
