import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Globe, 
  Code, 
  Package, 
  Github, 
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sun,
  Moon,
  AlertTriangle,
  Star,
  Copy,
  Check
} from 'lucide-react';
import AntIcon from './components/AntIcon';
import { useTheme } from './contexts/ThemeContext';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import './code-highlight.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [starCount, setStarCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Buscar stars do GitHub
  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/davidcromianski-dev/ant-di');
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.log('Erro ao buscar stars:', error);
      }
    };

    fetchStars();
  }, []);

  // Highlight code blocks when component mounts
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const copyToClipboard = async () => {
    const codeText = `import { Container } from '@davidcromianski-dev/ant-di';

// Create container
const container = new Container();

// Register a service
container.set('database', () => new DatabaseConnection());

// Get the service
const db = container.get('database');

// Auto-wiring example
class UserService {
    constructor(private db: DatabaseConnection) {}
}

container.bind(UserService, [DatabaseConnection]);
const userService = container.get(UserService);

// Service provider example
class DatabaseServiceProvider implements IServiceProvider {
    register(container: Container) {
        container.set('db.host', 'localhost');
        container.set('db.port', 5432);
        
        const connectionFactory = (c: Container) => ({
            host: c.get('db.host'),
            port: c.get('db.port'),
            connect: () => \`Connected to \${c.get('db.host')}:\${c.get('db.port')}\`
        });
        
        container.set('db.connection', connectionFactory, true);
    }
}

container.register(new DatabaseServiceProvider());`;

    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Zero Dependências",
      description: "Extremamente leve, sem conflitos de versão ou dependências externas"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Auto-wiring Manual",
      description: "Controle total sobre a resolução de dependências"
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Service Providers",
      description: "Organização modular de serviços com providers"
    }
  ];

  const benefits = [
    "Curva de aprendizado baixa",
    "API simples e intuitiva",
    "Compatibilidade universal",
    "Testabilidade excelente",
    "Proxy access para conveniência",
    "Frozen keys para segurança"
  ];

  const limitations = [
    "Auto-wiring limitado",
    "Sem decorators",
    "Comunidade menor",
    "Funcionalidades avançadas limitadas"
  ];

  const comparisons = [
    {
      name: "Ant-di",
      dependencies: "0",
      bundleSize: "Mínimo",
      learningCurve: "Baixa",
      typeSafety: "Manual",
      autoWiring: "Manual",
      decorators: false,
      serviceProviders: true,
      circularDeps: false,
      lifecycleHooks: false,
      testability: "Excelente"
    },
    {
      name: "Inversify",
      dependencies: "2",
      bundleSize: "Médio",
      learningCurve: "Alta",
      typeSafety: "Excelente",
      autoWiring: "Automático",
      decorators: true,
      serviceProviders: false,
      circularDeps: true,
      lifecycleHooks: true,
      testability: "Boa"
    },
    {
      name: "TSyringe",
      dependencies: "2",
      bundleSize: "Médio",
      learningCurve: "Média",
      typeSafety: "Excelente",
      autoWiring: "Automático",
      decorators: true,
      serviceProviders: false,
      circularDeps: true,
      lifecycleHooks: false,
      testability: "Boa"
    },
    {
      name: "Awilix",
      dependencies: "1",
      bundleSize: "Pequeno",
      learningCurve: "Baixa",
      typeSafety: "Limitado",
      autoWiring: "Por nome",
      decorators: false,
      serviceProviders: false,
      circularDeps: false,
      lifecycleHooks: false,
      testability: "Excelente"
    },
    {
      name: "TypeDI",
      dependencies: "2",
      bundleSize: "Médio",
      learningCurve: "Alta",
      typeSafety: "Excelente",
      autoWiring: "Automático",
      decorators: true,
      serviceProviders: false,
      circularDeps: true,
      lifecycleHooks: true,
      testability: "Boa"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Banner de Aviso Experimental */}
      <div className="bg-amber-700 border-b border-orange-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-orange-100">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Biblioteca Experimental - Destinada apenas para estudos e aprendizado
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <AntIcon className="h-5 w-5" size={20} />
              </div>
              <span className="text-xl font-bold">Ant DI</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botão de tema */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <a
                href="https://github.com/davidcromianski-dev/ant-di"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
                {starCount !== null && (
                  <>
                    <Star className="h-3 w-3 ml-2 mr-1" />
                    <span className="text-xs">{starCount}</span>
                  </>
                )}
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
            <Package className="h-3 w-3 mr-1" />
            Simple JavaScript Dependency Injection
          </div>

          {/* Ícone de formiga carregando injeção */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <AntIcon
                className="text-primary drop-shadow-lg"
                size={120}
              />
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-full"></div>
            </div>
          </div>

          <h1 className="text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ant DI
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Container de injeção de dependência simples e leve para JavaScript e TypeScript.
            Inspirado no PHP Pimple com recursos avançados como auto-wiring, service providers e internacionalização.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <a
              href="https://github.com/davidcromianski-dev/ant-di"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Documentação
            </a>
            <a
              href="#quick-start"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
            >
              <Code className="h-4 w-4 mr-2" />
              Quick Start
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Características Principais</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            O Ant DI oferece uma solução completa para injeção de dependência
            com foco em simplicidade e performance.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm text-center">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold leading-none tracking-tight text-lg">{feature.title}</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quick-start" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comece a usar o Ant DI em poucos passos. Exemplo básico de configuração e uso.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight">Exemplo Básico</h3>
                  <p className="text-sm text-muted-foreground">
                    Container de injeção de dependência com auto-wiring e service providers
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">TypeScript</span>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Copy code to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="code-block">
                <pre className="overflow-x-auto text-sm">
                  <code className="language-typescript">
                  {`import { Container } from '@davidcromianski-dev/ant-di';

// Create container
const container = new Container();

// Register a service
container.set('database', () => new DatabaseConnection());

// Get the service
const db = container.get('database');

// Auto-wiring example
class UserService {
    constructor(private db: DatabaseConnection) {}
}

container.bind(UserService, [DatabaseConnection]);
const userService = container.get(UserService);

// Service provider example
class DatabaseServiceProvider implements IServiceProvider {
    register(container: Container) {
        container.set('db.host', 'localhost');
        container.set('db.port', 5432);
        
        const connectionFactory = (c: Container) => ({
            host: c.get('db.host'),
            port: c.get('db.port'),
            connect: () => \`Connected to \${c.get('db.host')}:\${c.get('db.port')}\`
        });
        
        container.set('db.connection', connectionFactory, true);
    }
}

container.register(new DatabaseServiceProvider());`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Comparação com Outras Bibliotecas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja como o Ant DI se compara com outras bibliotecas populares de injeção de dependência.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-3 text-left font-semibold">Biblioteca</th>
                <th className="border border-border p-3 text-center font-semibold">Dependências</th>
                <th className="border border-border p-3 text-center font-semibold">Bundle Size</th>
                <th className="border border-border p-3 text-center font-semibold">Curva de Aprendizado</th>
                <th className="border border-border p-3 text-center font-semibold">Type Safety</th>
                <th className="border border-border p-3 text-center font-semibold">Auto-wiring</th>
                <th className="border border-border p-3 text-center font-semibold">Decorators</th>
                <th className="border border-border p-3 text-center font-semibold">Service Providers</th>
                <th className="border border-border p-3 text-center font-semibold">Testabilidade</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((lib, index) => (
                <tr key={index} className={lib.name === 'Ant-di' ? 'bg-primary/5' : ''}>
                  <td className="border border-border p-3 font-medium">
                    {lib.name === 'Ant-di' && <span className="text-primary">★ </span>}
                    {lib.name}
                  </td>
                  <td className="border border-border p-3 text-center">{lib.dependencies}</td>
                  <td className="border border-border p-3 text-center">{lib.bundleSize}</td>
                  <td className="border border-border p-3 text-center">{lib.learningCurve}</td>
                  <td className="border border-border p-3 text-center">{lib.typeSafety}</td>
                  <td className="border border-border p-3 text-center">{lib.autoWiring}</td>
                  <td className="border border-border p-3 text-center">
                    {lib.decorators ? '✅' : '❌'}
                  </td>
                  <td className="border border-border p-3 text-center">
                    {lib.serviceProviders ? '✅' : '❌'}
                  </td>
                  <td className="border border-border p-3 text-center">{lib.testability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Benefits vs Limitations Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Por que escolher o Ant DI?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comparado com outras bibliotecas de injeção de dependência,
            o Ant DI oferece vantagens únicas para projetos modernos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Benefícios
              </h3>
            </div>
            <div className="p-6 pt-0">
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Limitations */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Limitações
              </h3>
            </div>
            <div className="p-6 pt-0">
              <ul className="space-y-3">
                {limitations.map((limitation, index) => (
                  <li key={index} className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm text-center max-w-4xl mx-auto">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-3xl">Pronto para explorar?</h2>
            <p className="text-sm text-muted-foreground text-lg">
              Explore o código e aprenda sobre injeção de dependência com o Ant DI.
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center justify-center">
              <a
                href="https://github.com/davidcromianski-dev/ant-di"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
              >
                <Github className="h-4 w-4 mr-2" />
                Ver no GitHub
                {starCount !== null && (
                  <>
                    <Star className="h-4 w-4 ml-2 mr-1" />
                    <span className="text-sm">{starCount}</span>
                  </>
                )}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <AntIcon className="h-4 w-4" size={16} />
              </div>
              <span className="font-semibold">Ant DI</span>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Ant DI. Desenvolvido com ❤️ por{' '}
                <a
                  href="https://github.com/davidcromianski-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  David Cromianski
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://www.flaticon.com/free-icons/ant"
                  title="ant icons"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ant icons created by Freepik - Flaticon
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
