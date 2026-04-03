# Contributing to AI-BOS

Thank you for your interest in contributing to the AI-BOS (Artificial Intelligence Business Operating System) project! We welcome contributions from the community to help make this platform more robust, secure, and intelligent.

## Getting Started

1.  **Fork the Repository**: Create a personal fork of the project on GitHub.
2.  **Clone Your Fork**:
    ```bash
    git clone https://github.com/your-username/ai-bos.git
    cd ai-bos
    ```
3.  **Set Up Development Environment**:
    - Follow the instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) to set up a local development environment using Docker Compose.
    - Ensure you have Python 3.11+ and Node.js 18+ installed.

## Development Workflow

1.  **Create a Branch**: Create a new branch for your feature or bug fix.
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  **Make Changes**: Implement your changes, following the coding standards and architecture guidelines in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
3.  **Run Tests**: Ensure all existing tests pass and add new tests for your changes.
    ```bash
    # Backend tests
    cd backend
    pytest
    
    # Frontend tests
    cd frontend
    npm test
    ```
4.  **Lint Code**: Run linters to ensure code quality.
    ```bash
    # Backend linting
    flake8 backend
    black backend
    
    # Frontend linting
    npm run lint
    ```
5.  **Commit Changes**: Commit your changes with clear and descriptive commit messages.
    ```bash
    git commit -m "feat: Add new AI model integration for sentiment analysis"
    ```
6.  **Push to Fork**: Push your branch to your fork on GitHub.
    ```bash
    git push origin feature/my-new-feature
    ```
7.  **Create Pull Request**: Open a Pull Request (PR) from your branch to the main repository's `main` branch.

## Coding Standards

- **Python**: Follow PEP 8 style guide. Use type hints for all function arguments and return values.
- **JavaScript/TypeScript**: Follow Airbnb JavaScript Style Guide. Use strict mode and TypeScript for type safety.
- **Documentation**: Update documentation for any new features or changes to existing functionality.
- **Testing**: Write unit tests for all new code. Aim for high test coverage.

## Reporting Issues

If you encounter any bugs or have suggestions for improvements, please open an issue on the GitHub repository. Provide as much detail as possible, including steps to reproduce the issue and relevant logs.

## License

By contributing to AI-BOS, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
