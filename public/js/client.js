const ws = 'ws://localhost:3001';

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
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';

            tasks.forEach(task => {
                const item = document.createElement('li');
                item.innerText = `${task.title} (Vytvořil: ${task.created_by} dne ${task.created_at.substr(0, 10)})`;

                if (!task.is_completed) {
                    const completeButton = document.createElement('button');
                    completeButton.innerText = 'Dokončit';
                    completeButton.onclick = () => completeTask(task.task_id);
                    item.appendChild(completeButton);
                } else {
                    item.innerText += ` (Dokončil: ${task.assigned_name})`;
                }
                taskList.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}


function completeTask(taskId) {
    const token = localStorage.getItem('token');

    console.log("Task ID:", taskId);
    
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
            const orderSummary = document.getElementById("orderSummary");
            orderSummary.innerHTML = '';

            data.forEach(order => {
                const item = document.createElement("li");
                item.innerText = `${order.username} objednal: ${order.total_coffee}x Coffee, ${order.total_doppio}x Doppio+, ${order.total_espresso}x Espresso, ${order.total_long}x Long, ${order.total_milk}x Mléko`;
                orderSummary.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading summary:', error));
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
    loadTasks();
    getSummary();
});
