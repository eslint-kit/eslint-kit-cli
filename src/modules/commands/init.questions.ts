import inquirer from 'inquirer'

export async function askForReplacePermission(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: true,
        message:
          'You already have ESLint config in your project. ' +
          'Do you want to override it with eslint-kit?',
      },
    ])
    .then((answers) => answers[name])
}

export async function askForPrettierOverride(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: false,
        message:
          'You already have Prettier config in your project. ' +
          'Do you want to override it with the eslint-kit recommended one?',
      },
    ])
    .then((answers) => answers[name])
}

export async function askForPackageJsonCommands(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: true,
        message:
          'Do you want to add "lint" and "lint:fix" scripts to your package.json?',
      },
    ])
    .then((answers) => answers[name])
}
