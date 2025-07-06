import { Todolist } from "@/features/todolists/api/todolistsApi.types.ts"
import { todolistsApi } from "@/features/todolists/api/todolistsApi.ts"
import { createAppSlice } from "@/common/utils"
import { changeStatusAC } from "@/app/app-slice"
import type { RequestStatus } from "@/common/types"
import { ResultCode } from "@/common/enums"
import { handleServerError } from "@/common/utils/handleServerError"
import { handleAppError } from "@/common/utils/handleAppError"

export const todolistsSlice = createAppSlice({
  name: "todolists",
  initialState: [] as DomainTodolist[],
  selectors: {
    selectTodolists: (state) => state,
  },
  reducers: (create) => ({
    fetchTodolistsTC: create.asyncThunk(
      async (_state, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await todolistsApi.getTodolists()
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return { todolists: res.data }
        } catch (err) {
          handleServerError(err, thunkAPI.dispatch)
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (_state, action) => {
          return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
        },
      },
    ),
    createTodolistTC: create.asyncThunk(
      async (title: string, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await todolistsApi.createTodolist(title)
          if (res.data.resultCode === ResultCode.Success) {
            thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
            return { todolist: res.data.data.item }
          } else {
            handleAppError(res.data, thunkAPI.dispatch)
            thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
            return thunkAPI.rejectWithValue(null)
          }
        } catch (err) {
          handleServerError(err, thunkAPI.dispatch)
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
        },
      },
    ),
    deleteTodolistTC: create.asyncThunk(
      async (id: string, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          thunkAPI.dispatch(changeTodolistEntityStatusAC({ id, entityStatus: "loading" }))
          const res = await todolistsApi.deleteTodolist(id)
          if (res.data.resultCode === ResultCode.Success) {
            thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
            return { id }
          } else {
            handleAppError(res.data, thunkAPI.dispatch)
            thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
            thunkAPI.dispatch(changeTodolistEntityStatusAC({ id, entityStatus: "failed" }))
            return thunkAPI.rejectWithValue(null)
          }
        } catch (err) {
          handleServerError(err, thunkAPI.dispatch)
          thunkAPI.dispatch(changeTodolistEntityStatusAC({ id, entityStatus: "failed" }))
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state.splice(index, 1)
          }
        },
      },
    ),
    changeTodolistTitleTC: create.asyncThunk(
      async (args: { id: string; title: string }, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await todolistsApi.changeTodolistTitle(args)
          if (res.data.resultCode === ResultCode.Success) {
            thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
            return args
          } else {
            handleAppError(res.data, thunkAPI.dispatch)
            thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
            return thunkAPI.rejectWithValue(null)
          }
        } catch (err) {
          handleServerError(err, thunkAPI.dispatch)
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state[index].title = action.payload.title
          }
        },
      },
    ),
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
    changeTodolistEntityStatusAC: create.reducer<{ id: string; entityStatus: RequestStatus }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.entityStatus = action.payload.entityStatus
      }
    }),
  }),
})

export const {
  changeTodolistFilterAC,
  fetchTodolistsTC,
  createTodolistTC,
  deleteTodolistTC,
  changeTodolistTitleTC,
  changeTodolistEntityStatusAC,
} = todolistsSlice.actions
export const { selectTodolists } = todolistsSlice.selectors
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
  filter: FilterValues
  entityStatus: RequestStatus
}

export type FilterValues = "all" | "active" | "completed"
