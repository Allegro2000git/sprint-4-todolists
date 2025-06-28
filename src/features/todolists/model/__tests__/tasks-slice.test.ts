import { beforeEach, expect, test } from "vitest"
import { createTaskTC, deleteTaskTC, tasksReducer, type TasksState, updateTaskTC } from "../tasks-slice.ts"
import { TaskPriority, TaskStatus } from "@/common/enums"
import { createTodolistTC, deleteTodolistTC } from "@/features/todolists/model/todolists-slice"
import { nanoid } from "@reduxjs/toolkit"

let startState: TasksState = {}

const taskDefaultValues = {
  description: "",
  deadline: "",
  addedDate: "",
  startDate: "",
  priority: TaskPriority.Low,
  order: 0,
}

beforeEach(() => {
  startState = {
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatus.Completed,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "React",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "milk",
        status: TaskStatus.Completed,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
    ],
  }
})

test("correct task should be deleted", () => {
  const endState = tasksReducer(
    startState,
    deleteTaskTC.fulfilled({ todolistId: "todolistId2", taskId: "2" }, "requiredId", {
      todolistId: "todolistId2",
      taskId: "2",
    }),
  )

  expect(endState).toEqual({
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatus.Completed,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
      },
      {
        id: "3",
        title: "React",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId2",
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId2",
      },
    ],
  })
})

test("correct task should be created at correct array", () => {
  const task = {
    id: nanoid(),
    title: "juice",
    status: TaskStatus.New,
    description: "",
    deadline: "",
    addedDate: "",
    startDate: "",
    priority: TaskPriority.Low,
    order: 0,
    todoListId: "todolistId2",
  }

  const endState = tasksReducer(
    startState,
    createTaskTC.fulfilled({ task }, "requiredId", { todolistId: "todolistId2", title: "juice" }),
  )

  expect(endState.todolistId1.length).toBe(3)
  expect(endState.todolistId2.length).toBe(4)
  expect(endState.todolistId2[0].id).toBeDefined()
  expect(endState.todolistId2[0].title).toBe("juice")
  expect(endState.todolistId2[0].status).toBe(TaskStatus.New)
})

test("correct task should change its status", () => {
  const endState = tasksReducer(
    startState,
    updateTaskTC.fulfilled(
      {
        task: { ...taskDefaultValues, todoListId: "todolistId2", id: "2", status: TaskStatus.New, title: "milk" },
      },
      "requestId",
      startState["todolistId2"][1],
    ),
  )
  expect(endState.todolistId2[0].status).toBe(TaskStatus.New)
  expect(endState.todolistId2[1].status).toBe(TaskStatus.New)
})

test("correct task should change its title", () => {
  const endState = tasksReducer(
    startState,
    updateTaskTC.fulfilled(
      { task: { ...taskDefaultValues, todoListId: "todolistId1", id: "1", title: "TS", status: TaskStatus.New } },
      "requestId",
      startState["todolistId1"][0],
    ),
  )
  console.log(endState)
  expect(endState.todolistId1[0].title).toBe("TS")
  expect(endState.todolistId1[1].title).toBe("JS")
})

test("array should be created for new todolist", () => {
  const title = "New todolist"
  const todolist = { id: "todolistId3", title, addedDate: "", order: 0 }
  const endState = tasksReducer(startState, createTodolistTC.fulfilled({ todolist }, "requestId", title))

  const keys = Object.keys(endState)
  const newKey = keys.find((k) => k !== "todolistId1" && k !== "todolistId2")
  if (!newKey) {
    throw Error("New key should be added")
  }

  expect(keys.length).toBe(3)
  expect(endState[newKey]).toEqual([])
})

test("property with todolistId should be deleted", () => {
  const endState = tasksReducer(
    startState,
    deleteTodolistTC.fulfilled({ todolistId: "todolistId2" }, "requestId", "todolistId2"),
  )

  const keys = Object.keys(endState)

  expect(keys.length).toBe(1)
  expect(endState["todolistId2"]).toBeUndefined()
})
