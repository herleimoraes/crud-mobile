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
                <h6 class="mb-1 fw-bold text-dark">${c.nome}</h6>
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

// --- INICIALIZAÇÃO ---
carregarClientes();
