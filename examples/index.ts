import { basicUsageExamples } from './basic-usage';
import { dependencyInjectionExamples } from './dependency-injection';
import { factoriesAndProtectionExamples } from './factories-and-protection';
import { serviceProviderExamples } from './service-providers';
import { advancedPatternsExamples } from './advanced-patterns';

/**
 * Main examples runner
 */
async function runAllExamples() {
    console.log('🚀 Running Container Examples\n');

    try {
        basicUsageExamples();
        console.log('\n' + '='.repeat(50) + '\n');
        
        dependencyInjectionExamples();
        console.log('\n' + '='.repeat(50) + '\n');
        
        factoriesAndProtectionExamples();
        console.log('\n' + '='.repeat(50) + '\n');
        
        serviceProviderExamples();
        console.log('\n' + '='.repeat(50) + '\n');
        
        advancedPatternsExamples();
        
        console.log('\n✅ All examples completed successfully!');
    } catch (error) {
        console.error('❌ Error running examples:', error);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples();
}

export {
    basicUsageExamples,
    dependencyInjectionExamples,
    factoriesAndProtectionExamples,
    serviceProviderExamples,
    advancedPatternsExamples,
    runAllExamples
}; 