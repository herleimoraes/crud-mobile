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

    // Substitua o trecho do listaDiv.innerHTML dentro de carregarClientes()
listaDiv.innerHTML = data.map(c => `
    <div class="col-12">
        <div class="card card-cliente card-clicavel p-3" onclick='abrirDetalhes(${JSON.stringify(c)})'>
            <h6 class="mb-1 fw-bold text-dark">${c.nome}</h6>
            <small class="text-muted"><i class="bi bi-envelope me-1"></i>${c.email || 'Sem e-mail'}</small>
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

// --- INTEGRAÇÃO VIACEP (PREENCHIMENTO AUTOMÁTICO) ---
async function buscarCEP() {
    // Pega o valor e tira tudo que não for número (ex: tira o traço)
    let cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    // Se não tiver 8 números, ele ignora
    if (cep.length !== 8) return;

    // Feedback visual enquanto carrega
    document.getElementById('rua').value = 'Buscando...';
    document.getElementById('bairro').value = 'Buscando...';
    document.getElementById('cidade').value = 'Buscando...';
    document.getElementById('uf').value = '...';

    try {
        let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let data = await response.json();

        if (data.erro) {
            mostrarToast("CEP não encontrado!", "warning");
            document.getElementById('rua').value = '';
            document.getElementById('bairro').value = '';
            document.getElementById('cidade').value = '';
            document.getElementById('uf').value = '';
            return;
        }

        // Preenche os campos magicamente
        document.getElementById('rua').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('uf').value = data.uf;

        mostrarToast("Endereço encontrado!", "success");
        // Joga o foco pro usuário digitar apenas o número
        document.getElementById('numero').focus();

    } catch (error) {
        mostrarToast("Erro ao conectar no ViaCEP", "danger");
    }
}

// --- INTERFACE: Preparar Form ---
function limparForm() {
    const campos = ['clienteId', 'nome', 'email', 'whatsapp', 'telefone', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'observacoes'];
    campos.forEach(campo => document.getElementById(campo).value = '');
    document.getElementById('modalTitulo').innerText = 'Novo Cliente';
}

function prepararEdicao(cliente) {
    document.getElementById('clienteId').value = cliente.id || '';
    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('email').value = cliente.email || '';
    document.getElementById('whatsapp').value = cliente.whatsapp || '';
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('cep').value = cliente.cep || '';
    document.getElementById('rua').value = cliente.rua || '';
    document.getElementById('numero').value = cliente.numero || '';
    document.getElementById('complemento').value = cliente.complemento || '';
    document.getElementById('bairro').value = cliente.bairro || '';
    document.getElementById('cidade').value = cliente.cidade || '';
    document.getElementById('uf').value = cliente.uf || '';
    document.getElementById('observacoes').value = cliente.observacoes || '';
    
    document.getElementById('modalTitulo').innerText = 'Editar Cliente';
    modalFormEl.show();
}

// --- CREATE / UPDATE: Salvar Cliente ---
async function salvarCliente() {
    const id = document.getElementById('clienteId').value;
    
    // Captura todos os dados da tela
    const dadosForm = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        telefone: document.getElementById('telefone').value,
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        uf: document.getElementById('uf').value,
        observacoes: document.getElementById('observacoes').value
    };

    if (!dadosForm.nome) return mostrarToast("O Nome é obrigatório!", "warning");

    let response;
    // O botão de salvar decide se envia um UPDATE ou um INSERT
    if (id) {
        response = await _supabase.from('clientes').update(dadosForm).eq('id', id);
    } else {
        response = await _supabase.from('clientes').insert([dadosForm]);
    }

    if (response.error) {
        console.error(response.error);
        mostrarToast("Erro ao conectar com o banco de dados!", "danger");
    } else {
        modalFormEl.hide();
        carregarClientes();
        mostrarToast("Cliente salvo com sucesso!", "success");
    }
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
        // COMO ERA: alert("Erro ao deletar!");
        mostrarToast("Erro ao excluir o cliente!", "danger");
    } else {
        modalExclusaoEl.hide();
        carregarClientes();
        // ADICIONE ESTA LINHA:
        mostrarToast("Cliente excluído permanentemente.", "success");
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
// --- REGISTRO DO SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}
