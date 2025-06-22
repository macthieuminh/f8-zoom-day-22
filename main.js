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
const tabButtons = $$(".tab-button")
let taskCards = $$(".task-card")

const currentTab = JSON.parse(localStorage.getItem("currentTab")) ?? "all"
const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? []
let editIndex = null, escKeydownHandler;
function openModal() {
    addTaskModal.className = "modal-overlay show"
    if(!escKeydownHandler) {
        escKeydownHandler = function (e) {
            if(e.key === "Esc" || e.key === "Escape") {
                closeModal()
            }
        }
    }
    document.body.addEventListener("keydown", escKeydownHandler)
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

    if (escKeydownHandler) {
        document.body.removeEventListener("keydown", escKeydownHandler)
    }
}
addBtn.onclick = openModal
modalCloseBtn.onclick = closeModal
btnCancel.onclick = closeModal

elementModalOverlay.onclick = function (event) {
    if (event.target === elementModalOverlay) {
        closeModal()
    }
}
function renderTasks(tasks = todoTasks) {
    if (!tasks.length) {
        todoList.innerHTML = `<p>Chưa có tasks</p>`
        return
    }

    const html = tasks
        .map(
            (task, index) => `
        <div class="task-card ${escapeHTML(task.color)} ${
                task.isCompleted ? "completed" : ""
            }">
        <div class="task-header">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
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
        <p class="task-description">${escapeHTML(task.description)}</p>
        <div class="task-time">${escapeHTML(task.startTime)} - ${escapeHTML(
                task.endTime
            )}</div>
      </div>
    `
        )
        .join("")

    todoList.innerHTML = html
}
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks))
}
function saveTab(filter) {
    localStorage.setItem("currentTab", JSON.stringify(filter))
}
todoForm.onsubmit = (event) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(todoForm))
    const taskTitle = $("#taskTitle")
    todoTasks.forEach((tab) => {
        tab = tab.title.toLowerCase()
        const formDataTitle = formData.title.toLowerCase()

        if (tab === formDataTitle) {
            alert("Bạn vừa nhập Title Task đã tồn tại, hãy thay đổi tên khác.")
            taskTitle.focus()
            taskTitle.style.outline = "1px solid red"
            taskTitle.oninput = function () {
                taskTitle.style.outline = "none"
            }
            popupToast(false)
            throw new Error("Cần thay đổi tên Task Title!")
        }
    })
    if (editIndex !== null) {
        todoTasks[editIndex] = formData
    } else {
        formData.isCompleted = false
        todoTasks.unshift(formData)
    }
    saveTasks()
    popupToast(true)
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

searchInput.oninput = function (e) {
    const keyword = e.target.value.trim().toLowerCase()
    if (!keyword) {
        renderTasks(todoTasks)
        const currentTab = JSON.parse(localStorage.getItem("currentTab")) ?? "all"
        filterTasks(currentTab)
        return
    }
    const filteredTasks = todoTasks.filter(
        (task) =>
            task.title.toLowerCase().includes(keyword) ||
            (task.description && task.description.toLowerCase().includes(keyword))
    )
    renderTasks(filteredTasks)
}

function escapeHTML(html) {
    const div = document.createElement("div")
    div.textContent = html
    return div.innerHTML
}
function filterTasks(filter) {
    let taskCards = $$(".task-card")

    taskCards.forEach((card) => {
        if (filter === "all") {
            card.classList.remove("hidden")
        } else if (filter === "undone") {
            card.classList.toggle("hidden", card.classList.contains("completed"))
        } else if (filter === "done") {
            card.classList.toggle("hidden", !card.classList.contains("completed"))
        }
    })
    saveTab(filter)
}
function renderTab() {
    let tabs = $(".tabs")
    tabs.innerHTML = `
        <div class="tab-list">
            <button class="tab-button all-tasks active">Tất cả task</button>
            <button class="tab-button undone-tasks">Task chưa hoàn thành</button>
            <button class="tab-button done-tasks">Task đã hoàn thành</button>
        </div>
    `
    const tabButtons = $$(".tab-button")
    const allTasks = $(".all-tasks")
    const undoneTasks = $(".undone-tasks")
    const doneTasks = $(".done-tasks")

    tabButtons.forEach((element) => {
        element.addEventListener("click", function () {
            tabButtons.forEach((btn) => btn.classList.remove("active"))
            this.classList.add("active")
        })
    })

    allTasks.addEventListener("click", () => filterTasks("all"))
    undoneTasks.addEventListener("click", () => filterTasks("undone"))
    doneTasks.addEventListener("click", () => filterTasks("done"))
}
function popupToast(status) {
    const toastContainer = $('#toast-container')
    const icon = document.createElement('i')
    const toast = document.createElement('div')
    icon.classList.add('icon','fa-solid', 'fa-2xl')
    toast.classList.add('toast')

    if(status)  {
        toast.classList.add('success')
        icon.classList.add('fa-circle-check')
        toast.innerText = "Thêm task thành công!"
    } else {
        toast.classList.add('error')
        icon.classList.add('fa-circle-xmark')
        toast.innerText = "Không thể thêm task!!" 

    }
    
    toast.classList.add(status)
    toast.appendChild(icon)

    toastContainer.appendChild(toast)

    setTimeout(() => {
    toast.remove();
    icon.remove();
    }, 3500);
}

renderTab()
renderTasks()
