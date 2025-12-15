// === HORÁRIOS DISPONÍVEIS POR DIA DA SEMANA ===
const agenda = {
    "Segunda-feira": [],
    "Terça-feira": ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],
    "Quarta-feira": ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],
    "Quinta-feira": ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],
    "Sexta-feira": ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],
    "Sábado": ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],
};

// === CONFIGURAR DATA MÍNIMA (HOJE) ===
const inputData = document.getElementById("data");
let hoje = new Date();
let hojeFormatado = hoje.toISOString().split("T")[0];
inputData.setAttribute("min", hojeFormatado);

// === LOCAL STORAGE ===
const storageKey = "horariosReservados";

// Função para limpar reservas antigas (dias passados)
function limparReservasAntigas() {
    const armazenado = JSON.parse(localStorage.getItem(storageKey)) || {};
    const novaLista = {};
    const hojeStr = hojeFormatado;

    for (let data in armazenado) {
        if (data >= hojeStr) { 
            novaLista[data] = armazenado[data];
        }
    }

    localStorage.setItem(storageKey, JSON.stringify(novaLista));
}
limparReservasAntigas();

// === FUNÇÃO PARA OBTER DIA DA SEMANA ===
function getDiaSemana(dataStr) {
    const dias = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
    const data = new Date(dataStr + "T00:00");
    return dias[data.getDay()];
}

// === QUANDO O USUÁRIO ESCOLHER UMA DATA ===
inputData.addEventListener("change", function () {
    const diaSelecionado = getDiaSemana(this.value);
    let horariosDisponiveis = [...agenda[diaSelecionado]];

    // Carrega reservas do localStorage
    const reservados = JSON.parse(localStorage.getItem(storageKey)) || {};
    if (reservados[this.value]) {
        horariosDisponiveis = horariosDisponiveis.filter(h => !reservados[this.value].includes(h));
    }

    const diasContainer = document.getElementById("diasContainer");
    diasContainer.innerHTML = "";

    if (!horariosDisponiveis.length) {
        diasContainer.innerHTML = `<p style="text-align:center; color:red;">Não há horários disponíveis para ${diaSelecionado}.</p>`;
        return;
    }

    const divDia = document.createElement("div");
    divDia.classList.add("dia");

    const titulo = document.createElement("h4");
    titulo.innerText = `Horários para ${diaSelecionado}`;
    divDia.appendChild(titulo);

    const horariosDiv = document.createElement("div");
    horariosDiv.classList.add("horarios");

    horariosDisponiveis.forEach(hora => {
        const botaoHora = document.createElement("div");
        botaoHora.classList.add("horario");
        botaoHora.innerText = hora;

        // Preenche automaticamente o input time
        botaoHora.addEventListener("click", () => {
            document.getElementById("hora").value = hora;
        });

        horariosDiv.appendChild(botaoHora);
    });

    divDia.appendChild(horariosDiv);
    diasContainer.appendChild(divDia);
});

// === CARRINHO DE SERVIÇOS ===
const itensCarrinho = document.getElementById("itensCarrinho");
const totalEl = document.getElementById("total");
let carrinho = [];

document.querySelectorAll(".servico-item").forEach(item => {
    item.addEventListener("click", () => {
        const nome = item.getAttribute("data-nome");
        const preco = parseFloat(item.getAttribute("data-preco"));

        // adiciona no carrinho
        carrinho.push({ nome, preco });

        // renderiza carrinho
        renderCarrinho();
    });
});

function renderCarrinho() {
    itensCarrinho.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.nome} - R$${item.preco}`;
        
        // opção de remover item
        li.addEventListener("click", () => {
            carrinho.splice(index, 1);
            renderCarrinho();
        });

        itensCarrinho.appendChild(li);
        total += item.preco;
    });

    totalEl.textContent = `Total: R$${total}`;
}

// === FORMULÁRIO PARA WHATSAPP (COM BLOQUEIO DE HORÁRIO) ===
document.getElementById("formAgendamento").addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;
    const barbeiroSelect = document.getElementById("seubarbeiro");
    const barbeiro = barbeiroSelect.options[barbeiroSelect.selectedIndex].text;

    // validação carrinho
    if (carrinho.length === 0) {
        alert("Por favor, selecione pelo menos um serviço.");
        return;
    }

    // validação horário
    if (!hora) {
        alert("Por favor, escolha um horário disponível na agenda.");
        return;
    }

    // serviços escolhidos + total
    const servicosTexto = carrinho.map(item => `${item.nome} (R$${item.preco})`).join(", ");
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

    // === BLOQUEIA HORÁRIO NO LOCALSTORAGE ===
    const reservados = JSON.parse(localStorage.getItem(storageKey)) || {};
    if (!reservados[data]) reservados[data] = [];
    reservados[data].push(hora);
    localStorage.setItem(storageKey, JSON.stringify(reservados));

    // Atualiza a agenda
    inputData.dispatchEvent(new Event("change"));

    // === Mensagem WhatsApp ===
    const mensagem = `Gostaria de fazer uma reserva! \n
*Meu nome:* ${nome} 
*Serviços:* ${servicosTexto}
*Total:* R$${total}
*Data:* ${data} 
*Horário:* ${hora} 
*Barbeiro:* ${barbeiro} \n
*Telefone:* ${telefone}`;

    const numeroBarbearia = "5521987902255";
    const url = `https://api.whatsapp.com/send?phone=${numeroBarbearia}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
});
