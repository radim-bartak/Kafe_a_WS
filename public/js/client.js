
let socket;

function initWebSocket() {
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
        console.log("WebSocket připojen.");
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "newOrder") {
            const order = message.order;
            addOrderToTerminal(order);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket chyba:", error);
    };

    socket.onclose = () => {
        console.warn("WebSocket odpojen. Pokouším se znovu připojit...");
        setTimeout(initWebSocket, 5000);
    };
}

function addOrderToTerminal(order) {
    const terminal = document.getElementById("terminal");

    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerText = `${order.created_at} | Uživatelské jméno: ${order.username} | Coffee: ${order.details.coffee}, Doppio: ${order.details.doppio}, Espresso: ${order.details.espresso}, Long: ${order.details.long}, Milk: ${order.details.milk}`;
    terminal.prepend(logEntry);
}

function addTask(title) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Nejste přihlášeni.");
        return;
    }

    fetch('http://localhost:3000/tasks/add_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, title }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Úkol přidán');
            loadTasks();
        }
    })
    .catch(error => console.error('Error:', error));
}

function loadTasks() {
    fetch('http://localhost:3000/tasks/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskTableBody = document.getElementById('taskList');
            taskTableBody.innerHTML = '';

            tasks.forEach(task => {
                const row = document.createElement('tr');

                const descriptionCell = document.createElement('td');
                descriptionCell.innerText = task.title;
                row.appendChild(descriptionCell);

                const createdByCell = document.createElement('td');
                createdByCell.innerText = task.created_by;
                row.appendChild(createdByCell);

                const takenByCell = document.createElement('td');
                takenByCell.innerText = task.assigned_name || 'Nikdo';
                row.appendChild(takenByCell);

                const dateCell = document.createElement('td');
                dateCell.innerText = task.created_at.substr(0, 10);
                row.appendChild(dateCell);

                const statusCell = document.createElement('td');
                statusCell.innerText = task.is_completed ? 'Dokončeno' : 'Nedokončeno';
                row.appendChild(statusCell);

                const actionCell = document.createElement('td');
                
                if (!task.assigned_name && !task.is_completed) {
                    const assignButton = document.createElement('button');
                    assignButton.innerText = 'Převzít';
                    assignButton.onclick = () => assignTask(task.task_id);
                    actionCell.appendChild(assignButton);
                }

                if (task.assigned_name && !task.is_completed) {
                    const completeButton = document.createElement('button');
                    completeButton.innerText = 'Dokončit';
                    completeButton.onclick = () => completeTask(task.task_id);
                    actionCell.appendChild(completeButton);
                }
                row.appendChild(actionCell);

                taskTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}

function completeTask(taskId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Nejste přihlášeni.");
        return;
    }

    fetch('http://localhost:3000/tasks/complete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, task_id: taskId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            loadTasks(); 
        }
    })
    .catch(error => console.error('Error completing task:', error));
}

function assignTask(taskId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Nejste přihlášeni.");
        return;
    }

    fetch('http://localhost:3000/tasks/assign_task', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, task_id: taskId }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                loadTasks(); 
            }
        })
        .catch((error) => console.error("Error assigning task:", error));
}

function clearTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Nejste přihlášeni.");
        return;
    }

    fetch('http://localhost:3000/tasks/clear_tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            loadTasks();
        }
    })
    .catch(error => console.error('Error clearing tasks:', error));
}

function submitOrder() {
    const coffee = document.getElementById("coffee").value;
    const doppio = document.getElementById("doppio").value;
    const espresso = document.getElementById("espresso").value;
    const long = document.getElementById("long").value;
    const milk = document.getElementById("milk").value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Nejste přihlášeni.");
        return;
    }

    fetch('http://localhost:3000/orders/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token,
            coffee: parseInt(coffee),
            doppio: parseInt(doppio),
            espresso: parseInt(espresso),
            long: parseInt(long),
            milk: parseInt(milk)
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Objednávka úspěšně odeslána.");
            getSummary();
        }
    })
    .catch(error => console.error('Error submitting order:', error));
}

function getSummary() {
    fetch('http://localhost:3000/orders/summary')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('orderSummary');
            tableBody.innerHTML = '';

            data.forEach(order => {
                const row = document.createElement('tr');

                const userCell = document.createElement('td');
                userCell.textContent = order.username;
                row.appendChild(userCell);

                const coffeeCell = document.createElement('td');
                coffeeCell.textContent = `${order.total_coffee}x`;
                row.appendChild(coffeeCell);

                const doppioCell = document.createElement('td');
                doppioCell.textContent = `${order.total_doppio}x`;
                row.appendChild(doppioCell);

                const espressoCell = document.createElement('td');
                espressoCell.textContent = `${order.total_espresso}x`;
                row.appendChild(espressoCell);

                const longCell = document.createElement('td');
                longCell.textContent = `${order.total_long}x`;
                row.appendChild(longCell);

                const milkCell = document.createElement('td');
                milkCell.textContent = `${order.total_milk}x`;
                row.appendChild(milkCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading summary:', error));
}

function loadOrders() {
    fetch("http://localhost:3000/orders/all")
        .then((response) => response.json())
        .then((orders) => {
            const terminal = document.getElementById("terminal");
            terminal.innerHTML = "";

            if (orders.length === 0) {
                terminal.innerHTML = "<p>Žádné objednávky nebyly nalezeny.</p>";
                return;
            }

            orders.forEach((order) => {
                addOrderToTerminal({
                    username: order.username,
                    created_at: order.created_at,
                    details: {
                        coffee: order.coffee_count,
                        doppio: order.doppio_count,
                        espresso: order.espresso_count,
                        long: order.long_count,
                        milk: order.milk_count,
                    },
                });
            });
        })
        .catch((error) => {
            console.error("Chyba při načítání objednávek:", error);
            const terminal = document.getElementById("terminal");
            terminal.innerHTML = "<p>Chyba při načítání objednávek.</p>";
        });
}

function updateSliderValue(type) {
    const slider = document.getElementById(type);
    const valueDisplay = document.getElementById(`${type}Value`);
    valueDisplay.innerText = slider.value;
}

function generateQRCode() {
    const registrationUrl = "http://localhost:3000/register.html";
    
    fetch('http://localhost:3000/generate_qr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: registrationUrl }),
    })
    .then(response => response.json())
    .then(data => {
        const qrMessage = document.getElementById("qrMessage");
        qrMessage.innerText = 'QR kód a odkaz:';
        qrMessage.style.display = 'block';
        
        const qrImage = document.createElement("img");
        qrImage.src = data.url;
        document.getElementById("coffeeQR").appendChild(qrImage);
        const qrLink = document.createElement("a");
        qrLink.href = registrationUrl;
        qrLink.innerText = registrationUrl;
        qrLink.target = "_blank";
        document.getElementById("coffeeQR").appendChild(qrLink);
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
    loadTasks();
    loadOrders();
    getSummary();
});