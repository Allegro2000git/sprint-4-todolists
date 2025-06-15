import { Todolist } from "@/features/todolists/api/todolistsApi.types.ts"
import { todolistsApi } from "@/features/todolists/api/todolistsApi.ts"
import { createAppSlice } from "@/common/utils"
import { changeStatusAC } from "@/app/app-slice"

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
        } catch (error) {
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(error)
        }
      },
      {
        fulfilled: (_state, action) => {
          return action.payload.todolists.map((tl) => ({ ...tl, filter: "all" }))
        },
      },
    ),
    createTodolistTC: create.asyncThunk(
      async (title: string, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await todolistsApi.createTodolist(title)
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return { todolist: res.data.data.item }
        } catch (error) {
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(error)
        }
      },
      {
        fulfilled: (state, action) => {
          state.unshift({ ...action.payload.todolist, filter: "all" })
        },
      },
    ),
    deleteTodolistTC: create.asyncThunk(
      async (todolistId: string, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          await todolistsApi.deleteTodolist(todolistId)
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return { todolistId }
        } catch (error) {
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(error)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.todolistId)
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
          await todolistsApi.changeTodolistTitle(args)
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return args
        } catch (error) {
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(error)
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
  }),
})

export const { changeTodolistFilterAC, fetchTodolistsTC, createTodolistTC, deleteTodolistTC, changeTodolistTitleTC } =
  todolistsSlice.actions
export const { selectTodolists } = todolistsSlice.selectors
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"
