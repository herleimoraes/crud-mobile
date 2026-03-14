// --- CONFIGURAÇÃO SUPABASE ---
const SB_URL = 'https://lttacidpajuwolumovpz.supabase.co'; 
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGFjaWRwYWp1d29sdW1vdnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDM0MzIsImV4cCI6MjA4OTA3OTQzMn0.wKQ0VLiEz8sZ-l2Z1bh8pmPB592l4pHyXaOdPXWZC74'; 
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- VARIÁVEIS GLOBAIS E MODAIS ---
const listaDiv = document.getElementById('listaClientes');
const modalFormEl = new bootstrap.Modal(document.getElementById('modalCliente'));
const modalDetalhesEl = new bootstrap.Modal(document.getElementById('modalDetalhes'));
const modalExclusaoEl = new bootstrap.Modal(document.getElementById('modalConfirmarExclusao'));
let clienteIdParaExcluir = null;

// --- READ: Carregar Clientes ---
async function carregarClientes() {
    const { data, error } = await _supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error(error);
        return alert("Erro ao buscar dados do Supabase!");
    }

    if (data.length === 0) {
        listaDiv.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-person-exclamation display-4"></i>
                <p>Nenhum cliente cadastrado.</p>
            </div>`;
        return;
    }

    listaDiv.innerHTML = data.map(c => `
        <div class="col-12">
            <div class="card card-cliente card-clicavel p-3" onclick="abrirDetalhes(${c.id}, '${c.nome}', '${c.email}')">
                <h6 class="mb-1 fw-bold ">${c.nome}</h6>
                <small class="text-muted"><i class="bi bi-envelope me-1"></i>${c.email}</small>
            </div>
        </div>
    `).join('');
}

// --- INTERFACE: Abrir Detalhes ---
function abrirDetalhes(id, nome, email) {
    document.getElementById('detalheNome').innerText = nome;
    document.getElementById('detalheEmail').innerText = email;
    
    document.getElementById('btnEditar').onclick = () => {
        modalDetalhesEl.hide();
        prepararEdicao(id, nome, email);
    };
    
    document.getElementById('btnDeletar').onclick = () => {
        modalDetalhesEl.hide();
        deletarCliente(id);
    };

    modalDetalhesEl.show();
}

// --- CREATE / UPDATE: Salvar Cliente ---
async function salvarCliente() {
    const id = document.getElementById('clienteId').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;

    if (!nome || !email) return alert("Preencha todos os campos!");

    let response;
    if (id) {
        response = await _supabase.from('clientes').update({ nome, email }).eq('id', id);
    } else {
        response = await _supabase.from('clientes').insert([{ nome, email }]);
    }

    if (response.error) {
        console.error(response.error);
        alert("Erro ao salvar!");
    } else {
        modalFormEl.hide();
        carregarClientes();
    }
}

// --- INTERFACE: Preparar Form ---
function limparForm() {
    document.getElementById('clienteId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('modalTitulo').innerText = 'Novo Cliente';
}

function prepararEdicao(id, nome, email) {
    document.getElementById('clienteId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('email').value = email;
    document.getElementById('modalTitulo').innerText = 'Editar Cliente';
    modalFormEl.show();
}

// --- DELETE: Preparar e Confirmar Exclusão ---
function deletarCliente(id) {
    clienteIdParaExcluir = id;
    modalExclusaoEl.show();
}

document.getElementById('btnAcaoExcluir').onclick = async () => {
    if (!clienteIdParaExcluir) return;

    const btn = document.getElementById('btnAcaoExcluir');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    btn.disabled = true;

    const { error } = await _supabase.from('clientes').delete().eq('id', clienteIdParaExcluir);

    btn.innerHTML = textoOriginal;
    btn.disabled = false;

    if (error) {
        console.error(error);
        alert("Erro ao deletar!");
    } else {
        modalExclusaoEl.hide();
        carregarClientes();
    }
};
// --- SISTEMA DE NAVEGAÇÃO SPA ---
function navegarPara(telaDestino) {
    // 1. Esconde todas as telas (adicionando a classe d-none do Bootstrap)
    document.querySelectorAll('.view-section').forEach(tela => {
        tela.classList.add('d-none');
    });

    // 2. Mostra a tela solicitada
    document.getElementById(`view-${telaDestino}`).classList.remove('d-none');

    // 3. Reseta as cores de todos os botões do menu inferior
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-primary');
        btn.classList.add('text-muted');
        btn.querySelector('span').classList.remove('fw-bold');
    });

    // 4. Pinta o botão clicado de azul (ativo)
    const btnAtivo = document.getElementById(`nav-${telaDestino}`);
    btnAtivo.classList.remove('text-muted');
    btnAtivo.classList.add('text-primary');
    btnAtivo.querySelector('span').classList.add('fw-bold');

    // 5. Muda o Título da barra superior
    const titulos = {
        'dashboard': 'Painel de Controle',
        'clientes': 'Meus Clientes',
        'ajustes': 'Configurações'
    };
    document.getElementById('headerTitulo').innerText = titulos[telaDestino];

    // 6. Esconde o Botão Flutuante (+) se não estiver na tela de clientes
    const btnFloat = document.querySelector('.btn-float');
    if (telaDestino === 'clientes') {
        btnFloat.style.display = 'flex';
    } else {
        btnFloat.style.display = 'none';
    }

    // 7. Ações Específicas: Se abriu o Dashboard, atualiza os números
    if (telaDestino === 'dashboard') {
        atualizarDashboard();
    }
}

// --- FUNÇÃO PARA ATUALIZAR DADOS DO DASHBOARD ---
function atualizarDashboard() {
    // Pega o número de itens na lista atual e joga no card azul
    const total = document.querySelectorAll('.card-cliente').length;
    document.getElementById('dashTotalClientes').innerText = total;
}
// --- INICIALIZAÇÃO ---
carregarClientes();

// --- MODO ESCURO (DARK MODE) ---
const themeSwitch = document.getElementById('themeSwitch');
const htmlElement = document.documentElement; // Pega a tag <html>

// 1. Verifica se o usuário já tinha escolhido o tema escuro antes
const temaSalvo = localStorage.getItem('tema_crud_clientes');
if (temaSalvo === 'dark') {
    htmlElement.setAttribute('data-bs-theme', 'dark');
    themeSwitch.checked = true; // Deixa a chavinha ligada
}

// 2. Escuta o clique no interruptor da tela de Ajustes
themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        // Ativa modo escuro e salva no celular/PC
        htmlElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('tema_crud_clientes', 'dark');
    } else {
        // Volta pro modo claro e salva
        htmlElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('tema_crud_clientes', 'light');
    }
});

// --- SISTEMA DE NOTIFICAÇÕES (TOAST) ---
function mostrarToast(mensagem, tipo = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMensagem = document.getElementById('toastMensagem');
    
    // Inicializa o Toast do Bootstrap com tempo de 3 segundos (3000ms)
    const toastInstancia = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });

    // Preenche o texto
    toastMensagem.innerText = mensagem;

    // Limpa cores anteriores e aplica a nova baseada no 'tipo'
    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning');
    toastEl.classList.add(`text-bg-${tipo}`);

    // Mostra na tela
    toastInstancia.show();
}
