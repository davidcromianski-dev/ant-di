# GitHub Actions Workflows

Este repositório contém workflows automatizados para CI/CD usando GitHub Actions.

## Workflows Disponíveis

### 1. **Run Tests** (`test.yml`)
- **Trigger**: Push em qualquer branch
- **Função**: Executa os testes do projeto principal
- **Tecnologia**: pnpm + Node.js

### 2. **Deploy Site to GitHub Pages** (`deploy-site.yml`)
- **Trigger**: 
  - Push na branch `main` com mudanças na pasta `site/`
  - Execução manual via `workflow_dispatch`
- **Função**: Build e deploy automático do site para GitHub Pages
- **Tecnologia**: npm + React + GitHub Pages

## Configuração do Deploy

### Pré-requisitos
1. **GitHub Pages habilitado** no repositório
2. **Source configurado** para "GitHub Actions" nas configurações do repositório
3. **Permissões corretas** para o workflow (já configuradas no arquivo)

### Como funciona
1. **Detecção**: Monitora mudanças na pasta `site/`
2. **Build**: Executa `npm ci` e `npm run build` na pasta `site/`
3. **Deploy**: Faz upload do build para GitHub Pages
4. **URL**: Site disponível em `https://davidcromianski-dev.github.io/ant-di/`

### Execução Manual
Para fazer deploy manualmente:
1. Vá para **Actions** no GitHub
2. Selecione **Deploy Site to GitHub Pages**
3. Clique em **Run workflow**
4. Escolha a branch e clique em **Run workflow**

### Monitoramento
- **Status**: Verifique na aba **Actions** do repositório
- **Logs**: Clique no workflow para ver logs detalhados
- **URL**: O link do site é mostrado no final do deploy

## Estrutura do Projeto

```
.github/
├── workflows/
│   ├── test.yml           # Testes do projeto principal
│   └── deploy-site.yml    # Deploy do site
└── README.md             # Este arquivo

site/                     # Site React
├── public/              # Arquivos estáticos
├── src/                 # Código fonte
├── package.json         # Dependências do site
└── build/              # Build gerado (ignorado no git)
```

## Troubleshooting

### Site não atualiza após push
1. Verifique se as mudanças estão na pasta `site/`
2. Confirme que o push foi na branch `main`
3. Veja os logs na aba **Actions**

### Erro de permissões
1. Vá em **Settings** → **Pages**
2. Configure **Source** para "GitHub Actions"
3. Verifique se **Pages** está habilitado

### Erro de build
1. Teste localmente: `cd site && npm run build`
2. Verifique os logs do workflow
3. Confirme que `package.json` está correto 