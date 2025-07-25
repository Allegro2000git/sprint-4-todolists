import { createTodolistTC, deleteTodolistTC } from "./todolists-slice.ts"
import {
  DomainTask,
  getTasksShema,
  taskOperationResponseSchema,
  type UpdateTaskModel,
} from "@/features/todolists/api/tasksApi.types.ts"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi"
import { changeStatusAC } from "@/app/app-slice"
import { ResultCode } from "@/common/enums"
import { handleServerError } from "@/common/utils/handleServerError"
import { handleAppError } from "@/common/utils/handleAppError"
import { defaultResponseSchema } from "@/common/types"

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  selectors: {
    selectTasks: (state) => state,
  },
  reducers: (create) => ({
    fetchTasksTC: create.asyncThunk(
      async (todolistId: string, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await tasksApi.getTasks(todolistId)
          getTasksShema.parse(res.data) // zod
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return { todolistId, tasks: res.data.items }
        } catch (err) {
          handleServerError(err, thunkAPI.dispatch)
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
    createTaskTC: create.asyncThunk(
      async (args: { todolistId: string; title: string }, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await tasksApi.createTask(args)
          taskOperationResponseSchema.parse(res.data) // zod
          if (res.data.resultCode === ResultCode.Success) {
            thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
            return { task: res.data.data.item }
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
          state[action.payload.task.todoListId].unshift(action.payload.task)
        },
      },
    ),
    deleteTaskTC: create.asyncThunk(
      async (args: { todolistId: string; taskId: string }, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await tasksApi.deleteTask(args)
          defaultResponseSchema.parse(res.data) // zod
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
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex((task) => task.id === action.payload.taskId)
          if (index !== -1) {
            tasks.splice(index, 1)
          }
        },
      },
    ),
    updateTaskTC: create.asyncThunk(
      async (task: DomainTask, thunkAPI) => {
        try {
          const model: UpdateTaskModel = {
            status: task.status,
            description: task.description,
            title: task.title,
            deadline: task.deadline,
            startDate: task.startDate,
            priority: task.priority,
          }

          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          const res = await tasksApi.updateTask({ todolistId: task.todoListId, taskId: task.id, model })
          taskOperationResponseSchema.parse(res.data) // zod
          if (res.data.resultCode === ResultCode.Success) {
            thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
            return { task: res.data.data.item }
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
          const index = state[action.payload.task.todoListId].findIndex((task) => task.id === action.payload.task.id)
          if (index !== -1) {
            state[action.payload.task.todoListId][index] = action.payload.task
          }
        },
      },
    ),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
  },
})

export const { fetchTasksTC, deleteTaskTC, createTaskTC, updateTaskTC } = tasksSlice.actions
export const { selectTasks } = tasksSlice.selectors
export const tasksReducer = tasksSlice.reducer

export type TasksState = Record<string, DomainTask[]>
