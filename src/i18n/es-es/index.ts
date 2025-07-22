const enUsMessages = {
    expectedInvokable: 'Callable no es un Closure o objeto invocable.',
    keyFrozen: (key: string) => `La clave "${key}" está congelada y no puede ser modificada.`,
    keyIsNotDefined: (key: string) => `La clave "${key}" no está definida.`,
    circularDependency: (path: string, constructorName: string) => `Dependencia circular detectada: ${path} -> ${constructorName}`,
    couldNotResolveForConstructor: (constructorName: string) => `No se pudieron resolver las dependencias para ${constructorName}. Asegúrese de que es una clase y que los metadatos se han emitido.`,
    failedToResolveDependency: (paramTypeName: string, constructorName: string, errorMsg: string) => `No se pudo resolver la dependencia ${paramTypeName} para ${constructorName}: ${errorMsg}`,
    autoWiringFailed: (constructorName: string, errorMsg: string) => `Auto-wiring falló para ${constructorName}: ${errorMsg}`,
    failedToResolveDueToUndefinedParam: (constructorName: string) => `No se pudo resolver la dependencia para ${constructorName} debido a un paramType indefinido. Esto puede ocurrir con dependencias circulares o si una clase no se exporta/importa correctamente.`,
    languageNotSupported: (lang: string, currentLang: string) => `Idioma '${lang}' no soportado. Manteniendo '${currentLang}'.`,
    noDependenciesRegistered: (className: string) => `No se han registrado dependencias para ${className}. Use container.registerDependencies(${className}, [dependencies]) para registrar dependencias manualmente.`
};
export default enUsMessages;
