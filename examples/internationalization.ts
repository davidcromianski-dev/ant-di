import { Container } from '../src';

/**
 * Examples showing internationalization features
 */

export async function internationalizationExamples() {
    console.log('=== Internationalization Examples ===\n');

    const container = new Container();

    // 1. Default language (English)
    console.log('Default language:', container.getLanguage());

    // 2. Change to Portuguese
    await container.setLanguage('pt-br');
    console.log('Current language:', container.getLanguage());

    // 3. Test error messages in Portuguese
    try {
        container.offsetGet('nonexistent');
    } catch (error: any) {
        console.log('Portuguese error:', error.message);
    }

    // 4. Change to Spanish
    await container.setLanguage('es-es');
    console.log('\nCurrent language:', container.getLanguage());

    // 5. Test error messages in Spanish
    try {
        container.offsetSet('frozenKey', () => 'value');
        container.offsetGet('frozenKey');
        container.offsetSet('frozenKey', 'new value');
    } catch (error: any) {
        console.log('Spanish error:', error.message);
    }

    // 6. Test unsupported language
    console.log('\nTesting unsupported language:');
    await container.setLanguage('fr-fr' as any);
    console.log('Language after unsupported:', container.getLanguage());
} 