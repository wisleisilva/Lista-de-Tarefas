// Função para adicionar tarefa
function addTask(taskText, date = new Date(), completed = false) {
    if (taskText.trim() !== '') {
        const taskList = document.getElementById('taskList');

        // Cria um novo item da lista
        const li = document.createElement('li');
        if (completed) {
            li.classList.add('completed'); // Marca como concluída, se necessário
        }

        // Adiciona o texto da tarefa
        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;
        li.appendChild(taskSpan);

        // Adiciona a data da tarefa
        const taskDate = document.createElement('span');
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; // Formata a data como dd/mm/aaaa
        taskDate.textContent = ` ${formattedDate}`;
        taskDate.classList.add('task-date');
        li.appendChild(taskDate);

        // Botão "Concluído"
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Concluído';
        completeBtn.classList.add('completeBtn');
        completeBtn.addEventListener('click', function () {
            li.classList.toggle('completed');
            if (li.classList.contains('completed')) {
                // Move a tarefa concluída para o final da lista
                taskList.appendChild(li);
            }
            saveTasks(); // Salva as tarefas após marcar como concluída
        });
        li.appendChild(completeBtn);

        // Botão "Excluir"
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.addEventListener('click', function () {
            taskList.removeChild(li);
            saveTasks(); // Salva as tarefas após excluir
        });
        li.appendChild(deleteBtn);

        // Adiciona a tarefa à lista
        taskList.appendChild(li);

        // Salva as tarefas no localStorage
        saveTasks();
    }
}

// Função para salvar as tarefas no localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(task => {
        const taskDate = task.querySelector('.task-date').textContent.trim(); // Pega a data formatada (dd/mm/aaaa)
        const [day, month, year] = taskDate.split('/'); // Divide a data em dia, mês e ano
        const date = new Date(year, month - 1, day); // Converte para objeto Date

        tasks.push({
            text: task.querySelector('span').textContent,
            completed: task.classList.contains('completed'), // Salva o estado de conclusão
            date: date.toISOString() // Salva a data como string ISO
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para carregar as tarefas do localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Ordena as tarefas: não concluídas primeiro, concluídas por último
    tasks.sort((a, b) => a.completed - b.completed);

    // Adiciona as tarefas à lista na ordem correta
    tasks.forEach(task => {
        const date = new Date(task.date); // Converte a string ISO de volta para objeto Date
        addTask(task.text, date, task.completed); // Passa o estado de conclusão ao adicionar a tarefa
    });
}

// Função para excluir todas as tarefas
function deleteAllTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Remove todas as tarefas da lista
    localStorage.removeItem('tasks'); // Remove as tarefas do localStorage
}

// Função para gerar o relatório mensal
function generateMonthlyReport() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const report = {};

    // Organiza as tarefas por mês
    tasks.forEach(task => {
        const date = new Date(task.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; // Formato: MM/AAAA

        if (!report[monthYear]) {
            report[monthYear] = { total: 0, completed: 0 };
        }

        report[monthYear].total += 1; // Incrementa o total de tarefas
        if (task.completed) {
            report[monthYear].completed += 1; // Incrementa o total de tarefas concluídas
        }
    });

    // Exibe o relatório
    const reportContainer = document.getElementById('report');
    reportContainer.innerHTML = ''; // Limpa o conteúdo anterior

    for (const [monthYear, data] of Object.entries(report)) {
        const reportItem = document.createElement('div');
        reportItem.classList.add('report-item');

        const title = document.createElement('h3');
        title.textContent = `Mês: ${monthYear}`;
        reportItem.appendChild(title);

        const totalTasks = document.createElement('p');
        totalTasks.textContent = `Total de tarefas: ${data.total}`;
        reportItem.appendChild(totalTasks);

        const completedTasks = document.createElement('p');
        completedTasks.textContent = `Tarefas concluídas: ${data.completed}`;
        reportItem.appendChild(completedTasks);

        reportContainer.appendChild(reportItem);
    }

    // Mostra o botão de imprimir
    document.getElementById('printReportBtn').style.display = 'block';
}

// Função para imprimir o relatório
function printReport() {
    const reportContent = document.getElementById('report').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
            <head>
                <title>Relatório Mensal de Tarefas</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .report-item { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
                    .report-item h3 { margin: 0 0 10px 0; font-size: 1.2em; color: #333; }
                    .report-item p { margin: 0; color: #666; }
                </style>
            </head>
            <body>
                <h1>Relatório Mensal de Tarefas</h1>
                ${reportContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Adicionar tarefa ao clicar no botão "Inserir"
document.getElementById('addTaskBtn').addEventListener('click', function () {
    const taskInput = document.getElementById('taskInput');
    addTask(taskInput.value);
    taskInput.value = ''; // Limpa o campo de entrada
});

// Adicionar tarefa ao pressionar "Enter" no campo de entrada
document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const taskInput = document.getElementById('taskInput');
        addTask(taskInput.value);
        taskInput.value = ''; // Limpa o campo de entrada
    }
});

// Carregar tarefas ao abrir a página
document.addEventListener('DOMContentLoaded', loadTasks);

// Importar tarefas de um arquivo .txt
document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('fileInput').click(); // Abre o seletor de arquivos
});

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            const tasks = content.split('\n'); // Divide o conteúdo em linhas
            tasks.forEach(task => {
                if (task.trim() !== '') {
                    addTask(task.trim()); // Adiciona cada tarefa à lista
                }
            });
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo .txt válido.');
    }
});

// Gerar relatório mensal
document.getElementById('generateReportBtn').addEventListener('click', generateMonthlyReport);

// Imprimir relatório
document.getElementById('printReportBtn').addEventListener('click', printReport);

// Excluir todas as tarefas
document.getElementById('deleteAllBtn').addEventListener('click', deleteAllTasks);