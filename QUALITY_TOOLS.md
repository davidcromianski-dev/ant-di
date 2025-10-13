# Quality & Security Tools Setup

This document describes the quality and security tools configured for the Ant DI
package.

## 🔧 **Code Quality Tools**

### ESLint

- **Configuration**: `eslint.config.js`
- **Purpose**: Code linting and style enforcement
- **Commands**:
  - `pnpm run lint` - Check for linting issues
  - `pnpm run lint:fix` - Auto-fix linting issues

### Prettier

- **Configuration**: `.prettierrc.json`
- **Purpose**: Code formatting consistency
- **Commands**:
  - `pnpm run format` - Format all files
  - `pnpm run format:check` - Check formatting without fixing

## 🛡️ **Security Tools**

### npm audit

- **Purpose**: Built-in vulnerability scanning
- **Command**: `pnpm audit`

### Snyk

- **Purpose**: Advanced security scanning
- **Commands**:
  - `pnpm run security:snyk` - Run security test
  - `pnpm run security:snyk:monitor` - Monitor for vulnerabilities

### audit-ci

- **Configuration**: `.audit-ci.json`
- **Purpose**: CI/CD security integration
- **Command**: `pnpm run security:audit`

## 🧪 **Testing & Coverage**

### c8

- **Configuration**: `.c8rc.json`
- **Purpose**: Code coverage reporting
- **Commands**:
  - `pnpm run test:coverage` - Run tests with coverage
  - Coverage reports generated in `coverage/` directory

## 🚀 **CI/CD & Automation**

### Husky

- **Purpose**: Git hooks for automated quality checks
- **Hooks**:
  - `pre-commit`: Runs lint-staged
  - `pre-push`: Runs tests and type checking

### lint-staged

- **Configuration**: `.lintstagedrc.json`
- **Purpose**: Run linters only on staged files
- **Command**: `pnpm run precommit`

### GitHub Actions

- **Configuration**: `.github/workflows/ci.yml`
- **Jobs**:
  - Quality Checks (lint, format, type-check, test)
  - Security Scan (npm audit, Snyk, audit-ci)
  - Build and Test
  - Dependency Check
  - Release (on main branch)

## 📚 **Documentation Tools**

### TypeDoc

- **Configuration**: `typedoc.json`
- **Purpose**: API documentation generation
- **Commands**:
  - `pnpm run docs:generate` - Generate documentation
  - `pnpm run docs:serve` - Serve documentation locally

### API Extractor

- **Configuration**: `api-extractor.json`
- **Purpose**: API surface analysis and validation
- **Commands**:
  - `pnpm run api:extract` - Extract API surface
  - `pnpm run api:update` - Update API reports

## 🔍 **Analysis Tools**

### depcheck

- **Purpose**: Find unused and missing dependencies
- **Command**: `pnpm run deps:check`

### webpack-bundle-analyzer

- **Purpose**: Bundle size analysis
- **Command**: `pnpm run analyze:bundle`

## 📋 **Available Scripts**

```bash
# Development
pnpm run build              # Build the package
pnpm run test               # Run tests
pnpm run test:coverage      # Run tests with coverage
pnpm run test:watch         # Run tests in watch mode

# Code Quality
pnpm run lint               # Lint code
pnpm run lint:fix           # Fix linting issues
pnpm run format             # Format code
pnpm run format:check       # Check formatting
pnpm run type-check         # TypeScript type checking

# Documentation
pnpm run docs:generate      # Generate API docs
pnpm run docs:serve         # Serve docs locally
pnpm run api:extract        # Extract API surface
pnpm run api:update         # Update API reports

# Security
pnpm run security:audit     # Run audit-ci
pnpm run security:snyk     # Run Snyk test
pnpm run security:snyk:monitor # Monitor with Snyk

# Analysis
pnpm run deps:check         # Check dependencies
pnpm run deps:outdated      # Check outdated deps
pnpm run analyze:bundle     # Analyze bundle size

# Utilities
pnpm run clean              # Clean build artifacts
pnpm run precommit          # Run pre-commit checks
pnpm run prepush            # Run pre-push checks
```

## 🎯 **Quality Standards**

### Coverage Requirements

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Code Style

- **ESLint**: TypeScript-specific rules with strict configuration
- **Prettier**: Consistent formatting with single quotes, semicolons, trailing
  commas
- **Line Length**: 100 characters maximum

### Security

- **Vulnerability Scanning**: Required for all dependencies
- **Audit Level**: Moderate and above
- **License Compliance**: Checked via Snyk

## 🔄 **Workflow Integration**

### Pre-commit

1. Lint staged files
2. Format staged files
3. Run tests on staged files

### Pre-push

1. Run full test suite
2. Type checking
3. Security audit

### CI/CD Pipeline

1. **Quality Checks**: Lint, format, type-check, test, coverage
2. **Security Scan**: npm audit, Snyk, audit-ci
3. **Build & Test**: Build package, run tests, analyze bundle
4. **Dependency Check**: Check for unused/outdated dependencies
5. **Release**: Publish to npm (on main branch)

## 📁 **Generated Files**

- `coverage/` - Test coverage reports
- `docs/` - Generated API documentation
- `docs/api/` - API extraction reports
- `.eslintcache` - ESLint cache
- `.prettiercache` - Prettier cache

## 🚨 **Important Notes**

1. **Husky Setup**: Run `pnpm exec husky init` after cloning
2. **Snyk Token**: Set `SNYK_TOKEN` environment variable for CI/CD
3. **NPM Token**: Set `NPM_TOKEN` environment variable for publishing
4. **Coverage**: Coverage reports are generated in `coverage/` directory
5. **Documentation**: API docs are generated in `docs/` directory

## 🔧 **Troubleshooting**

### Common Issues

1. **ESLint Errors**: Run `pnpm run lint:fix` to auto-fix
2. **Prettier Issues**: Run `pnpm run format` to format code
3. **Type Errors**: Run `pnpm run type-check` to see TypeScript errors
4. **Test Failures**: Check test output and fix failing tests
5. **Security Issues**: Review audit output and update dependencies

### Getting Help

- Check the tool-specific documentation
- Review configuration files for custom settings
- Run individual commands to isolate issues
- Check CI/CD logs for detailed error information
