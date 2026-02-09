<template>
  <section>
    <div class="container mt-5 p-4">
      <h1 class="text-center mb-4">To-Do List</h1>
      
      <!-- Add Task Section -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="input-group">
            <input 
              v-model="newTask" 
              type="text" 
              class="form-control" 
              placeholder="Enter a new task..."
              @keyup.enter="addTask"
            >
            <button 
              class="btn btn-primary" 
              @click="addTask"
              :disabled="!newTask.trim()"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Your Tasks</h5>
        </div>
        <div class="card-body">
          <div v-if="tasks.length === 0" class="text-center text-muted py-4">
            <p>No tasks yet. Add your first task above!</p>
          </div>
          
          <ul v-else class="list-group">
            <li 
              v-for="(task, index) in tasks" 
              :key="task.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div class="flex-grow-1">
                <span :class="{ 'fw-bold': task.priority === 'high' }">
                  {{ task.text }}
                  <span v-if="task.priority === 'high'" class="text-danger">
                    (High Priority)
                  </span>
                  <span v-else class="text-success">
                    (Low Priority)
                  </span>
                </span>
              </div>
              
              <div class="btn-group" role="group">
                <button 
                  class="btn btn-sm"
                  :class="task.priority === 'high' ? 'btn-warning' : 'btn-outline-warning'"
                  @click="togglePriority(index)"
                >
                  {{ task.priority === 'high' ? 'Mark as Low Priority' : 'Mark as High Priority' }}
                </button>
                <button 
                  class="btn btn-sm btn-danger"
                  @click="deleteTask(index)"
                >
                  Delete
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ToDoList',
  setup() {
    const newTask = ref('')
    const tasks = ref([])

    const addTask = () => {
      if (newTask.value.trim()) {
        tasks.value.unshift({
          id: Date.now(),
          text: newTask.value.trim(),
          priority: 'low' // Default priority
        })
        newTask.value = ''
      }
    }

    const deleteTask = (index) => {
      tasks.value.splice(index, 1)
    }

    const togglePriority = (index) => {
      tasks.value[index].priority = tasks.value[index].priority === 'high' ? 'low' : 'high'
    }

    return {
      newTask,
      tasks,
      addTask,
      deleteTask,
      togglePriority
    }
  }
}
</script>

<style scoped>
section{
    margin-top: 6rem;

    min-height: 100vh;
}

.list-group-item {
  border-left: 4px solid #dee2e6;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  border-left-color: #007bff;
}

.btn-group .btn {
  margin-left: 0.25rem;
}

.text-danger {
  font-weight: bold;
}

.text-success {
  font-weight: normal;
}
</style>