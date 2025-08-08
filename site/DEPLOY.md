# Deploy do Site Ant DI

## Deploy para GitHub Pages

### 1. Configuração Inicial

O site já está configurado para GitHub Pages com:
- `homepage` configurado no `package.json`
- Scripts de deploy configurados
- Dependência `gh-pages` instalada

### 2. Deploy Automático

Para fazer o deploy:

```bash
npm run deploy
```

Este comando irá:
1. Executar `npm run build` (via predeploy)
2. Fazer deploy da pasta `build/` para o branch `gh-pages`

### 3. Configuração do GitHub

1. Vá para as configurações do repositório no GitHub
2. Navegue até "Pages" na barra lateral
3. Em "Source", selecione "Deploy from a branch"
4. Selecione o branch `gh-pages` e pasta `/ (root)`
5. Clique em "Save"

### 4. URL do Site

Após o deploy, o site estará disponível em:
`https://davidcromianski-dev.github.io/ant-di/`

### 5. Deploy Manual (Alternativo)

Se preferir fazer deploy manual:

```bash
# Build do projeto
npm run build

# Fazer commit e push da pasta build
git add build/
git commit -m "Deploy site"
git push origin gh-pages
```

### 6. Atualizações

Para atualizar o site:
1. Faça as alterações no código
2. Execute `npm run deploy`
3. O GitHub Pages será atualizado automaticamente

### 7. Troubleshooting

Se o site não aparecer:
- Verifique se o branch `gh-pages` foi criado
- Aguarde alguns minutos para o GitHub processar
- Verifique as configurações de Pages no repositório
- Confirme se a URL está correta no `package.json`

### 8. Domínio Customizado (Opcional)

Para usar um domínio customizado:
1. Adicione o domínio nas configurações do GitHub Pages
2. Atualize o `homepage` no `package.json`
3. Atualize as meta tags no `public/index.html` 