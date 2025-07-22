const enUsMessages = {
    expectedInvokable: 'Callable não é um Closure ou objeto invocável.',
    keyFrozen: (key: string) => `A chave "${key}" está congelada e não pode ser modificada.`,
    keyIsNotDefined: (key: string) => `A chave "${key}" não está definida.`,
    circularDependency: (path: string, constructorName: string) => `Dependência circular detectada: ${path} -> ${constructorName}`,
    couldNotResolveForConstructor: (constructorName: string) => `Não foi possível resolver as dependências para ${constructorName}. Certifique-se que é uma classe e que os metadados foram emitidos.`,
    failedToResolveDependency: (paramTypeName: string, constructorName: string, errorMsg: string) => `Não foi possível resolver a dependência ${paramTypeName} para ${constructorName}: ${errorMsg}`,
    autoWiringFailed: (constructorName: string, errorMsg: string) => `Auto-wiring falhou para ${constructorName}: ${errorMsg}`,
    failedToResolveDueToUndefinedParam: (constructorName: string) => `Não foi possível resolver a dependência para ${constructorName} devido a um paramType indefinido. Isso pode acontecer com dependências circulares ou se uma classe não for exportada/importada corretamente.`,
    languageNotSupported: (lang: string, currentLang: string) => `Idioma '${lang}' não suportado. Mantendo '${currentLang}'.`,
    noDependenciesRegistered: (className: string) => `Nenhuma dependência registrada para ${className}. Use container.registerDependencies(${className}, [dependencies]) para registrar dependências manualmente.`
};
export default enUsMessages;
