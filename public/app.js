async function login() {

    try {
        const response = await fetch('/api/seguranca/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: document.getElementById('login').value,
                senha: document.getElementById('senha').value
            })
        })

        const data = await response.json()

        if (data.message == 'Login ou senha incorretos') {
            alert('Login ou senha incorretos')
        }
        else {
            console.log(data.token)
            let userToken = data.token
            let userId = data.id
            sessionStorage.setItem('token', userToken)
            sessionStorage.setItem('id', userId)
            window.location.href = "/app/home"
        }

    } catch (error) {

    }
}

function verificarLogin() {

    if (sessionStorage.getItem('token') == null) {
        alert('Usuário não autenticado')
        window.location.href = "/app"
    }

    console.log(sessionStorage.getItem('token'))
    console.log((sessionStorage.getItem('id')))
}

async function getProdutos() {
    try {

        const response = await fetch('/api/produtos', {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'authorization': sessionStorage.getItem('token')
            }
        })

        const data = await response.json()

        showProdutos(data)

    } catch (error) {

    }
}

function showProdutos(data) {

    let cabecalho = [
        'Descrição',
        'Valor',
        'Marca',
        'Ação'
    ]

    var context = document.createElement('table');
    context.className = 'table';
    var header = context.createTHead();
    var row = header.insertRow();

    for (var i = 0; i < cabecalho.length; i++) {

        var th = document.createElement('th');
        th.innerHTML = cabecalho[i];
        row.appendChild(th);
    };

    var body = context.appendChild(document.createElement('tbody'))

    for (produto of data) {

        var row;
        row = body.insertRow();

        row.insertCell().innerHTML = produto.descricao;
        row.insertCell().innerHTML = produto.valor;
        row.insertCell().innerHTML = produto.marca;

        let editar = `<button id="${produto.id}" onclick="show_editar(this.id)">Editar</button>`
        let excluir = `<button style="background-color:red;border-color:red;border-radius:3px;margin:0.2rem" id="${produto.id}" onclick="excluir(this.id)">Excluir</button>`
        row.insertCell().innerHTML = editar + excluir
    };

    context.appendChild(body);
    document.body.appendChild(context);
}

async function excluir(id){
    console.log(id)

    console.log((sessionStorage.getItem('id')))

    try {

        const response = await fetch('/api/produtos/' + id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'usuarioId': sessionStorage.getItem('id')
            },
        })

        const data = await response.json()
        alert(data.message)
        window.location.reload()

    } catch (error) {

    }
}

function show_inserir(){
    document.getElementById('inserir').classList.remove("inserir_off")
    document.getElementById('editar').classList.add("editar_off")
}

async function inserir() {

    try {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'usuarioId': sessionStorage.getItem('id')
            },
            body: JSON.stringify({
                descricao: document.getElementById('insertDescricao').value,
                valor: document.getElementById('insertValor').value,
                marca: document.getElementById('insertMarca').value
            })
        })

        const data = await response.json()

        if (data.message != null || data.message != undefined) {
            alert('Erro ao inserir o produto')
        }
        else {
            alert('Inserido com sucesso')
            document.getElementById('inserir').classList.add("inserir_off")
            window.location.reload()
        }

    } catch (error) {

    }
}

function show_editar(id){
    document.getElementById('idDescricao').value = id
    document.getElementById('editar').classList.remove("editar_off")
    document.getElementById('inserir').classList.add("inserir_off")
    console.log(document.getElementById('idDescricao').value)
}

async function editar() {

    let id = document.getElementById('idDescricao').value

    try {
        const response = await fetch('/api/produtos/' + id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'usuarioId': sessionStorage.getItem('id')
            },
            body: JSON.stringify({
                descricao: document.getElementById('editDescricao').value,
                valor: document.getElementById('editValor').value,
                marca: document.getElementById('editMarca').value
            })
        })

        const data = await response.json()

        if (data.message == 'Item alterado com sucesso') {
            alert('Item alterado com sucesso')
            document.getElementById('inserir').classList.add("editar_off")
        }
        else {
            alert('Erro ao editar o produto')

        }
        window.location.reload()

    } catch (error) {

    }
}

function cancelar(){
    window.location.reload()
}
