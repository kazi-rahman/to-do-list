
        // Get DOM elements
        const newTaskInput = document.getElementById('newTaskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const columns = document.querySelectorAll('.drop-zone');
        const todoColumn = document.getElementById('todo');

        // --- Task Creation ---
        let taskIdCounter = 0; // Simple counter for unique IDs

        // Function to create a new task element
        function createTaskElement(taskText) {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task-card', 'draggable');
            taskDiv.setAttribute('draggable', 'true');
            taskDiv.id = `task-${taskIdCounter++}`; // Assign a unique ID

            const taskContent = document.createElement('span');
            taskContent.textContent = taskText;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕'; // Simple 'x' for delete
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => {
                taskDiv.remove(); // Remove the task when delete is clicked
                saveTasks(); // Update local storage
            };

            taskDiv.appendChild(taskContent);
            taskDiv.appendChild(deleteBtn);


            // Add drag event listeners to the new task
            taskDiv.addEventListener('dragstart', handleDragStart);
            taskDiv.addEventListener('dragend', handleDragEnd);

            return taskDiv;
        }

        // Function to add a new task to the 'To Do' column
        function addTask() {
            const taskText = newTaskInput.value.trim();
            if (taskText) {
                const taskElement = createTaskElement(taskText);
                todoColumn.appendChild(taskElement);
                newTaskInput.value = ''; // Clear the input field
                saveTasks(); // Save tasks after adding
            } else {
                // Optional: Provide feedback if input is empty
                alert('Please enter a task description.');
            }
        }

        // Event listener for the 'Add Task' button
        addTaskBtn.addEventListener('click', addTask);

        // Event listener for pressing Enter in the input field
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // --- Drag and Drop Functionality ---
        let draggedItem = null; // Variable to store the item being dragged

        // Function called when dragging starts
        function handleDragStart(event) {
            draggedItem = event.target; // Store the dragged element
            // Optional: Add a class for visual feedback during drag
            setTimeout(() => event.target.classList.add('opacity-50'), 0);
        }

        // Function called when dragging ends
        function handleDragEnd(event) {
            // Optional: Remove the visual feedback class
            event.target.classList.remove('opacity-50');
            draggedItem = null; // Clear the stored item
            saveTasks(); // Save tasks after dropping
        }

        // Add event listeners to each column (drop zone)
        columns.forEach(column => {
            // Prevent default behavior to allow dropping
            column.addEventListener('dragover', (event) => {
                event.preventDefault();
                // Add visual feedback when dragging over a drop zone
                if (event.target.classList.contains('drop-zone')) {
                     event.target.classList.add('drag-over');
                }
            });

            // Remove visual feedback when dragging leaves a drop zone
            column.addEventListener('dragleave', (event) => {
                 if (event.target.classList.contains('drop-zone')) {
                    event.target.classList.remove('drag-over');
                 }
            });

            // Handle the drop event
            column.addEventListener('drop', (event) => {
                event.preventDefault();
                 if (event.target.classList.contains('drop-zone')) {
                    event.target.classList.remove('drag-over'); // Remove visual feedback
                    if (draggedItem) {
                        const previousColumnId = draggedItem.parentElement.id;
                        event.target.appendChild(draggedItem); // Append the dragged item to the new column

                        // --- Confetti Trigger ---
                        // Check if the task was dropped into the 'Done' column
                        if (event.target.id === 'done' && previousColumnId !== 'done') {
                            triggerConfetti();
                        }
                    }
                 }
            });
        });

        // --- Confetti Animation ---
        const confettiCanvas = document.getElementById('confetti-canvas');
        const myConfetti = confetti.create(confettiCanvas, {
            resize: true, // Resize confetti canvas with window
            useWorker: true // Use worker thread for better performance
        });

        function triggerConfetti() {
            myConfetti({
                particleCount: 150, // Number of confetti particles
                spread: 90,       // How wide the confetti spreads
                origin: { y: 0.6 } // Start confetti slightly below the top
            });
        }

        // --- Local Storage for Persistence ---
        function saveTasks() {
            const tasks = {};
            columns.forEach(column => {
                tasks[column.id] = [];
                column.querySelectorAll('.task-card').forEach(task => {
                    // Store only the text content, excluding the delete button text
                    const taskText = task.querySelector('span').textContent;
                    tasks[column.id].push(taskText);
                });
            });
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        }

        function loadTasks() {
            const savedTasks = localStorage.getItem('kanbanTasks');
            if (savedTasks) {
                const tasks = JSON.parse(savedTasks);
                // Clear existing tasks before loading (optional, prevents duplicates on refresh if not handled carefully)
                // columns.forEach(column => column.innerHTML = '');

                Object.keys(tasks).forEach(columnId => {
                    const column = document.getElementById(columnId);
                    if (column) {
                         // Clear column before adding saved tasks to prevent duplicates on load
                        column.innerHTML = '';
                        tasks[columnId].forEach(taskText => {
                            const taskElement = createTaskElement(taskText);
                            column.appendChild(taskElement);
                        });
                    }
                });
                 // Recalculate taskIdCounter based on loaded tasks to avoid ID conflicts
                taskIdCounter = document.querySelectorAll('.task-card').length;
            }
        }

        // Load tasks when the page loads
        document.addEventListener('DOMContentLoaded', loadTasks);

