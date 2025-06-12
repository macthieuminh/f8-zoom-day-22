const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const addBtn = $(".add-btn")
const addTaskModal = $("#addTaskModal")
const modalCloseBtn = $(".modal-close")
const btnCancel = $(".btn-cancel")
const elementModalOverlay = $(".modal-overlay")
const todoForm = $(".todo-app-form")
const todoList = $("#todoList")
const titleInput = $("#taskTitle")
const searchInput = $(".search-input")

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? []
let editIndex = null
function openModal() {
    addTaskModal.className = "modal-overlay show"

    setTimeout(() => {
        titleInput.focus()
    }, 100)
}
function closeModal() {
    addTaskModal.className = "modal-overlay"

    const formTitle = addTaskModal.querySelector(".modal-title")
    if (formTitle) {
        formTitle.textContent = formTitle.dataset.original || formTitle.textContent
        delete formTitle.dataset.original
    }

    const submitBtn = addTaskModal.querySelector(".btn-submit")
    if (submitBtn) {
        submitBtn.textContent = submitBtn.dataset.original || submitBtn.textContent
        delete submitBtn.dataset.original
    }
    setTimeout(() => {
        addTaskModal.querySelector(".modal").scrollTop = 0
    }, 100)
    todoForm.reset()
    editIndex = null
}
addBtn.onclick = openModal
modalCloseBtn.onclick = closeModal
btnCancel.onclick = closeModal

elementModalOverlay.onclick = function (event) {
    if (event.target === elementModalOverlay) {
        closeModal()
    }
}
function renderTasks() {
    if (!todoTasks.length) {
        todoList.innerHTML = `<p>Chưa có tasks</p>`
        return
    }

    const html = todoTasks
        .map(
            (task, index) => `
        <div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <button class="task-menu">
            <i class="fa-solid fa-ellipsis fa-icon"></i>
            <div class="dropdown-menu">
              <div class="dropdown-item edit-btn" data-index="${index}">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
              </div>
              <div class="dropdown-item complete-btn" data-index="${index}">
                <i class="fa-solid fa-check fa-icon"></i>
                ${task.isCompleted ? "Mark as Active" : "Mark as Complete"} 
              </div>
              <div class="dropdown-item delete delete-btn" data-index="${index}">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
              </div>
            </div>
          </button>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-time">${task.startTime} - ${task.endTime}</div>
      </div>
    `
        )
        .join("")

    todoList.innerHTML = html
}
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks))
}
todoForm.onsubmit = (event) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(todoForm))

    if (editIndex !== null) {
        todoTasks[editIndex] = formData
    } else {
        formData.isCompleted = false
        todoTasks.unshift(formData)
    }
    saveTasks()
    closeModal()
    renderTasks()
}
todoList.onclick = function (event) {
    const editBtn = event.target.closest(".edit-btn")
    const deleteBtn = event.target.closest(".delete-btn")
    const completeBtn = event.target.closest(".complete-btn")

    if (editBtn) {
        const taskIndex = editBtn.dataset.index
        const task = todoTasks[taskIndex]

        editIndex = Number(taskIndex)

        for (const key in task) {
            const value = task[key]
            const input = $(`[name="${key}"]`)
            if (input) {
                input.value = value
            }
        }

        const formTitle = addTaskModal.querySelector(".modal-title")
        if (formTitle) {
            formTitle.dataset.original = formTitle.textContent
            formTitle.textContent = "Edit Task"
        }

        const submitBtn = addTaskModal.querySelector(".btn-submit")
        if (submitBtn) {
            submitBtn.dataset.original = submitBtn.textContent
            submitBtn.textContent = "Save Task"
        }

        openModal()
    }
    if (deleteBtn) {
        const taskIndex = deleteBtn.dataset.index
        const task = todoTasks[taskIndex]
        if (confirm(`Chắc chắn sẽ xóa công việc "${task.title}" chứ ?`)) {
            todoTasks.splice(taskIndex, 1)
            saveTasks()
            renderTasks()
        }
    }
    if (completeBtn) {
        const taskIndex = completeBtn.dataset.index
        const task = todoTasks[taskIndex]
        task.isCompleted = !task.isCompleted
        saveTasks()
        renderTasks()
    }
}
renderTasks()
